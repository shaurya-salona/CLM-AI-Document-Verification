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
    
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
