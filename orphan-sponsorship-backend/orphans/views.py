from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.db.models import Q

from users.permissions import IsOrphan, IsAdmin
from schools.models import School
from .models import Orphan
from .serializers import (
    OrphanApplicationSerializer,
    OrphanListSerializer,
    AdminOrphanSerializer,
    AdminOrphanDetailSerializer,
    MyApplicationSerializer,
)

class OrphanApplyView(APIView):
    """POST /api/orphans/apply/ -- guardian submits a new orphan application."""

    permission_classes = [IsAuthenticated, IsOrphan]

    def post(self, request):
        serializer = OrphanApplicationSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            orphan = serializer.save()

            try:
                send_mail(
                    subject='Application Received',
                    message=(
                        f'Dear {request.user.full_name},\n\n'
                        f'Your application for {orphan.full_name} has been received and is now '
                        f'pending review by our NGO administrator. We will notify you as soon as '
                        f'a decision has been made.\n\n'
                        f'Thank you.'
                    ),
                    from_email=None,
                    recipient_list=[request.user.email],
                    fail_silently=True,
                )
            except Exception:
                pass

            return Response(
                {'message': 'Application submitted. Please wait for admin approval.'}, status=201
            )
        return Response(serializer.errors, status=400)


class MyApplicationView(APIView):
    """GET /api/orphans/my-application/ -- the guardian checks their own application status."""

    permission_classes = [IsAuthenticated, IsOrphan]

    def get(self, request):
        application = Orphan.objects.filter(guardian=request.user).order_by('-submitted_at').first()
        if not application:
            return Response({'message': 'No application submitted yet.'}, status=404)
        serializer = MyApplicationSerializer(application, context={'request': request})
        return Response(serializer.data)


class OrphanListView(APIView):
    """GET /api/orphans/ -- shows the list of approved orphans (for donors to browse)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        orphans = Orphan.objects.filter(application_status='Approved')
        serializer = OrphanListSerializer(orphans, many=True, context={'request': request})
        return Response(serializer.data)


class MyStudentsView(APIView):
    """
    GET /api/orphans/my-students/ -- for School accounts only.
    Shows only approved orphans currently studying at this school.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'school':
            return Response({'message': 'Only school accounts can view this.'}, status=403)

        orphans = _students_for_school(request.user)
        serializer = OrphanListSerializer(orphans, many=True, context={'request': request})
        return Response(serializer.data)


def _students_for_school(school_user):
    """
    Students enrolled at this school account:
    - Approved
    - Currently studying
    - Linked via School FK, or (legacy) matching school name when FK is not set
    """
    profile = School.objects.filter(user=school_user).first()
    school_names = {
        (school_user.full_name or '').strip().lower(),
    }
    if profile and profile.school_name:
        school_names.add(profile.school_name.strip().lower())
    school_names.discard('')

    name_q = Q()
    for name in school_names:
        name_q |= Q(school_name_text__iexact=name)

    return (
        Orphan.objects.filter(
            application_status='Approved',
            is_currently_studying=True,
        )
        .filter(
            Q(school__user=school_user)
            | (Q(school__isnull=True) & name_q)
        )
        .order_by('full_name')
    )


class AdminApplicationsListView(APIView):
    """GET /api/admin/applications/ -- shows every application for the admin table."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        orphans = Orphan.objects.all().order_by('-submitted_at')
        serializer = AdminOrphanSerializer(orphans, many=True)
        return Response(serializer.data)


class AdminOrphanDetailView(APIView):
    """GET /api/admin/orphans/<id>/ -- full application details including uploaded PDF."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, orphan_id):
        try:
            orphan = Orphan.objects.get(id=orphan_id)
        except Orphan.DoesNotExist:
            return Response({'message': 'Orphan application not found.'}, status=404)
        serializer = AdminOrphanDetailSerializer(orphan, context={'request': request})
        return Response(serializer.data)


class AdminApproveOrphanView(APIView):
    """POST /api/admin/orphans/<id>/approve/"""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, orphan_id):
        try:
            orphan = Orphan.objects.get(id=orphan_id)
        except Orphan.DoesNotExist:
            return Response({'message': 'Orphan application not found.'}, status=404)

        school_id = request.data.get('school_id')
        student_class = (request.data.get('student_class') or '').strip()
        monthly_fee = request.data.get('monthly_fee', 0)

        if not school_id:
            return Response(
                {'message': 'Please select a registered school before approving.'},
                status=400,
            )
        if not student_class:
            return Response(
                {'message': 'Please select or enter the class before approving.'},
                status=400,
            )
        try:
            monthly_fee = float(monthly_fee)
        except ValueError:
            return Response(
                {'message': 'Invalid monthly fee amount.'},
                status=400,
            )

        try:
            # Admin school list may send School.id or the school user's CustomUser.id
            school = (
                School.objects.filter(id=school_id).first()
                or School.objects.filter(user_id=school_id).first()
            )
            if school is None:
                return Response({'message': 'Selected school was not found.'}, status=404)
        except (TypeError, ValueError):
            return Response({'message': 'Invalid school selection.'}, status=400)

        orphan.school = school
        orphan.school_name_text = school.school_name
        orphan.student_class = student_class
        orphan.monthly_fee = monthly_fee
        orphan.is_currently_studying = True
        orphan.application_status = 'Approved'
        orphan.reviewed_by = request.user
        orphan.save()

        try:
            send_mail(
                subject='Your Application Has Been Approved',
                message=(
                    f'Dear {orphan.guardian.full_name},\n\n'
                    f'Good news! The application for {orphan.full_name} has been approved. '
                    f'They have been assigned to {school.school_name}, Class {student_class}. '
                    f'This profile is now visible to donors on our platform.\n\n'
                    f'Thank you for trusting our system.'
                ),
                from_email=None,
                recipient_list=[orphan.guardian.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response(
            {
                'message': (
                    f'{orphan.full_name} has been approved and assigned to '
                    f'{school.school_name} (Class {student_class}).'
                )
            }
        )

class AdminRejectOrphanView(APIView):
    """POST /api/admin/orphans/<id>/reject/"""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, orphan_id):
        try:
            orphan = Orphan.objects.get(id=orphan_id)
        except Orphan.DoesNotExist:
            return Response({'message': 'Orphan application not found.'}, status=404)

        orphan.application_status = 'Rejected'
        orphan.reviewed_by = request.user
        orphan.save()

        send_mail(
            subject='Update on Your Application',
            message=(
                f'Dear {orphan.guardian.full_name},\n\n'
                f'We regret to inform you that the application for {orphan.full_name} '
                f'was not approved at this time. Please contact our NGO administrator '
                f'for more details.\n\n'
                f'Thank you for your understanding.'
            ),
            from_email=None,
            recipient_list=[orphan.guardian.email],
        )

        return Response({'message': f'{orphan.full_name} has been rejected.'})
class AdminDashboardView(APIView):
    """GET /api/admin/dashboard/ -- overview statistics for the admin dashboard."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from django.db.models import Sum
        from donors.models import Donation
        from users.models import CustomUser

        total_orphans = Orphan.objects.count()
        pending_applications = Orphan.objects.filter(application_status='Pending').count()
        total_donations = Donation.objects.aggregate(total=Sum('amount'))['total'] or 0
        # Count actual registered School accounts, not the old unused School model
        partner_schools = CustomUser.objects.filter(role='school').count()

        return Response({
            'totalOrphans': total_orphans,
            'pendingApplications': pending_applications,
            'totalDonations': total_donations,
            'partnerSchools': partner_schools,
        })

class AdminSchoolsListView(APIView):
    """GET /api/admin/schools/ -- shows every registered school account."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from users.models import CustomUser
        from schools.models import School

        schools = CustomUser.objects.filter(role='school').order_by('full_name')
        data = []
        for school_user in schools:
            profile, _ = School.objects.get_or_create(
                user=school_user,
                defaults={
                    'school_name': school_user.full_name,
                    'contact_email': school_user.email,
                    'is_approved': False,
                },
            )
            if profile.school_name != school_user.full_name and school_user.full_name:
                profile.school_name = school_user.full_name
                profile.save(update_fields=['school_name'])

            student_count = Orphan.objects.filter(
                application_status='Approved',
            ).filter(
                Q(school=profile) | Q(school_name_text__iexact=school_user.full_name.strip())
            ).count()

            if profile.is_approved:
                status = 'Approved'
            else:
                status = 'Pending'

            data.append({
                'id': profile.id,
                'name': profile.school_name or school_user.full_name,
                'email': school_user.email,
                'phone': school_user.phone,
                'studentCount': student_count,
                'status': status,
                'is_approved': profile.is_approved,
            })
        return Response(data)


class AdminApproveSchoolView(APIView):
    """POST /api/admin/schools/<id>/approve/"""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, school_id):
        try:
            school = School.objects.get(id=school_id)
        except School.DoesNotExist:
            return Response({'message': 'School not found.'}, status=404)

        school.is_approved = True
        school.save(update_fields=['is_approved'])

        return Response({
            'message': f'{school.school_name} has been approved.'
        })


class AdminRejectSchoolView(APIView):
    """POST /api/admin/schools/<id>/reject/"""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, school_id):
        try:
            school = School.objects.get(id=school_id)
        except School.DoesNotExist:
            return Response({'message': 'School not found.'}, status=404)

        school.is_approved = False
        school.save(update_fields=['is_approved'])

        return Response({
            'message': f'{school.school_name} has been rejected.'
        })

class AdminUpdateFeeView(APIView):
    """POST /api/admin/orphans/<id>/fee/"""
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, orphan_id):
        try:
            orphan = Orphan.objects.get(id=orphan_id)
        except Orphan.DoesNotExist:
            return Response({'message': 'Orphan application not found.'}, status=404)

        monthly_fee = request.data.get('monthly_fee')
        if monthly_fee is None:
            return Response({'message': 'Please provide a monthly fee amount.'}, status=400)

        try:
            monthly_fee = float(monthly_fee)
        except ValueError:
            return Response({'message': 'Invalid monthly fee amount.'}, status=400)

        orphan.monthly_fee = monthly_fee
        orphan.save(update_fields=['monthly_fee'])

        return Response({'message': f'Monthly fee for {orphan.full_name} updated successfully.'})