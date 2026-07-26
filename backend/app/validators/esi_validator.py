from typing import List, Dict, Any

def validate_esi_document(text: str, vendor_details: Dict[str, Any]) -> List[str]:
    """Validate ESI Certificate rules: 17-digit ESIC code, registration status."""
    issues = []
    text_lower = text.lower() if text else ""
    comp_name = vendor_details.get("company_name", "").strip().lower()

    # Company name check
    if comp_name and comp_name not in text_lower:
        issues.append(f"Company name '{vendor_details.get('company_name')}' not explicitly matched in extracted ESI Certificate text.")

    # ESIC Code check
    if "esi code" not in text_lower and "esic" not in text_lower and "code no" not in text_lower:
        issues.append("ESI 17-digit Employer Code number missing.")

    # Validity / Registration Date check
    if "validity" not in text_lower and "date of registration" not in text_lower:
        issues.append("ESIC registration date or active status stamp missing.")

    return issues
