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

// --- 5. INICIO DEL DICTADO CON RITMO EXACTO POR PALABRA ---
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
            // Esperar un segundo y detener al terminar la última palabra
            setTimeout(detenerLectura, 1000);
        }
        return;
    }

    const palabraActual = palabras[palabraIndex];
    
    // Actualizar interfaz visual
    document.getElementById('palabraActual').innerText = palabraActual;
    document.getElementById('lblPalabras').innerText = `Palabras leídas: ${palabraIndex + 1} / ${palabras.length}`;

    // Pronunciar solo la palabra actual de manera limpia
    if (synth) {
        synth.cancel(); // Limpiar cola anterior
        let utterance = new SpeechSynthesisUtterance(palabraActual);
        utterance.lang = 'es-AR';
        utterance.rate = 1.0; // Velocidad normal de locución por palabra
        synth.speak(utterance);
    }

    palabraIndex++;

    // CÁLCULO MATEMÁTICO ESTRICTO DE TIEMPO POR PALABRA:
    // Si velocidadActual es X palabras por minuto, cada palabra debe tardar (60 / X) segundos.
    // Lo pasamos a milisegundos multiplicando por 1000.
    const milisegundosPorPalabra = (60 / velocidadActual) * 1000;

    // Programar el llamado a la siguiente palabra respetando el cronómetro exacto
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