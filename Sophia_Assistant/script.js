document.addEventListener('DOMContentLoaded', () => {
    console.log("Sophia Iniciada");

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
        console.log("Cambiando a vista:", target);

        // Hide all views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
            v.style.display = 'none';
        });

        // Remove active class from all nav items
        document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));

        const viewId = `${target}-view`;
        const targetView = document.getElementById(viewId);
        const navItem = document.querySelector(`nav li[data-target="${target}"]`);

        if (targetView) {
            targetView.classList.add('active');
            targetView.style.display = 'block';
            if (navItem) navItem.classList.add('active');
            sectionTitle.innerText = navItem ? navItem.innerText.trim() : "Dashboard";
        } else {
            // Fallback to dashboard
            const dash = document.getElementById('dashboard-view');
            dash.classList.add('active');
            dash.style.display = 'block';
            document.querySelector('nav li[data-target="dashboard"]').classList.add('active');
            sectionTitle.innerText = "Dashboard";
        }
    }

    // Attach click events to nav items
    document.querySelectorAll('nav li').forEach(li => {
        li.addEventListener('click', (e) => {
            e.preventDefault();
            const target = li.getAttribute('data-target');
            if (target) switchView(target);
        });
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
            if (data.error) throw new Error(data.error.message);
            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            console.error("Error API Gemini:", e);
            return null;
        }
    }

    // --- Auto Analysis of Memory ---
    async function analyzeMemory() {
        if (!config.apiKey || !config.systemInstruction) {
            console.log("Falta configuración para analizar memoria");
            return;
        }

        console.log("Sophia analizando memoria...");

        const cards = document.querySelectorAll('.card-value');
        cards.forEach(c => c.innerText = "Analizando...");

        const extractionPrompt = `
        Analiza esta información: "${config.systemInstruction}"
        Extrae y responde exclusivamente en este formato JSON, sin texto extra:
        {
            "proyecto": "Nombre corto del proyecto actual",
            "salud": "Glucosa y Colesterol actual",
            "bienestar": "Próximo paso en Lote 71",
            "detalles_proyectos": "Resumen en HTML (usa <ul> y <li>)",
            "detalles_salud": "Tabla HTML (usa <table>, <tr>, <td>) con indicadores",
            "detalles_bienestar": "Resumen HTML de Lote 71"
        }
        `;

        const rawJson = await callGemini(extractionPrompt, true);
        if (rawJson) {
            try {
                const cleanJson = rawJson.replace(/```json|```/g, '').trim();
                const data = JSON.parse(cleanJson);

                // Actualizar Dashboard
                document.querySelector('#card-project .card-value').innerText = data.proyecto || "No detectado";
                document.querySelector('#card-health .card-value').innerText = data.salud || "No detectado";
                document.querySelector('#card-wellness .card-value').innerText = data.bienestar || "No detectado";

                // Actualizar Vistas
                document.getElementById('projects-content').innerHTML = data.detalles_proyectos || "<p>Sin datos</p>";
                document.getElementById('health-content').innerHTML = data.detalles_salud || "<p>Sin datos</p>";
                document.getElementById('wellness-content').innerHTML = data.detalles_bienestar || "<p>Sin datos</p>";

            } catch (e) {
                console.error("Error parseando memoria:", e);
                cards.forEach(c => c.innerText = "Error de formato");
            }
        } else {
            cards.forEach(c => c.innerText = "Error de conexión");
        }
    }

    // Initial analysis
    if (config.apiKey && config.systemInstruction) {
        analyzeMemory();
    }

    // --- Configuration Logic ---
    saveConfigBtn.addEventListener('click', (e) => {
        e.preventDefault();
        config.apiKey = apiKeyInput.value.trim();
        config.systemInstruction = systemInstructionInput.value.trim();

        if (!config.apiKey) {
            alert("Por favor ingresa tu API Key");
            return;
        }

        localStorage.setItem('sophia_api_key', config.apiKey);
        localStorage.setItem('sophia_system_instruction', config.systemInstruction);

        configStatusDisplay.innerText = "¡Cerebro actualizado y guardado!";
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
        if (thinkingMsg) thinkingMsg.innerHTML = `<p>${responseText || 'Lo siento Gaby, tuve un problema al procesar eso. Revisa tu conexión.'}</p>`;

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

    sendBtn.addEventListener('click', (e) => { e.preventDefault(); handleMessage(userInput.value); });
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleMessage(userInput.value); });
    voiceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (recognition) {
            try {
                recognition.start();
            } catch(e) {
                console.log("Reconocimiento ya activo");
            }
        }
    });
});
