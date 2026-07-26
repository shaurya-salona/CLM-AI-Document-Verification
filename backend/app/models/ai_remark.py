from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class AIRemark(Base):
    __tablename__ = "ai_remarks"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("vendor_requests.id"), nullable=False)
    document_type = Column(String(50), nullable=False) # 'work_order', 'registration', 'pf', 'esi'
    confidence_score = Column(String(20), nullable=True) # e.g. '96%'
    compliance_status = Column(String(30), nullable=True) # 'COMPLIANT' or 'ACTION REQUIRED'
    remarks = Column(Text, nullable=False) # Stored JSON text format
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    request = relationship("VendorRequest", back_populates="ai_remarks")
