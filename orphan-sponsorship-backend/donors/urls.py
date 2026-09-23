from django.urls import path
from .views import (
    MakeDonationView,
    DonationHistoryView,
    DownloadReceiptView,
    AdminDonationsListView,
    AdminDonorsListView,
    CreatePaymentIntentView,
    ConfirmPaymentView,
)

urlpatterns = [
    path('donations/', MakeDonationView.as_view(), name='make-donation'),
    path('donations/history/', DonationHistoryView.as_view(), name='donation-history'),
    path('donations/create-payment-intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('donations/confirm-payment/', ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('donations/<int:donation_id>/receipt/', DownloadReceiptView.as_view(), name='download-receipt'),
    path('admin/donations/', AdminDonationsListView.as_view(), name='admin-donations'),
    path('admin/donors/', AdminDonorsListView.as_view(), name='admin-donors'),
]