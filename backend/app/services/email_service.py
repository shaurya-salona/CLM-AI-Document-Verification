import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger(__name__)

def send_real_email_otp(recipient_email: str, otp_code: str, purpose: str = "registration") -> bool:
    """
    Sends a real HTML Email OTP via SMTP (Gmail, Outlook, AWS SES, or Tata Steel Corporate Mail).
    """
    subject = f"Tata Steel CLM - Security Verification OTP: {otp_code}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {{ font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }}
        .container {{ max-width: 550px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 30px; border: 1px solid #334155; }}
        .header {{ text-align: center; padding-bottom: 20px; border-bottom: 1px solid #334155; }}
        .title {{ font-size: 20px; font-weight: bold; color: #38bdf8; margin: 5px 0; }}
        .otp-box {{ background-color: #0284c7; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; border-radius: 12px; margin: 25px 0; border: 1px solid #38bdf8; }}
        .footer {{ text-align: center; font-size: 11px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #334155; padding-top: 15px; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">TATA STEEL | CLM Enterprise</div>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">Contract Labor Management System</p>
        </div>
        
        <p style="font-size: 14px; margin-top: 20px;">Dear Vendor Partner,</p>
        <p style="font-size: 13px; color: #cbd5e1;">Use the following 6-digit One-Time Password (OTP) to complete your <strong>{purpose.upper()}</strong> verification for Tata Steel plant site registration:</p>
        
        <div class="otp-box">{otp_code}</div>
        
        <p style="font-size: 12px; color: #f59e0b; text-align: center;">⏱️ This security OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        
        <div class="footer">
          © 2026 Tata Steel Limited. All rights reserved.<br/>
          Contract Workman Regulation (CWR) Cell Document Verification Engine.
        </div>
      </div>
    </body>
    </html>
    """

    # Check if SMTP server & credentials are configured in .env
    if not (settings.SMTP_USERNAME and settings.SMTP_PASSWORD):
        logger.info(f"[REAL EMAIL NOTICE] SMTP credentials not set in .env. Real OTP Email to {recipient_email}: Code = {otp_code}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME
        msg["To"] = recipient_email
        
        part = MIMEText(html_content, "html")
        msg.attach(part)

        # Connect to SMTP server via TLS
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(msg["From"], recipient_email, msg.as_string())

        logger.info(f"[REAL EMAIL SUCCESS] Real OTP Email successfully delivered to {recipient_email} via SMTP ({settings.SMTP_SERVER})!")
        return True

    except Exception as e:
        logger.error(f"[REAL EMAIL ERROR] Failed to send real email via SMTP to {recipient_email}: {e}")
        return False
