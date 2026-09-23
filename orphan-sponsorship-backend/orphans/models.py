from django.db import models
from django.conf import settings


class Orphan(models.Model):
    """
    Represents one orphan child's application and profile.
    The 'guardian' is the user account (role='orphan') that submitted the application.
    """

    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
    )

    guardian = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orphan_applications'
    )
    school = models.ForeignKey(
        'schools.School', on_delete=models.SET_NULL, null=True, blank=True, related_name='orphans'
    )

    full_name = models.CharField(max_length=150)
    date_of_birth = models.DateField()
    age = models.PositiveIntegerField(null=True, blank=True, help_text='Age of the child in years')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    guardian_name = models.CharField(max_length=150)
    guardian_cnic = models.CharField(max_length=20, blank=True)
    address = models.TextField()

    school_name_text = models.CharField(
        max_length=200,
        blank=True,
        help_text='School name as typed on the form (optional)',
    )
    student_class = models.CharField(max_length=20, blank=True)
    is_currently_studying = models.BooleanField(
        default=True,
        help_text='False when guardian did not provide school/class',
    )
    monthly_fee = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        help_text='Monthly fee set by Admin upon approval'
    )

    death_certificate = models.FileField(upload_to='documents/death_certificates/', blank=True, null=True)
    photo = models.ImageField(upload_to='documents/photos/', blank=True, null=True)

    application_status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='reviewed_orphans'
    )

    def __str__(self):
        return f"{self.full_name} ({self.application_status})"
