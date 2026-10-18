// --- 1. CONFIGURACIÓN INICIAL Y VARIABLES GLOBALES ---
let synth = window.speechSynthesis;
let utterance = null;
let palabras = [];
let palabraIndex = 0;
let reproduciendo = false;
let tiempoInicio = 0;
let timerInterval = null;
let lecturaInterval = null;
let velocidadActual = 75;

// Configurar el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// --- 2. CONTROL DE VELOCIDAD (SLIDER) ---
function actualizarVelocidad(val) {
    velocidadActual = parseInt(val);
    document.getElementById('lblVelocidad').innerText = `Velocidad: ${velocidadActual} PPM`;
    
    if (reproduciendo) {
        iniciarIntervaloLectura();
    }
}

// --- 3. CARGAR PDF DIRECTO DESDE EL CELULAR ---
async function cargarPdfMovil(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    detenerLectura();

    try {
        const arrayBuffer = await archivo.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        
        let textoCompleto = "";

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const pagina = await pdfDoc.getPage(i);
            const contenido = await pagina.getTextContent();
            const textItems = contenido.items.map(item => item.str);
            textoCompleto += textItems.join(" ") + " ";
        }

        const textoLimpio = textoCompleto.trim();
        if (!textoLimpio) {
            alert("El PDF parece estar vacío o protegido.");
            return;
        }

        palabras = textoLimpio.split(/\s+/);
        palabraIndex = 0;
        
        document.getElementById('lblPalabras').innerText = `Palabras leídas: 0 / ${palabras.length}`;
        document.getElementById('palabraActual').innerText = "-";
        document.getElementById('boxTextoCompleto').innerText = palabras.join(" ");
        
        alert(`PDF cargado con éxito (${palabras.length} palabras). ¡Listo para practicar!`);

    } catch (error) {
        alert("Error al leer el archivo PDF. Asegúrate de que sea un archivo válido.");
        console.error(error);
    }
}

// --- 4. REINICIO DE CONTADORES ---
function puestaEnCero() {
    detenerLectura();
    palabraIndex = 0;
    const total = palabras.length > 0 ? palabras.length : 0;
    document.getElementById('lblPalabras').innerText = `Palabras leídas: 0 / ${total}`;
    document.getElementById('lblTiempo').innerText = "Tiempo: 00:00";
    document.getElementById('palabraActual').innerText = "-";
}

// --- 5. INICIO DEL DICTADO ---
function iniciarLectura() {
    if (palabras.length === 0) {
        alert("Primero selecciona un archivo PDF.");
        return;
    }
    if (reproduciendo) return;

    reproduciendo = true;
    if (palabraIndex >= palabras.length) {
        palabraIndex = 0;
    }

    const textoCompleto = palabras.slice(palabraIndex).join(" ");
    
    utterance = new SpeechSynthesisUtterance(textoCompleto);
    utterance.lang = 'es-AR';

    const baseNormalNavegador = 125;
    let factorFluido = velocidadActual / baseNormalNavegador;
    utterance.rate = Math.max(0.3, Math.min(1.5, factorFluido));

    utterance.onend = () => {
        detenerLectura();
    };

    tiempoInicio = Date.now();
    timerInterval = setInterval(actualizarCronometro, 1000);

    synth.speak(utterance);
    iniciarIntervaloLectura();
}

function iniciarIntervaloLectura() {
    if (lecturaInterval) clearInterval(lecturaInterval);

    const msPorPalabra = (60 / velocidadActual) * 1000;

    lecturaInterval = setInterval(() => {
        if (!reproduciendo) return;

        if (palabraIndex < palabras.length) {
            document.getElementById('palabraActual').innerText = palabras[palabraIndex];
            document.getElementById('lblPalabras').innerText = `Palabras leídas: ${palabraIndex + 1} / ${palabras.length}`;
            palabraIndex++;
        } else {
            detenerLectura();
        }
    }, msPorPalabra);
}

// --- 6. DETENCIÓN DE LA REPRODUCCIÓN ---
function detenerLectura() {
    reproduciendo = false;
    if (synth) {
        synth.cancel();
    }
    clearInterval(timerInterval);
    clearInterval(lecturaInterval);
}

// --- 7. CRONÓMETRO ---
function actualizarCronometro() {
    const transcurrido = Math.floor((Date.now() - tiempoInicio) / 1000);
    const minutos = String(Math.floor(transcurrido / 60)).padStart(2, '0');
    const segundos = String(transcurrido % 60).padStart(2, '0');
    document.getElementById('lblTiempo').innerText = `Tiempo: ${minutos}:${segundos}`;
}

// --- 8. MOSTRAR / OCULTAR EL TEXTO CARGADO ---
function mostrarTextoCargado() {
    const box = document.getElementById('boxTextoCompleto');
    if (palabras.length === 0) {
        alert("Primero selecciona un archivo PDF.");
        return;
    }

    if (box.style.display === 'block') {
        box.style.display = 'none';
    } else {
        box.style.display = 'block';
    }
}

// --- 9. CONFIGURACIÓN DEL SLIDER AL INICIAR ---
window.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('rangeVelocidad');
    if (slider) {
        slider.min = 60;
        slider.max = 180;
        slider.value = 75;
        actualizarVelocidad(75);
    }
});

// --- 10. SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}