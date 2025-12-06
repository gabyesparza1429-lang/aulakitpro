# Contenido para AulaKitPro_Web/usuarios/urls.py

from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

# Define el espacio de nombres para las URLs de esta app.
# Esto permite usar {% url 'usuarios:login' %} en las plantillas.
app_name = 'usuarios'

urlpatterns = [
    # --- Flujo Público ---
    # La raíz del sitio ('/') ahora muestra la página principal pública.
    path('', views.public_home, name='public_home'),
    
    # --- Flujo de Autenticación ---
    # Rutas para iniciar sesión, cerrar sesión y registrarse.
    path('login/', auth_views.LoginView.as_view(template_name='usuarios/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='usuarios:public_home'), name='logout'),
    path('registro/', views.registro, name='registro'),

    # --- Flujo Privado (para usuarios logueados) ---
    # El dashboard es la página principal para usuarios autenticados.
    path('dashboard/', views.dashboard, name='dashboard'),
]
