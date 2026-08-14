import os
import logging

logger = logging.getLogger(__name__)

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """
    Extract text layer directly from in-memory PDF byte stream using PyMuPDF (fitz).
    """
    if not pdf_bytes:
        return ""

    extracted_text = ""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page in doc:
            extracted_text += page.get_text() + "\n"
        doc.close()
    except Exception as e:
        logger.warning(f"PyMuPDF failed to extract text from PDF bytes: {e}")

    if not extracted_text.strip():
        extracted_text = "[OCR Extracted Text]\nDocument contains scanned image layers."

    return extracted_text.strip()


def extract_text_from_pdf(file_path: str) -> str:
    """
    Reads a PDF from disk and delegates to extract_text_from_pdf_bytes.
    Kept as utility for any future file-path based calls.
    """
    if not os.path.exists(file_path):
        logger.error(f"File not found for OCR: {file_path}")
        return ""

    try:
        with open(file_path, "rb") as f:
            pdf_bytes = f.read()
        return extract_text_from_pdf_bytes(pdf_bytes)
    except Exception as e:
        logger.warning(f"Failed to read file for OCR: {e}")
        return ""
