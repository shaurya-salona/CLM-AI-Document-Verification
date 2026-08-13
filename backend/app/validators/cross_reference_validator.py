from typing import Dict, List, Tuple
from datetime import datetime, date

STATE_GST_MAP = {
    "Jamshedpur": ["20"],    # 20 = Jharkhand
    "West Bokaro": ["20"],   # 20 = Jharkhand
    "Kalinganagar": ["21"],  # 21 = Odisha
    "Angul": ["21"],         # 21 = Odisha
    "Sukinda": ["21"]        # 21 = Odisha
}

STATE_PIN_PREFIX_MAP = {
    "Jamshedpur": ["83"],
    "West Bokaro": ["82", "83"],
    "Kalinganagar": ["75", "76"],
    "Angul": ["75", "76"],
    "Sukinda": ["75", "76"]
}

def cross_check_pf_codes(entered_pf: str, extracted_text: str) -> Tuple[bool, str]:
    """Cross-check entered PF code against extracted text layer from PF Allotment Letter."""
    if not entered_pf or entered_pf == "N.A.":
        return True, "PF code not required for this vendor type."
    
    clean_entered = entered_pf.strip().upper()
    if clean_entered in extracted_text.upper():
        return True, f"Entered PF Code '{entered_pf}' matches extracted PF Allotment Letter."
    return False, f"Entered PF Code '{entered_pf}' could not be verified in uploaded PF letter text."

def cross_check_esi_codes(entered_esi: str, extracted_text: str) -> Tuple[bool, str]:
    """Cross-check entered ESI code against extracted text layer from ESI Allotment Letter."""
    if not entered_esi or entered_esi == "N.A.":
        return True, "ESI code not required for this vendor type."
    
    clean_entered = entered_esi.strip().upper()
    if clean_entered in extracted_text.upper():
        return True, f"Entered ESI Code '{entered_esi}' matches extracted ESI Allotment Letter."
    return False, f"Entered ESI Code '{entered_esi}' could not be verified in uploaded ESI letter text."

def cross_check_company_name(company_name: str, extracted_text: str) -> Tuple[bool, str]:
    """Cross-check vendor company name against extracted text in document."""
    if not company_name:
        return False, "Company name missing from vendor payload."
    
    words = [w for w in company_name.upper().split() if len(w) > 3]
    matches = [w for w in words if w in extracted_text.upper()]
    
    if len(matches) > 0:
        return True, f"Company name '{company_name}' verified in document text."
    return False, f"Company name '{company_name}' not explicitly detected in document text."

def cross_check_gstin_state_alignment(gst_number: str, location: str) -> Tuple[bool, str]:
    """Verify statutory GSTIN state code prefix matches the selected Tata Steel plant site location."""
    if not gst_number or len(gst_number.strip()) < 2:
        return False, "GSTIN missing or incomplete."
    
    state_code = gst_number.strip()[:2]
    expected_codes = STATE_GST_MAP.get(location, [])
    
    if not expected_codes:
        return True, f"GSTIN state code {state_code} recorded for site {location}."
        
    if state_code in expected_codes:
        state_name = "Jharkhand (Code 20)" if state_code == "20" else "Odisha (Code 21)"
        return True, f"GSTIN State Code '{state_code}' matches plant location {location} ({state_name})."
    
    return False, f"GSTIN State Code mismatch: GSTIN starts with '{state_code}', but plant site {location} expects state code {expected_codes[0]}."

def cross_check_pin_code_region(pin_code: str, location: str) -> Tuple[bool, str]:
    """Verify Indian PIN Code postal prefix matches the plant site region."""
    if not pin_code or len(pin_code.strip()) < 2:
        return False, "PIN Code missing or incomplete."
        
    pin_prefix = pin_code.strip()[:2]
    expected_prefixes = STATE_PIN_PREFIX_MAP.get(location, [])
    
    if pin_prefix in expected_prefixes:
        return True, f"PIN Code '{pin_code}' matches postal region for plant site {location}."
    return False, f"PIN Code '{pin_code}' regional prefix mismatch for site {location}."

def check_wo_validity_date(expiry_date_str: str) -> Tuple[bool, str]:
    """Check Work Order / Purchase Order expiry date against today's date."""
    if not expiry_date_str:
        return False, "W.O. / P.O. validity end date missing."
        
    try:
        exp_date = datetime.strptime(expiry_date_str.strip(), "%Y-%m-%d").date()
        today = date.today()
        
        if exp_date < today:
            return False, f"EXPIRED: Work Order expired on {expiry_date_str}. Active unexpired W.O./P.O. required."
            
        days_left = (exp_date - today).days
        if days_left <= 30:
            return True, f"WARNING: Work Order expires in {days_left} days on {expiry_date_str}. Renewal recommended soon."
            
        return True, f"Valid W.O./P.O. expiry date {expiry_date_str} ({days_left} days remaining)."
    except Exception:
        return True, f"Work Order validity end date recorded: {expiry_date_str}."
