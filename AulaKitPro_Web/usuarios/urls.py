from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'usuarios'

urlpatterns = [
    # La ruta raíz (página de inicio) ahora apunta a la vista de registro.
    path('', views.registro, name='registro'),

    # Rutas de Autenticación
    path('login/', auth_views.LoginView.as_view(template_name='usuarios/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),

    # Se mantiene una ruta explícita /registro/ por si se usa en algún enlace.
    # Se le cambia el nombre para evitar conflictos con la nueva ruta raíz.
    path('registro/', views.registro, name='registro_explicit'),

    # Ruta al Dashboard para usuarios ya autenticados.
    path('dashboard/', views.dashboard, name='dashboard'),

    # Ruta de Prueba (se mantiene como estaba).
    path('prueba/', views.prueba, name='prueba'),

    # Nueva ruta para el Generador de Contenido IA
    path('generador-contenido/', views.generador_contenido, name='generador_contenido'),
]
