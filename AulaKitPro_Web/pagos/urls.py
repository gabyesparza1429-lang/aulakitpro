# AulaKitPro_Web/pagos/urls.py
from django.urls import path
from . import views

app_name = 'pagos'

urlpatterns = [
    path('checkout/', views.checkout, name='checkout'),
    path('success/', views.success, name='success'),
    path('cancel/', views.cancel, name='cancel'),
    path('webhook/', views.webhook, name='webhook'),
]
