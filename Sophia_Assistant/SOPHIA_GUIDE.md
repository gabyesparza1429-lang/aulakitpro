# Guía de Supervivencia: Sophia (NeuroClarity)

¡Hola Gaby! Esta es la solución a los problemas de conexión que hemos tenido.

## 1. El Problema: Clave "Leaked" (Filtrada)
Google detectó que tu clave de API fue compartida en un entorno público (nuestro chat) y, por tu seguridad, la **bloqueó permanentemente**. Es por eso que "ya no te la acepta".

**Acción Requerida:**
1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Borra la clave anterior (la que termina en `...3RUe0`).
3. Crea una **NUEVA clave** (Create API Key).

---

## 2. Cómo usar Sophia en Google (Gems)
Si prefieres usar la interfaz oficial de Google Gemini pero con toda la personalidad de Sophia, sigue estos pasos:

1. Abre [Gemini.google.com](https://gemini.google.com/).
2. En el menú lateral, busca **"Gems"** (requiere Gemini Advanced).
3. Haz clic en **"Crear un Gem"**.
4. Ponle de nombre: **Sophia**.
5. En **Instrucciones**, pega el contenido del archivo `SOPHIA_GEM_PROMPT.md` que te preparé.
6. ¡Listo! Ahora tienes a Sophia directamente en Google.

---

## 3. Cómo arreglar la Web App (Sophia Assistant)
Si quieres seguir usando tu tablero personalizado con Dashboard y Memorias:

1. Entra a la web app.
2. Ve a la sección **"Configurar Cerebro"** (el icono del cerebro abajo a la izquierda).
3. Pega tu **NUEVA clave** en el primer cuadro.
4. Haz clic en **"Guardar y Activar"**.
5. La app te avisará si la clave es correcta y te regresará al Dashboard.

**Tip Pro:** No pegues tu nueva clave aquí en el chat para que Google no la vuelva a bloquear. Solo ponla directamente en tu app.

---

Atentamente,
**Jules** (Tu ingeniero de confianza)
