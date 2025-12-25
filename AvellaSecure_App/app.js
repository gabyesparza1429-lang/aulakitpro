// Importamos la función `createClient` desde la librería de Supabase que se carga a través de una CDN.
// Esto nos permite interactuar con la base de datos de Supabase.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- CONFIGURACIÓN DE SUPABASE ---
// ¡MUY IMPORTANTE! Debes reemplazar estos valores con los de tu propio proyecto de Supabase.
// Los encontrarás en tu panel de Supabase > Project Settings > API.
const SUPABASE_URL = 'TU_SUPABASE_URL'; // Pega aquí tu URL
const SUPABASE_ANON_KEY = 'TU_SUPABASE_ANON_KEY'; // Pega aquí tu "anon key"

// Creamos una instancia del cliente de Supabase.
// Esta variable `supabase` será nuestro punto de acceso para todas las operaciones con la base de datos.
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Cliente de Supabase inicializado.');

// --- LÓGICA DE AUTENTICACIÓN ---

// Obtenemos las referencias a los elementos del HTML con los que vamos a interactuar.
const loginButton = document.getElementById('login-button');
const emailInput = document.getElementById('email-input');
const messageArea = document.getElementById('message-area');

// Añadimos un "escuchador" al botón de login.
// Esto hace que la función se ejecute cada vez que el usuario hace clic en el botón.
loginButton.addEventListener('click', async () => {
    // Obtenemos el correo que el usuario escribió, eliminando espacios en blanco al inicio y al final.
    const email = emailInput.value.trim();

    // Verificamos si el campo de correo está vacío.
    if (!email) {
        messageArea.textContent = 'Por favor, ingresa tu correo electrónico.';
        return; // Detenemos la ejecución si no hay correo.
    }

    // Mostramos un mensaje de "cargando" para que el usuario sepa que algo está pasando.
    messageArea.textContent = 'Enviando enlace de acceso...';
    loginButton.disabled = true; // Desactivamos el botón para evitar múltiples clics.

    try {
        // Usamos el cliente de Supabase para enviar el Magic Link.
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                // Redirigimos al usuario a la misma página después de que haga clic en el enlace.
                emailRedirectTo: window.location.href,
            },
        });

        // Verificamos si Supabase nos devolvió un error.
        if (error) {
            // Si hay un error, lo mostramos al usuario.
            console.error('Error al enviar el Magic Link:', error.message);
            messageArea.textContent = `Error: ${error.message}`;
        } else {
            // Si todo salió bien, mostramos un mensaje de éxito.
            messageArea.textContent = '¡Listo! Revisa tu bandeja de entrada (y la carpeta de spam) para encontrar tu enlace mágico.';
            emailInput.value = ''; // Limpiamos el campo de correo.
        }
    } catch (e) {
        // Capturamos cualquier otro error inesperado.
        console.error('Ocurrió un error inesperado:', e.message);
        messageArea.textContent = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
    } finally {
        // Se ejecuta siempre, haya error o no. Reactivamos el botón.
        loginButton.disabled = false;
    }
});

// --- LÓGICA PRINCIPAL DE LA APLICACIÓN ---

// Referencias a los contenedores de las pantallas
const loginContainer = document.getElementById('login-container');
const mainContainer = document.getElementById('main-container');
const userInfo = document.getElementById('user-info');
const accessButtonsContainer = document.getElementById('access-buttons-container');
const logoutButton = document.getElementById('logout-button');

/**
 * Muestra la pantalla de login y oculta la principal.
 */
function showLoginScreen() {
    loginContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
}

/**
 * Muestra la pantalla principal y oculta la de login.
 */
function showMainScreen() {
    mainContainer.classList.remove('hidden');
    loginContainer.classList.add('hidden');
}

/**
 * Carga el perfil del usuario desde la tabla 'usuarios' y renderiza la pantalla principal.
 * @param {object} user - El objeto de usuario autenticado de Supabase.
 */
async function loadUserProfile(user) {
    try {
        // Buscamos en la tabla 'usuarios' una fila cuyo 'id' coincida con el del usuario logueado.
        const { data: profile, error } = await supabase
            .from('usuarios')
            .select('depto, adeudo_meses')
            .eq('id', user.id)
            .single(); // .single() nos devuelve un solo objeto, no un array.

        if (error) {
            console.error('Error al obtener el perfil del usuario:', error.message);
            // Si hay un error (ej: el usuario está en Auth pero no en la tabla 'usuarios'),
            // lo mostramos y cerramos la sesión por seguridad.
            userInfo.innerHTML = `<p class="error">No se pudo cargar tu perfil. Contacta al administrador.</p>`;
            setTimeout(() => supabase.auth.signOut(), 5000); // Cerramos sesión después de 5 segundos.
            return;
        }

        if (profile) {
            renderMainScreen(profile);
        }

    } catch (e) {
        console.error('Error inesperado al cargar el perfil:', e.message);
    }
}

/**
 * Renderiza el contenido de la pantalla principal según el perfil del usuario.
 * @param {object} profile - El perfil del usuario con 'depto' y 'adeudo_meses'.
 */
function renderMainScreen(profile) {
    // 1. Mostramos el saludo al usuario.
    userInfo.innerHTML = `<h2>Departamento ${profile.depto}</h2>`;
    accessButtonsContainer.innerHTML = ''; // Limpiamos los botones anteriores.

    const adeudo = profile.adeudo_meses;

    // 2. Creamos y mostramos los botones según las reglas de negocio.
    // Acceso Vehicular
    if (adeudo >= 1) {
        accessButtonsContainer.innerHTML += `<button class="access-button manual">Solicitar Apertura Manual</button>`;
    } else {
        accessButtonsContainer.innerHTML += `<button class="access-button auto">Abrir Portón (Automático)</button>`;
    }

    // Acceso Peatonal (siempre permitido)
    accessButtonsContainer.innerHTML += `<button class="access-button">Abrir Puerta Peatonal</button>`;

    // Acceso Basura
    if (adeudo < 2) {
        accessButtonsContainer.innerHTML += `<button class="access-button">Abrir Puerta de Basura</button>`;
    }
}

// --- GESTIÓN DEL ESTADO DE AUTENTICACIÓN ---

// Esta función se ejecuta automáticamente cuando el estado de la sesión cambia (login, logout).
supabase.auth.onAuthStateChange((event, session) => {
    if (session && session.user) {
        // Si hay una sesión activa, el usuario ha iniciado sesión.
        showMainScreen();
        loadUserProfile(session.user);
    } else {
        // Si no hay sesión, el usuario no ha iniciado sesión o ha cerrado la sesión.
        showLoginScreen();
    }
});

// Añadimos el evento de clic al botón de cerrar sesión.
logoutButton.addEventListener('click', () => {
    supabase.auth.signOut();
});
