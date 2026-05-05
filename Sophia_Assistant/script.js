document.addEventListener('DOMContentLoaded', () => {
    console.log("Sophia Iniciada v5 (Error Diagnostic)");

    // --- Elements ---
    const chatDisplay = document.getElementById('chat-display');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const voiceStatus = document.getElementById('voice-status');
    const dateDisplay = document.getElementById('date-display');

    const sectionTitle = document.getElementById('section-title');
    const apiKeyInput = document.getElementById('api-key');
    const systemInstructionInput = document.getElementById('system-instruction');
    const saveConfigBtn = document.getElementById('save-config');
    const configStatusDisplay = document.getElementById('config-status');

    // --- State ---
    let config = {
        apiKey: localStorage.getItem('sophia_api_key') || '',
        systemInstruction: localStorage.getItem('sophia_system_instruction') || ''
    };

    // Load initial values
    apiKeyInput.value = config.apiKey;
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

    document.querySelectorAll('nav li').forEach(li => {
        li.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(li.getAttribute('data-target'));
        });
    });

    // --- Gemini API Logic ---
    async function callGemini(prompt, isSystemCall = false) {
        if (!config.apiKey) return { error: "No hay API Key configurada" };
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: isSystemCall ? prompt : `Instrucción de Sistema: ${config.systemInstruction}\n\nUsuario dice: ${prompt}` }] }]
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.error) {
                return { error: data.error.message || "Error desconocido de Google" };
            }
            if (!data.candidates || !data.candidates[0]) {
                return { error: "Google no devolvió una respuesta válida. Revisa tu saldo o límites." };
            }

            return { text: data.candidates[0].content.parts[0].text };
        } catch (e) {
            return { error: "No hay conexión a internet o el servidor de Google está caído." };
        }
    }

    // --- Auto Analysis of Memory ---
    async function analyzeMemory() {
        if (!config.apiKey || !config.systemInstruction) return;

        const cards = document.querySelectorAll('.card-value');
        cards.forEach(c => c.innerText = "Analizando...");

        const extractionPrompt = `
        Analiza esta información: "${config.systemInstruction}"
        Responde estrictamente en formato JSON, sin texto extra:
        {
            "proyecto": "Nombre corto proyecto",
            "salud": "Glucosa/Colesterol",
            "bienestar": "Próximo paso",
            "detalles_proyectos": "Resumen HTML",
            "detalles_salud": "Tabla HTML",
            "detalles_bienestar": "Resumen HTML"
        }
        `;

        const result = await callGemini(extractionPrompt, true);

        if (result.error) {
            cards.forEach(c => c.innerText = "Error: " + result.error);
            console.error(result.error);
            return;
        }

        try {
            const cleanJson = result.text.replace(/```json|```/g, '').trim();
            const data = JSON.parse(cleanJson);

            document.querySelector('#card-project .card-value').innerText = data.proyecto || "No detectado";
            document.querySelector('#card-health .card-value').innerText = data.salud || "No detectado";
            document.querySelector('#card-wellness .card-value').innerText = data.bienestar || "No detectado";

            document.getElementById('projects-content').innerHTML = data.detalles_proyectos || "<p>Sin datos</p>";
            document.getElementById('health-content').innerHTML = data.detalles_salud || "<p>Sin datos</p>";
            document.getElementById('wellness-content').innerHTML = data.detalles_bienestar || "<p>Sin datos</p>";
        } catch (e) {
            cards.forEach(c => c.innerText = "Error de formato en la respuesta");
        }
    }

    if (config.apiKey && config.systemInstruction) analyzeMemory();

    // --- Configuration Logic ---
    saveConfigBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const testKey = apiKeyInput.value.trim();
        configStatusDisplay.innerText = "Verificando conexión...";
        configStatusDisplay.className = "config-status";

        // Probar conexión antes de guardar
        const testPrompt = "Hola, responde solo 'ok'";
        const API_URL_TEST = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${testKey}`;

        try {
            const resp = await fetch(API_URL_TEST, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: testPrompt }] }] })
            });
            const data = await resp.json();

            if (data.error) {
                configStatusDisplay.innerText = "Error: " + data.error.message;
                configStatusDisplay.className = "config-status error";
                return;
            }

            // Si funciona, guardar todo
            config.apiKey = testKey;
            config.systemInstruction = systemInstructionInput.value.trim();
            localStorage.setItem('sophia_api_key', config.apiKey);
            localStorage.setItem('sophia_system_instruction', config.systemInstruction);

            configStatusDisplay.innerText = "¡Conexión Exitosa! Sophia activada.";
            configStatusDisplay.className = "config-status success";

            analyzeMemory();
            setTimeout(() => switchView('dashboard'), 1500);

        } catch (e) {
            configStatusDisplay.innerText = "Error de red. Revisa tu internet.";
            configStatusDisplay.className = "config-status error";
        }
    });

    // --- Chat Logic ---
    const synth = window.speechSynthesis;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.onstart = () => { voiceStatus.innerText = "Escuchando..."; voiceBtn.classList.add('recording'); };
        recognition.onresult = (e) => { const t = e.results[0][0].transcript; userInput.value = t; handleMessage(t); };
        recognition.onend = () => { voiceStatus.innerText = "Micrófono inactivo"; voiceBtn.classList.remove('recording'); };
    }

    async function handleMessage(text) {
        if (!text.trim()) return;
        addMessage(text, 'user');
        userInput.value = '';
        const thinkingId = Date.now();
        addMessage("Sophia está pensando...", 'system', thinkingId);

        const result = await callGemini(text);
        const thinkingMsg = document.getElementById(thinkingId);

        if (result.error) {
            thinkingMsg.innerHTML = `<p style="color: red;">Error: ${result.error}</p>`;
        } else {
            thinkingMsg.innerHTML = `<p>${result.text}</p>`;
            const utter = new SpeechSynthesisUtterance(result.text);
            utter.lang = 'es-ES';
            synth.speak(utter);
        }
    }

    function addMessage(text, sender, id = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        if (id) msgDiv.id = id;
        msgDiv.innerHTML = `<p>${text}</p>`;
        chatDisplay.appendChild(msgDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    sendBtn.addEventListener('click', (e) => { e.preventDefault(); handleMessage(userInput.value); });
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleMessage(userInput.value); });
    voiceBtn.addEventListener('click', (e) => { e.preventDefault(); if (recognition) recognition.start(); });
});
