from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from .forms import CustomUserCreationForm

# ---------------------------------------------------------
# 1. VISTA PANEL (Antes dashboard, renombrada para "despegar" al servidor)
# ---------------------------------------------------------
@login_required(login_url='/login/')
def panel(request): # <--- CAMBIO DE NOMBRE AQUÍ
    """
    Vista principal de la aplicación.
    """
    return render(request, 'usuarios/dashboard.html')

# ---------------------------------------------------------
# 2. VISTA REGISTRO
# ---------------------------------------------------------
def registro(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            # Redirigir al nuevo nombre 'panel'
            return redirect('usuarios:panel') # <--- CAMBIO DE NOMBRE AQUÍ
    else:
        form = CustomUserCreationForm()
    return render(request, 'usuarios/registro.html', {'form': form})

# ---------------------------------------------------------
# 3. VISTA PRUEBA
# ---------------------------------------------------------
def prueba(request):
    return render(request, 'usuarios/prueba.html')
