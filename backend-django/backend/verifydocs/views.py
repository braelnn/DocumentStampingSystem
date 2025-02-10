import fitz  # PyMuPDF
import io
import re
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from pyzbar.pyzbar import decode
from PIL import Image
from .models import Document

class VerifyDocumentView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file = request.data.get("file", None)

        if not file:
            return Response({"status": "Error", "message": "No file uploaded"}, status=400)

        document = Document.objects.create(file=file)

        try:
            if file.name.endswith(".pdf"):
                result = self.verify_pdf(document.file.path)
            elif file.name.endswith((".png", ".jpg", ".jpeg")):
                result = self.verify_image(document.file.path)
            else:
                result = {"status": "Error", "message": "Unsupported file type"}

            document.verification_status = result["status"]
            document.verification_message = result["message"]
            if result["status"] == "Valid":
                document.qr_code_data = "QR Code Present" if result["details"]["qr_data"] == "Present" else None
                document.verified_at = datetime.now()
            document.save()

            return Response(result, status=200)
        except Exception as e:
            document.verification_status = "Error"
            document.verification_message = str(e)
            document.save()
            return Response({"status": "Error", "message": str(e)}, status=500)

    def verify_pdf(self, file_path):
        try:
            doc = fitz.open(file_path)
            qr_code_found = False
            serial_number = None

            # Scan all pages for QR codes and Serial Number
            for page_num in range(len(doc)):
                page = doc[page_num]
                images = page.get_images(full=True)

                # Extract QR codes from images
                for img in images:
                    xref = img[0]
                    base_image = doc.extract_image(xref)
                    img_bytes = base_image["image"]
                    img_pil = Image.open(io.BytesIO(img_bytes))

                    decoded_objects = decode(img_pil)
                    if decoded_objects:
                        qr_code_found = True  # Mark QR code as found
                        break  # Stop searching after detecting one QR code

                # Extract text and search for the full Serial Number
                text = page.get_text("text")
                serial_number_match = re.search(r"SN-[A-Za-z0-9\-_]+", text)  # Capture full SN-XXXXX format
                if serial_number_match:
                    serial_number = serial_number_match.group()

            return {
                "status": "Valid" if qr_code_found or serial_number else "Error",
                "message": "Document successfully verified." if qr_code_found or serial_number else "No QR code or serial number found.",
                "details": {
                    "qr_data": "Present" if qr_code_found else "Absent",
                    "serial_number": serial_number if serial_number else "Not found",
                },
            }
        except Exception as e:
            return {"status": "Error", "message": f"An error occurred: {str(e)}"}

    def verify_image(self, file_path):
        try:
            image = Image.open(file_path)
            decoded_objects = decode(image)

            qr_code_found = bool(decoded_objects)  # Check if QR is detected

            return {
                "status": "Valid" if qr_code_found else "Error",
                "message": "Image verified successfully" if qr_code_found else "No QR code found in the image",
                "details": {"qr_data": "Present" if qr_code_found else "Absent"},
            }
        except Exception as e:
            return {"status": "Error", "message": f"An error occurred: {str(e)}"}
