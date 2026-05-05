document.addEventListener('DOMContentLoaded', () => {
    console.log("Sophia Iniciada v11 (API Key Fix & Persistent Sync)");

    // --- Elements ---
    const chatDisplay = document.getElementById('chat-display');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const voiceStatus = document.getElementById('voice-status');
    const dateDisplay = document.getElementById('date-display');
    const sectionTitle = document.getElementById('section-title');
    const apiKeyInput = document.getElementById('api-key');
    const modelSelect = document.getElementById('model-select');
    const saveConfigBtn = document.getElementById('save-config');
    const testConfigBtn = document.getElementById('test-connection');
    const configStatusDisplay = document.getElementById('config-status');
    const dynamicProjectsMenu = document.getElementById('dynamic-projects');
    const magicContainer = document.getElementById('magic-container');

    // --- Modular Config Fields ---
    const configFields = {
        personality: document.getElementById('config-personality'),
        projects: document.getElementById('config-projects'),
        health: document.getElementById('config-health'),
        wellness: document.getElementById('config-wellness'),
        email: document.getElementById('config-email'),
        custom: document.getElementById('config-custom')
    };

    // --- State ---
    const DEFAULT_KEY = 'AIzaSyBtK5fbV_JJ-yUdi6VTPdJE6kSOmi3RUe0';
    let config = {
        apiKey: localStorage.getItem('sophia_api_key') || DEFAULT_KEY,
        selectedModel: localStorage.getItem('sophia_model') || 'gemini-2.5-flash',
        memory: {
            personality: localStorage.getItem('sophia_mem_personality') || '',
            projects: localStorage.getItem('sophia_mem_projects') || '',
            health: localStorage.getItem('sophia_mem_health') || '',
            wellness: localStorage.getItem('sophia_mem_wellness') || '',
            email: localStorage.getItem('sophia_mem_email') || '',
            custom: localStorage.getItem('sophia_mem_custom') || ''
        }
    };

    // Initialize Fields
    apiKeyInput.value = config.apiKey;
    modelSelect.value = config.selectedModel;
    for (let key in configFields) {
        if (configFields[key]) configFields[key].value = config.memory[key];
    }

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.innerText = new Date().toLocaleDateString('es-ES', dateOptions);

    // --- Navigation Logic ---
    function switchView(target) {
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
            v.style.display = 'none';
        });
        document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));
        const viewId = `${target}-view`;
        const targetView = document.getElementById(viewId);
        const navItem = document.querySelector(`nav li[data-target="${target}"]`);
        if (targetView) {
            targetView.classList.add('active');
            targetView.style.display = 'block';
            if (navItem) navItem.classList.add('active');
            sectionTitle.innerText = navItem ? navItem.innerText.trim() : "Dashboard";
        }
    }

    document.querySelectorAll('nav li[data-target]').forEach(li => {
        li.addEventListener('click', () => switchView(li.getAttribute('data-target')));
    });

    // --- Gemini API Logic ---
    async function callGemini(prompt, isSystemCall = false, tempKey = null) {
        // Usa la clave temporal (para pruebas) o la guardada
        const currentKey = tempKey || config.apiKey;

        if (!currentKey) return { error: "Falta API Key. Ve a Configuración." };

        const MODELS = [
            config.selectedModel,
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-2.0-flash",
            "gemini-2.5-flash-lite"
        ];
        const UNIQUE_MODELS = [...new Set(MODELS)];

        const globalContext = `
            PERSONALIDAD: ${config.memory.personality}
            PROYECTOS: ${config.memory.projects}
            SALUD: ${config.memory.health}
            BIENESTAR: ${config.memory.wellness}
            EMAIL: ${config.memory.email}
            CUSTOM: ${config.memory.custom}
        `;

        for (const model of UNIQUE_MODELS) {
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;
            const payload = {
                contents: [{
                    parts: [{ text: isSystemCall ? prompt : `CONTEXTO SOPHIA:\n${globalContext}\n\nMENSAJE GABY: ${prompt}` }]
                }]
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (data.error) {
                    const errStatus = data.error.status;
                    const errMsg = data.error.message;

                    if (errMsg.includes("expired") || errMsg.includes("invalid")) {
                        return { error: "Tu API Key ha expirado o es inválida. Cámbiala en Configuración." };
                    }
                    if (errStatus === "RESOURCE_EXHAUSTED" || data.error.code === 429) continue;
                    if (data.error.code === 404) continue;

                    return { error: `Error de Google: ${errMsg}` };
                }

                if (data.candidates && data.candidates[0]) {
                    return { text: data.candidates[0].content.parts[0].text, usedModel: model };
                }
            } catch (e) { continue; }
        }
        return { error: "Sophia no pudo conectar. Revisa tu clave o internet." };
    }

    function handleMagicContent(aiText) {
        const regex = /\[MAGIC_SECTION\]([\s\S]*?)\[\/MAGIC_SECTION\]/g;
        let match;
        let foundMagic = false;
        while ((match = regex.exec(aiText)) !== null) {
            const div = document.createElement('div');
            div.className = 'magic-section';
            div.innerHTML = match[1];
            magicContainer.prepend(div);
            foundMagic = true;
        }
        return foundMagic ? aiText.replace(regex, '').trim() : aiText;
    }

    async function analyzeMemory() {
        if (!config.apiKey) return;
        const cards = document.querySelectorAll('.card-value');
        cards.forEach(c => c.innerHTML = '<i class="fas fa-spinner fa-spin"></i>');

        const extractionPrompt = `Resumen rápido JSON: {"proyecto_activo":"...","salud_resumen":"...","bienestar_resumen":"...","lista_proyectos":[]} Memoria: ${JSON.stringify(config.memory)}`;
        const result = await callGemini(extractionPrompt, true);

        if (result.text) {
            try {
                const cleanJson = result.text.replace(/```json|```/g, '').trim();
                const data = JSON.parse(cleanJson);
                document.querySelector('#card-project .card-value').innerText = data.proyecto_activo || "Pendiente";
                document.querySelector('#card-health .card-value').innerText = data.salud_resumen || "Pendiente";
                document.querySelector('#card-wellness .card-value').innerText = data.bienestar_resumen || "Pendiente";

                dynamicProjectsMenu.innerHTML = '';
                (data.lista_proyectos || []).forEach(p => {
                    const li = document.createElement('li');
                    li.className = 'project-item';
                    li.innerHTML = `<i class="fas fa-chevron-right"></i> ${p}`;
                    dynamicProjectsMenu.appendChild(li);
                });
            } catch (e) { console.error("Error JSON Memory Sync"); }
        }
    }

    async function handleMessage(text) {
        if (!text.trim()) return;
        addMessage(text, 'user');
        userInput.value = '';

        const thinkingId = Date.now();
        addMessage("Sophia analizando...", 'system', thinkingId);

        const result = await callGemini(text);
        const msg = document.getElementById(thinkingId);

        if (result.error) {
            if (msg) msg.innerHTML = `<div class="md-content" style="color:#d63031"><i class="fas fa-exclamation-triangle"></i> ${result.error}</div>`;
        } else {
            const cleanedText = handleMagicContent(result.text);
            const modelBadge = `<span style="font-size:0.6rem; opacity:0.5; display:block; margin-top:5px; border-top:1px solid rgba(0,0,0,0.05); padding-top:5px">Vía ${result.usedModel}</span>`;

            // Render Markdown
            const htmlContent = marked.parse(cleanedText || "Sección actualizada.");
            if (msg) msg.innerHTML = `<div class="md-content">${htmlContent}</div>${modelBadge}`;
        }
    }

    function addMessage(text, sender, id = null) {
        const d = document.createElement('div');
        d.className = `message ${sender}`;
        if (id) d.id = id;

        // Renderizar Markdown también para el usuario (por si usa negritas o listas)
        const htmlContent = marked.parse(text);
        d.innerHTML = `<div class="md-content">${htmlContent}</div>`;

        chatDisplay.appendChild(d);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    sendBtn.addEventListener('click', () => handleMessage(userInput.value));
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleMessage(userInput.value); });

    // --- REPARACIÓN DE GUARDADO (Fix v11) ---
    saveConfigBtn.addEventListener('click', () => {
        const newKey = apiKeyInput.value.trim();
        const newModel = modelSelect.value;

        // Actualizar estado interno INMEDIATAMENTE
        config.apiKey = newKey;
        config.selectedModel = newModel;

        localStorage.setItem('sophia_api_key', newKey);
        localStorage.setItem('sophia_model', newModel);

        for (let key in configFields) {
            const val = configFields[key].value.trim();
            config.memory[key] = val;
            localStorage.setItem(`sophia_mem_${key}`, val);
        }

        configStatusDisplay.innerText = "¡Clave y memoria guardadas con éxito!";
        configStatusDisplay.className = "config-status success";

        // Re-analizar todo con la nueva clave
        analyzeMemory();
        setTimeout(() => switchView('dashboard'), 1000);
    });

    testConfigBtn.addEventListener('click', async () => {
        const tempKey = apiKeyInput.value.trim(); // Lee lo que hay en el cuadro AHORA
        if (!tempKey) {
            configStatusDisplay.innerText = "Escribe una clave primero.";
            configStatusDisplay.className = "config-status error";
            return;
        }

        configStatusDisplay.innerText = "Probando tu nueva clave...";
        configStatusDisplay.className = "config-status";

        // Forzamos el uso de la clave que acaba de escribir
        const res = await callGemini("Responde OK", true, tempKey);

        if (res.error) {
            configStatusDisplay.innerText = "Error: " + res.error;
            configStatusDisplay.className = "config-status error";
        } else {
            configStatusDisplay.innerText = "¡Clave Nueva Validada Correctamente!";
            configStatusDisplay.className = "config-status success";
        }
    });

    if (config.apiKey) analyzeMemory();
});
