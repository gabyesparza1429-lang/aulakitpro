# AulaKitPro_Web/usuarios/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    """
    Modelo de Usuario base.
    La información sobre pagos y suscripciones se gestiona en la app 'pagos'.
    """

    # Campo para el límite de uso de IA (ej. audios, exámenes)
    limite_generaciones_ia = models.IntegerField(
        default=10,
        verbose_name='Límite de Generación IA'
    )

    def __str__(self):
        return self.email if self.email else self.username

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
