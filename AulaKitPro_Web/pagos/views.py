# AulaKitPro_Web/pagos/views.py
from django.shortcuts import render, redirect, reverse
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from .models import Suscripcion
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY

@login_required
def checkout(request):
    try:
        suscripcion = Suscripcion.objects.get(usuario=request.user)
    except Suscripcion.DoesNotExist:
        # Esto no debería pasar si el registro funciona bien, pero es un buen fallback
        return redirect('usuarios:dashboard')

    # URL a la que el cliente será redirigido
    YOUR_DOMAIN = request.build_absolute_uri('/')[:-1]

    checkout_session = stripe.checkout.Session.create(
        customer_email=request.user.email,
        payment_method_types=['card'],
        line_items=[
            {
                'price': 'price_1PJRpL0876AP43Smc8bOTa9q', # REEMPLAZA CON TU PRICE ID DE STRIPE
                'quantity': 1,
            },
        ],
        mode='subscription',
        success_url=YOUR_DOMAIN + reverse('pagos:success'),
        cancel_url=YOUR_DOMAIN + reverse('pagos:cancel'),
        metadata={
            "user_id": request.user.id
        }
    )
    return redirect(checkout_session.url)

@login_required
def success(request):
    return render(request, 'pagos/success.html')

@login_required
def cancel(request):
    return render(request, 'pagos/cancel.html')

@csrf_exempt
def webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    event = None
    endpoint_secret = 'whsec_...' # REEMPLAZA CON TU WEBHOOK SIGNING SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)

    # Manejar el evento de checkout completado
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session['metadata']['user_id']

        try:
            suscripcion = Suscripcion.objects.get(usuario_id=user_id)
            suscripcion.is_pro = True
            suscripcion.stripe_customer_id = session.customer
            suscripcion.stripe_subscription_id = session.subscription
            suscripcion.save()
        except Suscripcion.DoesNotExist:
            return HttpResponse(status=404)

    # Manejar otros eventos si es necesario (ej. cancelación de suscripción)

    return HttpResponse(status=200)
