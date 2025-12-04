"""
Django settings for AulakitPro project.
Versión Final Corregida para Render.
"""

import os
from pathlib import Path
import environ
import dj_database_url # <--- 🚨 CORRECCIÓN 1: Importación necesaria para el bloque de base de datos.

# Inicializar django-environ
env = environ.Env()

# Construir la ruta al directorio raíz
BASE_DIR = Path(__file__).resolve().parent.parent

# CORRECCIÓN PARA RENDER: Solo lee el .env si existe (para local)
env_file = os.path.join(BASE_DIR, '.env')
if os.path.exists(env_file):
    environ.Env.read_env(env_file)

# --- SEGURIDAD ---
SECRET_KEY = env('SECRET_KEY', default='django-insecure-clave-de-emergencia-12345')

# En producción, DEBUG debe ser False.
DEBUG = env.bool('DEBUG', default=False)


# 🚨 CORRECCIÓN 2: Permite que Render acceda.
ALLOWED_HOSTS = ['*']


# Application definition
# AulaKitPro_Web/AulaKitPro_Core/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Tus apps:
    'usuarios',
    # 🟢 DESCOMENTADA: Django necesita leer esta aplicación.
    'pagos', 
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'AulaKitPro_Core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
            BASE_DIR / 'usuarios' / 'templates',
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
WSGI_APPLICATION = 'AulaKitPro_Core.wsgi.application'

# --- BASE DE DATOS (ESTO YA NO DEBE FALLAR) ---
# Usa la DB de Render (Postgres) o SQLite temporal para el build.
if 'DATABASE_URL' in os.environ:
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation (Deja esta sección intacta)
AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]


# Internationalization
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'America/Mexico_City'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# --- STRIPE Y OTROS ---
STRIPE_SECRET_KEY = env('STRIPE_SECRET_KEY', default='sk_test_dummy_clave_temporal')
STRIPE_PUBLISHABLE_KEY = env('STRIPE_PUBLISHABLE_KEY', default='pk_test_dummy_clave_temporal')

# Configuración de usuario
AUTH_USER_MODEL = 'usuarios.CustomUser'
LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/login/'










