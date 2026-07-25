import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.auth import get_current_user
from app.services.ai_service import generate_ai_remarks_for_document

router = APIRouter(prefix="/ai", tags=["AI Verification"])

@router.post("/generate-remarks")
def trigger_ai_remarks(
    payload: schemas.AIRemarkGenerateRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(models.VendorRequest).filter(models.VendorRequest.id == payload.request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    docs = db.query(models.Document).filter(models.Document.request_id == req.id).all()
    if not docs:
        raise HTTPException(status_code=400, detail="No documents found for this request")

    vendor_details = {
        "company_name": req.company_name,
        "vendor_name": req.vendor_name,
        "gst_number": req.gst_number,
        "location": req.location
    }

    generated_remarks = []

    for doc in docs:
        ai_res = generate_ai_remarks_for_document(
            doc.document_type,
            doc.extracted_text or "",
            vendor_details
        )
        json_str = json.dumps(ai_res)

        existing_remark = db.query(models.AIRemark).filter(
            models.AIRemark.request_id == req.id,
            models.AIRemark.document_type == doc.document_type
        ).first()

        if existing_remark:
            existing_remark.remarks = json_str
        else:
            new_remark = models.AIRemark(
                request_id=req.id,
                document_type=doc.document_type,
                remarks=json_str
            )
            db.add(new_remark)
        
        generated_remarks.append({
            "document_type": doc.document_type,
            "remarks": ai_res
        })

    db.commit()

    return {
        "message": "AI remarks generated successfully.",
        "request_id": req.id,
        "results": generated_remarks
    }
