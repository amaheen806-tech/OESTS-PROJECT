from rest_framework import serializers
from .models import Orphan


class OrphanApplicationSerializer(serializers.ModelSerializer):
    """Used when a guardian submits a new orphan application."""

    class Meta:
        model = Orphan
        fields = [
            'id',
            'full_name',
            'date_of_birth',
            'age',
            'gender',
            'guardian_name',
            'guardian_cnic',
            'child_cnic',
            'address',
            'school_name_text',
            'school_phone',
            'student_class',
            'is_currently_studying',
            'death_certificate',
            'b_form_document',
            'photo',
            'application_status',
            'submitted_at',
        ]
        read_only_fields = ['id', 'application_status', 'submitted_at', 'is_currently_studying']
        extra_kwargs = {
            'school_name_text': {'required': False, 'allow_blank': True},
            'school_phone': {'required': False, 'allow_blank': True},
            'student_class': {'required': False, 'allow_blank': True},
            'guardian_cnic': {'required': False, 'allow_blank': True},
            'child_cnic': {'required': False, 'allow_blank': True},
            'age': {'required': False, 'allow_null': True},
            'death_certificate': {'required': False, 'allow_null': True},
            'b_form_document': {'required': False, 'allow_null': True},
            'photo': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        request = self.context['request']
        validated_data['guardian'] = request.user

        school_name = (validated_data.get('school_name_text') or '').strip()
        student_class = (validated_data.get('student_class') or '').strip()
        validated_data['school_name_text'] = school_name
        validated_data['student_class'] = student_class
        validated_data['is_currently_studying'] = bool(school_name and student_class)

        return super().create(validated_data)


class OrphanListSerializer(serializers.ModelSerializer):
    """Used to show a list of approved orphans to donors, with a simple shape."""

    name = serializers.CharField(source='full_name')
    className = serializers.SerializerMethodField()
    school = serializers.SerializerMethodField()
    verified = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    location = serializers.CharField(source='address')
    bio = serializers.SerializerMethodField()

    class Meta:
        model = Orphan
        fields = [
            'id',
            'name',
            'age',
            'className',
            'school',
            'verified',
            'image',
            'location',
            'bio',
            'is_currently_studying',
        ]

    def get_verified(self, obj):
        return obj.application_status == 'Approved'

    def get_age(self, obj):
        if obj.age:
            return obj.age
        from datetime import date
        today = date.today()
        dob = obj.date_of_birth
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

    def get_className(self, obj):
        return obj.student_class or 'Not assigned'

    def get_school(self, obj):
        if obj.school_id and obj.school:
            return obj.school.school_name
        if obj.school_name_text:
            return obj.school_name_text
        return 'Not currently studying'

    def get_image(self, obj):
        if not obj.photo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.photo.url)
        return obj.photo.url

    def get_bio(self, obj):
        if not obj.is_currently_studying and not obj.school_name_text:
            return (
                f"{obj.full_name} is not currently enrolled in a school. "
                f"Sponsorship will help place them into education."
            )
        school = self.get_school(obj)
        class_name = obj.student_class or '—'
        return (
            f"{obj.full_name} is in class {class_name} at {school}. "
            f"Verified sponsorship helps keep their education on track."
        )


class AdminOrphanSerializer(serializers.ModelSerializer):
    """Used on the Admin Dashboard applications table."""

    name = serializers.CharField(source='full_name')
    school = serializers.SerializerMethodField()
    className = serializers.CharField(source='student_class')
    date = serializers.DateTimeField(source='submitted_at', format='%d %b')
    status = serializers.CharField(source='application_status')
    age = serializers.IntegerField()

    class Meta:
        model = Orphan
        fields = [
            'id',
            'name',
            'age',
            'school',
            'className',
            'date',
            'status',
            'is_currently_studying',
        ]

    def get_school(self, obj):
        if obj.school_id and obj.school:
            return obj.school.school_name
        if obj.school_name_text:
            return obj.school_name_text
        return 'Not currently studying'


class AdminOrphanDetailSerializer(serializers.ModelSerializer):
    """Full application details for admin review (including uploaded files)."""

    status = serializers.CharField(source='application_status')
    assigned_school_name = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()
    death_certificate = serializers.SerializerMethodField()
    death_certificate_name = serializers.SerializerMethodField()
    b_form_document = serializers.SerializerMethodField()
    b_form_document_name = serializers.SerializerMethodField()

    class Meta:
        model = Orphan
        fields = [
            'id',
            'full_name',
            'date_of_birth',
            'age',
            'gender',
            'guardian_name',
            'guardian_cnic',
            'child_cnic',
            'address',
            'school_name_text',
            'school_phone',
            'student_class',
            'is_currently_studying',
            'assigned_school_name',
            'photo',
            'death_certificate',
            'death_certificate_name',
            'b_form_document',
            'b_form_document_name',
            'status',
            'submitted_at',
        ]

    def get_assigned_school_name(self, obj):
        if obj.school_id and obj.school:
            return obj.school.school_name
        return obj.school_name_text or None

    def _absolute(self, file_field):
        if not file_field:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(file_field.url)
        return file_field.url

    def get_photo(self, obj):
        return self._absolute(obj.photo)

    def get_death_certificate(self, obj):
        return self._absolute(obj.death_certificate)

    def get_death_certificate_name(self, obj):
        if not obj.death_certificate:
            return None
        return obj.death_certificate.name.split('/')[-1]

    def get_b_form_document(self, obj):
        return self._absolute(obj.b_form_document)

    def get_b_form_document_name(self, obj):
        if not obj.b_form_document:
            return None
        return obj.b_form_document.name.split('/')[-1]

class MyApplicationSerializer(serializers.ModelSerializer):
    """Used so a guardian can view their full submitted application on the dashboard."""

    photo = serializers.SerializerMethodField()
    death_certificate = serializers.SerializerMethodField()
    b_form_document = serializers.SerializerMethodField()
    assigned_school_name = serializers.SerializerMethodField()

    class Meta:
        model = Orphan
        fields = [
            'id',
            'full_name',
            'date_of_birth',
            'age',
            'gender',
            'guardian_name',
            'guardian_cnic',
            'child_cnic',
            'address',
            'school_name_text',
            'school_phone',
            'student_class',
            'is_currently_studying',
            'assigned_school_name',
            'photo',
            'death_certificate',
            'b_form_document',
            'application_status',
            'submitted_at',
        ]

    def get_assigned_school_name(self, obj):
        if obj.school_id and obj.school:
            return obj.school.school_name
        return obj.school_name_text or None

    def get_photo(self, obj):
        if not obj.photo:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.photo.url)
        return obj.photo.url

    def get_death_certificate(self, obj):
        if not obj.death_certificate:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.death_certificate.url)
        return obj.death_certificate.url

    def get_b_form_document(self, obj):
        if not obj.b_form_document:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.b_form_document.url)
        return obj.b_form_document.url
