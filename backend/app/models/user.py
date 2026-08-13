from sqlalchemy import Column, Integer, String, DateTime, Boolean
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
    
    # ── OTP & Email Verification (Tata Steel 2FA Security) ─────────────────
    is_email_verified = Column(Boolean, default=False)
    otp_code = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    vendor_requests = relationship("VendorRequest", foreign_keys="VendorRequest.vendor_id", back_populates="vendor_user")
    assigned_requests = relationship("VendorRequest", foreign_keys="VendorRequest.approver_id", back_populates="approver_user")
