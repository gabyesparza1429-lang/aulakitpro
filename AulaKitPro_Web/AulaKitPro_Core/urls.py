from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('usuarios.urls')),  # Rutas de la app usuarios (login, registro, etc.)
    path('pagos/', include('pagos.urls')), # Rutas de la app de pagos
]

# Esto es para servir archivos estáticos (CSS, JS) en modo de desarrollo.
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
