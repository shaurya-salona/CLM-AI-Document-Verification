import os
import json
import logging
from typing import Dict, Any
from app.config import settings

logger = logging.getLogger(__name__)

STANDARDS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "standards")

DOC_TYPE_STANDARD_MAP = {
    "work_order": "workorder.json",
    "registration": "registration.json",
    "pf": "pf.json",
    "esi": "esi.json",
    "Work Order": "workorder.json",
    "Registration Certificate": "registration.json",
    "PF Certificate": "pf.json",
    "ESI Certificate": "esi.json"
}

DOC_TYPE_DISPLAY_MAP = {
    "work_order": "Work Order / Purchase Order",
    "registration": "Registration Certificate",
    "pf": "PF Certificate",
    "esi": "ESI Certificate"
}

def load_company_standard(doc_type: str) -> Dict[str, Any]:
    standard_file = DOC_TYPE_STANDARD_MAP.get(doc_type, "workorder.json")
    file_path = os.path.join(STANDARDS_DIR, standard_file)
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            return json.load(f)
    return {"required_fields": ["Company Name", "Registration Number"], "validation_rules": {}}

def generate_ai_remarks_for_document(doc_type: str, extracted_text: str, vendor_details: Dict[str, Any]) -> Dict[str, Any]:
    standard = load_company_standard(doc_type)
    display_doc_name = DOC_TYPE_DISPLAY_MAP.get(doc_type, doc_type)
    vendor_type = vendor_details.get("vendor_type", "Contractor")
    is_contractor = (vendor_type == "Contractor")

    vendor_type_directive = (
        "VENDOR REGISTRATION TYPE: CONTRACTOR (Labor Contractor)\n"
        "• Mandatory 4 PDF Certificates: Work Order, Registration, PF Allotment Letter, ESI Allotment Letter.\n"
        "• Maximum Labour Capacity Limit: 9 labourers.\n"
        "• Mandatory PF Code & ESI Code statutory verification."
        if is_contractor else
        "VENDOR REGISTRATION TYPE: SUPPLIER (Material / Service Supplier)\n"
        "• Mandatory 2 PDF Certificates: Purchase Order (P.O. / D.O.) and Registration Document.\n"
        "• Maximum Labour Capacity Limit: 4 labourers.\n"
        "• Statutory Exemption: PF Code & ESI Code are EXEMPT for Suppliers (PF Flag = No, ESI Flag = No)."
    )

    prompt = f"""
You are an expert AI Document Auditor for a Tata Steel Contract Labor Management (CLM) System.
Analyze the following extracted text from a vendor document and compare it against official Tata Steel Company Standards and Vendor Registration Details.

{vendor_type_directive}

IMPORTANT CONSTRAINTS:
1. Do NOT state whether the request is approved or rejected.
2. Do NOT approve or reject the document. Only generate compliance verification remarks.
3. Strictly format your output as a single JSON object with these exact key names:
   "Document": "{display_doc_name}",
   "Confidence Score": "e.g. 95%",
   "Compliance Status": "COMPLIANT" or "ACTION REQUIRED",
   "Issues Found": ["List of specific issues found or missing information"],
   "Suggestion": "Actionable suggestion for the vendor or approver"

COMPANY STANDARDS TO CHECK:
{json.dumps(standard, indent=2)}

VENDOR SUBMITTED DETAILS:
{json.dumps(vendor_details, indent=2)}

EXTRACTED DOCUMENT TEXT:
{extracted_text}
"""

    # 1. Try Google Gemini API if configured
    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            model_name = settings.AI_MODEL if "gemini" in settings.AI_MODEL.lower() else "gemini-2.0-flash"
            
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config={"response_mime_type": "application/json", "temperature": 0.2}
            )
            parsed = json.loads(response.text)
            return parsed
        except Exception as e:
            logger.warning(f"Google Gemini API call failed or quota reached ({e}). Trying OpenAI/Fallback engine.")

    # 2. Try OpenAI API if configured
    if settings.OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a precise document verification AI. Output JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            parsed = json.loads(content)
            return parsed
        except Exception as e:
            logger.warning(f"OpenAI API call failed ({e}). Falling back to Rule-Based AI Engine.")

    # 3. Rule-Based Intelligent Fallback Analysis Engine
    from app.validators import validate_document
    return validate_document(doc_type, extracted_text, standard, vendor_details)
