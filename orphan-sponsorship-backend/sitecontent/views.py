from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.mail import send_mail
from django.db.models import Sum
from django.conf import settings
import logging

from orphans.models import Orphan
from donors.models import Donation
from schools.models import School
from users.models import CustomUser
from users.permissions import IsAdmin
from orphans.serializers import OrphanListSerializer
from .serializers import (
    ContactMessageSerializer,
    FeedbackEntrySerializer,
    NewsletterSubscriberSerializer,
)
from .models import NewsletterSubscriber, FeedbackEntry, ContactMessage
from django.utils import timezone

logger = logging.getLogger(__name__)


class PublicStatsView(APIView):
    """GET /api/public/stats/ -- live homepage counters (no login required)."""

    permission_classes = [AllowAny]

    def get(self, request):
        total_orphans = Orphan.objects.filter(application_status='Approved').count()
        total_donors = CustomUser.objects.filter(role='donor').count()
        total_schools = School.objects.count()
        total_raised = Donation.objects.filter(payment_status='paid').aggregate(
            total=Sum('amount')
        )['total'] or 0

        return Response(
            {
                'verifiedOrphans': total_orphans,
                'activeDonors': total_donors,
                'partnerSchools': total_schools,
                'donationsRaised': float(total_raised),
            }
        )


class PublicFeaturedOrphansView(APIView):
    """GET /api/public/featured-orphans/ -- approved orphans for homepage."""

    permission_classes = [AllowAny]

    def get(self, request):
        orphans = Orphan.objects.filter(application_status='Approved').order_by('-submitted_at')[:8]
        serializer = OrphanListSerializer(orphans, many=True, context={'request': request})
        return Response(serializer.data)


class ContactMessageCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Thank you. Your message has been received.'},
                status=201,
            )
        return Response(serializer.errors, status=400)


class FeedbackCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = FeedbackEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Thank you for your feedback.'},
                status=201,
            )
        return Response(serializer.errors, status=400)


class AdminFeedbackListView(APIView):
    """GET /api/admin/feedback/ -- website feedback for NGO admin."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        entries = FeedbackEntry.objects.all().order_by('-created_at')
        serializer = FeedbackEntrySerializer(entries, many=True)
        return Response(serializer.data)

class AdminAcceptFeedbackView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def post(self, request, pk):
        try:
            entry = FeedbackEntry.objects.get(pk=pk)
            entry.status = 'Accepted'
            entry.reviewed_at = timezone.now()
            entry.save(update_fields=['status', 'reviewed_at'])
            return Response({'message': 'Feedback accepted.'})
        except FeedbackEntry.DoesNotExist:
            return Response({'message': 'Not found'}, status=404)

class AdminRejectFeedbackView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def post(self, request, pk):
        try:
            entry = FeedbackEntry.objects.get(pk=pk)
            entry.status = 'Rejected'
            entry.reviewed_at = timezone.now()
            entry.save(update_fields=['status', 'reviewed_at'])
            return Response({'message': 'Feedback rejected.'})
        except FeedbackEntry.DoesNotExist:
            return Response({'message': 'Not found'}, status=404)

class PublicFeedbackListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        entries = FeedbackEntry.objects.filter(status='Accepted').order_by('-reviewed_at', '-created_at')
        serializer = FeedbackEntrySerializer(entries, many=True)
        return Response(serializer.data)

class AdminContactMessageListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    def get(self, request):
        messages = ContactMessage.objects.all().order_by('-created_at')
        serializer = ContactMessageSerializer(messages, many=True)
        return Response(serializer.data)


class AdminNewsletterListView(APIView):
    """GET /api/admin/newsletter/ -- subscribed emails for NGO admin."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        subscribers = NewsletterSubscriber.objects.all().order_by('-created_at')
        serializer = NewsletterSubscriberSerializer(subscribers, many=True)
        return Response(serializer.data)


class NewsletterSubscribeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        if not email:
            return Response({'email': ['Please enter your email address.']}, status=400)

        existing = NewsletterSubscriber.objects.filter(email__iexact=email).first()
        if existing:
            return Response(
                {'message': 'You are already subscribed.', 'already_subscribed': True},
                status=409,
            )

        serializer = NewsletterSubscriberSerializer(data={'email': email})
        if serializer.is_valid():
            serializer.save()
            plain_message = (
                'Assalam o Alaikum!\n\n'
                'Thank you for subscribing to the Orphan Sponsorship Portal newsletter.\n\n'
                'You have successfully subscribed to our updates. '
                'You will receive news about orphan profiles, sponsorship opportunities, '
                'and stories of impact from our community.\n\n'
                'Together, we can make a difference in the lives of orphan children.\n\n'
                '— Orphan Educational Sponsorship and Tracking System (OESTS)'
            )
            html_message = """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
              <div style="background:linear-gradient(135deg,#1e2d5a,#2d4080);padding:32px;text-align:center">
                <h1 style="color:#d4a852;margin:0;font-size:22px;">Orphan Sponsorship Portal</h1>
                <p style="color:#fff;margin:8px 0 0;font-size:14px;opacity:0.85;">Newsletter Subscription Confirmed</p>
              </div>
              <div style="padding:32px">
                <p style="color:#374151;font-size:16px;margin-top:0">Assalam o Alaikum!</p>
                <p style="color:#6b7280;font-size:14px;line-height:1.6">
                  Thank you for subscribing to the <strong>Orphan Sponsorship Portal</strong> newsletter.
                  You have successfully subscribed to our updates.
                </p>
                <p style="color:#6b7280;font-size:14px;line-height:1.6">
                  You will receive news about orphan profiles, sponsorship opportunities,
                  and stories of impact from our community.
                </p>
                <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:24px 0;border-left:4px solid #d4a852">
                  <p style="margin:0;color:#374151;font-size:14px;">
                    <strong>Together, we can make a difference in the lives of orphan children.</strong>
                  </p>
                </div>
                <p style="color:#9ca3af;font-size:12px;margin-bottom:0">— Orphan Educational Sponsorship and Tracking System (OESTS)</p>
              </div>
            </div>
            """
            try:
                send_mail(
                    subject='✅ Subscribed to Orphan Sponsorship Portal Newsletter',
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    html_message=html_message,
                    fail_silently=False,
                )
            except Exception as e:
                logger.error('Newsletter subscription email failed for %s: %s', email, str(e))
            return Response({'message': 'Thanks for subscribing! A confirmation email has been sent.'}, status=201)
        return Response(serializer.errors, status=400)
