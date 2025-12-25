import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- ELEMENTOS DEL DOM ---
const configContainer = document.getElementById('config-container');
const loginContainer = document.getElementById('login-container');
const mainContainer = document.getElementById('main-container');

// --- VARIABLES GLOBALES ---
let supabase;

// --- FUNCIONES PRINCIPALES ---

/**
 * Inicializa el cliente de Supabase y arranca la aplicación.
 */
function initializeApp(url, key) {
    supabase = createClient(url, key);
    setupAuthListeners(); // Configura los escuchadores de sesión
}

/**
 * Muestra la pantalla correcta al cargar la página.
 */
function initialLoad() {
    const storedUrl = localStorage.getItem('supabaseUrl');
    const storedKey = localStorage.getItem('supabaseKey');

    if (storedUrl && storedKey) {
        initializeApp(storedUrl, storedKey);
        // El estado de la sesión se gestionará en setupAuthListeners
    } else {
        configContainer.classList.remove('hidden'); // Muestra la configuración si no hay datos
    }
}

// --- LÓGICA DE CONFIGURACIÓN ---
const saveConfigButton = document.getElementById('save-config-button');
const supabaseUrlInput = document.getElementById('supabase-url-input');
const supabaseKeyInput = document.getElementById('supabase-key-input');
const configMessage = document.getElementById('config-message-area');

saveConfigButton.addEventListener('click', () => {
    const url = supabaseUrlInput.value.trim();
    const key = supabaseKeyInput.value.trim();

    if (!url || !key) {
        configMessage.textContent = 'Por favor, completa ambos campos.';
        return;
    }

    localStorage.setItem('supabaseUrl', url);
    localStorage.setItem('supabaseKey', key);

    configMessage.textContent = '¡Configuración guardada!';
    setTimeout(() => {
        configContainer.classList.add('hidden');
        initializeApp(url, key);
    }, 1000);
});


// --- LÓGICA DE AUTENTICACIÓN ---

function setupAuthListeners() {
    const loginButton = document.getElementById('login-button');
    const emailInput = document.getElementById('email-input');
    const messageArea = document.getElementById('message-area');
    const logoutButton = document.getElementById('logout-button');

    loginButton.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        if (!email) {
            messageArea.textContent = 'Ingresa tu correo.';
            return;
        }
        messageArea.textContent = 'Enviando enlace...';
        loginButton.disabled = true;
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: window.location.href },
            });
            if (error) throw error;
            messageArea.textContent = '¡Revisa tu correo (y el spam)!';
        } catch (error) {
            messageArea.textContent = `Error: ${error.message}`;
        } finally {
            loginButton.disabled = false;
        }
    });

    logoutButton.addEventListener('click', () => supabase.auth.signOut());

    supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            mainContainer.classList.remove('hidden');
            loginContainer.classList.add('hidden');
            configContainer.classList.add('hidden');
            loadUserProfile(session.user);
        } else {
            // Si la app ya está configurada, muestra el login, si no, la config.
            if (localStorage.getItem('supabaseUrl')) {
                loginContainer.classList.remove('hidden');
            } else {
                configContainer.classList.remove('hidden');
            }
            mainContainer.classList.add('hidden');
        }
    });
}


// --- LÓGICA DE LA PANTALLA PRINCIPAL ---

async function loadUserProfile(user) {
    const userInfo = document.getElementById('user-info');
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('depto, adeudo_meses')
            .eq('id', user.id)
            .single();
        if (error) throw error;
        renderMainScreen(data);
    } catch (error) {
        userInfo.innerHTML = `<p class="message">Error al cargar tu perfil. Contacta al administrador.</p>`;
        setTimeout(() => supabase.auth.signOut(), 4000);
    }
}

function renderMainScreen(profile) {
    const userInfo = document.getElementById('user-info');
    const buttonsContainer = document.getElementById('access-buttons-container');

    userInfo.innerHTML = `<h2>Depto. ${profile.depto}</h2>`;
    buttonsContainer.innerHTML = ''; // Limpiar botones
    const adeudo = profile.adeudo_meses;

    // Lógica de botones
    if (adeudo >= 1) {
        buttonsContainer.innerHTML += `<button>Solicitar Apertura Manual</button>`;
    } else {
        buttonsContainer.innerHTML += `<button>Abrir Portón (Automático)</button>`;
    }
    buttonsContainer.innerHTML += `<button>Abrir Puerta Peatonal</button>`;
    if (adeudo < 2) {
        buttonsContainer.innerHTML += `<button>Abrir Puerta de Basura</button>`;
    }
}

// --- ARRANQUE DE LA APLICACIÓN ---
initialLoad();
