"""
email.py
Async email sender using Gmail SMTP (TLS on port 587).
"""
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from loguru import logger

from app.config import get_settings


async def send_email(to: str, subject: str, html_body: str) -> None:
    """Send an email via Gmail SMTP. Logs and swallows errors gracefully."""
    settings = get_settings()

    if not settings.smtp_user or not settings.smtp_password:
        logger.warning(f"[EMAIL] SMTP not configured — skipping email to {to}. Subject: {subject}")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Cargo Core <{settings.smtp_user}>"
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_user, to, msg.as_string())

        logger.info(f"[EMAIL] Sent '{subject}' to {to}")
    except Exception as e:
        logger.error(f"[EMAIL] Failed to send email to {to}: {e}")


def otp_email_html(otp: str, email: str) -> str:
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px;
                background: #0F1115; border-radius: 12px; color: #fff;">
      <h2 style="color: #00C4FF; text-align: center;">Cargo Core</h2>
      <p style="text-align: center; color: #aaa;">Email Verification</p>
      <div style="background: #1a1d24; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0;">
        <p style="color: #aaa; margin-bottom: 8px;">Your verification code is:</p>
        <h1 style="letter-spacing: 12px; color: #00C4FF; font-size: 36px; margin: 0;">{otp}</h1>
        <p style="color: #666; font-size: 12px; margin-top: 12px;">Expires in 10 minutes</p>
      </div>
      <p style="color: #666; font-size: 12px; text-align: center;">
        If you didn't request this, please ignore this email.
      </p>
    </div>
    """
