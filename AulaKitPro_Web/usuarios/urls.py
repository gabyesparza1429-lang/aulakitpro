from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'usuarios'

urlpatterns = [
    # 1. Ruta Home (usa dashboard)
    path('', views.dashboard, name='home'),

    # 2. Rutas de Auth
    path('login/', auth_views.LoginView.as_view(template_name='usuarios/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),

    # 3. Ruta Registro
    path('registro/', views.registro, name='registro'),

    # 4. Ruta Dashboard
    path('dashboard/', views.dashboard, name='dashboard'),

    # 5. Ruta Prueba
    path('prueba/', views.prueba, name='prueba'),
]
