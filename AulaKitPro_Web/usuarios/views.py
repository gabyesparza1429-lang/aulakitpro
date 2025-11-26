# usuarios/views.py (CÓDIGO FINAL LIMPIO Y CON CLASE DE REGISTRO)

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.generic.edit import CreateView # <--- NECESARIO
from django.urls import reverse_lazy # <--- NECESARIO

from .forms import CustomUserCreationForm # <--- NECESARIO

# 1. Vista de Dashboard (protegida)
@login_required(login_url='/login/')
def dashboard(request):
    """
    Vista principal de la aplicación.
    """
    return render(request, 'usuarios/dashboard.html')

# 2. Vista de Registro (Clase de Django)
class CustomUserCreationView(CreateView):
    form_class = CustomUserCreationForm
    template_name = 'usuarios/registro.html'
    success_url = reverse_lazy('usuarios:login') 

# 3. Vista de Prueba (Función simple para la ruta /prueba/)
def prueba(request):
    """
    Vista de prueba (cargada por la ruta /prueba/).
    """
    return render(request, 'usuarios/prueba.html')