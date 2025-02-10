from django.urls import path
from .views import VerifyDocumentView

urlpatterns = [
    path('verify/', VerifyDocumentView.as_view(), name='verify-document'),
]
