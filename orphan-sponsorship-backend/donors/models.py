import uuid
from django.db import models
from django.conf import settings


class Donation(models.Model):
    """
    Represents one donation made by a donor to sponsor a specific orphan child.
    A receipt number is generated automatically for every donation.
    """

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    )

    donor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='donations'
    )
    orphan = models.ForeignKey(
        'orphans.Orphan', on_delete=models.CASCADE, related_name='donations'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    receipt_number = models.CharField(max_length=30, unique=True, blank=True)
    donated_at = models.DateTimeField(auto_now_add=True)

    # Payment fields
    payment_screenshot = models.ImageField(upload_to='payment_receipts/', blank=True, null=True)
    payment_status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    def save(self, *args, **kwargs):
        # Automatically create a receipt number the first time this donation is saved
        if not self.receipt_number:
            self.receipt_number = f"RCPT-{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.donor} -> {self.orphan} (PKR {self.amount})"