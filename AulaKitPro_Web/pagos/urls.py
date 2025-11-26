# AulaKitPro_Web/pagos/urls.py

from django.urls import path
from . import views

# Nombre de la aplicación para referenciar las URLs (ej: pagos:checkout)
app_name = 'pagos'

urlpatterns = [
    # ... otras URLs
    path('checkout/', views.create_checkout_session, name='checkout'),
    # ⬇️ NUEVA URL DEL WEBHOOK (Stripe enviará peticiones a esta ruta)
    path('webhook/', views.stripe_webhook, name='webhook'), 
    # ...
]