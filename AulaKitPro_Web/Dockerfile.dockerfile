# Usar una imagen oficial de Python ligera
FROM python:3.11-slim

# Evitar que Python escriba archivos .pyc y permitir logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Crear carpeta de trabajo dentro del servidor
WORKDIR /app

# Instalar dependencias del sistema necesarias para PostgreSQL
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar el archivo de requerimientos e instalar librerías
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copiar todo el código del proyecto
COPY . /app/

# Comando para iniciar el servidor (usando tu configuración)
CMD ["gunicorn", "AulaKitPro_Core.wsgi:application", "--bind", "0.0.0.0:8000"]