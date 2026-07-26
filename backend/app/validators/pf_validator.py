from typing import List, Dict, Any

def validate_pf_document(text: str, vendor_details: Dict[str, Any]) -> List[str]:
    """Validate PF Certificate rules: EPFO code, establishment number, coverage."""
    issues = []
    text_lower = text.lower() if text else ""
    comp_name = vendor_details.get("company_name", "").strip().lower()

    # Company name check
    if comp_name and comp_name not in text_lower:
        issues.append(f"Company name '{vendor_details.get('company_name')}' not explicitly matched in extracted PF Certificate text.")

    # EPFO / PF Establishment code check
    if "pf code" not in text_lower and "epfo" not in text_lower and "estt code" not in text_lower:
        issues.append("PF Establishment Code / EPFO Number missing or invalid format.")

    # Expiry / Coverage check
    if "expiry" not in text_lower and "coverage" not in text_lower:
        issues.append("PF Expiry date / coverage period not clearly specified.")

    return issues
