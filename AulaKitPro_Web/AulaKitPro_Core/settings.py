"""
Django settings for AulaKitPro project.
Configuración unificada y optimizada para Render.
"""

import os
from pathlib import Path
import environ
import dj_database_url

# Inicializar django-environ
env = environ.Env(
    # Define el tipo de dato y valor por defecto para DEBUG
    DEBUG=(bool, False)
)

# Ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# Lee el archivo .env solo si existe (para desarrollo local)
env_file = os.path.join(BASE_DIR, '.env')
if os.path.exists(env_file):
    environ.Env.read_env(env_file)

# --- CONFIGURACIÓN DE SEGURIDAD ---
SECRET_KEY = env('SECRET_KEY', default='django-insecure-clave-super-secreta-de-emergencia')

# Usamos env.bool() para garantizar que el valor sea un booleano (práctica recomendada)
DEBUG = env('DEBUG')

# Hosts permitidos (Configuración segura para Render/Producción)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])
RENDER_EXTERNAL_HOSTNAME = env('RENDER_EXTERNAL_HOSTNAME', default=None)
if RENDER_EXTERNAL_HOSTNAME:
    # Añade el host de Render automáticamente
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# --- APLICACIONES INSTALADAS ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    # Necesario para el manejo de estáticos en desarrollo por Whitenoise
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    # Mis Apps (Usando la configuración explícita recomendada)
    'usuarios.apps.UsuariosConfig',
    'pagos.apps.PagosConfig',
]

# --- MIDDLEWARE ---
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # Whitenoise debe ir justo después de SecurityMiddleware
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'AulaKitPro_Core.urls'

# --- PLANTILLAS (TEMPLATES) ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            # Se usa os.path.join o Path, ambas válidas, aquí usamos os.path.join
            os.path.join(BASE_DIR, 'templates'),
            os.path.join(BASE_DIR, 'usuarios', 'templates'),
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

# --- BASE DE DATOS (Lógica robusta para Render) ---
# Si existe DATABASE_URL (Producción/Render), la usa. Si no, usa SQLite (Desarrollo).
if 'DATABASE_URL' in os.environ:
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=env.int('CONN_MAX_AGE', default=600)
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# --- VALIDACIÓN DE CONTRASEÑAS ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- INTERNACIONALIZACIÓN ---
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'America/Mexico_City' # Se prefiere una zona horaria específica.
USE_I18N = True
USE_TZ = True

# --- ARCHIVOS ESTÁTICOS (CSS, JAVASCRIPT) ---
STATIC_URL = '/static/'
# Directorio donde se recolectarán los archivos estáticos en producción
STATIC_ROOT = BASE_DIR / 'staticfiles'
# Directorios donde buscar estáticos en desarrollo
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Configuración de almacenamiento (Método moderno para Django 4.2+)
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    # Usa CompressedManifestStaticFilesStorage para Whitenoise en producción
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# --- CONFIGURACIÓN GENERAL ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- STRIPE ---
STRIPE_SECRET_KEY = env('STRIPE_SECRET_KEY', default='')
STRIPE_PUBLISHABLE_KEY = env('STRIPE_PUBLISHABLE_KEY', default='')

# --- AUTENTICACIÓN DE USUARIOS ---
AUTH_USER_MODEL = 'usuarios.CustomUser'
LOGIN_URL = 'login' # Se usa el nombre de la URL, más flexible
LOGIN_REDIRECT_URL = 'dashboard'
LOGOUT_REDIRECT_URL = 'login'
