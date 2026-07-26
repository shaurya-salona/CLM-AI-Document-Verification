from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AIRemarkOut(BaseModel):
    id: int
    document_type: str
    confidence_score: Optional[str] = None
    compliance_status: Optional[str] = None
    remarks: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AIRemarkGenerateRequest(BaseModel):
    request_id: int
