from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
from .utils import send_otp_email
import random
from django.core.mail import send_mail


from django.contrib.auth import get_user_model
CustomUser = get_user_model()  # Get the correct User model

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = CustomUser.objects.filter(email=email).first()

            # Check if user exists and validate the password
            if user and user.check_password(password):
                # Handle Company Users: Send OTP during login
                if user.account_type == 'Company':
                    otp_code = str(random.randint(100000, 999999))  # Generate a new OTP
                    user.otp_code = otp_code
                    user.save()

                    # Send OTP via email
                    send_mail(
                        subject="Your OTP Code for Login",
                        message=f"Your login OTP code is: {otp_code}.",
                        from_email="your-email@gmail.com",  # Replace with your email
                        recipient_list=[email],
                        fail_silently=False,
                    )

                    return Response({'requires_otp': True, 'message': 'OTP sent to your email.'}, status=status.HTTP_200_OK)

                # For Individual Users, return JWT tokens directly
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)

            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyLoginOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')

        try:
            user = CustomUser.objects.get(email=email)

            # Verify the OTP
            if user.otp_code == otp_code:
                user.otp_code = None  # Clear the OTP after successful verification
                user.save()

                # Return JWT tokens
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)

            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        account_type = request.data.get('accountType', 'Individual')
        company_name = request.data.get('companyName', '')
        company_address = request.data.get('companyAddress', '')

        try:
            # Ensure uniqueness
            if CustomUser.objects.filter(username=username).exists():
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            if CustomUser.objects.filter(email=email).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

            # Generate OTP
            otp_code = str(random.randint(100000, 999999))

            # Create user with correct attributes
            user = CustomUser.objects.create(
                username=username,
                email=email,
                account_type=account_type,
                company_name=company_name if account_type == 'Company' else '',
                company_address=company_address if account_type == 'Company' else '',
                otp_code=otp_code,  # Save OTP to the user model
                is_verified=False  # Mark as not verified
            )
            user.set_password(password)  # Hash password
            user.save()

            # Send OTP via email
            send_mail(
                subject="Your OTP Code for Account Verification",
                message=f"Your OTP code is: {otp_code}. Please enter this code to verify your email.",
                from_email="your-email@gmail.com",  # Replace with your email
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({'success': 'User created successfully. Please check your email for the OTP.'}, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response({'error': 'An error occurred during registration'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': f"Failed to send OTP: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')

        try:
            user = CustomUser.objects.get(email=email)

            if user.otp_code == otp_code:
                user.is_verified = True
                user.otp_code = None  # Clear OTP after successful verification
                user.save()
                return Response({'success': 'Email verified successfully!'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)