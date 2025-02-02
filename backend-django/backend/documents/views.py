import os  # Import 'os' to fix the error
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer
import mimetypes
from django.core.files.base import ContentFile
from django.http import FileResponse
import logging

logger = logging.getLogger(__name__)


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet to handle Document CRUD, stamping, and file download.
    """
    queryset = Document.objects.all().order_by("-created_at")
    serializer_class = DocumentSerializer

    def create(self, request, *args, **kwargs):
        """
        Handles document upload.
        """
        try:
            file = request.FILES.get("file")
            if not file:
                return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

            if not file.name.lower().endswith(".pdf"):
                return Response({"error": "Only PDF files are allowed."}, status=status.HTTP_400_BAD_REQUEST)

            name = request.data.get("name", "").strip()
            if not name:
                return Response({"error": "Document name is required."}, status=status.HTTP_400_BAD_REQUEST)

            description = request.data.get("description", "").strip()

            document = Document.objects.create(
                name=name,
                description=description,
                file=file
            )
            serializer = self.get_serializer(document)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": f"Failed to upload document: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    

    @action(detail=True, methods=["PUT"], url_path="save-stamped")
    def save_stamped(self, request, pk=None):
        """
        Handles saving a stamped PDF document.
        """
        document = get_object_or_404(Document, pk=pk)

        stamped_file = request.FILES.get("file")
        if not stamped_file:
            return Response({"error": "Stamped file is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not stamped_file.name.lower().endswith(".pdf"):
            return Response({"error": "Only PDF files are allowed."}, status=status.HTTP_400_BAD_REQUEST)

        document.file.save(f"stamped_{document.name}.pdf", ContentFile(stamped_file.read()), save=True)
        document.stamped = True
        document.save()

        return Response({"message": "Stamped PDF saved successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["GET"], url_path="download")
    def download(self, request, pk=None):
        document = get_object_or_404(Document, pk=pk)
        file_path = document.file.path

        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return Response({"error": "File not found."}, status=404)

        logger.info(f"Serving file: {file_path}")
        return FileResponse(
            open(file_path, "rb"),
            as_attachment=True,
            filename=os.path.basename(file_path),
            content_type="application/pdf"
            )
    @action(detail=True, methods=["GET"], url_path="get-serial-number")
    def get_serial_number(self, request, pk=None):
        """
        Returns the serial number for a document.
        """
        document = self.get_object()
        return Response({"serial_number": document.serial_number}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["PUT"], url_path="regenerate-serial-number")
    def regenerate_serial_number(self, request, pk=None):
        """
        Regenerates the serial number for a document (if required).
        """
        document = self.get_object()
        document.serial_number = f"SN-{uuid.uuid4().hex[:12].upper()}"
        document.save()
        return Response({"serial_number": document.serial_number}, status=status.HTTP_200_OK)