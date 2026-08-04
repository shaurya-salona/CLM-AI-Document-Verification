import pytest
from app.validators import (
    validate_gstin_format,
    validate_workorder_document,
    validate_pf_document,
    validate_esi_document
)
from app.services.validation_service import ValidationService

def test_gstin_validation():
    # Valid 15-character GSTIN
    assert validate_gstin_format("20AAACB1234C1Z5") is True
    assert validate_gstin_format("21BBBCB9876D2Z8") is True

    # Invalid GSTIN formats
    assert validate_gstin_format("INVALID_GST") is False
    assert validate_gstin_format("12345") is False
    assert validate_gstin_format("") is False

def test_validation_service_payload():
    valid_payload = {
        "owner_name": "Ramesh Kumar",
        "company_name": "Apex Infra Ltd",
        "address": "Industrial Area, Phase-2",
        "phone": "+91 9876543210",
        "email": "vendor@clm.com",
        "gst_number": "20AAACB1234C1Z5"
    }
    errors = ValidationService.validate_vendor_payload(valid_payload)
    assert len(errors) == 0

    invalid_payload = {
        "owner_name": "",
        "company_name": "Apex Infra Ltd",
        "address": "",
        "phone": "9876543210",
        "email": "vendor@clm.com",
        "gst_number": "INVALID"
    }
    errors = ValidationService.validate_vendor_payload(invalid_payload)
    assert len(errors) > 0
