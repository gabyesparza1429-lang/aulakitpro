# Diseño de Pantallas para AvellaSecure

Este documento describe la estructura y los componentes de las pantallas mínimas necesarias para la aplicación web de AvellaSecure. El diseño se enfoca en la simplicidad y la facilidad de uso.

---

### **Pantalla 1: Login (Inicio de Sesión)**

Esta es la primera pantalla que verá cualquier usuario. Su único objetivo es permitir que el usuario ingrese su correo para recibir el "Magic Link".

**Componentes:**

1.  **Título Principal:** Un texto grande y claro, por ejemplo: **"Bienvenido a AvellaSecure"**.
2.  **Subtítulo / Instrucción:** Un texto breve que le indica al usuario qué hacer. Por ejemplo: **"Ingresa tu correo para recibir tu enlace de acceso."**
3.  **Campo de Correo Electrónico:**
    *   Un cuadro de texto donde el usuario escribirá su dirección de correo.
    *   Debe tener un texto de ejemplo dentro (placeholder) que diga: `tu.correo@ejemplo.com`.
4.  **Botón de Envío:**
    *   Un botón grande y visible con el texto: **"Enviar Enlace de Acceso"**.
    *   Al hacer clic, se debe mostrar un mensaje de carga o una animación breve mientras el sistema envía el correo.

---

### **Pantalla 2: Confirmación de Envío**

Esta pantalla aparece inmediatamente después de que el usuario presiona el botón "Enviar Enlace de Acceso". Su propósito es confirmar que la acción fue exitosa y darle al usuario la siguiente instrucción.

**Componentes:**

1.  **Icono de Éxito:** Un ícono grande y amigable, como una marca de verificación (✓) o un sobre de correo (✉️).
2.  **Título de Confirmación:** Un texto claro como: **"¡Listo! Revisa tu correo"**.
3.  **Instrucción Adicional:** Un párrafo breve explicando qué hacer a continuación. Por ejemplo: **"Te hemos enviado un enlace mágico a tu correo. Ábrelo para iniciar sesión. Si no lo ves, no olvides revisar tu carpeta de spam."**
4.  **Mensaje de Cierre:** Algo como "Este enlace será válido por 15 minutos."

---

### **Pantalla 3: Principal (Panel de Control de Accesos)**

Esta es la pantalla principal de la aplicación una vez que el usuario ha iniciado sesión. Aquí es donde podrá interactuar con los accesos del condominio. El contenido de esta pantalla cambiará según el estado de la cuenta del usuario (sus meses de adeudo).

**Componentes:**

1.  **Saludo al Usuario:** Un texto de bienvenida en la parte superior. Por ejemplo: **"Hola, [Nombre del Usuario]"** o **"Departamento [Número de Depto]"**.
2.  **Sección de Accesos:** Una lista de botones grandes y claros para cada zona a la que el usuario tiene permitido el acceso.

**Lógica de Visualización de Botones (Reglas de Negocio):**

*   **Caso 1: Sin adeudos (`adeudo_meses = 0`)**
    *   **Botón "Portón Vehicular":** Grande, color verde. Texto: "Abrir Portón (Automático)".
    *   **Botón "Puerta Peatonal":** Grande, color azul. Texto: "Abrir Puerta Peatonal".
    *   **Botón "Puerta de Basura":** Grande, color gris. Texto: "Abrir Puerta de Basura".

*   **Caso 2: 1 mes de adeudo (`adeudo_meses = 1`)**
    *   **Botón "Portón Vehicular":** El botón se muestra, pero cambia su texto y función. Texto: "Solicitar Apertura Manual". (Este botón notificaría al guardia).
    *   **Botón "Puerta Peatonal":** Se muestra normalmente.
    *   **Botón "Puerta de Basura":** Se muestra normally.

*   **Caso 3: 2 o más meses de adeudo (`adeudo_meses >= 2`)**
    *   **Botón "Portón Vehicular":** Igual que en el caso 2. Texto: "Solicitar Apertura Manual".
    *   **Botón "Puerta Peatonal":** **Siempre se muestra**. La seguridad de los residentes es prioritaria.
    *   **Botón "Puerta de Basura":** **Este botón no aparece**. El acceso está bloqueado.

3.  **Botón de Salir (Logout):**
    *   Un enlace o botón pequeño, usualmente en la esquina superior derecha, para "Cerrar Sesión".