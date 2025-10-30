# ocr.py  – robust hybrid OCR extractor
import pdfplumber
import pytesseract
from PIL import Image

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text from a PDF.
    Falls back to OCR if the page is image-based.
    """
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for i, page in enumerate(pdf.pages, start=1):
                page_text = page.extract_text()
                if not page_text:
                    # Fallback OCR for scanned pages
                    print(f"[OCR] Page {i}: no embedded text, using Tesseract fallback.")
                    image = page.to_image(resolution=300).original
                    page_text = pytesseract.image_to_string(image)
                text += page_text or ""
    except Exception as e:
        print(f"[OCR ERROR] Could not read {file_path}: {e}")
        return ""
    return text.strip()
