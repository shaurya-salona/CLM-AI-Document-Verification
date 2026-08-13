import pytest
from datetime import date, timedelta
from app.validators.vendor_validator import (
    validate_vendor_type,
    validate_labour_capacity,
    validate_phone_number,
    validate_pin_code,
    validate_pf_code_format,
    validate_esi_code_format
)
from app.validators.cross_reference_validator import (
    cross_check_pf_codes,
    cross_check_esi_codes,
    cross_check_company_name,
    cross_check_gstin_state_alignment,
    cross_check_pin_code_region,
    check_wo_validity_date
)
from app.services.validation_service import ValidationService

def test_vendor_type_and_labour_capacity():
    assert validate_vendor_type("Contractor") is True
    assert validate_vendor_type("Supplier") is True
    assert validate_vendor_type("InvalidType") is False

    # Contractor max 9
    valid_c, _ = validate_labour_capacity(8, "Contractor")
    assert valid_c is True
    invalid_c, _ = validate_labour_capacity(12, "Contractor")
    assert invalid_c is False

    # Supplier max 4
    valid_s, _ = validate_labour_capacity(4, "Supplier")
    assert valid_s is True
    invalid_s, _ = validate_labour_capacity(6, "Supplier")
    assert invalid_s is False

def test_phone_and_pin_code_validation():
    assert validate_phone_number("9876543210") is True
    assert validate_phone_number("+91 9876543210") is True
    assert validate_phone_number("123") is False

    assert validate_pin_code("831002") is True
    assert validate_pin_code("123") is False

def test_cross_reference_validators():
    # PF code check
    pf_match, _ = cross_check_pf_codes("PY/KRP/0012345/000", "Employer Name: Apex Infra, PF Code: PY/KRP/0012345/000")
    assert pf_match is True

    # ESI code check
    esi_match, _ = cross_check_esi_codes("31000998877665544", "ESIC Office: Jamshedpur, ESI Code: 31000998877665544")
    assert esi_match is True

    # Company name check
    comp_match, _ = cross_check_company_name("Apex Infrastructure Ltd", "Work Order for Apex Infrastructure Ltd")
    assert comp_match is True

def test_wo_validity_date_checker():
    # Unexpired date (future)
    future_date = (date.today() + timedelta(days=180)).strftime("%Y-%m-%d")
    is_valid, msg = check_wo_validity_date(future_date)
    assert is_valid is True

    # Expired date (past)
    past_date = (date.today() - timedelta(days=30)).strftime("%Y-%m-%d")
    is_valid_past, msg_past = check_wo_validity_date(past_date)
    assert is_valid_past is False
    assert "EXPIRED" in msg_past

def test_gstin_state_code_alignment():
    # 20 = Jharkhand for Jamshedpur
    valid_jh, _ = cross_check_gstin_state_alignment("20AAACB1234C1Z5", "Jamshedpur")
    assert valid_jh is True

    # 21 = Odisha for Kalinganagar
    valid_or, _ = cross_check_gstin_state_alignment("21AAACB1234C1Z5", "Kalinganagar")
    assert valid_or is True

    # Mismatch check: 20 for Kalinganagar (expects 21)
    mismatch, msg = cross_check_gstin_state_alignment("20AAACB1234C1Z5", "Kalinganagar")
    assert mismatch is False
    assert "mismatch" in msg.lower()

def test_pin_code_regional_alignment():
    # 83 = Jharkhand region
    valid_pin, _ = cross_check_pin_code_region("831002", "Jamshedpur")
    assert valid_pin is True

    # 75 = Odisha region
    valid_odisha_pin, _ = cross_check_pin_code_region("755001", "Kalinganagar")
    assert valid_odisha_pin is True

def test_differentiated_supplier_validation_report():
    vendor_data = {
        "vendor_type": "Supplier",
        "company_name": "Tata Metal Supplier Corp",
        "owner_name": "Ramesh Kumar",
        "phone": "9876543210",
        "gst_number": "21AAACB1234C1Z5",
        "labour_capacity": 4,
        "licence_expiry_date": (date.today() + timedelta(days=90)).strftime("%Y-%m-%d"),
        "pin_code": "755001",
        "location": "Kalinganagar"
    }
    docs = {
        "work_order": "Purchase Order WO/2026/KAL/1234 Company Name: Tata Metal Supplier Corp",
        "registration": "Registration Certificate GST 21AAACB1234C1Z5"
    }
    report = ValidationService.validate_vendor_request(1, vendor_data, docs)
    assert report["overall_valid"] is True
    assert report["vendor_type"] == "Supplier"
    
    # Check that supplier PF & ESI statutory exemptions are present
    check_names = [c["check_name"] for c in report["validation_checks"]]
    assert "supplier_pf_statutory_exemption" in check_names
    assert "supplier_esi_statutory_exemption" in check_names
