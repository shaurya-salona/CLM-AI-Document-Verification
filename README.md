# Tata Steel - AI-Based Document Verification System for Vendor Registration in Contract Labor Management (CLM)

A complete, full-stack enterprise application built for automating document verification using OCR and Multi-Provider AI for Tata Steel Contract Labor Management (CLM). The system extracts text from uploaded PDF compliance documents, compares them against official agency standards, generates actionable compliance remarks, and presents them to Human Approvers for final decision-making.

> **CRITICAL HUMAN DECISION BOUNDARY**: The AI Module generates verification remarks and confidence metrics ONLY. Under no circumstances does the AI approve or reject vendor registration requests. Approvals and Rejections can strictly be rendered by authorized Human Approvers.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Axios, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy ORM, Pydantic V2, PyJWT, Passlib (bcrypt)
- **Database**: PostgreSQL (`clm_db` active) / SQLite fallback option with `psycopg2-binary` driver
- **Architecture**: Modular Packages (`models/`, `schemas/`, `validators/`, `routes/`, `services/`)
- **OCR Engine**: PyMuPDF (`fitz`) & PaddleOCR for PDF text layer extraction
- **AI Verification Engine**: 
  - **Tier 1**: Google Gemini API (`gemini-2.0-flash`)
  - **Tier 2**: OpenAI GPT API (`gpt-4o-mini`)
  - **Tier 3**: Intelligent Statutory Rule-Based Verification Engine (`validators/` package fallback)

---

## ⚙️ Key Features & System Modules

### 1. Vendor Onboarding Portal
- **Plant Location Selection**: Select target Tata Steel plant location (`Jamshedpur`, `Kalinganagar`, `West Bokaro`, `Angul`, `Sukinda`).
- **Vendor Information**: Owner Name, Company Name, Address, Phone Number, Email, Statutory GSTIN (15-character format validation).
- **Mandatory 4 PDF Uploads**:
  1. Work Order
  2. Registration Certificate
  3. PF Certificate
  4. ESI Certificate
- **Single Active Request Rule**: Prevents duplicate submissions while a vendor has an active pending request.
- **Role-Based Security View**: Clean status view hiding internal AI confidence metrics from vendors (`VendorStatus.jsx`).

### 2. TSL Approver Workstation (TSL Portal)
- **Location-Based Workstation**: Dedicated dashboard filtered by the logged-in Approver's site location.
- **Real-Time Live Updates**: 10-second automatic background polling for live synchronization.
- **Detailed Document Inspection**: View vendor details, preview/download PDF documents, and inspect extracted OCR text.
- **AI Remarks & Confidence Panel**: Displays structured JSON AI remarks containing:
  - `Confidence Score` (e.g. `⚡ 94% Confidence`)
  - `Compliance Status` (`COMPLIANT` or `ACTION REQUIRED`)
  - `Issues Found` (List of missing, invalid, or mismatched fields)
  - `Suggestion` (Actionable steps for vendor/approver)
- **Human Decision Boundary**: Dedicated `Approve` and `Reject` buttons with decision notes and automatic timestamp recording.

### 3. File Storage & Structure
Uploaded documents are organized under:
```
backend/uploads/request_{id}/
├── workorder.pdf
├── registration.pdf
├── pf.pdf
└── esi.pdf
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher & npm

### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Launch FastAPI Server
uvicorn app.main:app --reload
```
- **Backend API**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite React server
npm run dev
```
- **Frontend Portal**: `http://localhost:3000`

---

## 🔑 Pre-Seeded Test Credentials

| Role | Portal Access | Email Address | Password | Plant Location |
|---|---|---|---|---|
| **Vendor** | Vendor Portal | `vendor@clm.com` | `password123` | Jamshedpur |
| **Vendor** | Vendor Portal | `vendor2@clm.com` | `password123` | Kalinganagar |
| **Approver** | TSL Approver Portal | `approver_jamshedpur@clm.com` | `password123` | Jamshedpur |
| **Approver** | TSL Approver Portal | `approver_kalinganagar@clm.com` | `password123` | Kalinganagar |
| **Approver** | TSL Approver Portal | `approver_westbokaro@clm.com` | `password123` | West Bokaro |
| **Approver** | TSL Approver Portal | `approver_angul@clm.com` | `password123` | Angul |
| **Approver** | TSL Approver Portal | `approver_sukinda@clm.com` | `password123` | Sukinda |

---

## 📡 Key REST API Endpoints Reference

- `POST /login`: User authentication & JWT issuance
- `GET /auth/approvers`: Get approver list filtered by location
- `POST /vendor/create-request`: Create vendor registration request (Enforces 1 active pending request rule)
- `POST /vendor/upload`: Upload 4 PDFs, execute PyMuPDF OCR text extraction & trigger AI verification
- `GET /vendor/status`: Retrieve vendor submitted requests
- `GET /approver/requests`: Retrieve location-filtered requests for site approver
- `GET /approver/request/{id}`: Retrieve request details, PDF links, and AI remarks
- `POST /approver/approve`: Human approver sets status to Approved with timestamp
- `POST /approver/reject`: Human approver sets status to Rejected with timestamp
