from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas
from app.database import get_db
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(tags=["Authentication"])

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
        location=payload.location
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
