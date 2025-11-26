# AulaKitPro_Web/pagos/views.py

from django.shortcuts import render, redirect
from django.conf import settings
from django.contrib.auth.decorators import login_required
import stripe 
from .models import Suscripcion 
from django.contrib import messages # Para mostrar mensajes de error al usuario

# Inicializar Stripe con la clave secreta
stripe.api_key = settings.STRIPE_SECRET_KEY

@login_required
def create_checkout_session(request):
    """
    Crea una sesión de Stripe Checkout para la suscripción PRO.
    """
    user = request.user
    
    # 1. Obtener o crear el Customer ID en nuestro modelo Suscripcion
    suscripcion, created = Suscripcion.objects.get_or_create(usuario=user)
    customer_id = suscripcion.stripe_customer_id
    
    try:
        # 2. Crear la sesión de checkout
        checkout_session = stripe.checkout.Session.create(
            # Si ya tenemos un ID de cliente de Stripe, lo usamos
            customer=customer_id, 
            mode='subscription', 
            line_items=[
                {
                    # Usa el ID del PRECIO que configuramos en settings.py
                    'price': settings.STRIPE_PRO_PRICE_ID, 
                    'quantity': 1,
                },
            ],
            # Las URLs de éxito y cancelación usan el dominio de tu servidor
            success_url=request.build_absolute_uri('/pagos/success/'),
            cancel_url=request.build_absolute_uri('/pagos/cancel/'),
            
            # Pasamos el ID del usuario como metadato
            metadata={
                'user_id': user.id,
            },
            # Solo enviamos el email si Stripe no tiene aún un customer_id
            customer_email=user.email if not customer_id else None,
        )
        
        # 3. Si Stripe crea un nuevo Customer ID (y no estaba guardado), lo almacenamos
        if not customer_id and checkout_session.customer:
            suscripcion.stripe_customer_id = checkout_session.customer
            suscripcion.save()
        
        # 4. Redirigir al usuario a la página de pago de Stripe
        return redirect(checkout_session.url, code=303)
        
    except stripe.error.StripeError as e:
        # ERROR DE STRIPE: Imprimir en consola y mostrar un mensaje al usuario
        print(f"ERROR DE STRIPE: {e}")
        messages.error(request, f"Error de pago: {e.user_message or 'Verifica las claves de Stripe o el ID de precio en settings.py.'}")
        # REDIRIGIMOS AL DASHBOARD EN CASO DE FALLO
        return redirect('usuarios:dashboard')
        
    except Exception as e:
        # OTRO ERROR: Imprimir en consola y mostrar un mensaje genérico
        print(f"Error inesperado al crear la sesión de checkout: {e}")
        messages.error(request, "Error interno al iniciar el pago.")
        # REDIRIGIMOS AL DASHBOARD EN CASO DE FALLO
        return redirect('usuarios:dashboard')


@login_required
def payment_success(request):
    """ Página mostrada después de un pago exitoso. """
    return render(request, 'pagos/success.html')

@login_required
def payment_cancel(request):
    """ Página mostrada si el usuario cancela el checkout. """
    return render(request, 'pagos/cancel.html')
# AulaKitPro_Web/pagos/views.py (Al final del archivo)

from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
import json
# (Asegúrate de que 'import stripe' ya esté al inicio del archivo)

# ⚠️ La firma de esta función es especial: no requiere login y no necesita CSRF
@csrf_exempt 
def stripe_webhook(request):
    """
    Escucha los eventos de Stripe (Webhooks) y actualiza el estado de la suscripción.
    """
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    event = None

    try:
        # ⚠️ Nota: Necesitas el Webhook Secret Key (STRIPE_WEBHOOK_SECRET) aquí
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Payload inválido
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        # Firma inválida
        return HttpResponse(status=400)

    # Procesar el evento
    # Usamos transaction.atomic para asegurar que las operaciones en DB sean seguras
    with transaction.atomic():
        
        # 1. Evento de Checkout (Primer pago o primer intento fallido)
        if event.type == 'checkout.session.completed':
            session = event.data.object
            user_id = session.metadata.get('user_id')
            
            if user_id:
                try:
                    suscripcion = Suscripcion.objects.get(usuario__id=user_id)
                    
                    # El usuario pagó. Se le asigna el estado 'active' y PRO.
                    suscripcion.status = 'active'
                    suscripcion.is_pro = True
                    suscripcion.stripe_subscription_id = session.subscription
                    suscripcion.stripe_customer_id = session.customer 
                    suscripcion.save()
                    
                    # LOGGING: Puedes agregar aquí un log o email
                    print(f"✅ SUSCRIPCION ACTIVADA: Usuario {user_id} ahora es PRO.")
                except Suscripcion.DoesNotExist:
                    print(f"❌ Error: Suscripción no encontrada para el usuario {user_id}")
                    # En un entorno real, aquí crearías la suscripción.
            
        # 2. Evento de Suscripción Creada/Actualizada (Cambios de plan o renovación)
        elif event.type == 'customer.subscription.updated':
            subscription = event.data.object
            
            try:
                # Buscamos la suscripción por el ID que Stripe maneja
                suscripcion = Suscripcion.objects.get(stripe_subscription_id=subscription.id)
                
                # Actualizar el estado y el acceso PRO
                suscripcion.status = subscription.status
                suscripcion.is_pro = (subscription.status == 'active' or subscription.status == 'trialing')
                
                # Si se cancela, guardamos la fecha de fin
                if subscription.cancel_at_period_end:
                    suscripcion.end_date = timezone.datetime.fromtimestamp(subscription.current_period_end)
                else:
                    suscripcion.end_date = None # Se reactivó
                
                suscripcion.save()
                
                print(f"🔄 SUSCRIPCION ACTUALIZADA: Usuario {suscripcion.usuario.id} a estado {subscription.status}")

            except Suscripcion.DoesNotExist:
                print(f"❌ Error: Webhook recibió evento de suscripción no registrada en DB: {subscription.id}")

        # 3. Evento de Suscripción Cancelada (Fin del periodo pagado)
        elif event.type == 'customer.subscription.deleted':
            subscription = event.data.object
            
            try:
                suscripcion = Suscripcion.objects.get(stripe_subscription_id=subscription.id)
                suscripcion.status = 'canceled'
                suscripcion.is_pro = False
                suscripcion.end_date = timezone.now()
                suscripcion.save()
                print(f"🚫 SUSCRIPCION ELIMINADA: Usuario {suscripcion.usuario.id} canceló.")
            except Suscripcion.DoesNotExist:
                pass
            
    # Siempre debemos devolver un 200 (OK) a Stripe
    return HttpResponse(status=200)