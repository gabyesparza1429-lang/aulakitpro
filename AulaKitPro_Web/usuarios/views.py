from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from .forms import CustomUserCreationForm

# ---------------------------------------------------------
# 1. VISTA DASHBOARD (Esta es la que el error dice que falta)
# ---------------------------------------------------------
@login_required(login_url='/login/') 
def dashboard(request):
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
            return redirect('usuarios:dashboard')
    else:
        form = CustomUserCreationForm()
    return render(request, 'usuarios/registro.html', {'form': form})

# ---------------------------------------------------------
# 3. VISTA PRUEBA
# ---------------------------------------------------------
def prueba(request):
    return render(request, 'usuarios/prueba.html')
