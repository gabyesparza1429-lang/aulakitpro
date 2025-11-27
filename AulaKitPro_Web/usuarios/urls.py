from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'usuarios'

urlpatterns = [
    # Ruta raíz ahora apunta a 'panel'
    path('', views.panel, name='home'), 
    
    path('login/', auth_views.LoginView.as_view(template_name='usuarios/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('registro/', views.registro, name='registro'), 

    # Ruta Dashboard ahora apunta a la vista 'panel' (pero la url sigue siendo /dashboard/)
    path('dashboard/', views.panel, name='panel'), # <--- CAMBIO AQUÍ (name='panel' y views.panel)

    path('prueba/', views.prueba, name='prueba'), 
]
