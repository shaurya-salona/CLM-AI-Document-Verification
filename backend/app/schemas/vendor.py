from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.ai import AIRemarkOut

class VendorRequestCreate(BaseModel):
    vendor_type: Optional[str] = "Contractor"
    tsl_vendor_code: Optional[str] = None  # TSL Procurement-assigned Vendor Code
    owner_name: str
    company_name: str
    nature_of_work: Optional[str] = None
    labour_capacity: Optional[int] = 1
    licence_flag: Optional[str] = "No"
    licence_number: Optional[str] = "N.A."
    licence_expiry_date: Optional[str] = None
    capping_detail: Optional[str] = "NA"
    ec_policy_doc: Optional[str] = None
    pf_flag: Optional[bool] = True
    pf_code: Optional[str] = None
    esi_flag: Optional[bool] = True
    esi_code: Optional[str] = None
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    phone: str
    email: str
    gst_number: str
    location: str
    approver_id: int

class DocumentOut(BaseModel):
    id: int
    document_type: str
    file_name: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    file_data: Optional[str] = None # Base64 encoded PDF string
    extracted_text: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class VendorRequestOut(BaseModel):
    id: int
    vendor_type: Optional[str] = "Contractor"
    tsl_vendor_code: Optional[str] = None
    tsl_registration_verified: Optional[bool] = False
    tsl_verification_date: Optional[datetime] = None
    vendor_name: str
    company_name: str
    nature_of_work: Optional[str] = None
    labour_capacity: Optional[int] = 1
    licence_flag: Optional[str] = "No"
    licence_number: Optional[str] = "N.A."
    licence_expiry_date: Optional[str] = None
    capping_detail: Optional[str] = "NA"
    ec_policy_doc: Optional[str] = None
    pf_flag: Optional[bool] = True
    pf_code: Optional[str] = None
    esi_flag: Optional[bool] = True
    esi_code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gst_number: Optional[str] = None
    location: str
    approver: str
    approver_id: Optional[int] = None
    status: str
    decision_remarks: Optional[str] = None
    decision_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    documents: List[DocumentOut] = []
    ai_remarks: List[AIRemarkOut] = []

    class Config:
        from_attributes = True
