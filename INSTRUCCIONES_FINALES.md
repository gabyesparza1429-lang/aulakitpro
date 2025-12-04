# Instrucciones Finales para Desplegar AulaKitPro en Render

Hola! Lamento mucho todos los problemas que hemos tenido. Esta guía final te llevará paso a paso para desplegar tu aplicación correctamente. No hay más cambios de código, solo seguir estos pasos en la página de Render.

---

### **Resumen del Plan:**

Vamos a crear dos cosas en Render (ambas gratuitas):
1.  Una **Base de Datos** (PostgreSQL) para guardar tus usuarios, cursos, etc.
2.  Un **Servicio Web** (Web Service) que es tu aplicación Django.

Luego, le diremos a tu aplicación cómo conectarse a la base de datos.

---

### **Paso 1: Crear la Base de Datos en Render**

1.  Ve a tu panel de control de Render: `https://dashboard.render.com/`
2.  Haz clic en el botón azul **"New +"**.
3.  En el menú, selecciona **"PostgreSQL"**.
4.  Se abrirá un formulario. Rellénalo así:
    *   **Name**: `aulakitpro-db` (o el nombre que prefieras)
    *   **Database**: `aulakitpro_db` (puedes dejar el que viene por defecto)
    *   **User**: `aulakitpro_user` (puedes dejar el que viene por defecto)
    *   **Region**: `Oregon (US West)`
    *   **PostgreSQL Version**: La que aparezca por defecto (ej: `15`)
    *   **Instance Type**: `Free`
5.  Haz clic en el botón **"Create Database"** al final.

La base de datos tardará unos minutos en crearse. Cuando veas que su estado es **"Available"**, puedes continuar.

---

### **Paso 2: Copiar la Dirección Interna de la Base de Datos**

1.  En la página de tu base de datos (`aulakitpro-db`) en Render, busca la sección **"Connections"**.
2.  Encontrarás una dirección llamada **"Internal Database URL"**.
3.  Haz clic en el botón de copiar que está al lado. ¡Guarda esta URL en un bloc de notas! La necesitaremos en el siguiente paso.

![Donde encontrar la URL Interna](https://i.imgur.com/gG4Qc7h.png)

---

### **Paso 3: Crear el Servicio Web (Tu Aplicación)**

1.  Vuelve al panel principal de Render (`https://dashboard.render.com/`).
2.  Haz clic de nuevo en **"New +"**.
3.  Esta vez, selecciona **"Web Service"**.
4.  Conecta tu repositorio de GitHub (`aulakitpro/AulaKitPro`) si te lo pide.
5.  Rellena el formulario de configuración con estos datos **EXACTOS**:
    *   **Name**: `AulaKitPro`
    *   **Region**: `Oregon (US West)`
    *   **Branch**: `main`
    *   **Root Directory**: `AulaKitPro_Web`
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn AulaKitPro_Core.wsgi:application`
    *   **Instance Type**: `Free`

6.  **¡Paso Clave!** Sigue bajando hasta la sección **"Advanced"** o **"Environment Variables"**.
7.  Haz clic en **"Add Environment Variable"**.
    *   En el campo `Key`, escribe: `DATABASE_URL`
    *   En el campo `Value`, **pega la "Internal Database URL"** que copiaste en el Paso 2.
8.  Haz clic de nuevo en **"Add Environment Variable"**.
    *   En el campo `Key`, escribe: `SECRET_KEY`
    *   En el campo `Value`, haz clic en el botoncito que dice **"Generate"** para que Render cree una clave segura.
9.  Haz clic de nuevo en **"Add Environment Variable"**.
    *   En el campo `Key`, escribe: `PYTHON_VERSION`
    *   En el campo `Value`, escribe: `3.11.6`

10. Al final de todo, haz clic en el botón **"Create Web Service"**.

---

### **¿Qué Sucederá Ahora?**

Render empezará a construir tu aplicación. Verás un registro (log) en la pantalla. Este proceso puede tardar varios minutos.

Si todo sale bien, el estado del despliegue cambiará a **"Live"**. En ese momento, Render te dará una URL pública (`https://aulakitpro.onrender.com`) donde podrás ver tu proyecto funcionando.

Si aparece algún error, por favor, copia las últimas líneas del registro y envíamelas.

**¡Mucha suerte! Este es el método estándar y probado.**
