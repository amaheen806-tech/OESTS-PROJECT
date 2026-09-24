from django.urls import path
from .views import (
    MakeDonationView,
    DonationHistoryView,
    DownloadReceiptView,
    AdminDonationsListView,
    AdminDonorsListView,
)

urlpatterns = [
    path('donations/', MakeDonationView.as_view(), name='make-donation'),
    path('donations/history/', DonationHistoryView.as_view(), name='donation-history'),
    path('donations/<int:donation_id>/receipt/', DownloadReceiptView.as_view(), name='download-receipt'),
    path('admin/donations/', AdminDonationsListView.as_view(), name='admin-donations'),
    path('admin/donors/', AdminDonorsListView.as_view(), name='admin-donors'),
]