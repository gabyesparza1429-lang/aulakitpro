# AulaKitPro_Web/usuarios/urls.py

from django.urls import path
from django.contrib.auth import views as auth_views 
from . import views 
from .views import CustomUserCreationView 

app_name = 'usuarios'

urlpatterns = [
    # -----------------------------------------------------------
    # Login: CORRECCIÓN: Apunta a la plantilla correcta: 'usuarios/login.html'
    path('login/', auth_views.LoginView.as_view(template_name='usuarios/login.html'), name='login'),
    
    # Logout
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    
    # Registro
    path('registro/', CustomUserCreationView.as_view(), name='registro'),

    # RUTA DEL DASHBOARD PROTEGIDO
    path('dashboard/', views.dashboard, name='dashboard'), # (Asumiendo que views.dashboard ya existe)

    # Prueba
    path('prueba/', views.prueba, name='prueba'), 
]