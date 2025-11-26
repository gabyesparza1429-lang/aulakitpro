# AulaKitPro_Web/usuarios/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    # Formulario para crear usuarios (usado al añadir un nuevo usuario)
    add_form = CustomUserCreationForm
    # Formulario para editar usuarios (usado al editar un usuario existente)
    form = CustomUserChangeForm
    # Modelo al que se aplica esta configuración
    model = CustomUser
    
    # Define qué campos se muestran en la lista de usuarios
    list_display = ['username', 'email', 'is_pro', 'is_staff']
    
    # Define cómo se agrupan y ordenan los campos en la vista de edición
    fieldsets = UserAdmin.fieldsets + (
        ('Información de Licencia y Pago', {'fields': ('is_pro', 'limite_generaciones_ia', 'stripe_customer_id')}),
    )
    
    # Define los campos que se muestran en el formulario de creación de usuario
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('is_pro', 'limite_generaciones_ia', 'stripe_customer_id', 'email')}),
    )

# Registra tu modelo de usuario con tu configuración de administración personalizada
admin.site.register(CustomUser, CustomUserAdmin)