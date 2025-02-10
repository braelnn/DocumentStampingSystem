from django.contrib import admin
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "file", "uploaded_at", "verification_status", "verified_at")
    list_filter = ("verification_status", "uploaded_at", "verified_at")
    search_fields = ("file", "qr_code_data")
