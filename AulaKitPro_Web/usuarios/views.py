from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from .forms import CustomUserCreationForm

# ---------------------------------------------------------
# 1. VISTA DASHBOARD (La que faltaba y daba el error)
# ---------------------------------------------------------
@login_required(login_url='/login/') # Si no está logueado, lo manda al login
def dashboard(request):
    """
    Vista principal de la aplicación.
    """
    return render(request, 'usuarios/dashboard.html')

# ---------------------------------------------------------
# 2. VISTA REGISTRO (La lógica de guardado)
# ---------------------------------------------------------
def registro(request):
    """
    Vista que procesa el formulario de registro y guarda al usuario.
    """
    if request.method == 'POST':
        # Recibir los datos del formulario
        form = CustomUserCreationForm(request.POST)
        
        if form.is_valid():
            # Guardar el usuario
            user = form.save()
            
            # Iniciar sesión automáticamente
            login(request, user)
            
            # Redirigir al dashboard
            return redirect('usuarios:dashboard')
    else:
        # Mostrar formulario vacío
        form = CustomUserCreationForm()

    return render(request, 'usuarios/registro.html', {'form': form})

# ---------------------------------------------------------
# 3. VISTA PRUEBA
# ---------------------------------------------------------
def prueba(request):
    return render(request, 'usuarios/prueba.html')
