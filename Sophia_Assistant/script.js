document.addEventListener('DOMContentLoaded', () => {
    console.log("Sophia Iniciada v9 (Modular Memory & Dynamic Sections)");

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
        selectedModel: localStorage.getItem('sophia_model') || 'gemini-3.1-pro-preview',
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

    // --- Navigation Logic (Fixed) ---
    function switchView(target) {
        console.log("Cambiando a vista:", target);
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

    // Attach navigation events correctly
    document.querySelectorAll('nav li[data-target]').forEach(li => {
        li.addEventListener('click', (e) => {
            const target = li.getAttribute('data-target');
            switchView(target);
        });
    });

    // --- Gemini API Logic ---
    async function callGemini(prompt, isSystemCall = false) {
        if (!config.apiKey) return { error: "Falta API Key. Ve a Configuración." };

        const MODELS = [
            config.selectedModel,
            "gemini-2.0-flash-exp",
            "gemini-1.5-pro",
            "gemini-1.5-flash"
        ];
        const UNIQUE_MODELS = [...new Set(MODELS)];

        // Construct Global Context from Modular Memory
        const globalContext = `
            PERSONALIDAD: ${config.memory.personality}
            PROYECTOS: ${config.memory.projects}
            SALUD: ${config.memory.health}
            BIENESTAR: ${config.memory.wellness}
            EMAIL: ${config.memory.email}
            CUSTOM: ${config.memory.custom}
        `;

        for (const model of UNIQUE_MODELS) {
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
                    if (data.error.code === 404) continue; // Try next model
                    return { error: data.error.message };
                }

                if (data.candidates && data.candidates[0]) {
                    return { text: data.candidates[0].content.parts[0].text };
                }
            } catch (e) {
                console.error("Error con modelo " + model, e);
                continue;
            }
        }
        return { error: "No se pudo conectar con ningún modelo de Gemini." };
    }

    // --- Handle "Magic" Dynamic Sections ---
    function handleMagicContent(aiText) {
        // Look for [MAGIC_SECTION] tags in AI response
        const regex = /\[MAGIC_SECTION\]([\s\S]*?)\[\/MAGIC_SECTION\]/g;
        let match;
        let foundMagic = false;

        while ((match = regex.exec(aiText)) !== null) {
            const htmlContent = match[1];
            const div = document.createElement('div');
            div.className = 'magic-section';
            div.innerHTML = htmlContent;
            magicContainer.prepend(div); // Newest at top
            foundMagic = true;
        }

        if (foundMagic) {
            // Clean up the text shown in chat so the tags don't look ugly
            return aiText.replace(regex, '').trim();
        }
        return aiText;
    }

    // --- Auto Analysis of Memory ---
    async function analyzeMemory() {
        if (!config.apiKey || !config.memory.personality) return;

        const cards = document.querySelectorAll('.card-value');
        cards.forEach(c => c.innerHTML = '<i class="fas fa-spinner fa-spin"></i>...');

        const extractionPrompt = `
        Analiza toda mi memoria (Proyectos, Salud, Bienestar) y resume:
        Responde estrictamente en formato JSON:
        {
            "proyecto_activo": "Nombre",
            "salud_resumen": "Resumen corto",
            "bienestar_resumen": "Resumen corto",
            "lista_proyectos": ["P1", "P2"]
        }
        Memoria: ${JSON.stringify(config.memory)}
        `;

        const result = await callGemini(extractionPrompt, true);
        if (result.text) {
            try {
                const cleanJson = result.text.replace(/```json|```/g, '').trim();
                const data = JSON.parse(cleanJson);
                document.querySelector('#card-project .card-value').innerText = data.proyecto_activo || "Ninguno";
                document.querySelector('#card-health .card-value').innerText = data.salud_resumen || "Sin datos";
                document.querySelector('#card-wellness .card-value').innerText = data.bienestar_resumen || "Sin datos";

                dynamicProjectsMenu.innerHTML = '';
                (data.lista_proyectos || []).forEach(p => {
                    const li = document.createElement('li');
                    li.className = 'project-item';
                    li.innerHTML = `<i class="fas fa-chevron-right"></i> ${p}`;
                    dynamicProjectsMenu.appendChild(li);
                });
            } catch (e) { console.error("Error parseando memoria"); }
        }
    }

    // --- Interaction ---
    async function handleMessage(text) {
        if (!text.trim()) return;
        addMessage(text, 'user');
        userInput.value = ''; // CLEAN INPUT IMMEDIATELY

        const thinkingId = Date.now();
        addMessage("Sophia analizando...", 'system', thinkingId);

        const result = await callGemini(text);
        const msg = document.getElementById(thinkingId);

        if (result.error) {
            if (msg) msg.innerHTML = `<p style="color:#d63031">${result.error}</p>`;
        } else {
            const cleanedText = handleMagicContent(result.text);
            if (msg) msg.innerHTML = `<p>${cleanedText || "Sección creada abajo."}</p>`;

            // Speak response (Optional, limited for performance)
            if (cleanedText) {
                const ut = new SpeechSynthesisUtterance(cleanedText.substring(0, 200));
                ut.lang = 'es-ES';
                window.speechSynthesis.speak(ut);
            }
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

    // --- Event Listeners ---
    sendBtn.addEventListener('click', () => handleMessage(userInput.value));

    // THE ENTER KEY (Fixed)
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleMessage(userInput.value);
        }
    });

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

        configStatusDisplay.innerText = "¡Cerebro actualizado!";
        configStatusDisplay.className = "config-status success";
        analyzeMemory();
        setTimeout(() => switchView('dashboard'), 1000);
    });

    testConfigBtn.addEventListener('click', async () => {
        const originalKey = config.apiKey;
        config.apiKey = apiKeyInput.value.trim();
        configStatusDisplay.innerText = "Probando conexión...";
        const res = await callGemini("Responde solo OK", true);
        if (res.error) {
            configStatusDisplay.innerText = "Error: " + res.error;
            configStatusDisplay.className = "config-status error";
            config.apiKey = originalKey;
        } else {
            configStatusDisplay.innerText = "¡Conexión Perfecta!";
            configStatusDisplay.className = "config-status success";
        }
    });

    if (config.apiKey) analyzeMemory();
});
