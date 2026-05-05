document.addEventListener('DOMContentLoaded', () => {
    console.log("Sophia Iniciada v7 (Final Pro Stability - 2026 Optimized)");

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
    const systemInstructionInput = document.getElementById('system-instruction');
    const saveConfigBtn = document.getElementById('save-config');
    const testConfigBtn = document.getElementById('test-connection');
    const configStatusDisplay = document.getElementById('config-status');
    const dynamicProjectsMenu = document.getElementById('dynamic-projects');

    // --- State ---
    let config = {
        apiKey: localStorage.getItem('sophia_api_key') || '',
        // Actualizado al modelo más potente de tu lista
        selectedModel: localStorage.getItem('sophia_model') || 'gemini-3.1-pro-preview', 
        systemInstruction: localStorage.getItem('sophia_system_instruction') || ''
    };

    apiKeyInput.value = config.apiKey;
    modelSelect.value = config.selectedModel;
    systemInstructionInput.value = config.systemInstruction;
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
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            switchView(li.getAttribute('data-target'));
        });
    });

    // --- Gemini API Logic ---
    async function callGemini(prompt, isSystemCall = false) {
        if (!config.apiKey) return { error: "Falta API Key. Ve a Configuración." };

        // Lista de modelos actualizada según tu lista oficial de 2026
        const MODELS = [config.selectedModel, "gemini-3.1-pro-preview", "gemini-2.5-pro", "gemini-1.5-pro"];
        const UNIQUE_MODELS = [...new Set(MODELS)]; 

        let lastError = "";

        for (const model of UNIQUE_MODELS) {
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`;
            const payload = {
                contents: [{
                    parts: [{ text: isSystemCall ? prompt : `Instrucción de Sistema: ${config.systemInstruction}\n\nUsuario dice: ${prompt}` }]
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
                    lastError = data.error.message;
                    console.warn(`Modelo ${model} falló: ${lastError}`);
                    if (data.error.status === "NOT_FOUND" || data.error.code === 404) continue;
                    return { error: lastError }; 
                }

                if (!data.candidates || !data.candidates[0]) {
                    lastError = "Respuesta vacía. Revisa límites.";
                    continue;
                }

                console.log(`Sophia conectada con ${model}`);
                return { text: data.candidates[0].content.parts[0].text };

            } catch (e) {
                clearTimeout(timeoutId);
                if (e.name === 'AbortError') {
                    lastError = "Tiempo agotado en " + model;
                    continue;
                }
                return { error: "Error de conexión." };
            }
        }

        return { error: lastError || "No se pudo conectar." };
    }

    // --- Auto Analysis of Memory ---
    async function analyzeMemory() {
        if (!config.apiKey || !config.systemInstruction) return;

        const cards = document.querySelectorAll('.card-value');
        cards.forEach(c => c.innerHTML = '<i class="fas fa-spinner fa-spin"></i>...');

        const extractionPrompt = `
        Analiza esta información: "${config.systemInstruction}"
        Responde estrictamente en formato JSON:
        {
            "proyecto_activo": "Nombre corto",
            "salud_resumen": "Glucosa/Colesterol",
            "bienestar_resumen": "Próximo paso Lote 71",
            "lista_proyectos": ["Proyecto 1", "Proyecto 2"],
            "detalles_proyectos": "HTML lista",
            "detalles_salud": "HTML tabla",
            "detalles_bienestar": "HTML resumen"
        }`;

        const result = await callGemini(extractionPrompt, true);

        if (result.error) {
            cards.forEach(c => c.innerHTML = `<span style="color:#d63031; font-size:0.7rem">Revisar Config</span>`);
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

            dynamicProjectsMenu.innerHTML = '';
            if (data.lista_proyectos) {
                data.lista_proyectos.forEach(pName => {
                    const li = document.createElement('li');
                    li.className = 'project-item';
                    li.innerHTML = `<i class="fas fa-chevron-right"></i> ${pName}`;
                    li.onclick = () => { switchView('projects'); sectionTitle.innerText = pName; };
                    dynamicProjectsMenu.appendChild(li);
                });
            }
        } catch (e) {
            cards.forEach(c => c.innerText = "Error formato");
        }
    }

    if (config.apiKey && config.systemInstruction) analyzeMemory();

    // --- Configuration Logic ---
    testConfigBtn.addEventListener('click', async () => {
        const originalApiKey = config.apiKey;
        config.apiKey = apiKeyInput.value.trim();
        configStatusDisplay.innerText = "Probando...";
        const result = await callGemini("Responde OK", true);

        if (result.error) {
            configStatusDisplay.innerText = "Error: " + result.error;
            configStatusDisplay.className = "config-status error";
            config.apiKey = originalApiKey;
        } else {
            configStatusDisplay.innerText = "¡Sophia lista!";
            configStatusDisplay.className = "config-status success";
        }
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
    const synth = window.speechSynthesis;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.onstart = () => { voiceBtn.classList.add('recording'); };
        recognition.onresult = (e) => { handleMessage(e.results[0][0].transcript); };
        recognition.onend = () => { voiceBtn.classList.remove('recording'); };
    }

    async function handleMessage(text) {
        if (!text.trim()) return;
        addMessage(text, 'user');
        const thinkingId = Date.now();
        addMessage("Sophia pensando...", 'system', thinkingId);

        const result = await callGemini(text);
        const msg = document.getElementById(thinkingId);
        if (msg) msg.innerHTML = `<p>${result.error || result.text}</p>`;

        if (result.text) {
            const ut = new SpeechSynthesisUtterance(result.text);
            ut.lang = 'es-ES';
            synth.speak(ut);
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

    sendBtn.addEventListener('click', () => { handleMessage(userInput.value); userInput.value = ''; });
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { handleMessage(userInput.value); userInput.value = ''; }});
    voiceBtn.addEventListener('click', () => { if (recognition) recognition.start(); });
});
