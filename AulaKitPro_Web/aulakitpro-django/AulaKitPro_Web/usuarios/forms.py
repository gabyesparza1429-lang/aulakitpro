# AulaKitPro_Web/usuarios/forms.py

from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser

# Formulario de creación de usuario (usado en el registro)
class CustomUserCreationForm(UserCreationForm):

    class Meta:
        # Aquí especificamos que el formulario debe usar nuestro modelo CustomUser
        model = CustomUser
        fields = UserCreationForm.Meta.fields + ('email',) # Incluimos el correo electrónico

# Formulario de cambio de usuario (usado en el Admin, si es necesario)
class CustomUserChangeForm(UserChangeForm):

    class Meta:
        model = CustomUser
        fields = UserChangeForm.Meta.fields