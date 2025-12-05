# AulaKitPro_Web/usuarios/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    """
    Configuración para mostrar y editar el CustomUser en el panel de admin.
    """
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser

    # Campos que se mostrarán en la lista de usuarios
    # Eliminamos 'is_pro' porque ya no existe aquí.
    list_display = [
        'email',
        'username',
        'limite_generaciones_ia',
        'is_staff',
        'is_active',
    ]

    # Filtros que aparecerán en la barra lateral
    # Eliminamos 'is_pro'.
    list_filter = ('is_staff', 'is_active')

    # Campos que se podrán buscar
    search_fields = ('email', 'username')

    # Orden por defecto
    ordering = ('email',)

    # Campos que se mostrarán al editar un usuario
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'groups', 'user_permissions')}),
        ('Personal info', {'fields': ('username', 'limite_generaciones_ia')}),
    )

# Registrar el modelo CustomUser con la configuración personalizada
admin.site.register(CustomUser, CustomUserAdmin)
