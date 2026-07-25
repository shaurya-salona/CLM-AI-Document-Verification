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
    "work_order": "Work Order",
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

    prompt = f"""
You are an expert AI Document Auditor for a Contract Labor Management (CLM) System.
Analyze the following extracted text from a vendor document and compare it against the official Company Standards and Vendor Registration Details.

IMPORTANT CONSTRAINTS:
1. Do NOT state whether the request is approved or rejected.
2. Do NOT approve or reject the document. Only generate compliance remarks.
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
    return fallback_ai_verification(doc_type, extracted_text, standard, vendor_details)


def fallback_ai_verification(doc_type: str, text: str, standard: Dict[str, Any], vendor_details: Dict[str, Any]) -> Dict[str, Any]:
    display_doc_name = DOC_TYPE_DISPLAY_MAP.get(doc_type, doc_type)
    issues = []
    text_lower = text.lower() if text else ""
    comp_name = vendor_details.get("company_name", "").lower()
    gst_num = vendor_details.get("gst_number", "").lower()
    
    # 1. Company Name Match Check
    if comp_name and comp_name not in text_lower:
        issues.append(f"Company name '{vendor_details.get('company_name')}' not explicitly matched in extracted document text.")

    # 2. Document specific checks
    if doc_type in ["work_order", "Work Order"]:
        if "work order" not in text_lower and "order no" not in text_lower and "wo/" not in text_lower:
            issues.append("Work Order number or formal designation not clearly identified.")
        if "expiry" not in text_lower and "validity" not in text_lower and "valid till" not in text_lower:
            issues.append("Validity period or expiration date not explicitly stated.")
            
    elif doc_type in ["registration", "Registration Certificate"]:
        if gst_num and gst_num not in text_lower:
            issues.append(f"GST Number '{vendor_details.get('gst_number')}' missing from Registration Certificate.")
        if "registration number" not in text_lower and "reg no" not in text_lower and "cin" not in text_lower:
            issues.append("Official registration number format could not be verified.")

    elif doc_type in ["pf", "PF Certificate"]:
        if "pf code" not in text_lower and "epfo" not in text_lower and "estt code" not in text_lower:
            issues.append("PF Establishment Code / EPFO Number missing or invalid format.")
        if "expiry" not in text_lower and "coverage" not in text_lower:
            issues.append("PF Expiry date / coverage period not clearly specified.")

    elif doc_type in ["esi", "ESI Certificate"]:
        if "esi code" not in text_lower and "esic" not in text_lower and "code no" not in text_lower:
            issues.append("ESI 17-digit Employer Code number missing.")
        if "validity" not in text_lower and "date of registration" not in text_lower:
            issues.append("ESIC registration date or active status stamp missing.")

    confidence = 96 - (len(issues) * 12)
    if confidence < 50: confidence = 55

    status = "ACTION REQUIRED" if issues else "COMPLIANT"
    suggestion = "Document complies with basic requirements. Human approver may conduct final verification." if not issues else f"Request updated or clearer copy of {display_doc_name} addressing noted compliance remarks."

    return {
        "Document": display_doc_name,
        "Confidence Score": f"{confidence}%",
        "Compliance Status": status,
        "Issues Found": issues if issues else ["No critical formatting errors detected in OCR text layer."],
        "Suggestion": suggestion
    }
