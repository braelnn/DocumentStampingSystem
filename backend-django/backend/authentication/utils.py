from django.core.mail import send_mail
from django.conf import settings

def send_otp_email(email, otp):
    """Send an OTP email for user verification"""
    subject = "Your OTP Code for Account Verification"
    message = f"Your OTP code is: {otp}. Please enter this code to verify your email."
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]

    send_mail(subject, message, from_email, recipient_list)
