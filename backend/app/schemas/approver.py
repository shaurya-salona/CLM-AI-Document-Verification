from pydantic import BaseModel
from typing import Optional

class ApproverOut(BaseModel):
    id: int
    name: str
    email: str
    location: str

    class Config:
        from_attributes = True

class ApproverDecision(BaseModel):
    request_id: int
    remarks: Optional[str] = None