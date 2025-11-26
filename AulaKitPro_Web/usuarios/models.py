# AulaKitPro_Web/usuarios/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    # Campo para identificar si el usuario tiene una suscripción Pro/Pago
    is_pro = models.BooleanField(default=False, 
                                 verbose_name='Suscripción Pro')

    # Campo para almacenar el límite de uso de IA (ej. audios, exámenes)
    # Por ejemplo, 10 para la versión gratuita, o Ilimitado para la versión de pago.
    limite_generaciones_ia = models.IntegerField(default=10, 
                                                 verbose_name='Límite de Generación IA')

    # Campo para el ID de cliente de la pasarela de pago (Stripe/PayPal)
    stripe_customer_id = models.CharField(max_length=50, blank=True, null=True)

    # Añade cualquier otro campo que necesites, como por ejemplo:
    # fecha_vencimiento_pro = models.DateField(blank=True, null=True)

    def __str__(self):
        # Muestra el correo electrónico si existe, si no, el nombre de usuario
        return self.email if self.email else self.username

    class Meta:
        verbose_name = 'Usuario de AulaKitPro'
        verbose_name_plural = 'Usuarios de AulaKitPro'

# NOTA: No olvides que para que el sistema de Django use este modelo,
# ya añadiste AUTH_USER_MODEL = 'usuarios.CustomUser' en settings.py.