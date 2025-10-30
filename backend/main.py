# main.py
import os
import json
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session

from parser_local import parse_with_shivaay_ai
from discrepancy_engine import detect_discrepancies
from db import init_db, SessionLocal
from models import InvoiceData, POData, Discrepancy
from discrepancy_llm import run_discrepancy_query

# ====== Load environment & Initialize DB ======
load_dotenv()
init_db()

# ====== Initialize LLM Client ======
client = OpenAI(
    api_key=os.getenv("SHIVAAY_API_KEY"),
    base_url=os.getenv("SHIVAAY_BASE_URL", "https://api.futurixai.com/api/shivaay/v1")
)

# ====== Initialize FastAPI App ======
app = FastAPI(title="Verifin Discrepancy Checker")

# ====== CORS ======
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====== Serve static frontend files (optional) ======
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def serve_home():
    file_path = "static/index.html"
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="text/html")
    return {"message": "Verifin API root. Use the endpoints to upload files."}


# ====== Upload Invoice ======
@app.post("/upload-invoice")
async def upload_invoice(file: UploadFile = File(...)):
    try:
        os.makedirs("uploads/invoices", exist_ok=True)
        file_path = f"uploads/invoices/{file.filename}"
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        parsed_data = parse_with_shivaay_ai(file_path)
        parsed_json_text = json.dumps(parsed_data, default=str)

        db = SessionLocal()
        try:
            inv = InvoiceData(
                filename=file.filename,
                raw_text="",
                parsed_data=parsed_json_text
            )
            db.add(inv)
            db.commit()
            db.refresh(inv)
        finally:
            db.close()

        return {"message": "Invoice uploaded, parsed, and saved", "parsed_data": parsed_data}
    except Exception as e:
        return {"error": f"Error while processing invoice: {str(e)}"}


# ====== Upload Purchase Order ======
@app.post("/upload-po")
async def upload_po(file: UploadFile = File(...)):
    try:
        os.makedirs("uploads/pos", exist_ok=True)
        file_path = f"uploads/pos/{file.filename}"
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        parsed_data = parse_with_shivaay_ai(file_path)
        parsed_json_text = json.dumps(parsed_data, default=str)

        db = SessionLocal()
        try:
            po = POData(
                filename=file.filename,
                raw_text="",
                parsed_data=parsed_json_text
            )
            db.add(po)
            db.commit()
            db.refresh(po)
        finally:
            db.close()

        return {"message": "PO uploaded, parsed, and saved", "parsed_data": parsed_data}
    except Exception as e:
        return {"error": f"Error while processing PO: {str(e)}"}


# ====== Detect Discrepancy (Natural Language Summary Only) ======
from fastapi.responses import PlainTextResponse

@app.get("/detect-discrepancy", response_class=PlainTextResponse)
def detect_discrepancy():
    """
    Compare the latest uploaded Invoice and PO data saved in DB.
    Return ONLY plain natural-language text (no JSON brackets).
    """
    db = SessionLocal()
    try:
        latest_invoice = db.query(InvoiceData).order_by(InvoiceData.id.desc()).first()
        latest_po = db.query(POData).order_by(POData.id.desc()).first()
        if not latest_invoice or not latest_po:
            return PlainTextResponse("No invoice or PO found in the database. Please upload both first.")

        invoice_parsed = json.loads(latest_invoice.parsed_data or "{}")
        po_parsed = json.loads(latest_po.parsed_data or "{}")

        discrepancies = detect_discrepancies(invoice_parsed, po_parsed) or {}

        # ---------- Generate summary ----------
        if not discrepancies:
            final_summary = "Invoice and Purchase Order match perfectly. No discrepancies found."
        else:
            prompt = (
                "You are a finance assistant. Summarize these discrepancies between an invoice "
                "and a purchase order in clear, natural English. Mention which fields differ and their values. "
                "Keep it concise and professional.\n\n"
                f"Invoice file: {latest_invoice.filename}\n"
                f"PO file: {latest_po.filename}\n\n"
                f"Discrepancies:\n{json.dumps(discrepancies, indent=2)}"
            )

            try:
                completion = client.chat.completions.create(
                    model=os.getenv("SHIVAAY_MODEL", "shivaay"),
                    messages=[
                        {"role": "system", "content": "You are a helpful finance assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=300
                )
                final_summary = completion.choices[0].message.content.strip()
            except Exception as e:
                # fallback summary
                mismatch_lines = [
                    f"- {f}: Invoice = {v.get('invoice')}, PO = {v.get('po')}"
                    for f, v in discrepancies.items()
                ]
                final_summary = (
                    f"Invoice and PO do not match. Fields with discrepancies:\n" +
                    "\n".join(mismatch_lines)
                )

        # ---------- Store summary ----------
        discrepancy_record = Discrepancy(
            description=f"Invoice {latest_invoice.filename} vs PO {latest_po.filename}",
            details=json.dumps({
                "invoice_id": latest_invoice.id,
                "po_id": latest_po.id,
                "summary_text": final_summary
            }, indent=2)
        )
        db.add(discrepancy_record)
        db.commit()

        # ✅ Return plain text directly (no JSON brackets)
        return PlainTextResponse(final_summary)

    finally:
        db.close()

# ====== Run LLM-generated SQL Discrepancy Check ======
@app.post("/run-discrepancy-sql")
def run_discrepancy_sql(request: str = Query(...)):
    """
    Ask the LLM to generate and run SQL to find mismatches for a custom request.
    Returns ONLY a human-readable summary of the findings.
    """
    try:
        resp = run_discrepancy_query(request)

        # If the response already includes a natural summary
        if isinstance(resp, dict) and "summary" in resp:
            summary_text = resp["summary"]
        else:
            # fallback: stringify response for LLM summarization
            summary_input = json.dumps(resp, indent=2)
            prompt = (
                "You are a finance auditor. Summarize the following database discrepancy result "
                "in clear, human-readable English for a business user. Be concise.\n\n"
                f"{summary_input}"
            )

            try:
                completion = client.chat.completions.create(
                    model=os.getenv("SHIVAAY_MODEL", "shivaay"),
                    messages=[
                        {"role": "system", "content": "You are a helpful finance assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=250
                )
                summary_text = completion.choices[0].message.content.strip()
            except Exception as e:
                summary_text = f"Error summarizing results: {e}"

        # ✅ Return only clean summary
        return {"summary": summary_text}

    except Exception as e:
        return {"summary": f"Error while running discrepancy SQL: {str(e)}"}


# ====== Run the App ======
# Start with: uvicorn main:app --reload
