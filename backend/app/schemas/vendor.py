from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.ai import AIRemarkOut

class VendorRequestCreate(BaseModel):
    owner_name: str
    company_name: str
    address: str
    phone: str
    email: str
    gst_number: str
    location: str
    approver_id: int

class DocumentOut(BaseModel):
    id: int
    document_type: str
    file_name: Optional[str] = None
    file_path: str
    file_size: Optional[int] = None
    extracted_text: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class VendorRequestOut(BaseModel):
    id: int
    vendor_name: str
    company_name: str
    address: Optional[str] = None
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
