from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'usuarios'

urlpatterns = [
    # --- RUTA DE EMERGENCIA ---
    # En lugar de 'views.dashboard', usamos 'views.prueba' para que no falle.
    path('', views.prueba, name='home'), 
    
    # Login y Logout (Esto sigue igual)
    path('login/', auth_views.LoginView.as_view(template_name='usuarios/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    
    # Registro
    path('registro/', views.registro, name='registro'), 

    # --- RUTA DE EMERGENCIA 2 ---
    # También apuntamos el dashboard a prueba temporalmente
    path('dashboard/', views.prueba, name='dashboard'), 

    # Prueba
    path('prueba/', views.prueba, name='prueba'), 
]
