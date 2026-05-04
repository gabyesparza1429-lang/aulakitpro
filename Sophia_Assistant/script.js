document.addEventListener('DOMContentLoaded', () => {
    const chatDisplay = document.getElementById('chat-display');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const voiceStatus = document.getElementById('voice-status');
    const dateDisplay = document.getElementById('date-display');

    // Set Current Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.innerText = new Date().toLocaleDateString('es-ES', options);

    // --- Web Speech API Configuration ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synth = window.speechSynthesis;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            voiceStatus.innerText = "Escuchando...";
            voiceBtn.classList.add('recording');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            handleMessage(transcript);
        };

        recognition.onerror = (event) => {
            voiceStatus.innerText = "Error: " + event.error;
            stopRecognition();
        };

        recognition.onend = () => {
            stopRecognition();
        };
    } else {
        voiceBtn.style.display = 'none';
        voiceStatus.innerText = "Reconocimiento de voz no soportado";
    }

    function stopRecognition() {
        voiceStatus.innerText = "Micrófono inactivo";
        voiceBtn.classList.remove('recording');
    }

    // --- Message Handling ---
    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerHTML = `<p>${text}</p>`;
        chatDisplay.appendChild(msgDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;

        if (sender === 'system') {
            speak(text);
        }
    }

    function speak(text) {
        if (synth.speaking) {
            synth.cancel();
        }
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.lang = 'es-ES';
        utterThis.rate = 1.0;
        utterThis.pitch = 1.1; // Slightly higher pitch for Sophia
        synth.speak(utterThis);
    }

    function handleMessage(text) {
        if (!text.trim()) return;

        addMessage(text, 'user');
        userInput.value = '';

        // Simple Logic for the prototype
        setTimeout(() => {
            let response = "";
            const lowerText = text.toLowerCase();

            if (lowerText.includes('hola') || lowerText.includes('sophia')) {
                response = "Hola Gaby. Estoy lista. ¿Quieres revisar los resultados de la clínica o avanzar con NeuroClarity?";
            } else if (lowerText.includes('ya')) {
                response = "Entendido. Pasando al siguiente nivel de complejidad. ¿Procedemos con la tabla de glucosa?";
            } else if (lowerText.includes('salud') || lowerText.includes('glucosa')) {
                response = "Tus niveles actuales son: Glucosa 113, Colesterol 264. He preparado los espacios para Óscar y Michel. ¿Deseas ver la tabla de progreso?";
            } else if (lowerText.includes('gracias')) {
                response = "De nada, Gaby. Recuerda que mi misión es simplificar tu vida. ¿Algo más antes de terminar?";
            } else {
                response = "Recibido. Lo registro en el módulo correspondiente. Dime 'ya' cuando estés lista para el siguiente paso.";
            }

            addMessage(response, 'system');
        }, 1000);
    }

    // --- Event Listeners ---
    sendBtn.addEventListener('click', () => {
        handleMessage(userInput.value);
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleMessage(userInput.value);
        }
    });

    voiceBtn.addEventListener('click', () => {
        if (voiceBtn.classList.contains('recording')) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    // Navigation (Visual toggle)
    document.querySelectorAll('nav li').forEach(li => {
        li.addEventListener('click', () => {
            document.querySelectorAll('nav li').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            const target = li.getAttribute('data-target');
            document.getElementById('section-title').innerText = target.charAt(0).toUpperCase() + target.slice(1);
        });
    });
});
