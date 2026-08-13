# 🏭 Tata Steel CLM — AI Document Verification System

> **Contract Labor Management System** — Full-Stack Vendor Registration Portal with AI-Powered Statutory Document Verification

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql)](https://postgresql.org)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python)](https://python.org)

---

## 📌 Project Overview

The **Tata Steel CLM AI Document Verification System** is an enterprise-grade, production-ready full-stack web application that digitizes the vendor onboarding process for Tata Steel's 5 plant locations across India.

It enforces **SOP-aligned business rules**, performs **real-time OCR text extraction** from uploaded PDF documents, and generates **AI-powered compliance audit remarks** — while ensuring all final approval decisions remain with **authorized human site approvers**.

---

## ✨ Key Features

### 🔐 Security
- **Real Email OTP (2FA)** — Gmail SMTP sends a 6-digit one-time password to any email address. No hardcoded bypasses.
- **JWT Authentication** — Secure stateless sessions with 24-hour token expiry.
- **bcrypt Password Hashing** — Industry-standard password protection.
- **Role-Based Access Control (RBAC)** — `vendor` and `approver` roles strictly enforced on every API endpoint.

### 🏢 Dual Portal Architecture
| Portal | Users | Purpose |
|--------|-------|---------|
| **Vendor Portal** | Contractors & Suppliers | Register company, fill statutory details, upload compliance PDFs |
| **Approver Workstation** | Site Approvers (CWR Cell) | Review submissions, inspect OCR text, view AI audit remarks, approve/reject |

### 📋 Contractor vs. Supplier Smart Rules (SOP-Aligned)
| Rule | Contractor | Supplier |
|------|-----------|---------|
| Max Labour Capacity | **9 workers** | **4 workers** |
| PF Code (EPFO) Required | ✅ Mandatory | ❌ Exempt |
| ESI Code (ESIC) Required | ✅ Mandatory | ❌ Exempt |
| Documents Required | **4 PDFs** (Work Order, Registration, PF, ESI) | **2 PDFs** (Purchase Order, Registration) |

### 🤖 3-Tier AI Verification Pipeline
1. **Tier 1 — Google Gemini 2.0 Flash** (Primary AI engine)
2. **Tier 2 — OpenAI GPT-4o-Mini** (Fallback if Gemini quota exceeded)
3. **Tier 3 — Python Rule-Based Engine** (Always works offline — no API key needed)

### ✅ Python Validation Engine (10+ Rule Checks)
- 15-character GSTIN format validation
- GSTIN state code vs. plant site alignment (Jharkhand=20, Odisha=21)
- 10-digit phone number format
- 6-digit PIN code with regional prefix matching
- PF Code (EPFO format) & ESI Code (17-digit) validation
- PF/ESI code cross-referenced against uploaded certificate text (OCR)
- Work Order / P.O. expiry date check
- Company name verified in uploaded Work Order text
- TSL Procurement Vendor Code verification (SOP Requirement #1)

### 📂 Zero-Disk PDF Storage
All uploaded PDFs are stored as **Base64 strings directly in PostgreSQL** — no disk dependency, cloud-deployment ready.

---

## 🚀 Quick Start

### Option 1: Single-Command Start (Recommended)
```bash
./start.sh
```

### Option 2: Manual Start

**Backend** (FastAPI):
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (React + Vite):
```bash
cd frontend
npm install
npm run dev
```

### Access Points
| Service | URL |
|---------|-----|
| 🖥️ Vendor Portal | http://localhost:3000 |
| 🔧 Backend API | http://127.0.0.1:8000 |
| 📖 Swagger Docs | http://127.0.0.1:8000/docs |
| ☁️ Live Cloud (Render) | https://clm-ai-document-verification.onrender.com |

---

## 🔑 Demo Login Credentials

### 👷 Vendor Accounts
| Name | Email | Password | Plant Location |
| :--- | :--- | :--- | :--- |
| Ramesh Kumar | `vendor@clm.com` | `password123` | Jamshedpur |
| Vikram Singh | `vendor2@clm.com` | `password123` | Kalinganagar |

### ✅ Site Approver Accounts — All 5 Tata Steel Plant Locations
| Approver Name | Email | Password | Plant Site | State |
| :--- | :--- | :--- | :--- | :--- |
| Rajesh Sharma | `approver_jamshedpur@clm.com` | `password123` | Jamshedpur | Jharkhand |
| Anita Roy | `approver_kalinganagar@clm.com` | `password123` | Kalinganagar | Odisha |
| Sanjay Verma | `approver_westbokaro@clm.com` | `password123` | West Bokaro | Jharkhand |
| Pradeep Mishra | `approver_angul@clm.com` | `password123` | Angul | Odisha |
| Sunita Das | `approver_sukinda@clm.com` | `password123` | Sukinda | Odisha |

> 💡 **New users** can self-register via the Register page — a real 6-digit OTP will be delivered to any email address for verification.

---

## ⚙️ Environment Configuration

Create a `.env` file inside the `backend/` folder:

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname
# or for local SQLite:
DATABASE_URL=sqlite:///./clm_database.db

# Security
SECRET_KEY=your-super-secret-jwt-key-change-in-production

# AI API Keys (optional — Rule-Based Engine works without these)
GEMINI_API_KEY=your-google-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Real Email OTP (Gmail SMTP — use App Password, not your main password)
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=your-16-char-gmail-app-password
```

---

## 🧪 Test Suite

```bash
cd backend
./venv/bin/pytest tests/ -v
```

Expected output:
```
tests/test_auth.py .                     [ 16%]
tests/test_validators.py ..              [ 50%]
tests/test_vendors.py ...               [100%]

======================== 6 passed in 0.75s =========================
```

---

## 📂 Project Structure

```
Contract Labor Management System/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app + CORS middleware
│   │   ├── auth.py                  # JWT + bcrypt + RBAC decorators
│   │   ├── config.py                # Environment settings
│   │   ├── database.py              # SQLAlchemy session factory
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── routes/                  # API route handlers
│   │   ├── services/                # Business logic services
│   │   └── validators/              # Deterministic rule validators
│   ├── tests/                       # Pytest test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Routes + ProtectedRoute guards
│   │   ├── context/AuthContext.jsx  # JWT decode + global user state
│   │   ├── services/api.js          # Axios API client
│   │   ├── components/              # Reusable UI components
│   │   └── pages/                   # Full page views
│   └── package.json
├── README.md
├── ARCHITECTURE.md
├── render.yaml                      # Render cloud deployment config
└── start.sh                         # Single-command local start script
```

---

## 📚 Architecture & Documentation

For complete technical details, database schemas, API reference, and data flow diagrams, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 👨‍💻 Developed By

**Shaurya Salona**
Tata Steel CLM Project — AI Document Verification Engine
*Built for mentor review: Manab Dey*
