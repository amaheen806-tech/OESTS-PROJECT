from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.http import HttpResponse
from django.conf import settings
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
import io

from users.permissions import IsDonor, IsAdmin
from .models import Donation
from .serializers import DonationCreateSerializer, DonationHistorySerializer, AdminDonationSerializer


class MakeDonationView(APIView):
    """POST /api/donations/ -- a donor sponsors an orphan child."""

    permission_classes = [IsAuthenticated, IsDonor]

    def post(self, request):
        serializer = DonationCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            donation = serializer.save()
            donation.payment_status = 'paid'
            donation.save(update_fields=['payment_status'])

            send_mail(
                subject='Thank You for Your Donation — OESTS',
                message=(
                    f'Dear {request.user.full_name},\n\n'
                    f'Thank you for your generous donation!\n\n'
                    f'Amount donated: PKR {donation.amount}\n'
                    f'Sponsored child: {donation.orphan.full_name}\n'
                    f'Receipt Number: {donation.receipt_number}\n'
                    f'Date: {donation.donated_at.strftime("%d %B %Y")}\n\n'
                    f'Your support helps this child continue their education. '
                    f'You can view progress reports anytime from your donor portal.\n\n'
                    f'With gratitude,\n'
                    f'Orphan Educational Sponsorship and Tracking System (OESTS)'
                ),
                from_email=None,
                recipient_list=[request.user.email],
            )

            return Response({
                'message': 'Thank you, your donation has been recorded.',
                'receiptNumber': donation.receipt_number,
            }, status=201)
        return Response(serializer.errors, status=400)


class DonationHistoryView(APIView):
    """GET /api/donations/history/ -- shows all donations made by the logged in donor."""

    permission_classes = [IsAuthenticated, IsDonor]

    def get(self, request):
        donations = Donation.objects.filter(donor=request.user).order_by('-donated_at')
        serializer = DonationHistorySerializer(donations, many=True)
        return Response(serializer.data)


class DownloadReceiptView(APIView):
    """
    GET /api/donations/<id>/receipt/ -- generates and returns a real PDF
    receipt for one donation, but only if it belongs to the logged in donor.
    """

    permission_classes = [IsAuthenticated, IsDonor]

    def get(self, request, donation_id):
        try:
            donation = Donation.objects.get(id=donation_id, donor=request.user)
        except Donation.DoesNotExist:
            return Response({'message': 'Receipt not found.'}, status=404)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=A4,
            topMargin=25 * mm, bottomMargin=20 * mm, leftMargin=20 * mm, rightMargin=20 * mm,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('Title', parent=styles['Title'], fontSize=18, alignment=TA_CENTER)
        subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=10,
                                         textColor=colors.HexColor('#555555'), alignment=TA_CENTER, spaceAfter=16)

        story = [
            Paragraph("Orphan Educational Sponsorship and Tracking System", subtitle_style),
            Paragraph("Donation Receipt", title_style),
            Spacer(1, 10),
        ]

        details = [
            ["Receipt Number", donation.receipt_number],
            ["Donor Name", donation.donor.full_name],
            ["Donor Email", donation.donor.email],
            ["Sponsored Child", donation.orphan.full_name],
            ["Amount", f"PKR {donation.amount}"],
            ["Date", donation.donated_at.strftime('%d %B %Y, %I:%M %p')],
        ]
        table = Table(details, colWidths=[50 * mm, 100 * mm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F3EBE1')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.6, colors.black),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(table)
        story.append(Spacer(1, 20))
        story.append(Paragraph(
            "Thank you for supporting a child's education. This receipt confirms that your "
            "donation has been recorded in our system.",
            ParagraphStyle('Note', parent=styles['Normal'], fontSize=9.5, textColor=colors.HexColor('#555555'))
        ))

        doc.build(story)
        buffer.seek(0)

        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="receipt_{donation.receipt_number}.pdf"'
        return response


class AdminDonationsListView(APIView):
    """GET /api/admin/donations/ -- shows every donation (who donated to whom)."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        donations = Donation.objects.all().order_by('-donated_at')
        serializer = AdminDonationSerializer(donations, many=True)
        return Response(serializer.data)


class AdminDonorsListView(APIView):
    """GET /api/admin/donors/ -- registered donors + donation activity."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from users.models import CustomUser
        from django.db.models import Sum, Count

        donors = CustomUser.objects.filter(role='donor').order_by('full_name')
        registered = []
        for donor in donors:
            stats = Donation.objects.filter(donor=donor).aggregate(
                total_amount=Sum('amount'),
                donation_count=Count('id'),
            )
            registered.append({
                'id': donor.id,
                'name': donor.full_name,
                'email': donor.email,
                'phone': donor.phone or '',
                'donation_count': stats['donation_count'] or 0,
                'total_donated': float(stats['total_amount'] or 0),
            })

        donations = Donation.objects.select_related('donor', 'orphan').order_by('-donated_at')
        donated = AdminDonationSerializer(donations, many=True).data

        return Response({
            'registered': registered,
            'donations': donated,
        })


class CreatePaymentIntentView(APIView):
    """
    POST /api/donations/create-payment-intent/
    Step 1 of paying: tells Stripe how much money to expect, and gets back
    a special code (client secret) that the frontend uses to show the card form.
    """

    permission_classes = [IsAuthenticated, IsDonor]

    def post(self, request):
        orphan_id = request.data.get('orphan')
        amount = request.data.get('amount')

        if not orphan_id or not amount:
            return Response({'message': 'Orphan and amount are required.'}, status=400)

        if float(amount) <= 0:
            return Response({'message': 'Amount must be greater than zero.'}, status=400)

        try:
            from orphans.models import Orphan
            orphan = Orphan.objects.get(id=orphan_id)
        except Orphan.DoesNotExist:
            return Response({'message': 'Orphan not found.'}, status=404)

        # Stripe works in the smallest currency unit (e.g. cents), so we
        # multiply by 100. Stripe's test mode does not support PKR directly,
        # so we use USD here for the sandbox demonstration.
        amount_in_cents = int(float(amount) * 100)

        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency='usd',
            metadata={
                'donor_id': str(request.user.id),
                'orphan_id': str(orphan.id),
                'orphan_name': orphan.full_name,
            },
        )

        # Create the Donation record now, marked as "pending" until payment succeeds
        donation = Donation.objects.create(
            donor=request.user,
            orphan=orphan,
            amount=amount,
            stripe_payment_intent_id=intent.id,
            payment_status='pending',
        )

        return Response({
            'clientSecret': intent.client_secret,
            'donationId': donation.id,
        })


class ConfirmPaymentView(APIView):
    """
    POST /api/donations/confirm-payment/
    Step 2 of paying: called by the frontend after Stripe confirms the card
    payment succeeded, so we can mark our own donation record as paid.
    """

    permission_classes = [IsAuthenticated, IsDonor]

    def post(self, request):
        donation_id = request.data.get('donationId')

        try:
            donation = Donation.objects.get(id=donation_id, donor=request.user)
        except Donation.DoesNotExist:
            return Response({'message': 'Donation not found.'}, status=404)

        # Double-check with Stripe directly that the payment really succeeded,
        # instead of just trusting the frontend.
        intent = stripe.PaymentIntent.retrieve(donation.stripe_payment_intent_id)

        if intent.status == 'succeeded':
            donation.payment_status = 'paid'
            donation.save()

            send_mail(
                subject='Thank You for Your Donation',
                message=(
                    f'Dear {request.user.full_name},\n\n'
                    f'Thank you for your generous donation of PKR {donation.amount} to sponsor '
                    f'{donation.orphan.full_name}.\n\n'
                    f'Receipt Number: {donation.receipt_number}\n'
                    f'Date: {donation.donated_at.strftime("%d %B %Y")}\n\n'
                    f'With gratitude.'
                ),
                from_email=None,
                recipient_list=[request.user.email],
            )

            return Response({'message': 'Payment confirmed. Thank you for your donation.'})

        donation.payment_status = 'failed'
        donation.save()
        return Response({'message': 'Payment was not successful.'}, status=400)