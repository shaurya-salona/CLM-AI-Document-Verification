from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("vendor_requests.id"), nullable=False)
    document_type = Column(String(50), nullable=False) # 'work_order', 'registration', 'pf', 'esi'
    file_name = Column(String(255), nullable=True)
    file_path = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    file_data = Column(Text, nullable=True) # Base64 Data URL stored directly in PostgreSQL DB
    extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("VendorRequest", back_populates="documents")
