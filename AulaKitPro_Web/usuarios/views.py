from django.shortcuts import render, redirect # Necesitas 'redirect' por si la usas
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login # Necesario para iniciar sesión después del registro


# 1. Vista de Dashboard (protegida y principal)
@login_required(login_url='/login/')
def dashboard(request):
    """
    Vista principal de la aplicación.
    """
    # El objeto 'user' tiene todos tus campos personalizados
    return render(request, 'usuarios/dashboard.html')


# 2. Vista de Registro (Temporalmente solo renderiza la plantilla)
def registro(request):
    """
    Vista que maneja la lógica de registro. Por ahora solo muestra la plantilla.
    """
    # Para la fase de prueba: solo renderizamos el HTML que tienes.
    # En producción, aquí iría la lógica de procesar el formulario.
    return render(request, 'usuarios/registro.html')


# 3. Vista de Prueba (Para confirmar que la ruta funciona)
def prueba(request):
    """
    Vista de prueba (cargada por la ruta /prueba/).
    """
    return render(request, 'usuarios/prueba.html')

# NOTA: La clase CustomUserCreationView y sus imports fueron eliminados
# para asegurar que el comando 'migrate' se ejecute sin fallos.
