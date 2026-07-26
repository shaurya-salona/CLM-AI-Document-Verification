from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class VendorRequest(Base):
    __tablename__ = "vendor_requests"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    vendor_name = Column(String(100), nullable=False)
    company_name = Column(String(150), nullable=False)
    address = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    gst_number = Column(String(50), nullable=True)
    location = Column(String(50), nullable=False)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approver = Column(String(100), nullable=False) # Approver name for convenience
    status = Column(String(20), default="Pending") # 'Pending', 'Approved', 'Rejected'
    decision_remarks = Column(Text, nullable=True) # Comments added by human approver
    decision_at = Column(DateTime, nullable=True) # Timestamp of decision
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vendor_user = relationship("User", foreign_keys=[vendor_id], back_populates="vendor_requests")
    approver_user = relationship("User", foreign_keys=[approver_id], back_populates="assigned_requests")
    
    documents = relationship("Document", back_populates="request", cascade="all, delete-orphan")
    ai_remarks = relationship("AIRemark", back_populates="request", cascade="all, delete-orphan")
