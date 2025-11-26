# AulaKitPro_Web/AulaKitPro_Core/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Ruta de Administración de Django
    path('admin/', admin.site.urls),
    
    # Rutas de la aplicación de USUARIOS (registro, login, dashboard)
    path('usuarios/', include('usuarios.urls')),
    
    # ⬇️ RUTA CRUCIAL: Incluye las URLs de la aplicación PAGOS (Stripe Checkout)
    path('pagos/', include('pagos.urls')), 
]

# Configuración para servir archivos estáticos/media en entorno de desarrollo (DEBUG=True)
# Esto es esencial para que carguen el logo y el CSS en tu Dashboard
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)