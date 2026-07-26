from typing import List, Dict, Any

def validate_workorder_document(text: str, vendor_details: Dict[str, Any]) -> List[str]:
    """Validate Work Order specific rules: designation, validity/expiration, scope."""
    issues = []
    text_lower = text.lower() if text else ""
    comp_name = vendor_details.get("company_name", "").strip().lower()

    # Company name check
    if comp_name and comp_name not in text_lower:
        issues.append(f"Company name '{vendor_details.get('company_name')}' not explicitly matched in extracted Work Order text.")

    # Work Order designation check
    if "work order" not in text_lower and "order no" not in text_lower and "wo/" not in text_lower:
        issues.append("Work Order number or formal designation not clearly identified.")

    # Validity / Expiration check
    if "expiry" not in text_lower and "validity" not in text_lower and "valid till" not in text_lower:
        issues.append("Validity period or expiration date not explicitly stated.")

    return issues
