from django.contrib import admin
from .models import Stamp

@admin.register(Stamp)
class StampAdmin(admin.ModelAdmin):
    list_display = ('name', 'shape', 'color', 'created_at')
    search_fields = ('name', 'shape', 'color')
    list_filter = ('shape', 'color', 'created_at')

    def has_add_permission(self, request):
        # Allow adding new stamps
        return True

    def has_delete_permission(self, request, obj=None):
        # Allow deleting stamps
        return True
