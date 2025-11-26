# AulaKitPro_Web/usuarios/views.py

from django.shortcuts import render
from django.views.generic.edit import CreateView
from django.urls import reverse_lazy
from django.http import HttpResponse # Mantener la importación de HttpResponse si aún usas la vista 'prueba'

from .forms import CustomUserCreationForm # Importamos nuestro formulario personalizado

# Vista de prueba simple (puedes mantenerla para verificar la ruta)
def prueba(request):
    """Devuelve un mensaje simple para verificar que la ruta funciona."""
    return HttpResponse("<h1>¡Ruta de Usuarios Funcionando!</h1><p>Esta es la prueba de la app 'usuarios'.</p>")

# Vista para manejar el Registro de Usuarios
class CustomUserCreationView(CreateView):
    # Especifica el formulario que debe usar (nuestro CustomUserCreationForm)
    form_class = CustomUserCreationForm
    
    # Especifica la plantilla HTML para el registro (la crearemos luego)
    template_name = 'usuarios/registro.html'
    
    # URL a la que redirigir al usuario después de un registro exitoso
    # 'login' es el 'name' de la ruta de login que definimos en urls.py
    success_url = reverse_lazy('usuarios:login') 

# NOTA: Ahora la vista CustomUserCreationView ya existe y se enlaza con urls.py.
# AulaKitPro_Web/usuarios/views.py (Fragmento, añadir al final)

from django.contrib.auth.decorators import login_required # Importar el decorador

# ... (código existente: CustomUserCreationView y prueba)
# AulaKitPro_Web/usuarios/views.py (Fragmento)

from django.shortcuts import render
from django.contrib.auth.decorators import login_required # ⬅️ Importa el decorador

# ... (código existente: CustomUserCreationView y prueba)

@login_required # Esto protege la vista. Si no hay login, te envía a LOGIN_URL
def dashboard(request):
    """
    Vista principal del dashboard (página protegida).
    """
    context = {
        'user': request.user,
    }
    return render(request, 'usuarios/dashboard.html', context)