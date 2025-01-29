from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Stamp
from .serializers import StampSerializer
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
import base64  # Import the base64 module

def download_stamp(request, pk):
    """
    View to handle downloading a stamp's preview image.
    """
    stamp = get_object_or_404(Stamp, pk=pk)
    if not stamp.preview:
        return HttpResponse("Stamp preview not available.", status=404)

    # If the preview is stored as Base64, decode it
    if stamp.preview.startswith("data:image"):
        base64_data = stamp.preview.split(",")[1]
        image_data = base64.b64decode(base64_data)
        response = HttpResponse(image_data, content_type="image/png")
        response["Content-Disposition"] = f'attachment; filename="{stamp.name}.png"'
        return response

    # If the preview is stored as an actual file
    file_path = stamp.preview.path  # Assuming the `preview` field is an ImageField
    with open(file_path, "rb") as f:
        response = HttpResponse(f.read(), content_type="image/png")
        response["Content-Disposition"] = f'attachment; filename="{stamp.name}.png"'
        return response

class StampViewSet(viewsets.ModelViewSet):
    queryset = Stamp.objects.all().order_by('-created_at')
    serializer_class = StampSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)