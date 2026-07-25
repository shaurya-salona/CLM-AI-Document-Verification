import os
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app import models
from app.auth import get_password_hash
from app.services.ai_service import generate_ai_remarks_for_document

def seed_initial_data(db: Session):
    # 1. Seed Approvers for all 5 Plant Locations
    approvers_data = [
        {"name": "Rajesh Sharma", "email": "approver_jamshedpur@clm.com", "location": "Jamshedpur"},
        {"name": "Anita Roy", "email": "approver_kalinganagar@clm.com", "location": "Kalinganagar"},
        {"name": "Sanjay Verma", "email": "approver_westbokaro@clm.com", "location": "West Bokaro"},
        {"name": "Pradeep Mishra", "email": "approver_angul@clm.com", "location": "Angul"},
        {"name": "Sunita Das", "email": "approver_sukinda@clm.com", "location": "Sukinda"},
    ]

    approver_users = {}
    for app_data in approvers_data:
        existing = db.query(models.User).filter(models.User.email == app_data["email"]).first()
        if not existing:
            user = models.User(
                name=app_data["name"],
                email=app_data["email"],
                password=get_password_hash("password123"),
                role="approver",
                location=app_data["location"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            approver_users[app_data["location"]] = user
        else:
            approver_users[app_data["location"]] = existing

    # 2. Seed Default Vendors
    vendors_data = [
        {"name": "Ramesh Kumar", "email": "vendor@clm.com", "location": "Jamshedpur"},
        {"name": "Vikram Singh", "email": "vendor2@clm.com", "location": "Kalinganagar"}
    ]

    vendor_users = {}
    for v_data in vendors_data:
        existing = db.query(models.User).filter(models.User.email == v_data["email"]).first()
        if not existing:
            user = models.User(
                name=v_data["name"],
                email=v_data["email"],
                password=get_password_hash("password123"),
                role="vendor",
                location=v_data["location"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            vendor_users[v_data["email"]] = user
        else:
            vendor_users[v_data["email"]] = existing

    # 3. Seed Sample Vendor Requests & AI Remarks for initial demonstration
    sample_requests = [
        {
            "vendor_email": "vendor@clm.com",
            "vendor_name": "Ramesh Kumar",
            "company_name": "Apex Infrastructure Ltd",
            "address": "Industrial Area, Phase-2, Jamshedpur",
            "phone": "+91 9876543210",
            "email": "ramesh@apexinfra.com",
            "gst_number": "20AAACB1234C1Z5",
            "location": "Jamshedpur",
            "status": "Pending"
        },
        {
            "vendor_email": "vendor2@clm.com",
            "vendor_name": "Vikram Singh",
            "company_name": "Titan Industrial Services",
            "address": "Plot 104, Industrial Estate, Kalinganagar",
            "phone": "+91 9123456789",
            "email": "vikram@titanind.com",
            "gst_number": "21BBBCB9876D2Z8",
            "location": "Kalinganagar",
            "status": "Pending"
        }
    ]

    for req_data in sample_requests:
        existing_req = db.query(models.VendorRequest).filter(
            models.VendorRequest.company_name == req_data["company_name"]
        ).first()

        if not existing_req:
            v_user = vendor_users.get(req_data["vendor_email"])
            appr_user = approver_users.get(req_data["location"])
            
            new_req = models.VendorRequest(
                vendor_id=v_user.id if v_user else None,
                vendor_name=req_data["vendor_name"],
                company_name=req_data["company_name"],
                address=req_data["address"],
                phone=req_data["phone"],
                email=req_data["email"],
                gst_number=req_data["gst_number"],
                location=req_data["location"],
                approver_id=appr_user.id if appr_user else None,
                approver=appr_user.name if appr_user else "Assigned Approver",
                status=req_data["status"]
            )
            db.add(new_req)
            db.commit()
            db.refresh(new_req)

            # Create sample documents & AI Remarks
            doc_types = ["work_order", "registration", "pf", "esi"]
            upload_dir = os.path.join("uploads", f"request_{new_req.id}")
            os.makedirs(upload_dir, exist_ok=True)

            vendor_details = {
                "company_name": new_req.company_name,
                "vendor_name": new_req.vendor_name,
                "gst_number": new_req.gst_number,
                "location": new_req.location
            }

            for doc_type in doc_types:
                file_path = os.path.join(upload_dir, f"{doc_type}.pdf")
                if not os.path.exists(file_path):
                    # Write placeholder PDF file bytes
                    dummy_pdf = f"%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj\n4 0 obj << /Length 120 >> stream\nBT /F1 12 Tf 50 700 TD ({doc_type.upper()} CERTIFICATE - {new_req.company_name}) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \ntrailer << /Size 5 /Root 1 0 R >>\nstartxref\n250\n%%EOF"
                    with open(file_path, "w") as f:
                        f.write(dummy_pdf)

                sample_text = f"{doc_type.upper()} Document for {new_req.company_name}. GSTIN: {new_req.gst_number}. Location: {new_req.location}. Issued: 2026-01-15. Valid till: 2027-01-14."
                
                doc_obj = models.Document(
                    request_id=new_req.id,
                    document_type=doc_type,
                    file_name=f"{doc_type}.pdf",
                    file_path=file_path,
                    file_size=len(sample_text),
                    extracted_text=sample_text
                )
                db.add(doc_obj)

                # Generate AI Remarks
                ai_res = generate_ai_remarks_for_document(doc_type, sample_text, vendor_details)
                ai_obj = models.AIRemark(
                    request_id=new_req.id,
                    document_type=doc_type,
                    confidence_score=ai_res.get("Confidence Score", "94%"),
                    compliance_status=ai_res.get("Compliance Status", "COMPLIANT"),
                    remarks=json.dumps(ai_res)
                )
                db.add(ai_obj)

            db.commit()
