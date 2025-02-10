from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('authentication.urls')),
    path('stamps/', include('stamps.urls')),
    path('documents/', include('documents.urls')),
    path('verifydoc/', include('verifydocs.urls')),  # Include the API app's URLs

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

    



