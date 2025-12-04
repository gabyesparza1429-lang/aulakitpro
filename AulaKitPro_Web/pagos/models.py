# AulaKitPro_Web/pagos/models.py

from django.db import models
from django.conf import settings

class Suscripcion(models.Model):
    """
    Fuente única de verdad sobre el estado de la suscripción de un usuario.
    """
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='suscripcion'
    )

    stripe_customer_id = models.CharField(max_length=50, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, default='free')

    # Este campo es el que realmente determina si el usuario tiene acceso PRO.
    is_pro = models.BooleanField(default=False)

    end_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Suscripción de {self.usuario.username} - Estado: {self.status}"
