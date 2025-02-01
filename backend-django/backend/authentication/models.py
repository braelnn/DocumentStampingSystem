from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
import random
from django.contrib.auth import get_user_model


class CustomUser(AbstractUser):
    ACCOUNT_TYPE_CHOICES = [
        ('Individual', 'Individual'),
        ('Company', 'Company'),
    ]
    
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPE_CHOICES, default='Individual')
    company_name = models.CharField(max_length=255, blank=True, null=True)
    company_address = models.TextField(blank=True, null=True)



    is_verified = models.BooleanField(default=False)
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    

    def generate_otp(self):
        """Generate a 6-digit OTP"""
        self.otp_code = str(random.randint(100000, 999999))
        self.save()  


    # Fixing Reverse Accessor Conflict
    groups = models.ManyToManyField(Group, related_name="customuser_groups", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="customuser_permissions", blank=True)

    def __str__(self):
        return self.username
