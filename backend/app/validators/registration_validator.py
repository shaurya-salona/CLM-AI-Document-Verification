from typing import List, Dict, Any
from app.validators.gst_validator import validate_gst_in_document

def validate_registration_document(text: str, vendor_details: Dict[str, Any]) -> List[str]:
    """Validate Registration Certificate rules: GST match, CIN/Reg Number."""
    issues = []
    text_lower = text.lower() if text else ""
    comp_name = vendor_details.get("company_name", "").strip().lower()

    # Company name check
    if comp_name and comp_name not in text_lower:
        issues.append(f"Company name '{vendor_details.get('company_name')}' not explicitly matched in extracted document text.")

    # GST Number match check
    gst_issues = validate_gst_in_document(text, vendor_details)
    issues.extend(gst_issues)

    # Registration / CIN Number check
    if "registration number" not in text_lower and "reg no" not in text_lower and "cin" not in text_lower:
        issues.append("Official registration number format could not be verified.")

    return issues
