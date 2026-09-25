from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from .serializers import SendOTPSerializer, VerifyOTPSerializer, DirectRegisterSerializer, LoginSerializer, UserSerializer
from .models import CustomUser, OTPVerification


class SendOTPView(APIView):
    """
    POST /api/auth/send-otp/ -- Step 1 of registration.
    Validates the person's details, then emails them a 6-digit code.
    The account is NOT created yet at this point.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']

            # Remove any older, unused codes for this email first
            OTPVerification.objects.filter(email=email).delete()

            otp_code = OTPVerification.generate_otp()
            OTPVerification.objects.create(email=email, otp_code=otp_code)

            try:
                from django.conf import settings
                send_mail(
                    subject='Your Verification Code',
                    message=(
                        f'Your verification code is: {otp_code}\n\n'
                        f'This code will expire in 10 minutes. If you did not request this, '
                        f'you can safely ignore this email.'
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
            except Exception as e:
                # Remove OTP so they can try again
                OTPVerification.objects.filter(email=email).delete()
                return Response({'message': f'Could not send email: {str(e)}'}, status=500)

            return Response({'message': 'A verification code has been sent to your email.'})
        return Response(serializer.errors, status=400)


class VerifyOTPView(APIView):
    """
    POST /api/auth/verify-otp/ -- Step 2 of registration.
    Checks the code the person entered, and if correct, creates the account.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            entered_code = serializer.validated_data['otp_code']

            record = OTPVerification.objects.filter(email=email).order_by('-created_at').first()

            if not record:
                return Response({'message': 'No verification code was requested for this email.'}, status=400)

            if record.is_expired():
                return Response({'message': 'This code has expired. Please request a new one.'}, status=400)

            if record.otp_code != entered_code:
                return Response({'message': 'The verification code is incorrect.'}, status=400)

            # Code is correct -- create the account and clean up the used code
            serializer.save()
            OTPVerification.objects.filter(email=email).delete()

            return Response({'message': 'Account created successfully.'}, status=201)
        return Response(serializer.errors, status=400)


class DirectRegisterView(APIView):
    """
    POST /api/auth/register/ -- Direct registration without OTP.
    Validates the person's details and creates the account immediately.
    Email verification can be added in the future via SMTP.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = DirectRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Account created successfully! You can now login.'}, status=201)

        # Return a clean error message
        errors = serializer.errors
        first = next(iter(errors.values()), None)
        if isinstance(first, list):
            first = first[0]
        return Response({'message': first or 'Registration failed. Please try again.'}, status=400)


class LoginView(APIView):
    """POST /api/auth/login/ -- checks the email/password and returns a JWT token."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)

            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
            })

        # Prefer a clear message field for the frontend alert
        errors = serializer.errors
        if 'message' in errors:
            message = errors['message']
            if isinstance(message, list):
                message = message[0]
            return Response({'message': message}, status=400)

        if 'non_field_errors' in errors:
            message = errors['non_field_errors']
            if isinstance(message, list):
                message = message[0]
            return Response({'message': message}, status=400)

        # Field-level errors (e.g. invalid email format)
        first = next(iter(errors.values()), None)
        if isinstance(first, list):
            first = first[0]
        return Response({'message': first or 'Login failed. Please try again.'}, status=400)


class ForgotPasswordView(APIView):
    """POST /api/auth/forgot-password/ -- sends a password reset link to the user's email."""

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            # We don't reveal whether the email exists, for security.
            return Response({'message': 'If this email exists, a reset link has been sent.'})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"

        send_mail(
            subject='Reset your password',
            message=f'Click this link to reset your password: {reset_link}',
            from_email=None,
            recipient_list=[user.email],
        )
        return Response({'message': 'If this email exists, a reset link has been sent.'})


class ResetPasswordView(APIView):
    """POST /api/auth/reset-password/ -- sets a new password using the reset link's token."""

    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=user_id)
        except (CustomUser.DoesNotExist, ValueError, TypeError):
            return Response({'message': 'This reset link is invalid.'}, status=400)

        if not default_token_generator.check_token(user, token):
            return Response({'message': 'This reset link has expired or is invalid.'}, status=400)

        try:
            validate_password(new_password)
        except DjangoValidationError as error:
            return Response({'password': list(error.messages)}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Your password has been reset successfully.'})