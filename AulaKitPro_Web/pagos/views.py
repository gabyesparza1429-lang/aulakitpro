# AulaKitPro_Web/pagos/views.py

from django.shortcuts import render, redirect
from django.conf import settings
from django.contrib.auth.decorators import login_required
import stripe
#  Imports que se usarán en varias funciones
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.utils import timezone
import json

# Inicializar Stripe con la clave secreta
stripe.api_key = settings.STRIPE_SECRET_KEY

@login_required
def create_checkout_session(request):
    """
    Crea una sesión de Stripe Checkout para la suscripción PRO.
    """
    # -----------------------------------------------------------------
    # CORRECCIÓN DEFINITIVA: Importar el modelo DENTRO de la función
    # Esto evita el error de inicialización en Render.
    from .models import Suscripcion
    # -----------------------------------------------------------------

    user = request.user

    # 1. Obtener o crear el Customer ID en nuestro modelo Suscripcion
    suscripcion, created = Suscripcion.objects.get_or_create(usuario=user)
    customer_id = suscripcion.stripe_customer_id

    try:
        # 2. Crear la sesión de checkout
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            mode='subscription',
            line_items=[
                {
                    'price': settings.STRIPE_PRO_PRICE_ID,
                    'quantity': 1,
                },
            ],
            success_url=request.build_absolute_uri('/pagos/success/'),
            cancel_url=request.build_absolute_uri('/pagos/cancel/'),
            metadata={'user_id': user.id},
            customer_email=user.email if not customer_id else None,
        )

        # 3. Si Stripe crea un nuevo Customer ID, lo almacenamos
        if not customer_id and checkout_session.customer:
            suscripcion.stripe_customer_id = checkout_session.customer
            suscripcion.save()

        # 4. Redirigir al usuario a la página de pago de Stripe
        return redirect(checkout_session.url, code=303)

    except Exception as e:
        messages.error(request, f"Error de pago: {str(e)}")
        return redirect('usuarios:dashboard')

@login_required
def payment_success(request):
    """ Página mostrada después de un pago exitoso. """
    return render(request, 'pagos/success.html')

@login_required
def payment_cancel(request):
    """ Página mostrada si el usuario cancela el checkout. """
    return render(request, 'pagos/cancel.html')

@csrf_exempt
def stripe_webhook(request):
    """
    Escucha los eventos de Stripe (Webhooks) y actualiza el estado de la suscripción.
    """
    # -----------------------------------------------------------------
    # CORRECCIÓN DEFINITIVA: Importar el modelo DENTRO de la función
    from .models import Suscripcion
    # -----------------------------------------------------------------

    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        return HttpResponse(status=400)

    with transaction.atomic():
        if event.type == 'checkout.session.completed':
            session = event.data.object
            user_id = session.metadata.get('user_id')
            if user_id:
                try:
                    suscripcion = Suscripcion.objects.get(usuario__id=user_id)
                    suscripcion.status = 'active'
                    suscripcion.is_pro = True
                    suscripcion.stripe_subscription_id = session.subscription
                    suscripcion.stripe_customer_id = session.customer
                    suscripcion.save()
                except Suscripcion.DoesNotExist:
                    pass

        elif event.type in ['customer.subscription.updated', 'customer.subscription.deleted']:
            subscription = event.data.object
            try:
                suscripcion = Suscripcion.objects.get(stripe_subscription_id=subscription.id)
                new_status = subscription.status
                suscripcion.status = new_status
                suscripcion.is_pro = (new_status == 'active' or new_status == 'trialing')

                if event.type == 'customer.subscription.deleted':
                    suscripcion.is_pro = False
                    suscripcion.status = 'canceled'

                suscripcion.save()
            except Suscripcion.DoesNotExist:
                pass

    return HttpResponse(status=200)
