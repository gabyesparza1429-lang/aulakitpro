# Contenido para AulaKitPro_Web/AulaKitPro_Core/settings.py

import os
from pathlib import Path
import environ
import dj_database_url

# Inicializar django-environ para leer variables de entorno
env = environ.Env(
    # Define el tipo de dato y valor por defecto
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
DEBUG = env.bool('DEBUG', default=False)

# Hosts permitidos. Render necesita su propio host aquí.
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])
RENDER_EXTERNAL_HOSTNAME = env('RENDER_EXTERNAL_HOSTNAME', default=None)
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# --- APLICACIONES INSTALADAS (Método Explícito y Correcto) ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    # Mis Apps (Usando la configuración explícita)
    'usuarios.apps.UsuariosConfig',
    'pagos.apps.PagosConfig',
]

# --- MIDDLEWARE ---
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

# --- PLANTILLAS (TEMPLATES) ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
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

# --- BASE DE DATOS ---
DATABASES = {
    'default': env.db('DATABASE_URL', default=f'sqlite:///{os.path.join(BASE_DIR, "db.sqlite3")}')
}
DATABASES['default']['CONN_MAX_AGE'] = env.int('CONN_MAX_AGE', default=600)

# --- VALIDACIÓN DE CONTRASEÑAS ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- INTERNACIONALIZACIÓN ---
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# --- ARCHIVOS ESTÁTICOS (CSS, JAVASCRIPT) ---
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# --- CONFIGURACIÓN GENERAL ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- STRIPE ---
STRIPE_SECRET_KEY = env('STRIPE_SECRET_KEY', default='')
STRIPE_PUBLISHABLE_KEY = env('STRIPE_PUBLISHABLE_KEY', default='')

# --- AUTENTICACIÓN DE USUARIOS ---
AUTH_USER_MODEL = 'usuarios.CustomUser'
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'dashboard'
LOGOUT_REDIRECT_URL = 'login'
