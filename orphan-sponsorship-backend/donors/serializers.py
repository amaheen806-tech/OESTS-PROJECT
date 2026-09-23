from rest_framework import serializers
from .models import Donation


class DonationCreateSerializer(serializers.ModelSerializer):
    """Used when a donor makes a new donation."""

    class Meta:
        model = Donation
        fields = ['id', 'orphan', 'amount', 'receipt_number', 'donated_at']
        read_only_fields = ['id', 'receipt_number', 'donated_at']

    def validate_amount(self, value):
        # This matches the "zero amount donation should show an error" test case
        if value <= 0:
            raise serializers.ValidationError('Donation amount must be greater than zero.')
        return value

    def create(self, validated_data):
        request = self.context['request']
        validated_data['donor'] = request.user
        return super().create(validated_data)


class DonationHistorySerializer(serializers.ModelSerializer):
    """Used to show a donor's past donations."""

    child = serializers.CharField(source='orphan.full_name')
    orphan_id = serializers.IntegerField(source='orphan.id')

    class Meta:
        model = Donation
        fields = ['id', 'child', 'orphan_id', 'amount', 'receipt_number', 'donated_at']
class AdminDonationSerializer(serializers.ModelSerializer):
    """Used on the Admin Dashboard to show every donation with donor and child names."""

    donor_name = serializers.CharField(source='donor.full_name')
    donor_email = serializers.CharField(source='donor.email')
    child_name = serializers.CharField(source='orphan.full_name')

    class Meta:
        model = Donation
        fields = ['id', 'donor_name', 'donor_email', 'child_name', 'amount', 'receipt_number', 'donated_at']