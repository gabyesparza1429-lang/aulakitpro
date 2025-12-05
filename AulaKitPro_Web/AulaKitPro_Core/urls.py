# AulaKitPro_Core/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Ruta de Administración de Django
    path('admin/', admin.site.urls),

    # URLs de la aplicación 'usuarios' (login, registro, etc.)
    path('', include('usuarios.urls')),

    # URLs de la aplicación 'pagos'
    path('pagos/', include('pagos.urls')),
]

# Configuración para servir archivos estáticos y de media en entorno de DESARROLLO (DEBUG=True)
if settings.DEBUG:
    # Servir archivos estáticos (CSS, JS)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Si planeas tener archivos de media subidos por usuarios (imágenes, documentos)
    # y quieres servirlos en desarrollo:
    # urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
