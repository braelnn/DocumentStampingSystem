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
import qrcode
import qrcode.image.svg
from io import BytesIO
import base64
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from django.contrib.auth.hashers import check_password
from .serializers import UserSerializer



from django.contrib.auth import get_user_model
CustomUser = get_user_model()  # Get the correct User model

class UserListView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access

    def get(self, request):
        users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = CustomUser.objects.filter(email=email).first()

            # Check if user exists and validate the password
            if user and user.check_password(password):
                request.session['email'] = email  # Store email in session

                # Special Case: Superuser login
                if email == "admin@gmail.com" and password == "admin":
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'is_admin': True,  # Indicate this user is an admin
                    }, status=status.HTTP_200_OK)

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
                    'is_admin': False,  # Regular user
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



class QRCodeView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure user is authenticated

    def get(self, request):
        try:
            user = request.user  # Get the logged-in user

            # Prepare user data for QR code generation
            user_data = {
                "email": user.email,
                "username": user.username,
                "account_type": getattr(user, "account_type", "Unknown"),
                "is_verified": getattr(user, "is_verified", False),
                "company_name": getattr(user, "company_name", ""),  # Include company_name
                "company_address": getattr(user, "company_address", None)
                if getattr(user, "account_type", "") == "Company"
                else None,
            }

            # Log user data for debugging
            print(f"User Data for QR Code: {user_data}")

            # Convert user data to a string
            qr_data = str(user_data)

            # Validate QR data
            if not qr_data:
                return Response({"error": "No data to encode in QR code."}, status=status.HTTP_400_BAD_REQUEST)

            # Generate the QR code as SVG
            qr = qrcode.make(qr_data, image_factory=qrcode.image.svg.SvgImage)
            stream = BytesIO()
            qr.save(stream)
            qr_code_base64 = base64.b64encode(stream.getvalue()).decode()

            # Optional: Save the QR code to the media directory (uncomment if needed)
            # qr_code_path = f"media/qrcodes/{user.username}_qr_code.svg"
            # with open(qr_code_path, "wb") as qr_file:
            #     qr_file.write(stream.getvalue())

            # Return the QR code as a base64-encoded SVG
            return Response(
                {"qr_code_url": f"data:image/svg+xml;base64,{qr_code_base64}"},
                status=status.HTTP_200_OK,
            )

        except AttributeError as e:
            # Handle attribute errors specifically
            print(f"Attribute Error while generating QR Code: {e}")
            return Response(
                {"error": f"Attribute error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            # Catch any other unexpected errors
            print(f"Unexpected error generating QR Code: {e}")
            return Response(
                {"error": "An unexpected error occurred while generating the QR code."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class QRCodeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            users = CustomUser.objects.all()  # Fetch all users
            qr_codes = []

            for user in users:
                user_data = {
                    "email": user.email,
                    "username": user.username,
                    "account_type": user.account_type if hasattr(user, "account_type") else "Unknown",
                    "company_name": getattr(user, "company_name", ""),  # Include company_name
                    "is_verified": user.is_verified,
                }

                qr_data = str(user_data)
                if not qr_data:
                    continue  # Skip empty QR data

                qr = qrcode.make(qr_data, image_factory=qrcode.image.svg.SvgImage)
                stream = BytesIO()
                qr.save(stream)
                qr_code_base64 = base64.b64encode(stream.getvalue()).decode()

                qr_codes.append({
                    "id": user.id,
                    "username": user.username,
                    "qr_code_url": f"data:image/svg+xml;base64,{qr_code_base64}",
                })

            return Response({"qr_codes": qr_codes}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyOTPDocView(APIView):
    def post(self, request):
        email = request.session.get('email')  # Retrieve email from session

        if not email:
            return Response({'error': 'User email not found in session'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        otp_code = str(random.randint(100000, 999999))
        user.otp_code = otp_code
        user.save()

        send_mail(
            subject="Your OTP for Document Verification",
            message=f"Your OTP for document verification is: {otp_code}",
            from_email="blessingbraelly@gmail.com",
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({'success': True, 'message': 'OTP sent to email'}, status=status.HTTP_200_OK)


class VerifyOTPDocVerifyView(APIView):
    def post(self, request):
        email = request.session.get('email')  # Retrieve email from session
        otp_code = request.data.get('otp')

        if not email:
            return Response({'error': 'User email not found in session'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if user.otp_code == otp_code:
            user.otp_code = None
            user.save()
            return Response({'success': True, 'message': 'OTP verified'}, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can delete users

    def delete(self, request, user_id):
        try:
            user_to_delete = CustomUser.objects.get(id=user_id)

            # Check if the user is the specific admin with email 'admin@gmail.com'
            if user_to_delete.email == "admin@gmail.com":
                return Response(
                    {"error": "This admin user cannot be deleted."},
                    status=status.HTTP_403_FORBIDDEN
                )

            user_to_delete.delete()
            return Response({"success": "User deleted successfully."}, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
