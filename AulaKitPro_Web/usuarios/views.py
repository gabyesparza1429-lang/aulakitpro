from django.shortcuts import render, redirect # Importar redirect para la redirección final
from django.contrib.auth.decorators import login_required
from .forms import CustomUserCreationForm # <--- IMPORTAMOS EL FORMULARIO
from django.contrib.auth import login # Para iniciar sesión después del registro

# ... (código existente: dashboard, prueba) ...


# 2. Vista de Registro (AHORA CON LÓGICA DE PROCESAMIENTO)
def registro(request):
    """
    Vista que procesa el formulario de registro y guarda al usuario.
    """
    if request.method == 'POST':
        # 1. Recibir los datos enviados por el formulario
        form = CustomUserCreationForm(request.POST)

        # 2. Validar que los datos sean correctos (ej: contraseñas iguales, campos llenos)
        if form.is_valid():
            # 3. Guardar el nuevo usuario en la base de datos
            user = form.save()
            
            # 4. Iniciar sesión automáticamente al usuario creado (Opcional)
            login(request, user)
            
            # 5. Redirigir al dashboard (o a donde desees)
            return redirect('usuarios:dashboard') # <--- Cambia a la ruta que uses para el inicio

    else:
        # Si el método es GET (primera vez que se carga la página), muestra el formulario vacío
        form = CustomUserCreationForm()

    # Renderiza la plantilla, pasando el formulario a registro.html
    return render(request, 'usuarios/registro.html', {'form': form})
