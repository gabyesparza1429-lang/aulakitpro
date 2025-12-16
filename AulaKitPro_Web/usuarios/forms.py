from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm, AuthenticationForm
from .models import CustomUser

# -----------------------------------------------------------------------------
# Definición centralizada de los atributos de estilo para los campos del formulario
# -----------------------------------------------------------------------------
# Usamos un diccionario para no repetir las mismas clases en cada campo.
# Esto hace que si queremos cambiar el estilo, solo lo cambiamos en un lugar.
form_field_attrs = {
    'class': 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
}

# ---------------------------------------------------------
# 1. Formulario para la AUTENTICACIÓN de usuarios (Login)
# ---------------------------------------------------------
class CustomAuthenticationForm(AuthenticationForm):
    """
    Formulario de login personalizado para aplicar estilos de Tailwind CSS.
    """
    username = forms.CharField(
        label="Nombre de usuario",
        widget=forms.TextInput(attrs=form_field_attrs)
    )
    password = forms.CharField(
        label="Contraseña",
        widget=forms.PasswordInput(attrs=form_field_attrs)
    )

# ---------------------------------------------------------
# 2. Formulario para la CREACIÓN de usuarios (Registro Público)
# ---------------------------------------------------------
class CustomUserCreationForm(UserCreationForm):
    """
    Formulario de registro personalizado con estilos y campos adicionales.
    """
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Aplicamos los estilos a todos los campos del formulario dinámicamente.
        for field_name, field in self.fields.items():
            # La contraseña necesita un tratamiento especial para el campo de confirmación
            if field_name == 'password2':
                 self.fields['password2'].label = "Confirmar contraseña"

            field.widget.attrs.update(form_field_attrs)

    def save(self, commit=True):
        user = super().save(commit=False)
        # Aquí no necesitamos manejar la contraseña porque UserCreationForm ya lo hace
        # de forma segura.
        if commit:
            user.save()
        return user


# ---------------------------------------------------------
# 3. Formulario para la MODIFICACIÓN de usuarios (Panel Admin)
# ---------------------------------------------------------
class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name', 'is_active',
                  'is_staff', 'is_superuser', 'groups',
                  'is_pro', 'limite_generaciones_ia', 'stripe_customer_id')
