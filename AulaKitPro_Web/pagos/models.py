# AulaKitPro_Web/pagos/models.py
from django.db import models
from django.conf import settings

class Suscripcion(models.Model):
    """
    Modelo para gestionar el estado de la suscripción de un usuario.
    """
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='suscripcion'
    )
    is_pro = models.BooleanField(
        default=False,
        verbose_name='Estado PRO'
    )
    stripe_customer_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='ID de Cliente en Stripe'
    )
    stripe_subscription_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name='ID de Suscripción en Stripe'
    )

    def __str__(self):
        return f"Suscripción de {self.usuario.username}"

    class Meta:
        verbose_name = "Suscripción"
        verbose_name_plural = "Suscripciones"
