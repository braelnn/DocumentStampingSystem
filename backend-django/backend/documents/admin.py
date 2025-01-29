from django.contrib import admin
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "stamped", "created_at")
    list_filter = ("stamped", "created_at")
    search_fields = ("name", "description")
