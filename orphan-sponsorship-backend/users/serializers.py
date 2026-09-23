from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
import re
from .models import CustomUser


def check_strong_password(value):
    """Runs Django's built-in validators plus our own letter+number+symbol rule."""
    try:
        validate_password(value)
    except DjangoValidationError as error:
        raise serializers.ValidationError(list(error.messages))

    has_letter = re.search(r'[a-zA-Z]', value)
    has_number = re.search(r'[0-9]', value)
    has_symbol = re.search(r'[^a-zA-Z0-9]', value)
    if not (has_letter and has_number and has_symbol):
        raise serializers.ValidationError(
            'Password must include at least one letter, one number, and one symbol.'
        )
    return value


class SendOTPSerializer(serializers.Serializer):
    """
    Used on the first step of registration: checks the details are valid
    and, if so, an OTP is sent to the given email (handled in the view).
    """

    fullName = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES)

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate_password(self, value):
        return check_strong_password(value)


class VerifyOTPSerializer(serializers.Serializer):
    """
    Used on the second step of registration: checks the OTP code is correct
    and, if so, creates the account.
    """

    fullName = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES)
    otp_code = serializers.CharField(max_length=6)

    def create(self, validated_data):
        validated_data.pop('otp_code')
        user = CustomUser(
            username=validated_data['email'],
            email=validated_data['email'],
            full_name=validated_data['fullName'],
            phone=validated_data.get('phone', ''),
            role=validated_data['role'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """A simple representation of the logged in user, sent back to the frontend."""

    fullName = serializers.CharField(source='full_name')

    class Meta:
        model = CustomUser
        fields = ['id', 'fullName', 'email', 'role', 'phone']


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False)

    def validate(self, data):
        email = data['email']
        password = data['password']

        # Check whether this email is registered at all
        try:
            account = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({
                'message': (
                    'No account found with this email address. '
                    'Please register yourself first.'
                )
            })

        user = authenticate(email=email, password=password)
        if user is None:
            raise serializers.ValidationError({
                'message': 'Your email address or password is incorrect.'
            })

        # If the person selected a role on the login page, make sure it matches
        # their real account role. This is an extra security check.
        selected_role = data.get('role')
        if selected_role and selected_role != user.role:
            raise serializers.ValidationError({
                'message': (
                    f'This account is registered as a {account.get_role_display()}. '
                    f'Please select the correct role and try again.'
                )
            })

        data['user'] = user
        return data