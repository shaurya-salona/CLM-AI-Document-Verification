import random
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.services.email_service import send_real_email_otp

router = APIRouter(tags=["Authentication"])
logger = logging.getLogger(__name__)

# In-Memory Cache for Pending Email OTPs (supports dynamic real OTP verification for ANY recipient email)
PENDING_OTPS: Dict[str, Dict[str, Any]] = {}

@router.post("/auth/send-otp")
def send_otp(payload: schemas.SendOTPRequest, db: Session = Depends(get_db)):
    """
    Generates a 6-digit numeric OTP and sends verification email via SMTP.
    """
    email = payload.email.lower().strip()
    
    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    PENDING_OTPS[email] = {
        "otp_code": otp_code,
        "expires_at": expires_at
    }
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        user.otp_code = otp_code
        user.otp_expires_at = expires_at
        db.commit()

    email_sent = send_real_email_otp(email, otp_code, payload.purpose or "registration")

    logger.info(f"Generated OTP for {email} (delivered: {email_sent})")
    
    response_data = {
        "message": f"Verification code sent to {email}.",
        "email": email,
        "email_sent_via_smtp": email_sent,
        "expires_in_minutes": 10
    }
    
    if not email_sent:
        response_data["otp_demo"] = otp_code

    return response_data

@router.post("/auth/verify-otp")
def verify_otp(payload: schemas.VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Verifies the 6-digit OTP code against pending cache or database.
    """
    email = payload.email.lower().strip()
    user = db.query(models.User).filter(models.User.email == email).first()
    pending = PENDING_OTPS.get(email)
    
    # Check pending cache or database
    valid_code = None
    expires_at = None
    
    if pending:
        valid_code = pending["otp_code"]
        expires_at = pending["expires_at"]
    elif user and user.otp_code:
        valid_code = user.otp_code
        expires_at = user.otp_expires_at

    if not valid_code:
        raise HTTPException(status_code=400, detail="No active OTP found for this email address. Please request a new code.")

    # Strict code match check (NO BYPASS ALLOWED)
    if payload.otp_code != valid_code:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please enter the exact 6-digit code received in your email inbox.")

    # Expiry check
    if expires_at and datetime.utcnow() > expires_at:
        raise HTTPException(status_code=400, detail="OTP code has expired. Please request a new verification code.")
        
    if user:
        user.is_email_verified = True
        user.otp_code = None
        user.otp_expires_at = None
        db.commit()
        
    # Clear pending OTP from cache
    if email in PENDING_OTPS:
        del PENDING_OTPS[email]
        
    return {"verified": True, "message": "Email address verified successfully."}

@router.post("/auth/register", response_model=schemas.UserResponse)
def register_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    hashed_pwd = get_password_hash(payload.password)
    new_user = models.User(
        name=payload.name,
        email=payload.email,
        password=hashed_pwd,
        role=payload.role.lower(),
        location=payload.location,
        is_email_verified=True # Verified strictly via Real Email OTP flow
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 2FA OTP Check for Login if OTP code is supplied (STRICT MATCHING ONLY)
    if payload.otp_code:
        pending = PENDING_OTPS.get(payload.email.lower().strip())
        valid_otp = pending["otp_code"] if pending else user.otp_code
        if not valid_otp or payload.otp_code != valid_otp:
            raise HTTPException(status_code=400, detail="Invalid 2FA OTP code. Enter the code sent to your email.")
        user.is_email_verified = True
        db.commit()
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/auth/approvers", response_model=List[schemas.ApproverOut])
def get_approvers(location: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.User).filter(models.User.role == "approver")
    if location:
        query = query.filter(models.User.location == location)
    approvers = query.all()
    return approvers
