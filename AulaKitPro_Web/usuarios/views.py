# AulaKitPro_Web/usuarios/views.py

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from .forms import CustomUserCreationForm
# Importamos el modelo Suscripcion para poder consultarlo
from pagos.models import Suscripcion

# ---------------------------------------------------------
# 1. VISTA DASHBOARD (Corregida)
# ---------------------------------------------------------
@login_required(login_url='/login/')
def dashboard(request): 
    """
    Vista principal que ahora comprueba el estado PRO desde el modelo Suscripcion.
    """
    try:
        # Buscamos la suscripción del usuario.
        suscripcion = Suscripcion.objects.get(usuario=request.user)
        is_pro = suscripcion.is_pro
    except Suscripcion.DoesNotExist:
        # Si no tiene un objeto de suscripción, no es PRO.
        is_pro = False

    context = {
        'is_pro': is_pro,
        'intentos_restantes': request.user.limite_generaciones_ia
    }
    return render(request, 'usuarios/dashboard.html', context)

# ---------------------------------------------------------
# 2. VISTA REGISTRO
# ---------------------------------------------------------
def registro(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Creamos un objeto de suscripción por defecto para el nuevo usuario
            Suscripcion.objects.create(usuario=user)
            login(request, user)
            return redirect('usuarios:dashboard')
    else:
        form = CustomUserCreationForm()
    return render(request, 'usuarios/registro.html', {'form': form})

# ---------------------------------------------------------
# 3. VISTA PRUEBA
# ---------------------------------------------------------
def prueba(request):
    return render(request, 'usuarios/prueba.html')

# ---------------------------------------------------------
# 4. VISTA PÁGINA DE INICIO PÚBLICA (NUEVA)
# ---------------------------------------------------------
def public_home(request):
    """
    Renderiza la página de inicio pública.
    Si el usuario ya está autenticado, lo redirige al dashboard.
    """
    if request.user.is_authenticated:
        return redirect('usuarios:dashboard')
    return render(request, 'usuarios/public_home.html')
