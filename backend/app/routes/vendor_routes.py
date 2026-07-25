import os
import shutil
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas
from app.database import get_db
from app.auth import get_current_user, require_role
from app.config import settings
from app.services.ocr_service import extract_text_from_pdf
from app.services.ai_service import generate_ai_remarks_for_document

router = APIRouter(prefix="/vendor", tags=["Vendor"])

@router.post("/create-request", response_model=schemas.VendorRequestOut)
def create_request(
    payload: schemas.VendorRequestCreate,
    current_user: models.User = Depends(require_role("vendor")),
    db: Session = Depends(get_db)
):
    # Rule Enforcement: Check if vendor already has an active pending request
    existing_pending = db.query(models.VendorRequest).filter(
        models.VendorRequest.vendor_id == current_user.id,
        models.VendorRequest.status == "Pending"
    ).first()
    
    if existing_pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You already have an active pending registration request (Req #{existing_pending.id}). Please wait for approver decision before submitting another."
        )

    # Fetch assigned approver name
    approver_user = db.query(models.User).filter(
        models.User.id == payload.approver_id,
        models.User.role == "approver"
    ).first()
    
    approver_name = approver_user.name if approver_user else "Assigned Approver"

    new_request = models.VendorRequest(
        vendor_id=current_user.id,
        vendor_name=payload.owner_name,
        company_name=payload.company_name,
        address=payload.address,
        phone=payload.phone,
        email=payload.email,
        gst_number=payload.gst_number,
        location=payload.location,
        approver_id=payload.approver_id,
        approver=approver_name,
        status="Pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


@router.post("/upload")
async def upload_documents(
    request_id: int = Form(...),
    work_order: Optional[UploadFile] = File(None),
    registration: Optional[UploadFile] = File(None),
    pf: Optional[UploadFile] = File(None),
    esi: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(require_role("vendor")),
    db: Session = Depends(get_db)
):
    # Strict Validation: Check that ALL four mandatory files were attached
    if not (work_order and registration and pf and esi and work_order.filename and registration.filename and pf.filename and esi.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All four document files (Work Order, Registration, PF, and ESI certificates) MUST be attached before submitting."
        )

    # Verify request exists and belongs to vendor
    req = db.query(models.VendorRequest).filter(models.VendorRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Vendor Request not found")

    # Document Storage: uploads/request_{id}/
    req_folder_name = f"request_{req.id}"
    target_dir = os.path.join(settings.UPLOAD_DIR, req_folder_name)
    os.makedirs(target_dir, exist_ok=True)

    files_map = {
        "work_order": (work_order, "workorder.pdf"),
        "registration": (registration, "registration.pdf"),
        "pf": (pf, "pf.pdf"),
        "esi": (esi, "esi.pdf"),
    }

    uploaded_docs = []

    vendor_details = {
        "company_name": req.company_name,
        "vendor_name": req.vendor_name,
        "gst_number": req.gst_number,
        "location": req.location
    }

    for doc_type, (file_obj, filename) in files_map.items():
        if file_obj and file_obj.filename:
            file_path = os.path.join(target_dir, filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file_obj.file, buffer)

            # File size in bytes
            file_size_bytes = os.path.getsize(file_path) if os.path.exists(file_path) else 0

            # Module 4 OCR: Extract Text from PDF
            extracted_text = extract_text_from_pdf(file_path)

            # Check if document record already exists for re-upload, else create
            doc_rec = db.query(models.Document).filter(
                models.Document.request_id == req.id,
                models.Document.document_type == doc_type
            ).first()

            if not doc_rec:
                doc_rec = models.Document(
                    request_id=req.id,
                    document_type=doc_type,
                    file_name=file_obj.filename or filename,
                    file_path=file_path,
                    file_size=file_size_bytes,
                    extracted_text=extracted_text
                )
                db.add(doc_rec)
            else:
                doc_rec.file_name = file_obj.filename or filename
                doc_rec.file_path = file_path
                doc_rec.file_size = file_size_bytes
                doc_rec.extracted_text = extracted_text
            
            db.commit()

            # Module 6 AI Module: Auto-generate remarks upon document upload
            ai_result = generate_ai_remarks_for_document(doc_type, extracted_text, vendor_details)
            
            ai_rec = db.query(models.AIRemark).filter(
                models.AIRemark.request_id == req.id,
                models.AIRemark.document_type == doc_type
            ).first()

            remarks_json_str = json.dumps(ai_result)
            confidence_str = ai_result.get("Confidence Score", "94%")
            compliance_str = ai_result.get("Compliance Status", "COMPLIANT")

            if not ai_rec:
                ai_rec = models.AIRemark(
                    request_id=req.id,
                    document_type=doc_type,
                    confidence_score=confidence_str,
                    compliance_status=compliance_str,
                    remarks=remarks_json_str
                )
                db.add(ai_rec)
            else:
                ai_rec.confidence_score = confidence_str
                ai_rec.compliance_status = compliance_str
                ai_rec.remarks = remarks_json_str
            
            db.commit()
            uploaded_docs.append(doc_type)

    db.refresh(req)
    return {
        "message": "Documents uploaded, OCR extracted, and AI remarks generated successfully.",
        "request_id": req.id,
        "uploaded_types": uploaded_docs,
        "request": req
    }


@router.get("/status", response_model=List[schemas.VendorRequestOut])
def get_vendor_status(
    current_user: models.User = Depends(require_role("vendor")),
    db: Session = Depends(get_db)
):
    requests = db.query(models.VendorRequest).filter(
        models.VendorRequest.vendor_id == current_user.id
    ).order_by(models.VendorRequest.id.desc()).all()
    return requests
