from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet

router = DefaultRouter()
router.register(r"documents", DocumentViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/documents/all/", DocumentViewSet.as_view({'get': 'get_all_documents'}), name="all-documents"),

]