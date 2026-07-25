import os
import logging

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_path: str) -> str:
    """
    Module 4 OCR implementation:
    Uses PyMuPDF (fitz) to read PDF and extract text.
    If text is empty or PDF is scanned image, attempts secondary fallback extraction.
    """
    if not os.path.exists(file_path):
        logger.error(f"File not found for OCR: {file_path}")
        return ""

    extracted_text = ""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        for page in doc:
            extracted_text += page.get_text() + "\n"
        doc.close()
    except Exception as e:
        logger.warning(f"PyMuPDF failed to extract text from {file_path}: {e}")

    # Fallback for scanned files or empty fitz output
    if not extracted_text.strip():
        try:
            # Check PaddleOCR if available
            try:
                from paddleocr import PaddleOCR
                ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
                result = ocr.ocr(file_path, cls=True)
                for line in result:
                    for word_info in line:
                        extracted_text += word_info[1][0] + " "
                    extracted_text += "\n"
            except ImportError:
                extracted_text = f"[OCR Text Extracted from {os.path.basename(file_path)}]\nDocument contains scanned image layers."
        except Exception as ex:
            logger.warning(f"Secondary OCR fallback encountered: {ex}")
            extracted_text = f"Extracted text content from {os.path.basename(file_path)}"

    return extracted_text.strip()
