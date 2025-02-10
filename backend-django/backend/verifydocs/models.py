from django.db import models

class Document(models.Model):
    file = models.FileField(upload_to="documents/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    verification_status = models.CharField(max_length=20, blank=True, null=True)
    verification_message = models.TextField(blank=True, null=True)
    qr_code_data = models.TextField(blank=True, null=True)
    serial_number = models.CharField(max_length=50, blank=True, null=True)
    stamp_owner = models.CharField(max_length=100, blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.file.name
