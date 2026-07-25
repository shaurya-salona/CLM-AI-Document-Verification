from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app import models, schemas
from app.database import get_db
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/approver", tags=["Approver"])

@router.get("/requests", response_model=List[schemas.VendorRequestOut])
def get_approver_requests(
    status_filter: Optional[str] = None,
    current_user: models.User = Depends(require_role("approver")),
    db: Session = Depends(get_db)
):
    # Match by approver_id OR plant location code
    query = db.query(models.VendorRequest).filter(
        or_(
            models.VendorRequest.approver_id == current_user.id,
            models.VendorRequest.location == current_user.location
        )
    )
    
    if status_filter:
        query = query.filter(models.VendorRequest.status == status_filter)
    
    requests = query.order_by(models.VendorRequest.id.desc()).all()
    return requests


@router.get("/request/{id}", response_model=schemas.VendorRequestOut)
def get_request_details(
    id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(models.VendorRequest).filter(models.VendorRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req


@router.post("/approve", response_model=schemas.VendorRequestOut)
def approve_request(
    payload: schemas.ApproverDecision,
    current_user: models.User = Depends(require_role("approver")),
    db: Session = Depends(get_db)
):
    req = db.query(models.VendorRequest).filter(models.VendorRequest.id == payload.request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Vendor Request not found")

    req.status = "Approved"
    req.decision_at = datetime.utcnow()
    if payload.remarks:
        req.decision_remarks = payload.remarks
    db.commit()
    db.refresh(req)
    return req


@router.post("/reject", response_model=schemas.VendorRequestOut)
def reject_request(
    payload: schemas.ApproverDecision,
    current_user: models.User = Depends(require_role("approver")),
    db: Session = Depends(get_db)
):
    req = db.query(models.VendorRequest).filter(models.VendorRequest.id == payload.request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Vendor Request not found")

    req.status = "Rejected"
    req.decision_at = datetime.utcnow()
    if payload.remarks:
        req.decision_remarks = payload.remarks
    db.commit()
    db.refresh(req)
    return req
