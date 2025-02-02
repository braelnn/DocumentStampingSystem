from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'name', 'file', 'description', 'stamped', 'stamp', 'serial_number', 'created_at']
        read_only_fields = ['serial_number', 'created_at']
