document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const chatDisplay = document.getElementById('chat-display');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const voiceStatus = document.getElementById('voice-status');
    const dateDisplay = document.getElementById('date-display');

    const configBtn = document.querySelector('[data-target="config"]');
    const dashboardBtn = document.querySelector('[data-target="dashboard"]');
    const dashboardView = document.getElementById('dashboard-view');
    const configView = document.getElementById('config-view');
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

    // Load initial values into form
    apiKeyInput.value = config.apiKey;
    systemInstructionInput.value = config.systemInstruction;

    // Set Current Date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.innerText = new Date().toLocaleDateString('es-ES', dateOptions);

    // --- Navigation Logic ---
    function switchView(target) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));

        if (target === 'config') {
            configView.classList.add('active');
            configBtn.classList.add('active');
            sectionTitle.innerText = "Configurar Cerebro";
        } else {
            dashboardView.classList.add('active');
            dashboardBtn.classList.add('active');
            sectionTitle.innerText = "Dashboard";
        }
    }

    configBtn.addEventListener('click', () => switchView('config'));
    dashboardBtn.addEventListener('click', () => switchView('dashboard'));

    // Other nav items (visual only for now)
    document.querySelectorAll('nav li:not(.config-nav):not([data-target="dashboard"])').forEach(li => {
        li.addEventListener('click', () => {
            switchView('dashboard');
            sectionTitle.innerText = li.innerText.trim();
        });
    });

    // --- Configuration Logic ---
    saveConfigBtn.addEventListener('click', () => {
        config.apiKey = apiKeyInput.value.trim();
        config.systemInstruction = systemInstructionInput.value.trim();

        localStorage.setItem('sophia_api_key', config.apiKey);
        localStorage.setItem('sophia_system_instruction', config.systemInstruction);

        configStatusDisplay.innerText = "¡Cerebro activado y guardado correctamente!";
        configStatusDisplay.className = "config-status success";

        setTimeout(() => {
            configStatusDisplay.innerText = "";
            switchView('dashboard');
        }, 2000);
    });

    // --- Gemini API Logic ---
    async function askGemini(prompt) {
        if (!config.apiKey) {
            return "Gaby, aún no has configurado mi 'Cerebro'. Por favor, ve a la sección de Configuración y pega tu API Key de Google.";
        }

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.apiKey}`;

        const systemPrompt = `Instrucción de Sistema: ${config.systemInstruction}\n\nUsuario dice: ${prompt}`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: systemPrompt }] }]
                })
            });

            const data = await response.json();
            if (data.error) {
                console.error(data.error);
                return "Hubo un error con mi cerebro (API). Por favor, revisa tu API Key.";
            }
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error(error);
            return "No puedo conectarme con Google en este momento. Revisa tu internet.";
        }
    }

    // --- Web Speech API ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synth = window.speechSynthesis;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.onstart = () => {
            voiceStatus.innerText = "Escuchando...";
            voiceBtn.classList.add('recording');
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            handleMessage(transcript);
        };
        recognition.onend = () => {
            voiceStatus.innerText = "Micrófono inactivo";
            voiceBtn.classList.remove('recording');
        };
    }

    function speak(text) {
        if (synth.speaking) synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'es-ES';
        utter.rate = 1.0;
        synth.speak(utter);
    }

    // --- Message Handling ---
    async function handleMessage(text) {
        if (!text.trim()) return;

        addMessage(text, 'user');
        userInput.value = '';

        // Add "thinking" state
        const thinkingId = Date.now();
        addMessage("Sophia está pensando...", 'system', thinkingId);

        const responseText = await askGemini(text);

        // Replace thinking message
        const thinkingMsg = document.getElementById(thinkingId);
        if (thinkingMsg) thinkingMsg.innerHTML = `<p>${responseText}</p>`;

        speak(responseText);
    }

    function addMessage(text, sender, id = null) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        if (id) msgDiv.id = id;
        msgDiv.innerHTML = `<p>${text}</p>`;
        chatDisplay.appendChild(msgDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    // --- Listeners ---
    sendBtn.addEventListener('click', () => handleMessage(userInput.value));
    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleMessage(userInput.value); });
    voiceBtn.addEventListener('click', () => {
        if (recognition) recognition.start();
    });
});
