# ARCHITECTURE.md — Tata Steel CLM AI Document Verification System

> **Technical Architecture Reference** — For Engineers, Reviewers & Mentor Evaluation

---

## 1. Executive Summary

The **Contract Labor Management (CLM) AI Document Verification System** is a full-stack, production-ready enterprise application built for Tata Steel's vendor onboarding process across 5 plant locations in India (Jamshedpur, Kalinganagar, West Bokaro, Angul, Sukinda).

The system enforces statutory compliance rules as per Tata Steel's SOP, performs real-time OCR-based document verification, and generates AI-powered audit remarks — while ensuring all final decisions remain with authorized human site approvers.

---

## 2. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VENDOR PORTAL (React SPA)                        │
│  Register → Email OTP → Fill Registration Form → Upload PDFs → Submit  │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │  HTTPS / REST API (JWT Bearer Token)
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       FASTAPI BACKEND (Python)                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Auth Layer: JWT decode → require_role() decorator              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────────────┐   │
│  │  auth_routes  │  │ vendor_routes │  │    approver_routes       │   │
│  │  /login       │  │ /vendor/      │  │    /approver/            │   │
│  │  /auth/*      │  │ create-request│  │    approve, reject       │   │
│  └───────────────┘  │ upload (PDF)  │  │    validation-results    │   │
│                     └───────────────┘  │    verify-tsl            │   │
│                                        └──────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Services:                                                      │   │
│  │  ├── email_service.py    (Gmail SMTP → Real OTP delivery)       │   │
│  │  ├── ocr_service.py      (PyMuPDF in-memory text extraction)    │   │
│  │  ├── ai_service.py       (Gemini → OpenAI → Rule Engine)        │   │
│  │  ├── validation_service.py (10+ deterministic rule checks)      │   │
│  │  └── seed_service.py     (Startup data seeding on boot)         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Validators:                                                    │   │
│  │  ├── gst_validator.py          (15-char GSTIN format)           │   │
│  │  ├── vendor_validator.py       (capacity, phone, PIN, PF, ESI)  │   │
│  │  ├── cross_reference_validator.py (GST-state, PIN region, date) │   │
│  │  ├── workorder_validator.py    (W.O. text field checks)         │   │
│  │  ├── registration_validator.py (Reg cert text checks)           │   │
│  │  ├── pf_validator.py           (PF cert text checks)            │   │
│  │  └── esi_validator.py          (ESI cert text checks)           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL / SQLite Fallback)                 │
│                                                                         │
│  users ─────────────────── vendor_requests ─────────────── documents   │
│  (id, name, email,         (id, vendor_id,                 (id,         │
│   password, role,           vendor_type,                    request_id, │
│   location,                 tsl_vendor_code,                doc_type,   │
│   otp_code,                 company_name,                   file_data,  │
│   is_email_verified)        gst_number, pf_code,            ← Base64   │
│                             esi_code, status,               PDF here!)  │
│                             decision_remarks)                           │
│                                              └──── ai_remarks           │
│                                                    (confidence_score,   │
│                                                     compliance_status,  │
│                                                     remarks JSON)       │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    APPROVER WORKSTATION (React SPA)                     │
│  View Pending → Inspect OCR Text → Review Rule Checks → AI Remarks     │
│  → TSL Verification → Human Decision: Approve / Reject                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Request Lifecycle — Full Data Flow

```
Step 1: VENDOR REGISTRATION
  POST /auth/send-otp   → generates OTP → Gmail SMTP → vendor inbox
  POST /auth/verify-otp → validates 6-digit code from PENDING_OTPS cache
  POST /auth/register   → creates user record (is_email_verified = True)

Step 2: CREATE VENDOR REQUEST
  POST /vendor/create-request
    → ValidationService.validate_payload()
       ├── GSTIN format check
       ├── Labour capacity check (Contractor ≤ 9, Supplier ≤ 4)
       ├── Phone & PIN code format
       └── Approver lookup by location
    → VendorRequest row created in DB (status = "Pending")
    → Returns request_id

Step 3: UPLOAD COMPLIANCE DOCUMENTS
  POST /vendor/upload (multipart/form-data)
    → PDF bytes read into RAM (no disk write)
    → PyMuPDF OCR → extracted_text
    → Base64 encode → stored in documents.file_data (PostgreSQL)
    → BackgroundTask scheduled: AI remarks generation (async)

Step 4: AI AUDIT (BACKGROUND)
  ai_service.generate_ai_remarks_for_document()
    ├── Try: Google Gemini 2.0 Flash API
    ├── Fallback: OpenAI GPT-4o-Mini API
    └── Fallback: validators/__init__.validate_document() [always works]
  → AIRemark row saved to DB (confidence_score, compliance_status, remarks)

Step 5: APPROVER REVIEW
  GET /approver/requests          → all requests at their plant location
  GET /approver/request/{id}      → full details + documents + ai_remarks
  GET /approver/request/{id}/validation-results
    → ValidationService.validate_vendor_request()
       ├── TSL Vendor Code presence check
       ├── Vendor type validity
       ├── Labour capacity enforcement
       ├── GSTIN format + state-location alignment
       ├── PIN code regional prefix matching
       ├── Work Order expiry date check
       ├── PF Code format (Contractor only)
       ├── ESI Code format (Contractor only)
       ├── PF Code OCR cross-reference (Contractor only)
       ├── ESI Code OCR cross-reference (Contractor only)
       ├── Mandatory document count (4 or 2)
       └── Company name in Work Order text

Step 6: DECISION
  POST /approver/approve  → req.status = "Approved"
  POST /approver/reject   → req.status = "Rejected"
  POST /approver/request/{id}/verify-tsl → tsl_registration_verified = True
```

---

## 4. Database Schema

### Table: `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer PK | Auto-increment |
| `name` | String(100) | Full name |
| `email` | String(100) | Unique, indexed |
| `password` | String(255) | bcrypt hashed |
| `role` | String(20) | `'vendor'` or `'approver'` |
| `location` | String(50) | Plant site (e.g. Jamshedpur) |
| `is_email_verified` | Boolean | Set `True` after OTP verification |
| `otp_code` | String(10) | Temporary 6-digit OTP |
| `otp_expires_at` | DateTime | 10-minute expiry window |
| `created_at` | DateTime | Auto timestamp |

### Table: `vendor_requests`
| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer PK | |
| `vendor_id` | FK → users.id | |
| `vendor_type` | String(50) | `'Contractor'` or `'Supplier'` |
| `tsl_vendor_code` | String(50) | TSL Procurement Code (SOP Rule #1) |
| `tsl_registration_verified` | Boolean | CWR Cell confirmation |
| `tsl_verification_date` | DateTime | When TSL was confirmed |
| `vendor_name` | String(100) | Owner / contact person |
| `company_name` | String(150) | Registered firm name |
| `nature_of_work` | String(255) | Work description |
| `labour_capacity` | Integer | Max allowed: 9 (Contractor), 4 (Supplier) |
| `licence_flag` | String | `"No"` (≤9 workers, statutory exempt) |
| `licence_number` | String | `"N.A."` |
| `licence_expiry_date` | String | W.O. / P.O. validity end date |
| `pf_flag` | Boolean | `True` for Contractors |
| `pf_code` | String(50) | EPFO PF Code |
| `esi_flag` | Boolean | `True` for Contractors |
| `esi_code` | String(50) | ESIC ESI Code |
| `address`, `city`, `state`, `pin_code` | String | Registered address |
| `phone` | String(20) | 10-digit format |
| `email` | String(100) | Company contact email |
| `gst_number` | String(50) | 15-character GSTIN |
| `location` | String(50) | Target plant site |
| `approver_id` | FK → users.id | Assigned approver |
| `approver` | String(100) | Approver name (denormalized) |
| `status` | String(20) | `'Pending'`, `'Approved'`, `'Rejected'` |
| `decision_remarks` | Text | Approver's written comments |
| `decision_at` | DateTime | When decision was made |
| `created_at`, `updated_at` | DateTime | Timestamps |

### Table: `documents`
| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer PK | |
| `request_id` | FK → vendor_requests.id | Cascade delete |
| `document_type` | String | `'work_order'`, `'registration'`, `'pf'`, `'esi'` |
| `file_name` | String | Original uploaded filename |
| `file_path` | String | Virtual path label (no disk storage) |
| `file_size` | Integer | File size in bytes |
| `file_data` | Text | **Full PDF as Base64 `data:application/pdf;base64,...`** |
| `extracted_text` | Text | PyMuPDF OCR extracted text layer |
| `created_at` | DateTime | Upload timestamp |

### Table: `ai_remarks`
| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer PK | |
| `request_id` | FK → vendor_requests.id | Cascade delete |
| `document_type` | String | Linked document type |
| `confidence_score` | String | e.g. `"94%"` |
| `compliance_status` | String | `'COMPLIANT'` or `'ACTION REQUIRED'` |
| `remarks` | Text | Full AI response as JSON string |
| `created_at` | DateTime | Generation timestamp |

---

## 5. Security Model

| Layer | Mechanism | Detail |
|-------|-----------|--------|
| **Password Storage** | `bcrypt` | 72-byte truncation, auto-salt per hash |
| **Session Tokens** | JWT (HS256) | 24-hour expiry, `sub` = email |
| **Route Protection** | `require_role()` decorator | Raises HTTP 403 if role mismatch |
| **2FA** | Real Email OTP | Gmail SMTP, 6-digit, 10 min expiry |
| **OTP Verification** | Strict exact-match | No bypass codes — matches only the exact sent OTP |
| **OTP Storage** | In-memory cache (`PENDING_OTPS`) | Also mirrored to DB for persistence |
| **Frontend Guards** | `<ProtectedRoute>` component | Redirects to /login if no valid JWT |

---

## 6. AI Verification Engine

```
Document uploaded
      │
      ▼
PyMuPDF (fitz) — in-memory OCR
      │
      ▼
Background Task triggered
      │
      ├──► TIER 1: Google Gemini 2.0 Flash
      │      model: gemini-2.0-flash
      │      response_mime_type: application/json
      │      temperature: 0.2
      │      Output: {Document, Confidence Score, Compliance Status,
      │               Issues Found, Suggestion}
      │
      ├──► TIER 2: OpenAI GPT-4o-Mini  (if Gemini fails/quota exceeded)
      │      response_format: json_object
      │      temperature: 0.2
      │
      └──► TIER 3: Python Rule-Based Engine  (always available, no API needed)
             validators/__init__.validate_document()
             Confidence = 96% − (issues × 12%), min 55%
             Status = "COMPLIANT" or "ACTION REQUIRED"
```

> **Approver-Only Visibility**: AI remarks are shown **only** in the Approver Workstation. The Vendor Portal has no AI labels or AI verification references.

---

## 7. Tata Steel Plant Location Mapping

| Plant Site | State | GSTIN Code | PIN Prefix | Approver |
|-----------|-------|-----------|-----------|---------|
| Jamshedpur | Jharkhand | `20` | `83` | Rajesh Sharma |
| West Bokaro | Jharkhand | `20` | `82`, `83` | Sanjay Verma |
| Kalinganagar | Odisha | `21` | `75`, `76` | Anita Roy |
| Angul | Odisha | `21` | `75`, `76` | Pradeep Mishra |
| Sukinda | Odisha | `21` | `75`, `76` | Sunita Das |

These mappings are enforced in `cross_reference_validator.py` — a GSTIN or PIN code from a different state will trigger a validation warning.

---

## 8. Frontend Architecture

```
src/
├── App.jsx                      # BrowserRouter + ProtectedRoute guards
├── context/
│   └── AuthContext.jsx           # JWT decode, user state, login/logout
├── services/
│   └── api.js                   # Axios client + authAPI / vendorAPI / approverAPI / aiAPI
├── components/
│   ├── Navbar.jsx               # Role-aware: "Vendor Portal" vs "Approver Workstation"
│   ├── ProtectedRoute.jsx       # Redirects if wrong role or not logged in
│   ├── StatusBadge.jsx          # Pending/Approved/Rejected visual badge
│   ├── AIRemarksCard.jsx        # Per-document AI audit card (Approver-only)
│   └── ValidationResultsCard.jsx # Python rule check results display
└── pages/
    ├── Login.jsx                # JWT login + optional 2FA OTP
    ├── Register.jsx             # 3-step wizard: details → email OTP → submit
    ├── VendorDashboard.jsx      # My submissions list + live 10s polling
    ├── NewRequest.jsx           # Multi-step form + document upload wizard
    ├── VendorStatus.jsx         # Per-request detail + PDF download button
    ├── ApproverDashboard.jsx    # All location requests + search + tab filter
    └── RequestDetails.jsx       # Full audit workspace: OCR, rules, AI, approve/reject
```

---

## 9. API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/send-otp` | None | Send 6-digit OTP to email via SMTP |
| POST | `/auth/verify-otp` | None | Verify OTP code (strict match) |
| POST | `/auth/register` | None | Register new vendor/approver account |
| POST | `/login` | None | Login → returns JWT access token |
| GET | `/auth/me` | JWT | Get current logged-in user details |
| GET | `/auth/approvers` | None | List approvers (filter by location) |

### Vendor
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/vendor/create-request` | vendor | Create new registration request |
| POST | `/vendor/upload` | vendor | Upload compliance PDFs |
| GET | `/vendor/status` | vendor | Get all my requests |

### Approver
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/approver/requests` | approver | Get all location requests |
| GET | `/approver/request/{id}` | any | Get full request details |
| GET | `/approver/request/{id}/validation-results` | any | Run all validation checks |
| POST | `/approver/approve` | approver | Approve a request |
| POST | `/approver/reject` | approver | Reject a request |
| POST | `/approver/request/{id}/verify-tsl` | approver | Mark TSL registration verified |

### AI
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/ai/generate-remarks` | any | Re-run AI audit for all documents |

---

## 10. Deployment (Render)

Configured via `render.yaml`:

```yaml
services:
  - type: web
    name: clm-backend
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT

  - type: web
    name: clm-frontend
    env: node
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/dist
```

Environment variables must be set in Render Dashboard:
- `DATABASE_URL`, `SECRET_KEY`, `GEMINI_API_KEY`, `SMTP_USERNAME`, `SMTP_PASSWORD`

---

## 11. Testing

```bash
cd backend
./venv/bin/pytest tests/ -v
```

| Test File | What It Tests |
|-----------|--------------|
| `test_auth.py` | JWT login, role-based route access blocking |
| `test_validators.py` | GSTIN format, payload validation, capacity rules |
| `test_vendors.py` | Full contractor/supplier rule enforcement, cross-reference checks |
