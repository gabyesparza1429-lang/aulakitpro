# AulaKitPro_Web/usuarios/forms.py

from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    """
    Formulario para crear nuevos usuarios.
    Hereda los campos base de Django (username, password, etc.)
    y los adapta a nuestro CustomUser.
    """
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        # Campos que se mostrarán en el formulario de registro.
        # Quitamos los campos que ya no existen en el modelo.
        fields = ('username', 'email')

class CustomUserChangeForm(UserChangeForm):
    """
    Formulario para actualizar usuarios existentes desde el panel de admin.
    """
    class Meta:
        model = CustomUser
        # Campos que se podrán editar en el admin.
        # Quitamos los campos que ya no existen en el modelo.
        fields = ('username', 'email', 'limite_generaciones_ia')
