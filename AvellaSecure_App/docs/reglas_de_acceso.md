# Reglas de Acceso y Lógica de Negocio para AvellaSecure

Este documento detalla las reglas que el sistema AvellaSecure debe seguir para permitir o restringir el acceso a las diferentes zonas del condominio. La lógica se basa en el valor del campo `adeudo_meses` de la tabla `usuarios`.

---

### **Objetivo de las Reglas**

El objetivo es automatizar el control de accesos de una manera justa y segura, asegurando que los residentes que están al corriente con sus pagos tengan todos los beneficios, mientras que se aplican restricciones progresivas a quienes tienen adeudos. La seguridad, como el acceso peatonal, es siempre una prioridad.

---

### **Lógica Condicional (Si... Entonces...)**

El sistema deberá comprobar el valor de `adeudo_meses` para cada usuario en el momento en que este intente acceder a una zona y mostrará las opciones en la aplicación según las siguientes condiciones:

#### **Condición 1: Residente al Corriente**
*   **Si `adeudo_meses` es igual a `0`:**
    *   **Acceso Vehicular:** **PERMITIDO y AUTOMÁTICO.** El usuario puede abrir el portón directamente desde la app.
    *   **Acceso Peatonal:** **PERMITIDO.**
    *   **Acceso a Basura:** **PERMITIDO.**
    *   **Dispositivos Permitidos:** Hasta **4** dispositivos pueden tener la sesión activa simultáneamente.

#### **Condición 2: Residente con 1 Mes de Adeudo**
*   **Si `adeudo_meses` es igual a `1`:**
    *   **Acceso Vehicular:** **NO AUTOMÁTICO.** El botón en la app cambia a "Solicitar Apertura Manual". Esto enviaría una notificación al guardia para que abra el portón. El residente no puede abrirlo directamente.
    *   **Acceso Peatonal:** **PERMITIDO.**
    *   **Acceso a Basura:** **PERMITIDO.**
    *   **Dispositivos Permitidos:** Se restringe a **1** solo dispositivo.

#### **Condición 3: Residente con 2 o más Meses de Adeudo**
*   **Si `adeudo_meses` es mayor o igual a `2`:**
    *   **Acceso Vehicular:** **NO AUTOMÁTICO.** Misma restricción que con 1 mes de adeudo.
    *   **Acceso Peatonal:** **SIEMPRE PERMITIDO.** Por razones de seguridad, un residente nunca debe quedar fuera del condominio. El acceso peatonal no se puede restringir.
    *   **Acceso a Basura:** **BLOQUEADO.** El botón para esta zona no debe aparecer en la aplicación.
    *   **Dispositivos Permitidos:** Se mantiene la restricción de **1** solo dispositivo.

---

### **Registro de Eventos**

**MUY IMPORTANTE:** Independientemente del resultado (permitido, bloqueado o manual), **TODO** intento de acceso debe ser registrado en la tabla `eventos` de la base de datos. Esto es crucial para la auditoría y la seguridad del sistema. El registro debe incluir:
*   ID del usuario.
*   La zona a la que se intentó acceder.
*   El resultado (`permitido`, `bloqueado`).
*   El motivo (`sin adeudo`, `adeudo_bloquea_basura`, etc.).
*   La fecha y hora del evento.