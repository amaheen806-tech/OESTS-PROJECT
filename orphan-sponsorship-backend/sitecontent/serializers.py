from rest_framework import serializers
from .models import ContactMessage, FeedbackEntry, NewsletterSubscriber


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']


class FeedbackEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackEntry
        fields = ['id', 'name', 'email', 'comments', 'status', 'reviewed_at', 'created_at']
        read_only_fields = ['id', 'status', 'reviewed_at', 'created_at']
        extra_kwargs = {
            'name': {'required': False, 'allow_blank': True},
            'email': {'required': True},
        }


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']
