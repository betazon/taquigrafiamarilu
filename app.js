// --- 1. CONFIGURACIÓN INICIAL Y VARIABLES GLOBALES ---
let synth = window.speechSynthesis;
let utterance = null;
let palabras = [];
let palabraIndex = 0;
let reproduciendo = false;
let tiempoInicio = 0;
let timerInterval = null;
let velocidadActual = 75;

// Configurar el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// --- 2. CONTROL DE VELOCIDAD (SLIDER) ---
function actualizarVelocidad(val) {
    velocidadActual = parseInt(val);
    document.getElementById('lblVelocidad').innerText = `Velocidad: ${velocidadActual} PPM`;
}

// --- 3. CARGAR PDF DIRECTO DESDE EL CELULAR (WHATSAPP / ARCHIVOS) ---
async function cargarPdfMovil(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    detenerLectura();

    try {
        const arrayBuffer = await archivo.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        
        let textoCompleto = "";

        // Extraer texto de todas las páginas del PDF
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

// --- 5. INICIO DEL DICTADO CON LECTURA FLUIDA Y NATURAL ---
function iniciarLectura() {
    if (palabras.length === 0) {
        alert("Primero selecciona un archivo PDF.");
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