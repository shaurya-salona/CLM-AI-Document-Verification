import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CLM Document Verification System"
    DATABASE_URL: str = "sqlite:///./clm_database.db"
    SECRET_KEY: str = "supersecretjwtkey_clm_2026_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    AI_MODEL: str = "gpt-4o-mini"
    AI_PROVIDER: str = "gemini"

    # SMTP Real Email OTP Settings (Gmail / Outlook / Corporate SMTP)
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "clm-noreply@tatasteel.com"
    
    DEFAULT_UPLOAD_PATH: str = os.path.join(os.path.expanduser("~"), ".clm_storage", "uploads")
    UPLOAD_DIR: str = os.path.join(os.path.expanduser("~"), ".clm_storage", "uploads")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# If UPLOAD_DIR is a relative path or 'uploads', resolve to external storage outside codebase
if not os.path.isabs(settings.UPLOAD_DIR) or settings.UPLOAD_DIR in ["uploads", "./uploads", "backend/uploads"]:
    settings.UPLOAD_DIR = os.path.join(os.path.expanduser("~"), ".clm_storage", "uploads")

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
