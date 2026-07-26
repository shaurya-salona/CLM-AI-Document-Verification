import re
from typing import List, Dict, Any

# Standard 15-character GSTIN regex pattern
GSTIN_REGEX = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"

def validate_gstin_format(gst_number: str) -> bool:
    """Check if a GSTIN matches the standard 15-character statutory format."""
    if not gst_number:
        return False
    return bool(re.match(GSTIN_REGEX, gst_number.strip().upper()))

def validate_gst_in_document(text: str, vendor_details: Dict[str, Any]) -> List[str]:
    """Validate GSTIN presence and match in document text."""
    issues = []
    text_lower = text.lower() if text else ""
    gst_num = vendor_details.get("gst_number", "").strip().lower()
    
    if gst_num and gst_num not in text_lower:
        issues.append(f"GST Number '{vendor_details.get('gst_number')}' missing from document text.")
        
    return issues
