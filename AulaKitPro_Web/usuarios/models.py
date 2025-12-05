# AulaKitPro_Web/usuarios/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """
    Modelo de usuario personalizado.
    La lógica de suscripción (is_pro, stripe_customer_id) se ha movido
    al modelo 'Suscripcion' en la app 'pagos' para evitar dependencias circulares.
    """
    limite_generaciones_ia = models.IntegerField(
        default=10,
        verbose_name='Límite de Generaciones IA'
    )

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = "Usuario Personalizado"
        verbose_name_plural = "Usuarios Personalizados"
