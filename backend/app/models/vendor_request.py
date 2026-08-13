from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class VendorRequest(Base):
    __tablename__ = "vendor_requests"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    vendor_type = Column(String(50), default="Contractor") # 'Contractor' or 'Supplier'

    # ── TSL Registration Verification (SOP Requirement #1) ──────────────────
    tsl_vendor_code = Column(String(50), nullable=True) # TSL Procurement Vendor Code
    tsl_registration_verified = Column(Boolean, default=False) # True once CWR Cell confirms TSL registration
    tsl_verification_date = Column(DateTime, nullable=True) # Timestamp of TSL registration verification
    vendor_name = Column(String(100), nullable=False)
    company_name = Column(String(150), nullable=False)
    nature_of_work = Column(String(255), nullable=True)
    labour_capacity = Column(Integer, default=1)
    licence_flag = Column(String(10), default="No")
    licence_number = Column(String(20), default="N.A.")
    licence_expiry_date = Column(String(50), nullable=True)
    capping_detail = Column(String(50), default="NA") # Screenshot field: Capping Detail (NA)
    ec_policy_doc = Column(String(255), nullable=True) # Screenshot field: EC / WC Policy Doc
    
    pf_flag = Column(Boolean, default=True)
    pf_code = Column(String(50), nullable=True)
    esi_flag = Column(Boolean, default=True)
    esi_code = Column(String(50), nullable=True)
    
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pin_code = Column(String(20), nullable=True)
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
