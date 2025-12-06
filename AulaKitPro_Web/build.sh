#!/usr/bin/env bash
# exit on error
set -o errexit

# Instalar las dependencias de Python
pip install -r requirements.txt

# Recolectar todos los archivos estáticos (CSS, JS, imágenes)
# Esta línea es la que soluciona el problema del logo y los estilos.
python manage.py collectstatic --no-input

# Aplicar las migraciones de la base de datos
python manage.py migrate
