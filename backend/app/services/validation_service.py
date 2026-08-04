from typing import Dict, Any, List
from app.validators import (
    validate_gstin_format,
    validate_document
)

class ValidationService:
    """
    Service layer providing unified validation interface for vendor registration payloads,
    statutory GSTIN checks, and document compliance text verification.
    """

    @staticmethod
    def validate_gstin(gstin: str) -> bool:
        """Validates 15-character GSTIN format."""
        return validate_gstin_format(gstin)

    @staticmethod
    def audit_document_text(
        doc_type: str, 
        text: str, 
        standard: Dict[str, Any], 
        vendor_details: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Runs statutory document validator against extracted OCR text."""
        return validate_document(doc_type, text, standard, vendor_details)

    @staticmethod
    def validate_vendor_payload(payload: Dict[str, Any]) -> List[str]:
        """Validates vendor registration form fields before DB insertion."""
        errors = []

        if not payload.get("owner_name", "").strip():
            errors.append("Owner name cannot be empty.")
        if not payload.get("company_name", "").strip():
            errors.append("Company name cannot be empty.")
        if not payload.get("address", "").strip():
            errors.append("Address cannot be empty.")
        if not payload.get("phone", "").strip():
            errors.append("Phone number cannot be empty.")
        if not payload.get("email", "").strip():
            errors.append("Email address cannot be empty.")
        
        gstin = payload.get("gst_number", "").strip()
        if not gstin or len(gstin) != 15:
            errors.append("GST Number must be exactly 15 characters (e.g., 20AAACB1234C1Z5).")
        elif not validate_gstin_format(gstin):
            errors.append("GST Number format is invalid.")

        return errors
