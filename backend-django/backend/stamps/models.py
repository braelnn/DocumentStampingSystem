from django.db import models

class Stamp(models.Model):
    name = models.CharField(max_length=100)
    shape = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=20, blank=True, null=True)
    preview = models.TextField(blank=True, null=True)  # Base64-encoded image data

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
