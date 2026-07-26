from typing import Dict, Any
from app.validators.gst_validator import validate_gstin_format, validate_gst_in_document
from app.validators.workorder_validator import validate_workorder_document
from app.validators.registration_validator import validate_registration_document
from app.validators.pf_validator import validate_pf_document
from app.validators.esi_validator import validate_esi_document

DOC_TYPE_DISPLAY_MAP = {
    "work_order": "Work Order",
    "registration": "Registration Certificate",
    "pf": "PF Certificate",
    "esi": "ESI Certificate"
}

def validate_document(doc_type: str, text: str, standard: Dict[str, Any], vendor_details: Dict[str, Any]) -> Dict[str, Any]:
    """
    Unified validation dispatcher that routes text verification to specific document validators.
    Calculates confidence scores, compliance status, and suggestions.
    """
    display_doc_name = DOC_TYPE_DISPLAY_MAP.get(doc_type, doc_type)
    issues = []

    if doc_type in ["work_order", "Work Order"]:
        issues = validate_workorder_document(text, vendor_details)
    elif doc_type in ["registration", "Registration Certificate"]:
        issues = validate_registration_document(text, vendor_details)
    elif doc_type in ["pf", "PF Certificate"]:
        issues = validate_pf_document(text, vendor_details)
    elif doc_type in ["esi", "ESI Certificate"]:
        issues = validate_esi_document(text, vendor_details)
    else:
        # Default fallback company check
        comp_name = vendor_details.get("company_name", "").strip().lower()
        if text and comp_name and comp_name not in text.lower():
            issues.append(f"Company name '{vendor_details.get('company_name')}' not explicitly matched in document.")

    # Calculate Confidence Score
    confidence = 96 - (len(issues) * 12)
    if confidence < 50:
        confidence = 55

    status = "ACTION REQUIRED" if issues else "COMPLIANT"
    suggestion = (
        "Document complies with basic requirements. Human approver may conduct final verification."
        if not issues
        else f"Request updated or clearer copy of {display_doc_name} addressing noted compliance remarks."
    )

    return {
        "Document": display_doc_name,
        "Confidence Score": f"{confidence}%",
        "Compliance Status": status,
        "Issues Found": issues if issues else ["No critical formatting errors detected in OCR text layer."],
        "Suggestion": suggestion
    }

__all__ = [
    "validate_gstin_format",
    "validate_gst_in_document",
    "validate_workorder_document",
    "validate_registration_document",
    "validate_pf_document",
    "validate_esi_document",
    "validate_document"
]
