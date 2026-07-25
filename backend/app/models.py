from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False) # 'vendor' or 'approver'
    location = Column(String(50), nullable=True) # e.g. Jamshedpur, Kalinganagar, West Bokaro
    created_at = Column(DateTime, default=datetime.utcnow)

    vendor_requests = relationship("VendorRequest", foreign_keys="VendorRequest.vendor_id", back_populates="vendor_user")
    assigned_requests = relationship("VendorRequest", foreign_keys="VendorRequest.approver_id", back_populates="approver_user")


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


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("vendor_requests.id"), nullable=False)
    document_type = Column(String(50), nullable=False) # 'work_order', 'registration', 'pf', 'esi'
    file_name = Column(String(255), nullable=True)
    file_path = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=True)
    extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("VendorRequest", back_populates="documents")


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
