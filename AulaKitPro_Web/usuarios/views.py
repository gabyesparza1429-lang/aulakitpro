# AulaKitPro_Web/usuarios/views.py
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from .forms import CustomUserCreationForm
from pagos.models import Suscripcion

@login_required(login_url='/login/')
def dashboard(request):
    try:
        suscripcion = Suscripcion.objects.get(usuario=request.user)
        is_pro = suscripcion.is_pro
    except Suscripcion.DoesNotExist:
        is_pro = False

    context = {
        'is_pro': is_pro,
        'intentos_restantes': request.user.limite_generaciones_ia
    }
    return render(request, 'usuarios/dashboard.html', context)

def registro(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            Suscripcion.objects.create(usuario=user)
            login(request, user)
            return redirect('usuarios:dashboard')
    else:
        form = CustomUserCreationForm()
    return render(request, 'usuarios/registro.html', {'form': form})

def public_home(request):
    if request.user.is_authenticated:
        return redirect('usuarios:dashboard')
    return render(request, 'usuarios/public_home.html')
