"""
Main URL configuration. All API endpoints are grouped under /api/
so they line up with what the React frontend expects
(see src/services/api.js in the frontend project).
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # /api/auth/register/, /api/auth/login/
    path('api/auth/', include('users.urls')),

    # /api/orphans/, /api/orphans/apply/, /api/admin/dashboard/, /api/admin/orphans/<id>/approve|reject/
    path('api/', include('orphans.urls')),

    # /api/donations/, /api/donations/history/
    path('api/', include('donors.urls')),

    # /api/reports/submit/, /api/reports/<orphan_id>/
    path('api/', include('schools.urls')),

    # /api/public/stats/, /api/contact/, /api/feedback/, /api/newsletter/subscribe/
    path('api/', include('sitecontent.urls')),
]

# During development, this lets Django serve uploaded files (documents/photos)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
