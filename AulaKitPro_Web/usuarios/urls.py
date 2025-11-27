from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'usuarios'

urlpatterns = [
    # Ruta Raíz -> Va al Dashboard
    path('', views.dashboard, name='home'), 
    
    # Login y Logout
    path('login/', auth_views.LoginView.as_view(template_name='usuarios/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    
    # Registro
    path('registro/', views.registro, name='registro'), 

    # Ruta Dashboard -> Busca views.dashboard
    path('dashboard/', views.dashboard, name='dashboard'), 

    # Prueba
    path('prueba/', views.prueba, name='prueba'), 
]
