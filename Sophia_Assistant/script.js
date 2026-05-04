document.addEventListener('DOMContentLoaded', () => {
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
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));

        const viewId = `${target}-view`;
        const targetView = document.getElementById(viewId);
        const navItem = document.querySelector(`nav li[data-target="${target}"]`);

        if (targetView) {
            targetView.classList.add('active');
            if (navItem) navItem.classList.add('active');
            sectionTitle.innerText = navItem ? navItem.innerText.trim() : "Dashboard";
        }
    }

    document.querySelectorAll('nav li').forEach(li => {
        li.addEventListener('click', () => switchView(li.getAttribute('data-target')));
    });

    // --- Gemini API Logic ---
    async function callGemini(prompt, isSystemCall = false) {
        if (!config.apiKey) return null;
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
            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    // --- Auto Analysis of Memory ---
    async function analyzeMemory() {
        if (!config.apiKey || !config.systemInstruction) return;

        console.log("Sophia analizando memoria...");

        const extractionPrompt = `
        Analiza esta información: "${config.systemInstruction}"
        Extrae y responde exclusivamente en este formato JSON, sin texto extra:
        {
            "proyecto": "Nombre corto del proyecto actual",
            "salud": "Glucosa y Colesterol actual",
            "bienestar": "Próximo paso en Lote 71",
            "detalles_proyectos": "Resumen en HTML para lista",
            "detalles_salud": "Tabla HTML con indicadores",
            "detalles_bienestar": "Resumen HTML de Lote 71"
        }
        `;

        const rawJson = await callGemini(extractionPrompt, true);
        if (rawJson) {
            try {
                // Limpiar posible formato markdown de la IA
                const cleanJson = rawJson.replace(/```json|```/g, '').trim();
                const data = JSON.parse(cleanJson);

                // Actualizar Dashboard
                document.querySelector('#card-project .card-value').innerText = data.proyecto;
                document.querySelector('#card-health .card-value').innerText = data.salud;
                document.querySelector('#card-wellness .card-value').innerText = data.bienestar;

                // Actualizar Vistas
                document.getElementById('projects-content').innerHTML = data.detalles_proyectos;
                document.getElementById('health-content').innerHTML = data.detalles_salud;
                document.getElementById('wellness-content').innerHTML = data.detalles_bienestar;

            } catch (e) {
                console.error("Error parseando memoria", e);
            }
        }
    }

    // Initial analysis
    analyzeMemory();

    // --- Configuration Logic ---
    saveConfigBtn.addEventListener('click', () => {
        config.apiKey = apiKeyInput.value.trim();
        config.systemInstruction = systemInstructionInput.value.trim();
        localStorage.setItem('sophia_api_key', config.apiKey);
        localStorage.setItem('sophia_system_instruction', config.systemInstruction);
        configStatusDisplay.innerText = "¡Cerebro actualizado!";
        configStatusDisplay.className = "config-status success";
        analyzeMemory();
        setTimeout(() => {
            configStatusDisplay.innerText = "";
            switchView('dashboard');
        }, 1500);
    });

    // --- Chat & Voice Logic ---
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

        const responseText = await callGemini(text);
        const thinkingMsg = document.getElementById(thinkingId);
        if (thinkingMsg) thinkingMsg.innerHTML = `<p>${responseText || 'Error de conexión'}</p>`;
        if (responseText) {
            const utter = new SpeechSynthesisUtterance(responseText);
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

    sendBtn.addEventListener('click', () => handleMessage(userInput.value));
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleMessage(userInput.value); });
    voiceBtn.addEventListener('click', () => { if (recognition) recognition.start(); });
});
