from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser

# ---------------------------------------------------------
# 1. Formulario para la CREACIÓN de usuarios (Registro Público)
# ---------------------------------------------------------
class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        # ✅ CORRECCIÓN FINAL: Solo incluimos los campos que el usuario debe llenar.
        # Los campos de licencia (is_pro, stripe_customer_id, limite_generaciones_ia)
        # se inicializan automáticamente con sus valores por defecto en models.py.
        fields = ('username', 'email', 'first_name', 'last_name') 

    # Función crucial para asegurar que la contraseña se guarde cifrada y no como texto plano
    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get("password")
        if password:
            user.set_password(password)
        if commit:
            user.save()
        return user

# ---------------------------------------------------------
# 2. Formulario para la MODIFICACIÓN de usuarios (Panel Admin)
# ---------------------------------------------------------
class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        # Para el panel de administración (solo para ti), listamos todos los campos.
        fields = ('username', 'email', 'first_name', 'last_name', 'is_active', 
                  'is_staff', 'is_superuser', 'groups', 
                  'is_pro', 'limite_generaciones_ia', 'stripe_customer_id')
