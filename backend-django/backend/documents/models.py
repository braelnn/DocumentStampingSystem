from django.db import models
from stamps.models import Stamp  # Import the Stamp model


class Document(models.Model):
    name = models.CharField(max_length=200)
    file = models.FileField(upload_to="documents/")
    description = models.TextField(null=True, blank=True)
    stamped = models.BooleanField(default=False)
    stamp = models.ForeignKey(Stamp, on_delete=models.SET_NULL, null=True, blank=True, related_name="documents")  # Add relationship to Stamp

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
