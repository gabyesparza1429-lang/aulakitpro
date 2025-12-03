# AulaKitPro_Web/AulaKitPro_Core/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Ruta de Administración de Django
    path('admin/', admin.site.urls),

    # CORRECCIÓN CLAVE: La raíz (path='') apunta al app usuarios
    # Si estaba así: path('usuarios/', include('usuarios.urls')), el servidor buscaba
    # en 143.198.138.195/usuarios/
    path('', include('usuarios.urls')),

    path('pagos/', include('pagos.urls')),
]

# Configuración para servir archivos estáticos/media en entorno de desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # Si tienes archivos de medios (imágenes subidas)

    # urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
