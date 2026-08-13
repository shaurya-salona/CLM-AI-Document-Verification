import re
from typing import Tuple

def validate_vendor_type(vendor_type: str) -> bool:
    """Validate vendor type is either Contractor or Supplier."""
    return vendor_type in ["Contractor", "Supplier"]

def validate_labour_capacity(capacity: int, vendor_type: str) -> Tuple[bool, str]:
    """
    Validate labour capacity rules:
    - Contractor: Max 9 (reject if > 9)
    - Supplier: Max 4 (reject if > 4)
    """
    if capacity < 0:
        return False, "Labour capacity cannot be negative."
    
    if vendor_type == "Contractor":
        if capacity > 9:
            return False, "Contractor labour capacity exceeds maximum limit of 9."
    elif vendor_type == "Supplier":
        if capacity > 4:
            return False, "Supplier labour capacity exceeds maximum limit of 4."
    return True, "Valid labour capacity."

def validate_nature_of_work(nature: str) -> bool:
    """Validate nature of work is non-empty."""
    return bool(nature and len(nature.strip()) >= 3)

def validate_phone_number(phone: str) -> bool:
    """Validate 10-digit phone number format (strips non-digits and checks last 10 digits)."""
    digits = re.sub(r'\D', '', phone or "")
    return len(digits) >= 10

def validate_pin_code(pin_code: str) -> bool:
    """Validate 6-digit Indian PIN code format."""
    digits = re.sub(r'\D', '', pin_code or "")
    return len(digits) == 6

def validate_pf_code_format(pf_code: str) -> Tuple[bool, str]:
    """Validate EPFO PF Code format."""
    if not pf_code or pf_code == "N.A.":
        return False, "PF Code is missing."
    pattern = r'^[A-Z]{2}/[A-Z0-9]{3,7}/[0-9]{5,7}(/[0-9]{3})?$'
    if re.match(pattern, pf_code.strip().upper()):
        return True, "Valid PF Code format."
    if len(pf_code.strip()) >= 5:
        return True, "PF Code format accepted."
    return False, "Invalid PF Code format."

def validate_esi_code_format(esi_code: str) -> Tuple[bool, str]:
    """Validate ESIC ESI Code format."""
    if not esi_code or esi_code == "N.A.":
        return False, "ESI Code is missing."
    digits = re.sub(r'\D', '', esi_code)
    if len(digits) >= 10:
        return True, "Valid ESI Code format."
    return False, "Invalid ESI Code format."
