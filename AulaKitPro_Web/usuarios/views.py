from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from .forms import CustomUserCreationForm

# ---------------------------------------------------------
# 1. VISTA DASHBOARD (El nombre ESTÁNDAR)
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

# ---------------------------------------------------------
# 4. VISTA GENERADOR DE CONTENIDO IA
# ---------------------------------------------------------
@login_required(login_url='/login/')
def generador_contenido(request):
    """
    Página para el generador de contenido IA.
    Maneja tanto la visualización del formulario (GET) como el procesamiento de datos (POST).
    """
    generated_content = ""
    if request.method == 'POST':
        user_prompt = request.POST.get('user_prompt', '')

        # Aquí iría la lógica para llamar a la IA.
        # Por ahora, simplemente simularemos una respuesta.
        generated_content = f"Contenido generado basado en la siguiente instrucción: '{user_prompt}'"

    return render(request, 'usuarios/generador_contenido.html', {
        'generated_content': generated_content
    })
