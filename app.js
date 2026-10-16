// --- 1. CONFIGURACIÓN INICIAL Y VARIABLES GLOBALES ---
let synth = window.speechSynthesis;
let utterance = null;
let palabras = [];
let palabraIndex = 0;
let reproduciendo = false;
let tiempoInicio = 0;
let timerInterval = null;
let velocidadActual = 75;

// --- 2. CONTROL DE VELOCIDAD (SLIDER) ---
function actualizarVelocidad(val) {
    velocidadActual = parseInt(val);
    document.getElementById('lblVelocidad').innerText = `Velocidad: ${velocidadActual} PPM`;
}

// --- 3. CARGAR EJERCICIO DESDE EL MENÚ DESPLEGABLE (IDEAL PARA iPHONE) ---
function cargarEjercicioPreset(rutaArchivo) {
    if (!rutaArchivo) return;
    
    detenerLectura();

    // Descarga el archivo de texto seleccionado de la carpeta del proyecto
    fetch(rutaArchivo)
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el archivo.");
            return response.text();
        })
        .then(texto => {
            const textoLimpio = texto.trim();
            palabras = textoLimpio.split(/\s+/);
            palabraIndex = 0;
            
            document.getElementById('lblPalabras').innerText = `Palabras leídas: 0 / ${palabras.length}`;
            document.getElementById('palabraActual').innerText = "-";
            
            alert(`Ejercicio cargado con éxito (${palabras.length} palabras). ¡Listo para practicar!`);
        })
        .catch(error => {
            alert("Error al cargar el ejercicio. Verifica que el archivo exista en la carpeta 'ejercicios'.");
            console.error(error);
        });
}

// (Opcional) Mantener compatibilidad por si querés pegar texto manualmente desde la PC
function cargarTexto() {
    detenerLectura();
    const textoElemento = document.getElementById('textoEjercicio');
    if (!textoElemento) return;
    
    const texto = textoElemento.value.trim();
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
    document.getElementById('lblPalabras').innerText = `Palabras leídas: 0 / ${palabras.length if palabras.length > 0 else 0}`;
    document.getElementById('lblTiempo').innerText = "Tiempo: 00:00";
    document.getElementById('palabraActual').innerText = "-";
}

// --- 5. INICIO DEL DICTADO CON LECTURA FLUIDA Y NATURAL ---
function iniciarLectura() {
    if (palabras.length === 0) {
        alert("Primero selecciona o carga un ejercicio.");
        return;
    }
    if (reproduciendo) return;

    reproduciendo = true;
    palabraIndex = 0;

    // Unimos todas las palabras restantes para que el navegador las lea de corrido de forma natural
    const textoCompleto = palabras.slice(palabraIndex).join(" ");
    
    utterance = new SpeechSynthesisUtterance(textoCompleto);
    utterance.lang = 'es-AR'; // Español Argentina

    // CALIBRACIÓN DE FLUIDEZ:
    // Base normal del navegador de 125 PPM para una locución humana y fluida
    const baseNormalNavegador = 125;
    let factorFluido = velocidadActual / baseNormalNavegador;
    
    // Limitamos los extremos para asegurar compatibilidad total en iOS (Safari)
    utterance.rate = Math.max(0.3, Math.min(1.5, factorFluido));

    // Evento nativo del navegador para rastrear el avance palabra por palabra en tiempo real
    utterance.onboundary = (event) => {
        if (event.name === 'word') {
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

    // Arranca el cronómetro digital
    tiempoInicio = Date.now();
    timerInterval = setInterval(actualizarCronometro, 1000);

    // Reproduce la locución fluida
    synth.speak(utterance);
}

// --- 6. DETENCIÓN DE LA REPRODUCCIÓN ---
function detenerLectura() {
    reproduciendo = false;
    if (synth) {
        synth.cancel();
    }
    clearInterval(timerInterval);
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