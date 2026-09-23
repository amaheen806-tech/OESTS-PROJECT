from django.contrib import admin
from .models import School, AcademicRecord


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('school_name', 'location', 'is_approved')


@admin.register(AcademicRecord)
class AcademicRecordAdmin(admin.ModelAdmin):
    list_display = ('orphan', 'report_month', 'attendance_percentage', 'average_marks')
