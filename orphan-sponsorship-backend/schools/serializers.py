from rest_framework import serializers
from .models import AcademicRecord


class AcademicRecordSerializer(serializers.ModelSerializer):
    """Used when a school submits a new monthly report for a student."""

    orphan_id = serializers.IntegerField(source='orphan.id', read_only=True)

    class Meta:
        model = AcademicRecord
        fields = [
            'id', 'orphan', 'orphan_id', 'report_month', 'total_school_days',
            'days_present', 'average_marks', 'teacher_comments', 'report_card',
            'submitted_at',
        ]
        read_only_fields = ['id', 'submitted_at']

    def create(self, validated_data):
        request = self.context['request']
        validated_data['submitted_by'] = request.user
        return super().create(validated_data)

class AcademicRecordReadSerializer(serializers.ModelSerializer):
    """Used when showing a student's report history to donors/admin."""

    attendance = serializers.ReadOnlyField(source='attendance_percentage')
    report_card = serializers.SerializerMethodField()

    class Meta:
        model = AcademicRecord
        fields = [
            'id', 'report_month', 'total_school_days', 'days_present',
            'attendance', 'average_marks', 'teacher_comments', 'submitted_at',
            'report_card',
        ]

    def get_report_card(self, obj):
        if not obj.report_card:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.report_card.url)
        return obj.report_card.url
