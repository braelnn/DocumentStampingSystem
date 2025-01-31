from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    fieldsets = UserAdmin.fieldsets + (
        ('Account Type & Company Details', {'fields': ('account_type', 'company_name', 'company_address')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Account Type & Company Details', {'fields': ('account_type', 'company_name', 'company_address')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)

