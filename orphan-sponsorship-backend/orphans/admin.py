from django.contrib import admin
from .models import Orphan


@admin.register(Orphan)
class OrphanAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'guardian', 'application_status', 'submitted_at')
    list_filter = ('application_status',)
    search_fields = ('full_name', 'guardian_name')
