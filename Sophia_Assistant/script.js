document.addEventListener('DOMContentLoaded', () => {
    console.log("Sophia Iniciada v10 (Quota Management & Real-time Sync)");

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
    let config = {
        apiKey: localStorage.getItem('sophia_api_key') || '',
        selectedModel: localStorage.getItem('sophia_model') || 'gemini-1.5-flash',
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
    async function callGemini(prompt, isSystemCall = false) {
        if (!config.apiKey) return { error: "Falta API Key. Ve a Configuración." };

        // Priority List for Fallback (Avoid Quota Errors)
        const MODELS = [
            config.selectedModel,
            "gemini-1.5-flash",
            "gemini-2.0-flash-exp",
            "gemini-1.5-pro"
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
            console.log(`Intentando con modelo: ${model}`);
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
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

                    // 429 = Quota Exceeded, 404 = Not Found
                    if (errStatus === "RESOURCE_EXHAUSTED" || data.error.code === 429) {
                        console.warn(`Cuota agotada en ${model}. Probando siguiente...`);
                        continue;
                    }
                    if (data.error.code === 404) continue;

                    return { error: `Error de Google: ${errMsg}` };
                }

                if (data.candidates && data.candidates[0]) {
                    return { text: data.candidates[0].content.parts[0].text, usedModel: model };
                }
            } catch (e) {
                console.error("Fallo de red para " + model, e);
                continue;
            }
        }
        return { error: "Todos los modelos fallaron. Revisa tu cuota o clave en Google AI Studio." };
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

        const extractionPrompt = `Analiza mi memoria y responde SOLO en JSON: {"proyecto_activo":"...","salud_resumen":"...","bienestar_resumen":"...","lista_proyectos":["..."]} Memoria: ${JSON.stringify(config.memory)}`;
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
            } catch (e) { console.error("Error JSON"); }
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
            if (msg) msg.innerHTML = `<p style="color:#d63031"><i class="fas fa-exclamation-triangle"></i> ${result.error}</p>`;
        } else {
            const cleanedText = handleMagicContent(result.text);
            const modelBadge = `<span style="font-size:0.6rem; opacity:0.5; display:block; margin-top:5px">Vía ${result.usedModel}</span>`;
            if (msg) msg.innerHTML = `<p>${cleanedText || "Sección actualizada."}${modelBadge}</p>`;
        }
    }

    function addMessage(text, sender, id = null) {
        const d = document.createElement('div');
        d.className = `message ${sender}`;
        if (id) d.id = id;
        d.innerHTML = `<p>${text}</p>`;
        chatDisplay.appendChild(d);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    sendBtn.addEventListener('click', () => handleMessage(userInput.value));
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleMessage(userInput.value); });

    saveConfigBtn.addEventListener('click', () => {
        config.apiKey = apiKeyInput.value.trim();
        config.selectedModel = modelSelect.value;
        localStorage.setItem('sophia_api_key', config.apiKey);
        localStorage.setItem('sophia_model', config.selectedModel);

        for (let key in configFields) {
            const val = configFields[key].value.trim();
            config.memory[key] = val;
            localStorage.setItem(`sophia_mem_${key}`, val);
        }
        configStatusDisplay.innerText = "¡Sophia actualizada en tiempo real!";
        configStatusDisplay.className = "config-status success";
        analyzeMemory();
        setTimeout(() => switchView('dashboard'), 1000);
    });

    testConfigBtn.addEventListener('click', async () => {
        configStatusDisplay.innerText = "Probando clave...";
        const res = await callGemini("Responde OK", true);
        configStatusDisplay.innerText = res.error ? "Error: " + res.error : "¡Conexión Exitosa!";
        configStatusDisplay.className = res.error ? "config-status error" : "config-status success";
    });

    if (config.apiKey) analyzeMemory();
});
