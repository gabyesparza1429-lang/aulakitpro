# ¿Qué es la Seguridad RLS y Por Qué es Crucial para AvellaSecure?

Este documento explica de forma sencilla uno de los conceptos de seguridad más importantes de Supabase: la **Seguridad a Nivel de Fila** (o RLS, por sus siglas en inglés, Row Level Security).

---

### **Una Analogía Simple: Los Apartados Postales**

Imagina que la base de datos de AvellaSecure es una gran sala de correo con cientos de apartados postales, uno para cada residente.

*   En cada apartado está la información de un residente: su nombre, su número de departamento, sus meses de adeudo, etc.
*   Cada residente tiene una **llave única** que solo abre **su propio apartado postal**.
*   Aunque todos los apartados están en la misma sala, nadie puede ver la información de los demás porque no tienen la llave correcta.

La **Seguridad a Nivel de Fila (RLS)** funciona exactamente como esa llave. Es una regla de seguridad que le dice a la base de datos: "Cuando un usuario intente ver información, muéstrale únicamente las filas (los apartados postales) que le pertenecen".

---

### **¿Por Qué es tan Importante para AvellaSecure?**

Sin RLS, cualquier usuario que logre entrar a la aplicación podría, con las herramientas adecuadas, ver la información de **todos** los demás residentes. Esto sería un fallo de seguridad y privacidad muy grave.

RLS nos protege de tres maneras clave:

1.  **Protege la Privacidad del Residente:**
    *   Un residente solo podrá ver su propia información (su `adeudo_meses`, su `depto`, etc.). No podrá ver si sus vecinos deben dinero o no.

2.  **Previene Accesos no Autorizados:**
    *   Evita que un usuario malintencionado pueda leer o modificar datos que no son suyos. Por ejemplo, impide que un residente intente cambiar el `adeudo_meses` de otro departamento a `0`.

3.  **Define Permisos por Roles (`admin`, `guardia`, `condomino`):**
    *   RLS nos permite crear reglas diferentes para cada tipo de usuario:
        *   **Un `condomino`** solo puede ver su propia información.
        *   **Un `guardia`** podría tener permiso para ver la tabla de `eventos` (quién entró y a qué hora), pero no la tabla de `usuarios` para no ver los adeudos.
        *   **Un `admin`** tendría una "llave maestra" para poder ver y gestionar toda la información del sistema.

---

### **En Resumen**

Activar RLS es como construir los muros de seguridad de nuestra base de datos. Aunque es un paso que se configura un poco más adelante en el desarrollo, es la base que garantiza que los datos de AvellaSecure estén siempre seguros y que cada usuario solo pueda acceder a lo que estrictamente le corresponde.

**Es una medida de seguridad no negociable para este proyecto.**