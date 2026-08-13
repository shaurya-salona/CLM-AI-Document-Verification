from typing import Dict, Any, List
from datetime import datetime
from app.validators.gst_validator import validate_gstin_format
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

class ValidationService:
    @staticmethod
    def validate_payload(payload: Dict[str, Any]) -> List[str]:
        """Validate input payload before processing."""
        errors = []
        vendor_type = payload.get("vendor_type", "Contractor")
        capacity = payload.get("labour_capacity", 1)

        is_valid, msg = validate_labour_capacity(capacity, vendor_type)
        if not is_valid:
            errors.append(msg)

        phone = payload.get("phone", "")
        if phone and not validate_phone_number(phone):
            errors.append("Contact phone number must be a valid 10-digit number.")

        pin_code = payload.get("pin_code", "")
        if pin_code and not validate_pin_code(pin_code):
            errors.append("PIN Code must be a valid 6-digit number.")

        gstin = payload.get("gst_number", "").strip()
        if not gstin or len(gstin) != 15:
            errors.append("GST Number must be exactly 15 characters (e.g., 20AAACB1234C1Z5).")
        elif not validate_gstin_format(gstin):
            errors.append("GST Number format is invalid.")

        return errors

    @staticmethod
    def validate_vendor_payload(payload: Dict[str, Any]) -> List[str]:
        """Alias for validate_payload."""
        return ValidationService.validate_payload(payload)

    @staticmethod
    def validate_vendor_request(request_id: int, vendor_data: Dict[str, Any], uploaded_docs: Dict[str, str]) -> Dict[str, Any]:
        """
        Orchestrates all business rule checks, format validators, and document cross-reference verification.
        Differentiates rules for Contractor vs Supplier.
        """
        checks = []
        critical_errors = []
        warnings = []

        vendor_type = vendor_data.get("vendor_type", "Contractor")
        labour_capacity = vendor_data.get("labour_capacity", 1)
        location = vendor_data.get("location", "Jamshedpur")
        is_contractor = (vendor_type == "Contractor")

        # 0. TSL Registration Verification (SOP Eligibility Requirement #1)
        tsl_vendor_code = vendor_data.get("tsl_vendor_code", "")
        tsl_code_present = bool(tsl_vendor_code and str(tsl_vendor_code).strip() not in ["", "N.A.", "None"])
        checks.append({
            "check_name": "tsl_procurement_vendor_code_verification",
            "validator": "vendor_validator",
            "passed": tsl_code_present,
            "error_message": (
                None if tsl_code_present
                else "TSL Procurement Vendor Code not provided. SOP requires vendor to be registered with Tata Steel Limited (TSL) before CLM registration. CWR Cell must verify TSL registration status."
            )
        })
        if not tsl_code_present:
            warnings.append("TSL Procurement Vendor Code missing. Please verify vendor's Tata Steel registration before proceeding.")

        # 1. Vendor Type Validation
        v_type_valid = validate_vendor_type(vendor_type)
        checks.append({
            "check_name": f"{vendor_type.lower()}_vendor_type_validity",
            "validator": "vendor_validator",
            "passed": v_type_valid,
            "error_message": None if v_type_valid else f"Invalid vendor type: {vendor_type}"
        })
        if not v_type_valid:
            critical_errors.append(f"Invalid vendor type: {vendor_type}")

        # 2. Labour Capacity Validation (Contractor <= 9, Supplier <= 4)
        cap_valid, cap_msg = validate_labour_capacity(labour_capacity, vendor_type)
        checks.append({
            "check_name": f"{vendor_type.lower()}_labour_capacity_limit_check",
            "validator": "vendor_validator",
            "passed": cap_valid,
            "error_message": None if cap_valid else cap_msg
        })
        if not cap_valid:
            critical_errors.append(cap_msg)

        # 3. Phone Number Validation
        phone = vendor_data.get("phone", "")
        phone_valid = validate_phone_number(phone)
        checks.append({
            "check_name": "phone_number_format",
            "validator": "vendor_validator",
            "passed": phone_valid,
            "error_message": None if phone_valid else "Phone number must be a valid 10-digit number."
        })
        if not phone_valid:
            warnings.append("Phone number is not in 10-digit standard format.")

        # 4. GSTIN Format & Plant Location State Code Alignment
        gstin = vendor_data.get("gst_number", "")
        gstin_valid = validate_gstin_format(gstin)
        checks.append({
            "check_name": "gstin_format_verification",
            "validator": "gst_validator",
            "passed": gstin_valid,
            "error_message": None if gstin_valid else "Invalid 15-character GSTIN format."
        })
        if not gstin_valid:
            critical_errors.append("GSTIN format is invalid.")
        else:
            gst_state_match, gst_state_msg = cross_check_gstin_state_alignment(gstin, location)
            checks.append({
                "check_name": "gstin_state_plant_location_alignment",
                "validator": "cross_reference_validator",
                "passed": gst_state_match,
                "error_message": None if gst_state_match else gst_state_msg
            })
            if not gst_state_match:
                warnings.append(gst_state_msg)

        # 5. PIN Code Regional Postal Alignment
        pin_code = vendor_data.get("pin_code", "")
        pin_match, pin_msg = cross_check_pin_code_region(pin_code, location)
        checks.append({
            "check_name": "pin_code_regional_alignment",
            "validator": "cross_reference_validator",
            "passed": pin_match,
            "error_message": None if pin_match else pin_msg
        })
        if not pin_match:
            warnings.append(pin_msg)

        # 6. Work Order / P.O. Expiry Date Check
        expiry_date = vendor_data.get("licence_expiry_date", "")
        wo_exp_valid, wo_exp_msg = check_wo_validity_date(expiry_date)
        doc_label = "work_order" if is_contractor else "purchase_order"
        checks.append({
            "check_name": f"{doc_label}_validity_period_check",
            "validator": "cross_reference_validator",
            "passed": wo_exp_valid,
            "error_message": None if wo_exp_valid else wo_exp_msg
        })
        if not wo_exp_valid:
            critical_errors.append(wo_exp_msg)

        # 7 & 8. PF & ESI Audit Rules (Differentiated for Contractor vs Supplier)
        if is_contractor:
            # Contractor PF Check
            pf_code = vendor_data.get("pf_code", "")
            pf_format_valid, pf_format_msg = validate_pf_code_format(pf_code)
            checks.append({
                "check_name": "contractor_pf_code_format",
                "validator": "vendor_validator",
                "passed": pf_format_valid,
                "error_message": None if pf_format_valid else pf_format_msg
            })
            if not pf_format_valid:
                critical_errors.append(pf_format_msg)

            pf_doc_text = uploaded_docs.get("pf", "")
            pf_match, pf_match_msg = cross_check_pf_codes(pf_code, pf_doc_text)
            checks.append({
                "check_name": "contractor_pf_code_cross_reference",
                "validator": "cross_reference_validator",
                "passed": pf_match,
                "error_message": None if pf_match else pf_match_msg
            })
            if not pf_match:
                warnings.append(pf_match_msg)

            # Contractor ESI Check
            esi_code = vendor_data.get("esi_code", "")
            esi_format_valid, esi_format_msg = validate_esi_code_format(esi_code)
            checks.append({
                "check_name": "contractor_esi_code_format",
                "validator": "vendor_validator",
                "passed": esi_format_valid,
                "error_message": None if esi_format_valid else esi_format_msg
            })
            if not esi_format_valid:
                critical_errors.append(esi_format_msg)

            esi_doc_text = uploaded_docs.get("esi", "")
            esi_match, esi_match_msg = cross_check_esi_codes(esi_code, esi_doc_text)
            checks.append({
                "check_name": "contractor_esi_code_cross_reference",
                "validator": "cross_reference_validator",
                "passed": esi_match,
                "error_message": None if esi_match else esi_match_msg
            })
            if not esi_match:
                warnings.append(esi_match_msg)

            # Contractor 4-Document Presence Check
            has_4_docs = ("work_order" in uploaded_docs and "registration" in uploaded_docs and "pf" in uploaded_docs and "esi" in uploaded_docs)
            checks.append({
                "check_name": "contractor_mandatory_4_documents_check",
                "validator": "vendor_validator",
                "passed": has_4_docs,
                "error_message": None if has_4_docs else "Contractor requires 4 mandatory PDF certificates (Work Order, Registration, PF, ESI)."
            })
            if not has_4_docs:
                critical_errors.append("Contractor missing required compliance PDF documents.")

        else:
            # Supplier PF & ESI Statutory Exemption Verification
            checks.append({
                "check_name": "supplier_pf_statutory_exemption",
                "validator": "cross_reference_validator",
                "passed": True,
                "error_message": "PF Code & Allotment Letter exempt for Suppliers (PF Flag = No per Tata Steel SOP)."
            })
            checks.append({
                "check_name": "supplier_esi_statutory_exemption",
                "validator": "cross_reference_validator",
                "passed": True,
                "error_message": "ESI Code & Allotment Letter exempt for Suppliers (ESI Flag = No per Tata Steel SOP)."
            })

            # Supplier 2-Document Presence Check
            has_2_docs = ("work_order" in uploaded_docs and "registration" in uploaded_docs)
            checks.append({
                "check_name": "supplier_mandatory_2_documents_check",
                "validator": "vendor_validator",
                "passed": has_2_docs,
                "error_message": None if has_2_docs else "Supplier requires 2 mandatory PDF documents (Purchase Order and Registration)."
            })
            if not has_2_docs:
                critical_errors.append("Supplier missing required Purchase Order or Registration document.")

        # 9. Document Cross-Reference Check (Company Name in Work Order / P.O.)
        wo_text = uploaded_docs.get("work_order", "")
        comp_name = vendor_data.get("company_name", "")
        comp_match, comp_msg = cross_check_company_name(comp_name, wo_text)
        checks.append({
            "check_name": "company_name_document_cross_reference",
            "validator": "cross_reference_validator",
            "passed": comp_match,
            "error_message": None if comp_match else comp_msg
        })

        overall_valid = len(critical_errors) == 0

        return {
            "request_id": request_id,
            "vendor_type": vendor_type,
            "overall_valid": overall_valid,
            "validation_checks": checks,
            "critical_errors": critical_errors,
            "warnings": warnings,
            "timestamp": datetime.utcnow().isoformat()
        }
