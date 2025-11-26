"""
Django settings for AulakitPro project.
"""

import os
from pathlib import Path
import environ # Necesario para leer el .env

# Inicializar django-environ
env = environ.Env()

# Construir la ruta al directorio raíz de tu proyecto (donde está el .env)
# BASE_DIR es la carpeta AulaKitPro_Core, por eso necesitamos 2x parent.
BASE_DIR = Path(__file__).resolve().parent.parent

# CORRECCIÓN PARA RENDER:
# Solo intentamos leer el archivo .env si realmente existe.
# Si no existe (como en Render), usamos las variables de entorno del panel.
env_file = os.path.join(BASE_DIR, '.env')
if os.path.exists(env_file):
    environ.Env.read_env(env_file)

# SECURITY WARNING: keep the secret key used in production secret!
# Lee la clave secreta del .env
SECRET_KEY = env('SECRET_KEY', default='django-insecure-clave-de-emergencia-12345')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool('DEBUG', default=False)


ALLOWED_HOSTS = ['143.198.138.195', 'localhost', '127.0.0.1']


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'usuarios',
    # 'pagos',
    'whitenoise.runserver_nostatic', 
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
        'DIRS': [BASE_DIR / 'templates'],
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

        # Database
# CORRECCIÓN PARA RENDER:
# Si existe la variable DATABASE_URL (Producción), la usamos.
# Si no (durante el Build), usamos una SQLite local para que no falle.
if os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': env.db('DATABASE_URL')
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation
# ... (Deja esta sección intacta)


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


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Configuración de Stripe (usando variables del .env)
STRIPE_SECRET_KEY = env('STRIPE_SECRET_KEY')
STRIPE_PUBLISHABLE_KEY = env('STRIPE_PUBLISHABLE_KEY')

# Configuración de usuario
# settings.py (cerca del final)

AUTH_USER_MODEL = 'usuarios.CustomUser'
LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/'  # <--- CAMBIO AQUÍ

LOGOUT_REDIRECT_URL = '/login/'


