from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from .forms import CustomUserCreationForm, CustomUserChangeForm 

class CustomUserAdmin(UserAdmin):
    # Conexión directa a los formularios corregidos
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    
    # Campos que se muestran en la lista de usuarios
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_pro', 'limite_generaciones_ia')
    
    list_filter = ('is_pro', 'is_staff', 'is_superuser', 'is_active', 'groups')
    
    # Campos al MODIFICAR
    fieldsets = UserAdmin.fieldsets + (
        ('Información de Licencia y Pago', {'fields': ('is_pro', 'limite_generaciones_ia', 'stripe_customer_id')}),
    )
    
    # IMPORTANTE: add_fieldsets ha sido eliminado

# Registra tu modelo de usuario con tu configuración de administración personalizada
admin.site.register(CustomUser, CustomUserAdmin)