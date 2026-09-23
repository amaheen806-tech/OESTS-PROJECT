from django.db import models
from django.conf import settings


class School(models.Model):
    """
    Represents a partner school. Each school is linked to one user account
    (the school administrator who logs in and submits reports).
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='school_profile'
    )
    school_name = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return self.school_name


class AcademicRecord(models.Model):
    """
    One monthly academic report submitted by a school for one orphan student.
    This is what powers the Progress Report page for donors.
    """

    orphan = models.ForeignKey(
        'orphans.Orphan', on_delete=models.CASCADE, related_name='academic_records'
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='submitted_reports'
    )

    report_month = models.CharField(max_length=20, help_text="e.g. 'April 2026'")
    total_school_days = models.PositiveIntegerField()
    days_present = models.PositiveIntegerField()
    average_marks = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    teacher_comments = models.TextField(blank=True)
    report_card = models.FileField(upload_to='documents/report_cards/', blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    @property
    def attendance_percentage(self):
        if self.total_school_days == 0:
            return 0
        return round((self.days_present / self.total_school_days) * 100, 2)

    def __str__(self):
        return f"{self.orphan.full_name} - {self.report_month}"


class FeePayment(models.Model):
    """
    Records a monthly fee payment from the NGO to a School for a specific Orphan.
    """
    orphan = models.ForeignKey(
        'orphans.Orphan', on_delete=models.CASCADE, related_name='fee_payments'
    )
    school = models.ForeignKey(
        'School', on_delete=models.CASCADE, related_name='fee_payments'
    )
    month = models.CharField(max_length=20, help_text="e.g. 'September 2026'")
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    paid_at = models.DateTimeField(auto_now_add=True)
    paid_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='processed_fee_payments'
    )

    class Meta:
        unique_together = ('orphan', 'month')

    def __str__(self):
        return f"{self.orphan.full_name} - {self.month} ({self.amount_paid})"