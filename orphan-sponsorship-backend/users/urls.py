from django.urls import path
from .views import (
    SendOTPView,
    VerifyOTPView,
    DirectRegisterView,
    LoginView,
    ForgotPasswordView,
    ResetPasswordView,
)

urlpatterns = [
    path('register/', DirectRegisterView.as_view(), name='register'),
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('login/', LoginView.as_view(), name='login'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]