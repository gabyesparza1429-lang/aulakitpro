# AulaKitPro_Web/pagos/admin.py
from django.contrib import admin
from .models import Suscripcion

class SuscripcionAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'is_pro', 'stripe_customer_id', 'stripe_subscription_id')
    list_filter = ('is_pro',)
    search_fields = ('usuario__username', 'stripe_customer_id')

admin.site.register(Suscripcion, SuscripcionAdmin)
