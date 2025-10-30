import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from parser_local import parse_with_shivaay_ai
from ocr import extract_text_from_pdf
from db import SessionLocal, init_db
from models import InvoiceData, POData, Discrepancy
from discrepancy_engine import detect_discrepancies
import json

app = FastAPI()

from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
def serve_home():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


@app.post("/upload-invoice")
async def upload_invoice(file: UploadFile = File(...)):
    """
    Uploads an invoice PDF, extracts text using OCR, and parses it via Shivaay AI.
    """
    contents = await file.read()
    file_path = f"uploads/{file.filename}"
    os.makedirs("uploads", exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(contents)

    # OCR extraction
    extracted_text = extract_text_from_pdf(file_path)

    # Shivaay parsing
    parsed_data_str = parse_with_shivaay_ai(extracted_text)

    # Parse JSON safely
    try:
        parsed_data = json.loads(parsed_data_str)
    except json.JSONDecodeError:
        parsed_data = {"raw": parsed_data_str}

    # Save to DB
    db = SessionLocal()
    invoice_entry = InvoiceData(
        filename=file.filename,
        raw_text=extracted_text,
        parsed_data=json.dumps(parsed_data)
    )
    db.add(invoice_entry)
    db.commit()
    db.close()

    return {"message": "Invoice uploaded and parsed successfully!"}


@app.post("/upload-po")
async def upload_po(file: UploadFile = File(...)):
    """
    Uploads a Purchase Order PDF, extracts text, parses via Shivaay AI,
    compares with latest invoice, and stores mismatches.
    """
    contents = await file.read()
    file_path = f"uploads/{file.filename}"
    os.makedirs("uploads", exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(contents)

    extracted_text = extract_text_from_pdf(file_path)
    parsed_po_str = parse_with_shivaay_ai(extracted_text)

    try:
        parsed_po = json.loads(parsed_po_str)
    except json.JSONDecodeError:
        parsed_po = {"raw": parsed_po_str}

    db = SessionLocal()

    # Get the most recent invoice
    latest_invoice = db.query(InvoiceData).order_by(InvoiceData.id.desc()).first()

    if not latest_invoice:
        db.close()
        return {"error": "No invoice found to compare with. Please upload an invoice first."}

    invoice_data = json.loads(latest_invoice.parsed_data)
    mismatches = detect_discrepancies(invoice_data, parsed_po)

    # Save PO data
    po_entry = POData(
        filename=file.filename,
        raw_text=extracted_text,
        parsed_data=json.dumps(parsed_po)
    )
    db.add(po_entry)

    # Save discrepancies
    # After running detect_discrepancies(invoice_data, po_data)
    mismatches = detect_discrepancies(invoice_data, parsed_po)

    # Just return the list directly
    return {"mismatches": mismatches}

from fastapi import Query
from fastapi.responses import JSONResponse
from db import init_db
init_db()
    
@app.get("/detect-discrepancy")
def detect_discrepancy(request: str = Query(...)):
    """
    Uses Shivaay AI to generate and run SQL discrepancy checks.
    """
    try:
        from discrepancy_llm import run_discrepancy_query
        result = run_discrepancy_query(request)
        return JSONResponse(content={"query": request, "result": result})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/")
def root():
    return {"message": "Invoice-PO Discrepancy API running!"}
