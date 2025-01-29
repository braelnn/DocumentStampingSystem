from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StampViewSet, download_stamp


router = DefaultRouter()
router.register(r'stamps', StampViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/stamps/<int:pk>/download/', download_stamp, name='download_stamp'),

]
