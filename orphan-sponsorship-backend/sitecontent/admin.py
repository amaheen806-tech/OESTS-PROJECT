from django.contrib import admin
from .models import ContactMessage, FeedbackEntry, NewsletterSubscriber

admin.site.register(ContactMessage)
admin.site.register(FeedbackEntry)
admin.site.register(NewsletterSubscriber)
