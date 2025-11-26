from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser

# 1. Formulario para la CREACIÓN de usuarios (CORRECCIÓN CRÍTICA)
class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        # Lista CORREGIDA: Solo incluimos los campos esenciales (username, email)
        # más tus campos personalizados, eliminando los que causan el conflicto de inicio.
        fields = ('username', 'email', 'is_pro', 'limite_generaciones_ia', 'stripe_customer_id') 

    # Función crucial para cifrar la contraseña
    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get("password")
        if password:
            user.set_password(password)
        if commit:
            user.save()
        return user

# 2. Formulario para la MODIFICACIÓN de usuarios (Editar)
class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        # Para la modificación, la lista extensa es correcta y aceptable:
        fields = ('username', 'email', 'first_name', 'last_name', 'is_active', 
                  'is_staff', 'is_superuser', 'groups', 
                  'is_pro', 'limite_generaciones_ia', 'stripe_customer_id')