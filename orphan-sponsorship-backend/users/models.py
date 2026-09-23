import random
from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver


class CustomUser(AbstractUser):
    """
    Our own User model. We use email to login instead of username,
    and every user has a role that decides which dashboard they see
    and what they are allowed to do (Admin, Donor, School, Orphan).
    """

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('donor', 'Donor'),
        ('school', 'School'),
        ('orphan', 'Orphan'),
    )

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    # We login with email instead of username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name', 'role']

    def __str__(self):
        return f"{self.full_name} ({self.role})"


class OTPVerification(models.Model):
    """Temporarily stores a 6-digit code sent to an email for verification."""

    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        # OTP is valid for 10 minutes only
        return timezone.now() > self.created_at + timedelta(minutes=10)

    @staticmethod
    def generate_otp():
        return str(random.randint(100000, 999999))

    def __str__(self):
        return f"OTP for {self.email}"


@receiver(post_save, sender=CustomUser)
def create_school_profile(sender, instance, created, **kwargs):
    """
    Whenever a new user registers with the 'school' role, automatically
    create a matching entry in the School model too, so both stay in sync.
    """
    if created and instance.role == 'school':
        from schools.models import School
        School.objects.get_or_create(
            user=instance,
            defaults={
                'school_name': instance.full_name,
                'contact_email': instance.email,
                'is_approved': True,
            }
        )