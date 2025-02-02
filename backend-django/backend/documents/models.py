from django.db import models
from stamps.models import Stamp  # Import the Stamp model
import uuid



class Document(models.Model):
    name = models.CharField(max_length=200)
    file = models.FileField(upload_to="documents/")
    description = models.TextField(null=True, blank=True)
    stamped = models.BooleanField(default=False)
    stamp = models.ForeignKey(Stamp, on_delete=models.SET_NULL, null=True, blank=True, related_name="documents")  # Add relationship to Stamp

    created_at = models.DateTimeField(auto_now_add=True)
    serial_number = models.CharField(max_length=50, unique=True, editable=False, blank=True)

    def save(self, *args, **kwargs):
        # Generate a unique serial number if not already set
        if not self.serial_number:
            self.serial_number = f"SN-{uuid.uuid4().hex[:12].upper()}"  # e.g., SN-4F3A1B2C3D4E
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.serial_number})"


