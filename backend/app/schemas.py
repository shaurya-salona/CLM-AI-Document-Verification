from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    location: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ApproverOut(BaseModel):
    id: int
    name: str
    location: str

    class Config:
        from_attributes = True

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

class AIRemarkOut(BaseModel):
    id: int
    document_type: str
    confidence_score: Optional[str] = None
    compliance_status: Optional[str] = None
    remarks: str
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

class ApproverDecision(BaseModel):
    request_id: int
    remarks: Optional[str] = ""

class AIRemarkGenerateRequest(BaseModel):
    request_id: int
