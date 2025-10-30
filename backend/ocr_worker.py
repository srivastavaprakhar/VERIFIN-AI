import pdfplumber
import pytesseract
from PIL import Image
import io

def extract_text(file_bytes: bytes, filename: str) -> str:
    if filename.endswith(".pdf"):
        text = ""
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text
    else:
        image = Image.open(io.BytesIO(file_bytes))
        return pytesseract.image_to_string(image)
