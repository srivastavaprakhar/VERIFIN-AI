# parser_local.py  – improved parser with hybrid OCR + strong prompt
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from typing import Union
from ocr import extract_text_from_pdf
from ocr_worker import extract_text as extract_text_from_bytes

load_dotenv()

client = OpenAI(
    api_key=os.getenv("SHIVAAY_API_KEY"),
    base_url=os.getenv("SHIVAAY_BASE_URL", "https://api.futurixai.com/api/shivaay/v1")
)

def _safe_load_json(text: str) -> Union[dict, str]:
    """Try to parse text as JSON, otherwise return cleaned text."""
    try:
        return json.loads(text)
    except Exception:
        cleaned = text.strip().strip("` \n")
        try:
            return json.loads(cleaned)
        except Exception:
            return cleaned

def parse_with_shivaay_ai(file_path: str) -> dict:
    """
    - Extracts text using pdfplumber/pytesseract (hybrid OCR)
    - Calls Shivaay LLM for structured JSON
    - Returns dict or {"raw_parsed": "..."} fallback
    """
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}

    ext = file_path.lower().split(".")[-1]
    extracted_text = ""
    prompt = ""

    # ---------- OCR Extraction ----------
    try:
        if ext == "pdf":
            extracted_text = extract_text_from_pdf(file_path)
        else:
            with open(file_path, "rb") as f:
                file_bytes = f.read()
            extracted_text = extract_text_from_bytes(file_bytes, os.path.basename(file_path))
    except Exception as e:
        print(f"[PARSER OCR ERROR] {file_path}: {e}")
        extracted_text = ""

    if not extracted_text.strip():
        return {"error": "No text extracted from document (possibly image-only or unreadable)."}

    # ---------- Build Prompt ----------
    prompt = (
        "You are a financial document parser for invoices and purchase orders. "
        "Always output valid JSON only — no explanation or markdown. "
        "If a field is missing, set it to null.\n\n"
        "Equivalent fields:\n"
        "- invoice_number ≈ purchase_order_reference ≈ purchase_order_id\n"
        "- total_amount ≈ total_value\n"
        "- invoice_date ≈ order_date (minor differences are normal)\n\n"
        "Expected keys:\n"
        "invoice_number, vendor, purchase_order_reference, total_amount, invoice_date, "
        "purchase_order_id, total_value, order_date\n\n"
        "Document text:\n"
        f"{extracted_text[:8000]}"  # limit to avoid token overflow
    )

    # ---------- Call Shivaay LLM ----------
    try:
        completion = client.chat.completions.create(
            model=os.getenv("SHIVAAY_MODEL", "shivaay"),
            messages=[
                {"role": "system", "content": "You are a financial document parser. Output only JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=1200
        )

        raw = completion.choices[0].message.content.strip()
        parsed = _safe_load_json(raw)

        # Try to recover embedded JSON if still text
        if isinstance(parsed, str):
            try:
                s = parsed
                start, end = s.find("{"), s.rfind("}")
                if start != -1 and end > start:
                    parsed = json.loads(s[start:end + 1])
            except Exception:
                pass

        # Guarantee dictionary return
        if isinstance(parsed, dict):
            print(f"[PARSER] Parsed keys: {list(parsed.keys())}")
            return parsed
        else:
            return {"raw_parsed": parsed if isinstance(parsed, str) else str(parsed)}

    except Exception as e:
        print(f"[PARSER LLM ERROR] {file_path}: {e}")
        return {"raw_parsed": ""}
