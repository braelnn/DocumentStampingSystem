import os  
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
import traceback
from django.core.mail import EmailMessage
from django.conf import settings



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

    @action(detail=True, methods=["POST"], url_path="share")
    def share_document(self, request, pk=None):
        """
        Share the stamped document via email.
        """
        document = get_object_or_404(Document, pk=pk)
        recipient_email = request.data.get("email")

        if not recipient_email:
            return Response({"error": "Recipient email is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure the document is a stamped PDF
        if not document.file.name.endswith(".pdf"):
            return Response({"error": "Only stamped PDF documents can be shared."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure file exists before attempting to attach it
        if not document.file or not os.path.exists(document.file.path):
            error_msg = f"Document file not found at: {document.file.path}"
            logger.error(error_msg)  # Log error
            return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)

        try:
            email_subject = "Shared Final Document"
            email_body = "The attachd document below is either stamped, has a QrCode or Serial Number. Chec it out!!!"

            email = EmailMessage(
                email_subject,
                email_body,
                settings.DEFAULT_FROM_EMAIL,
                [recipient_email],
            )

            logger.info(f"Attaching file: {document.file.path}")  # Debugging log

            email.attach_file(document.file.path)
            email.send()

            logger.info("Email sent successfully!")
            return Response({"message": "Document sent successfully."}, status=status.HTTP_200_OK)

        except Exception as e:
            error_message = f"Failed to send email: {str(e)}\n{traceback.format_exc()}"
            logger.error(error_message)  # Log full error
            return Response({"error": error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=["GET"], url_path="all")
    def get_all_documents(self, request):
        """
        Fetch all documents and categorize them as stamped or unstamped.
        """
        try:
            stamped_docs = Document.objects.filter(stamped=True)
            unstamped_docs = Document.objects.filter(stamped=False)

            stamped_serializer = DocumentSerializer(stamped_docs, many=True)
            unstamped_serializer = DocumentSerializer(unstamped_docs, many=True)

            return Response(
                {
                    "stamped_documents": stamped_serializer.data,
                    "unstamped_documents": unstamped_serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"error": f"Error retrieving documents: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )