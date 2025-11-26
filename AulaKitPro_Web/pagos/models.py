# AulaKitPro_Web/pagos/models.py

from django.db import models
from django.conf import settings # Para referenciar el AUTH_USER_MODEL

class Suscripcion(models.Model):
    """
    Modelo que rastrea el estado de la suscripción de cada usuario
    e incluye la información de Stripe.
    """
    # Relación uno a uno con el usuario
    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='suscripcion'
    )
    
    # ID del cliente generado por Stripe (necesario para gestionar la suscripción)
    stripe_customer_id = models.CharField(max_length=50, blank=True, null=True)
    
    # ID de la suscripción activa en Stripe (si existe)
    stripe_subscription_id = models.CharField(max_length=50, blank=True, null=True)
    
    # Estado actual de la suscripción (ej: 'active', 'trialing', 'canceled')
    status = models.CharField(max_length=20, default='free') 
    
    # Campo booleano para el acceso rápido al dashboard
    is_pro = models.BooleanField(default=False)
    
    # Fecha de finalización de la suscripción (usada para cuentas que no son recurrentes)
    end_date = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Suscripción de {self.usuario.username} - Estado: {self.status}"