# parser_local.py
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from typing import Union

# use your OCR helper
from ocr import extract_text_from_pdf
from ocr_worker import extract_text as extract_text_from_bytes

load_dotenv()

client = OpenAI(
    api_key=os.getenv("SHIVAAY_API_KEY"),
    base_url=os.getenv("SHIVAAY_BASE_URL", "https://api.futurixai.com/api/shivaay/v1")
)

def _safe_load_json(text: str) -> Union[dict, str]:
    """Try to parse text as JSON, otherwise return cleaned text string."""
    try:
        return json.loads(text)
    except Exception:
        # try to be tolerant: if text contains markdown fences, strip them
        cleaned = text.strip().strip("` \n")
        try:
            return json.loads(cleaned)
        except Exception:
            return cleaned

def parse_with_shivaay_ai(file_path: str) -> dict:
    """
    Accepts a file path (PDF or image).
    - extracts text using pdfplumber/pytesseract
    - calls Shivaay LLM asking for a structured JSON
    - returns a dict (if JSON parseable) or a dict with 'raw_parsed' text otherwise
    """
    # Extract text first
    ext = file_path.lower().split(".")[-1]
    extracted_text = ""
    try:
        if ext == "pdf":
            extracted_text = extract_text_from_pdf(file_path)
        else:
            # open bytes and use ocr_worker for images
            with open(file_path, "rb") as f:
                file_bytes = f.read()
            extracted_text = extract_text_from_bytes(file_bytes, os.path.basename(file_path))
    except Exception as e:
        print("OCR error:", e)
        extracted_text = ""

        prompt = (
        "You are a financial document parser for invoices and purchase orders. "
        "Extract structured fields and return valid JSON only (no explanation). "
        "If a field is missing, omit it or set it to null.\n\n"
        "Field equivalences to understand:\n"
        "- 'invoice_number' and 'purchase_order_id' or 'purchase_order_reference' refer to document identifiers that may cross-reference each other.\n"
        "- Dates (invoice_date and order_date) may differ slightly; that does not imply a mismatch.\n"
        "- Always extract vendor, totals, and identifiers clearly.\n\n"
        "Expected keys for an invoice:\n"
        "invoice_number, vendor, purchase_order_reference, total_amount, invoice_date\n\n"
        "Expected keys for a purchase order:\n"
        "purchase_order_id, vendor, total_value, order_date\n\n"
        "Document:\n"
        f"{extracted_text}"
    )

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
        # if parsed is a string (still text), try a last resort: look for a JSON substring
        if isinstance(parsed, str):
            # try to find first '{' and last '}' and json.loads that slice
            try:
                s = parsed
                start = s.find('{')
                end = s.rfind('}')
                if start != -1 and end != -1 and end > start:
                    maybe = s[start:end+1]
                    parsed2 = json.loads(maybe)
                    parsed = parsed2
            except Exception:
                pass

        # Guarantee a dict return type for callers
        if isinstance(parsed, dict):
            return parsed
        else:
            # fallback: wrap parsed text
            return {"raw_parsed": parsed if isinstance(parsed, str) else str(parsed)}

    except Exception as e:
        print("Error calling Shivaay API:", e)
        return {"raw_parsed": ""}
