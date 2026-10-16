// --- 1. CONFIGURACIÓN INICIAL Y VARIABLES GLOBALES ---
let synth = window.speechSynthesis; // Motor de voz nativo del navegador (ideal para Safari en iPhone)
let utterance = null;               // Contiene el texto y propiedades del dictado actual
let palabras = [];                  // Array donde se guardan todas las palabras del texto separadas
let palabraIndex = 0;               // Índice para llevar el control de la palabra actual
let reproduciendo = false;          // Bandera de estado de reproducción
let tiempoInicio = 0;               // Marca temporal de inicio para el cronómetro
let timerInterval = null;           // Control del intervalo del reloj en pantalla
let velocidadActual = 75;           // Velocidad por defecto en Palabras Por Minuto (PPM)

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
    // Divide el texto usando espacios o saltos de línea como separadores
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

// --- 5. INICIO DEL DICTADO ---
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

    // CALIBRACIÓN FINANCIADA DE VELOCIDAD:
    // Ajustado con divisor de 130 para que las velocidades de práctica (ej. 50-60 PPM) 
    // realenticen de forma correcta y fiel el motor de voz del celular.
    utterance.rate = Math.max(0.25, Math.min(1.5, velocidadActual / 130));

    // Evento que se dispara cada vez que el sintetizador pronuncia una palabra
    utterance.onboundary = (event) => {
        if (event.name === 'word') {
            if (palabraIndex < palabras.length) {
                // Actualiza en pantalla la palabra actual y el contador numérico
                document.getElementById('palabraActual').innerText = palabras[palabraIndex];
                document.getElementById('lblPalabras').innerText = `Palabras leídas: ${palabraIndex + 1} / ${palabras.length}`;
                palabraIndex++;
            }
        }
    };

    // Al terminar de leer todo el texto de forma natural
    utterance.onend = () => {
        detenerLectura();
    };

    // Arranca el cronómetro digital
    tiempoInicio = Date.now();
    timerInterval = setInterval(actualizarCronometro, 1000);

    // Ordena al navegador reproducir la voz
    synth.speak(utterance);
}

// --- 6. DETENCIÓN DE LA REPRODUCCIÓN ---
function detenerLectura() {
    reproduciendo = false;
    if (synth) {
        synth.cancel(); // Cancela cualquier síntesis de voz activa
    }
    clearInterval(timerInterval); // Detiene el reloj
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