from django.urls import path
from .views import LoginView
from .views import RegisterView
from .views import VerifyOTPView
from .views import VerifyLoginOTPView 
from .views import QRCodeView


urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('verify-login-otp/', VerifyLoginOTPView.as_view(), name='verify-login-otp'),
    path('api/qr-code/', QRCodeView.as_view(), name="qr-code"),

    


    

]
