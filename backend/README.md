# Tata Steel CLM - AI Document Verification Backend API

FastAPI backend for Tata Steel Contract Labor Management (CLM) system with PyMuPDF OCR and Multi-Provider AI document verification.

## Architecture Highlights

- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL (`clm_db`) with SQLAlchemy ORM & `psycopg2-binary` driver
- **Packages**: Modular `app/models/`, `app/schemas/`, `app/validators/`, `app/routes/`, `app/services/`
- **Security**: JWT tokens & Bcrypt password hashing
- **OCR Engine**: PyMuPDF (`fitz`) for PDF text layer extraction
- **AI Verification Engine**: 3-Tier Multi-Provider Fallback
  1. Google Gemini API (`gemini-2.0-flash`)
  2. OpenAI GPT API (`gpt-4o-mini`)
  3. Built-in Modular Rule-Based Verification Engine (`validators/` package)

## Setup Instructions

1. **Activate Virtual Environment**:
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start Backend Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - API Base: `http://127.0.0.1:8000`
   - Swagger Docs: `http://127.0.0.1:8000/docs`
