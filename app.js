// --- 1. CONFIGURACIÓN INICIAL Y VARIABLES GLOBALES ---
let synth = window.speechSynthesis;
let palabras = [];
let palabraIndex = 0;
let reproduciendo = false;
let tiempoInicio = 0;
let timerInterval = null;
let velocidadActual = 75;
let timeoutPalabra = null;

// --- 2. CONTROL DE VELOCIDAD (SLIDER) ---
function actualizarVelocidad(val) {
    velocidadActual = parseInt(val);
    document.getElementById('lblVelocidad').innerText = `Velocidad: ${velocidadActual} PPM`;
}

// --- 3. CARGA Y PARTICIÓN DEL TEXTO ---
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

// --- 4. REINICIO DE CONTADORES ---
function puestaEnCero() {
    detenerLectura();
    palabraIndex = 0;
    document.getElementById('lblPalabras').innerText = `Palabras leídas: 0 / ${palabras.length}`;
    document.getElementById('lblTiempo').innerText = "Tiempo: 00:00";
    document.getElementById('palabraActual').innerText = "-";
}

// --- 5. INICIO DEL DICTADO CON RITMO EXACTO Y ACTUALIZACIÓN VISUAL ---
function iniciarLectura() {
    if (palabras.length === 0) {
        alert("Primero carga o pega un texto.");
        return;
    }
    if (reproduciendo) return;

    reproduciendo = true;
    palabraIndex = 0;
    tiempoInicio = Date.now();
    timerInterval = setInterval(actualizarCronometro, 1000);

    siguientePalabraRitmoExacto();
}

function siguientePalabraRitmoExacto() {
    if (!reproduciendo || palabraIndex >= palabras.length) {
        if (palabraIndex >= palabras.length) {
            // Pausar un segundo al finalizar y limpiar
            setTimeout(detenerLectura, 1000);
        }
        return;
    }

    const palabraActual = palabras[palabraIndex];
    
    // --- ACTUALIZACIÓN VISUAL EN TIEMPO REAL ---
    document.getElementById('palabraActual').innerText = palabraActual;
    document.getElementById('lblPalabras').innerText = `Palabras leídas: ${palabraIndex + 1} / ${palabras.length}`;

    // Pronunciar la palabra actual de forma limpia mediante la síntesis de voz nativa
    if (synth) {
        synth.cancel(); // Limpia la cola anterior de audio
        let utterance = new SpeechSynthesisUtterance(palabraActual);
        utterance.lang = 'es-AR';
        utterance.rate = 1.0; // Velocidad natural para la locución de la palabra individual
        synth.speak(utterance);
    }

    palabraIndex++;

    // --- CÁLCULO MATEMÁTICO ESTRICTO DE TIEMPO POR PALABRA ---
    // Fórmula exacta: (60 segundos / Palabras Por Minuto) * 1000 milisegundos
    const milisegundosPorPalabra = (60 / velocidadActual) * 1000;

    // Programa la siguiente ejecución respetando el compás exacto de las PPM
    timeoutPalabra = setTimeout(siguientePalabraRitmoExacto, milisegundosPorPalabra);
}

// --- 6. DETENCIÓN DE LA REPRODUCCIÓN ---
function detenerLectura() {
    reproduciendo = false;
    if (synth) {
        synth.cancel();
    }
    clearInterval(timerInterval);
    clearTimeout(timeoutPalabra);
}

// --- 7. ACTUALIZACIÓN DEL CRONÓMETRO ---
function actualizarCronometro() {
    const transcurrido = Math.floor((Date.now() - tiempoInicio) / 1000);
    const minutos = String(Math.floor(transcurrido / 60)).padStart(2, '0');
    const segundos = String(transcurrido % 60).padStart(2, '0');
    document.getElementById('lblTiempo').innerText = `Tiempo: ${minutos}:${segundos}`;
}

// --- 8. REGISTRO DEL SERVICE WORKER (PWA) ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}