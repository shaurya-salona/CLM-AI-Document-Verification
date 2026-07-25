import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.seed_service import seed_initial_data
from app.routes import auth_routes, vendor_routes, approver_routes, ai_routes

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed database on startup
db = SessionLocal()
try:
    seed_initial_data(db)
finally:
    db.close()

app = FastAPI(
    title="CLM AI Document Verification System",
    description="AI Based Document Verification for Vendor Registration in Contract Labor Management System",
    version="1.0.0"
)

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads directory for static document viewing/downloading
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Routers
app.include_router(auth_routes.router)
app.include_router(vendor_routes.router)
app.include_router(approver_routes.router)
app.include_router(ai_routes.router)

@app.get("/")
def read_root():
    return {
        "status": "Online",
        "system": "Contract Labor Management System (CLM) - AI Document Verification Engine",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
