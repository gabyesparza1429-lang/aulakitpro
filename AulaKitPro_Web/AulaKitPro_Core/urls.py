# AulaKitPro_Web/AulaKitPro_Core/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Ruta de Administración de Django
    path('admin/', admin.site.urls),

    # URLs de la app de usuarios
    path('', include('usuarios.urls')),

    # URLs de la app de pagos
    path('pagos/', include('pagos.urls')),
]

# Configuración para servir archivos estáticos en entorno de desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
