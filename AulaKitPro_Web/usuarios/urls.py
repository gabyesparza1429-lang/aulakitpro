# AulaKitPro_Web/usuarios/urls.py

from django.urls import path
from django.contrib.auth import views as auth_views 
from . import views 

app_name = 'usuarios'

urlpatterns = [
    # RUTA RAÍZ (Funciona como tu home, redirige automáticamente a /login/)
    path('', views.dashboard, name='home'), 
    
    # Login: 
    path('login/', auth_views.LoginView.as_view(template_name='usuarios/login.html'), name='login'),
    
    # Logout
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    
   # Registro
path('registro/', CustomUserCreationView.as_view(), name='registro'),

    # RUTA DEL DASHBOARD PROTEGIDO (Mantenemos esta ruta específica)
    path('dashboard/', views.dashboard, name='dashboard'), 

    # Prueba
    path('prueba/', views.prueba, name='prueba'), 
]