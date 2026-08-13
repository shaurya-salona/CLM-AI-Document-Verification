from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    location: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_email_verified: Optional[bool] = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    otp_code: Optional[str] = None # Optional OTP code for 2FA login verification

class SendOTPRequest(BaseModel):
    email: EmailStr
    purpose: Optional[str] = "registration" # 'registration' or 'login'

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
