# AulaKitPro_Web/pagos/urls.py

from django.urls import path
from . import views

# Nombre de la aplicación para referenciar las URLs (ej: pagos:checkout)
app_name = 'pagos'

urlpatterns = [
    path('checkout/', views.create_checkout_session, name='checkout'),
    path('success/', views.payment_success, name='success'),
    path('cancel/', views.payment_cancel, name='cancel'),
    path('webhook/', views.stripe_webhook, name='webhook'),
]
