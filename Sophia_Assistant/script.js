document.addEventListener('DOMContentLoaded', () => {
    console.log("Sophia Iniciada v7 (Error Debug Enabled)");

    const chatDisplay = document.getElementById('chat-display');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const voiceStatus = document.getElementById('voice-status');
    const dateDisplay = document.getElementById('date-display');
    const sectionTitle = document.getElementById('section-title');
    const apiKeyInput = document.getElementById('api-key');
    const modelSelect = document.getElementById('model-select');
    const systemInstructionInput = document.getElementById('system-instruction');
    const saveConfigBtn = document.getElementById('save-config');
    const testConfigBtn = document.getElementById('test-connection');
    const configStatusDisplay = document.getElementById('config-status');
    const dynamicProjectsMenu = document.getElementById('dynamic-projects');

    let config = {
        apiKey: localStorage.getItem('sophia_api_key') || '',
        selectedModel: localStorage.getItem('sophia_model') || 'gemini-3.1-pro-preview', 
        systemInstruction: localStorage.getItem('sophia_system_instruction') || ''
    };

    apiKeyInput.value = config.apiKey;
    modelSelect.value = config.selectedModel;
    systemInstructionInput.value = config.systemInstruction;
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.innerText = new Date().toLocaleDateString('es-ES', dateOptions);

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
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            switchView(li.getAttribute('data-target'));
        });
    });

    async function callGemini(prompt, isSystemCall = false) {
        if (!config.apiKey) return { error: "Falta API Key" };

        const MODELS = [config.selectedModel, "gemini-3.1-pro-preview", "gemini-2.5-pro", "gemini-1.5-pro"];
        const UNIQUE_MODELS = [...new Set(MODELS)]; 
        let lastError = "";

        for (const model of UNIQUE_MODELS) {
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
            const payload = {
                contents: [{
                    parts: [{ text: isSystemCall ? prompt : `Instrucción de Sistema: ${config.systemInstruction}\n\nUsuario: ${prompt}` }]
                }]
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); 

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                const data = await response.json();

                if (data.error) {
                    lastError = `Error en ${model}: ${data.error.message}`;
                    if (data.error.code === 404) continue;
                    return { error: lastError }; 
                }

                if (!data.candidates || !data.candidates[0]) {
                    lastError = "Respuesta vacía";
                    continue;
                }

                return { text: data.candidates[0].content.parts[0].text };

            } catch (e) {
                clearTimeout(timeoutId);
                lastError = e.name === 'AbortError' ? "Tiempo agotado" : "Error de red";
                continue;
            }
        }
        return { error: lastError || "No hay conexión" };
    }

    async function analyzeMemory() {
        if (!config.apiKey || !config.systemInstruction) return;

        const cards = document.querySelectorAll('.card-value');
        cards.forEach(c => c.innerHTML = '<i class="fas fa-spinner fa-spin"></i>');

        const extractionPrompt = `Analiza: "${config.systemInstruction}". Responde solo JSON: {"proyecto_activo": "...", "salud_resumen": "...", "bienestar_resumen": "...", "lista_proyectos": [], "detalles_proyectos": "...", "detalles_salud": "...", "detalles_bienestar": "..."}`;

        const result = await callGemini(extractionPrompt, true);

        if (result.error) {
            // AQUÍ TE AVISARÁ EL ERROR EN LAS TARJETAS
            cards.forEach(c => c.innerHTML = `<span style="color:#ff7675; font-size:0.7rem">${result.error}</span>`);
            return;
        }

        try {
            const cleanJson = result.text.replace(/```json|
```/g, '').trim();
            const data = JSON.parse(cleanJson);

            document.querySelector('#card-project .card-value').innerText = data.proyecto_activo;
            document.querySelector('#card-health .card-value').innerText = data.salud_resumen;
            document.querySelector('#card-wellness .card-value').innerText = data.bienestar_resumen;

            document.getElementById('projects-content').innerHTML = data.detalles_proyectos;
            document.getElementById('health-content').innerHTML = data.detalles_salud;
            document.getElementById('wellness-content').innerHTML = data.detalles_bienestar;
        } catch (e) {
            cards.forEach(c => c.innerText = "Error en formato JSON");
        }
    }

    if (config.apiKey && config.systemInstruction) analyzeMemory();

    testConfigBtn.addEventListener('click', async () => {
        config.apiKey = apiKeyInput.value.trim();
        configStatusDisplay.innerText = "Probando...";
        const result = await callGemini("Hola", true);
        configStatusDisplay.innerText = result.error ? "Error: " + result.error : "¡Sophia lista!";
        configStatusDisplay.className = result.error ? "config-status error" : "config-status success";
    });

    saveConfigBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        config.apiKey = apiKeyInput.value.trim();
        config.selectedModel = modelSelect.value;
        config.systemInstruction = systemInstructionInput.value.trim();
        localStorage.setItem('sophia_api_key', config.apiKey);
        localStorage.setItem('sophia_model', config.selectedModel);
        localStorage.setItem('sophia_system_instruction', config.systemInstruction);
        await analyzeMemory();
        setTimeout(() => switchView('dashboard'), 1000);
    });

    // --- Interaction ---
    async function handleMessage(text) {
        if (!text.trim()) return;
        addMessage(text, 'user');
        const thinkingId = Date.now();
        addMessage("Pensando...", 'system', thinkingId);
        const result = await callGemini(text);
        const msg = document.getElementById(thinkingId);
        if (msg) msg.innerHTML = `<p>${result.error || result.text}</p>`;
    }

    function addMessage(text, sender, id = null) {
        const d = document.createElement('div');
        d.className = `message ${sender}`;
        if (id) d.id = id;
        d.innerHTML = `<p>${text}</p>`;
        chatDisplay.appendChild(d);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    sendBtn.addEventListener('click', () => { handleMessage(userInput.value); userInput.value = ''; });
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { handleMessage(userInput.value); userInput.value = ''; }});
});
