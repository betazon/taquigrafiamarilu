let synth = window.speechSynthesis;
let utterance = null;
let palabras = [];
let palabraIndex = 0;
let reproduciendo = false;
let tiempoInicio = 0;
let timerInterval = null;
let velocidadActual = 75;

function actualizarVelocidad(val) {
    velocidadActual = parseInt(val);
    document.getElementById('lblVelocidad').innerText = `Velocidad: ${velocidadActual} PPM`;
}

function cargarTexto() {
    detenerLectura();
    const texto = document.getElementById('textoEjercicio').value.trim();
    if (!texto) {
        alert("Por favor ingresa o pega un texto.");
        return;
    }
    palabras = texto.split(/\s+/);
    palabraIndex = 0;
    document.getElementById('lblPalabras').innerText = `Palabras leídas: 0 / ${palabras.length}`;
    document.getElementById('palabraActual').innerText = "-";
    alert(`Texto cargado correctamente (${palabras.length} palabras).`);
}

function puestaEnCero() {
    detenerLectura();
    palabraIndex = 0;
    document.getElementById('lblPalabras').innerText = `Palabras leídas: 0 / ${palabras.length}`;
    document.getElementById('lblTiempo').innerText = "Tiempo: 00:00";
    document.getElementById('palabraActual').innerText = "-";
}

function iniciarLectura() {
    if (palabras.length === 0) {
        alert("Primero carga o pega un texto.");
        return;
    }
    if (reproduciendo) return;

    reproduciendo = true;
    const textoCompleto = palabras.slice(palabraIndex).join(" ");
    utterance = new SpeechSynthesisUtterance(textoCompleto);
    utterance.lang = 'es-AR'; // Español Argentina

    // Ajustar velocidad en Web Speech API (en iOS el valor por defecto es 1.0)
    // Mapeamos 40-180 PPM a un factor de velocidad aproximado (75 PPM ~ 0.8x, etc.)
    utterance.rate = Math.max(0.5, Math.min(2.0, velocidadActual / 90));

    utterance.onboundary = (event) => {
        if (event.name === 'word') {
            // Intentar rastrear la palabra leída de forma aproximada por caracteres/índices
            // O llevar un conteo secuencial basado en el evento
            if (palabraIndex < palabras.length) {
                document.getElementById('palabraActual').innerText = palabras[palabraIndex];
                document.getElementById('lblPalabras').innerText = `Palabras leídas: ${palabraIndex + 1} / ${palabras.length}`;
                palabraIndex++;
            }
        }
    };

    utterance.onend = () => {
        detenerLectura();
    };

    tiempoInicio = Date.now();
    timerInterval = setInterval(actualizarCronometro, 1000);

    synth.speak(utterance);
}

function detenerLectura() {
    reproduciendo = false;
    if (synth) {
        synth.cancel();
    }
    clearInterval(timerInterval);
}

function actualizarCronometro() {
    const transcurrido = Math.floor((Date.now() - tiempoInicio) / 1000);
    const minutos = String(Math.floor(transcurrido / 60)).padStart(2, '0');
    const segundos = String(transcurrido % 60).padStart(2, '0');
    document.getElementById('lblTiempo').innerText = `Tiempo: ${minutos}:${segundos}`;
}

// Registrar el Service Worker para que sea PWA instalable
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}