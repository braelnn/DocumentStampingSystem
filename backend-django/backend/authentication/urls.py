from django.urls import path
from .views import LoginView
from .views import RegisterView
from .views import VerifyOTPView
from .views import VerifyLoginOTPView 
from .views import QRCodeView
from .views import VerifyOTPDocView, VerifyOTPDocVerifyView
from .views import UserListView, UserDeleteView
from .views import QRCodeListView






urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('verify-login-otp/', VerifyLoginOTPView.as_view(), name='verify-login-otp'),
    path('api/qr-code/', QRCodeView.as_view(), name="qr-code"),
    path('api/verify-otp-doc/', VerifyOTPDocView.as_view(), name="send-otp-doc"),
    path('api/verify-otp-doc/verify/', VerifyOTPDocVerifyView.as_view(), name="verify-otp-doc"),
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<int:user_id>/", UserDeleteView.as_view(), name='user-delete'),
    path('qr-codescollect/', QRCodeListView.as_view(), name='qr-code-list'),



    


]
