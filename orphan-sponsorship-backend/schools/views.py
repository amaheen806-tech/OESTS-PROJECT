from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsSchool, IsAdmin
from orphans.models import Orphan
from .models import AcademicRecord, FeePayment
from .serializers import AcademicRecordSerializer, AcademicRecordReadSerializer


class SubmitReportView(APIView):
    """POST /api/reports/submit/ -- a school submits a monthly academic report."""

    permission_classes = [IsAuthenticated, IsSchool]

    def post(self, request):
        orphan_id = request.data.get('orphan')
        try:
            orphan = Orphan.objects.get(id=orphan_id)
        except Orphan.DoesNotExist:
            return Response({'message': 'Student not found.'}, status=404)

        # Security check: school can only report on its own enrolled students
        from orphans.views import _students_for_school

        if not _students_for_school(request.user).filter(id=orphan.id).exists():
            return Response(
                {'message': 'You can only submit reports for students enrolled at your own school.'},
                status=403
            )

        serializer = AcademicRecordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Monthly report submitted successfully.'}, status=201)
        return Response(serializer.errors, status=400)


class StudentReportsView(APIView):
    """
    GET /api/reports/<orphan_id>/ -- shows the report history for one orphan child.
    To protect the child's privacy, only these people can view it:
    - The NGO Admin
    - A donor who has actually sponsored this specific child
    - The guardian who submitted this child's application
    - Any School account (needed to review their own submissions)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, orphan_id):
        from donors.models import Donation

        try:
            orphan = Orphan.objects.get(id=orphan_id)
        except Orphan.DoesNotExist:
            return Response({'message': 'Orphan not found.'}, status=404)

        user = request.user
        is_admin = user.role == 'admin'
        is_school = user.role == 'school'
        is_guardian = user.role == 'orphan' and orphan.guardian_id == user.id
        is_sponsor = user.role == 'donor' and Donation.objects.filter(orphan=orphan, donor=user).exists()

        if not (is_admin or is_school or is_guardian or is_sponsor):
            return Response(
                {'message': 'You can only view the progress report of a child you are sponsoring.'},
                status=403
            )

        records = orphan.academic_records.all().order_by('-submitted_at')
        serializer = AcademicRecordReadSerializer(records, many=True, context={'request': request})

        return Response({
            'name': orphan.full_name,
            'className': orphan.student_class,
            'school': orphan.school_name_text,
            'records': serializer.data,
        })


class MySubmittedReportsView(APIView):
    """GET /api/reports/my-submissions/ -- School sees all reports it has submitted."""

    permission_classes = [IsAuthenticated, IsSchool]

    def get(self, request):
        records = AcademicRecord.objects.filter(submitted_by=request.user).order_by('-submitted_at')
        data = []
        for record in records:
            data.append({
                'id': record.id,
                'student_name': record.orphan.full_name,
                'report_month': record.report_month,
                'attendance': record.attendance_percentage,
                'average_marks': record.average_marks,
                'submitted_at': record.submitted_at,
            })
        return Response(data)


class AdminReportsListView(APIView):
    """GET /api/admin/reports/ -- all monthly student reports for NGO admin."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        records = (
            AcademicRecord.objects.select_related('orphan', 'orphan__school', 'submitted_by')
            .order_by('-submitted_at')
        )
        data = []
        for record in records:
            school_name = None
            if record.orphan.school_id and record.orphan.school:
                school_name = record.orphan.school.school_name
            elif record.submitted_by_id:
                school_name = record.submitted_by.full_name
            else:
                school_name = record.orphan.school_name_text or '—'

            report_card_url = None
            if record.report_card:
                report_card_url = request.build_absolute_uri(record.report_card.url)

            data.append({
                'id': record.id,
                'student_name': record.orphan.full_name,
                'student_class': record.orphan.student_class or '—',
                'school_name': school_name,
                'report_month': record.report_month,
                'total_school_days': record.total_school_days,
                'days_present': record.days_present,
                'attendance': record.attendance_percentage,
                'average_marks': float(record.average_marks),
                'teacher_comments': record.teacher_comments,
                'report_card': report_card_url,
                'submitted_at': record.submitted_at,
            })
        return Response(data)

class SchoolPayrollView(APIView):
    """GET /api/schools/payroll/?month=... -- shows enrolled students and their fee status."""

    permission_classes = [IsAuthenticated, IsSchool]

    def get(self, request):
        month = request.query_params.get('month')
        if not month:
            return Response({'message': 'Please provide a month (e.g. September 2026).'}, status=400)

        from orphans.views import _students_for_school
        orphans = _students_for_school(request.user)
        
        data = []
        for orphan in orphans:
            fee_payment = FeePayment.objects.filter(orphan=orphan, month=month).first()
            data.append({
                'id': orphan.id,
                'student_name': orphan.full_name,
                'student_class': orphan.student_class,
                'monthly_fee': float(orphan.monthly_fee),
                'status': 'Paid' if fee_payment else 'Pending',
                'paid_at': fee_payment.paid_at if fee_payment else None,
            })
        return Response(data)


class AdminPayrollListView(APIView):
    """GET /api/admin/payroll/?month=... -- admin sees payroll for all approved students."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        month = request.query_params.get('month')
        if not month:
            return Response({'message': 'Please provide a month (e.g. September 2026).'}, status=400)

        orphans = Orphan.objects.filter(application_status='Approved', is_currently_studying=True).select_related('school')
        
        data = []
        for orphan in orphans:
            fee_payment = FeePayment.objects.filter(orphan=orphan, month=month).first()
            data.append({
                'orphan_id': orphan.id,
                'student_name': orphan.full_name,
                'student_class': orphan.student_class,
                'school_name': orphan.school_name_text or (orphan.school.school_name if orphan.school else '—'),
                'monthly_fee': float(orphan.monthly_fee),
                'status': 'Paid' if fee_payment else 'Pending',
                'paid_at': fee_payment.paid_at if fee_payment else None,
                'paid_by': fee_payment.paid_by.full_name if fee_payment and fee_payment.paid_by else None,
            })
        return Response(data)


class AdminPayFeeView(APIView):
    """POST /api/admin/payroll/pay/"""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        orphan_id = request.data.get('orphan_id')
        month = request.data.get('month')

        if not orphan_id or not month:
            return Response({'message': 'Orphan ID and month are required.'}, status=400)

        try:
            orphan = Orphan.objects.get(id=orphan_id, application_status='Approved')
        except Orphan.DoesNotExist:
            return Response({'message': 'Approved orphan not found.'}, status=404)

        if not orphan.school:
            return Response({'message': 'Orphan is not assigned to a school.'}, status=400)

        # Check if already paid
        if FeePayment.objects.filter(orphan=orphan, month=month).exists():
            return Response({'message': f'Fee for {month} is already paid for {orphan.full_name}.'}, status=400)

        payment = FeePayment.objects.create(
            orphan=orphan,
            school=orphan.school,
            month=month,
            amount_paid=orphan.monthly_fee,
            paid_by=request.user
        )

        return Response({
            'message': f'Fee of {payment.amount_paid} paid to {orphan.school.school_name} for {orphan.full_name} ({month}).'
        })
