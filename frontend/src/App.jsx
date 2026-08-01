import { useState, useRef, useEffect } from "react";

const API_BASE = "http://localhost:8000";

// SVG Icons components
const Icons = {
  Microphone: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  Pause: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Play: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Stop: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v4H9z" />
    </svg>
  ),
  Settings: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Plus: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Volume2: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  ),
  VolumeX: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zm10.414-4.586l2.828 2.828m0-2.828l-2.828 2.828" />
    </svg>
  ),
  ArrowLeft: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Sparkles: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  TrendingUp: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  TrendingDown: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
    </svg>
  ),
  Calendar: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 3V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  ChevronDown: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  AlertCircle: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Edit: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Text: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
  Refresh: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
    </svg>
  ),
  Close: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Info: ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width="24" height="24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

export default function App() {
  const [fase, setFase] = useState("inicio"); // inicio | grabando | procesando | resumen
  const [resultado, setResultado] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [tiempoGrabacion, setTiempoGrabacion] = useState(0);
  const [errorText, setErrorText] = useState("");
  
  // Custom manual text entry state
  const [mostrarManual, setMostrarManual] = useState(false);
  const [textoManual, setTextoManual] = useState("");
  const [fechaManual, setFechaManual] = useState("");

  // States for recording pause/resume and Text-To-Speech
  const [isPaused, setIsPaused] = useState(false);
  const [reproduciendoVoz, setReproduciendoVoz] = useState(false);

  // Onboarding & custom products states
  const [onboardingCompletado, setOnboardingCompletado] = useState(
    localStorage.getItem("changarro_onboarding_completado") === "true"
  );
  const [onboardingFase, setOnboardingFase] = useState("eleccion"); // eleccion | grabando_config | procesando_config | formulario
  const [menuEditable, setMenuEditable] = useState([]);
  const [textoManualConfig, setTextoManualConfig] = useState("");
  const [mostrarConfigManual, setMostrarConfigManual] = useState(false);
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [tipoGrabacion, setTipoGrabacion] = useState("diario"); // diario | config

  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const timerInterval = useRef(null);
  const audioPlaybackRef = useRef(null);

  // Load savings history and verify onboarding status on start
  useEffect(() => {
    verificarMenuYHistorial();
  }, []);

  const verificarMenuYHistorial = async () => {
    try {
      const resMenu = await fetch(`${API_BASE}/api/menu`);
      if (resMenu.ok) {
        const menu = await resMenu.json();
        if (menu.length === 0) {
          localStorage.removeItem("changarro_onboarding_completado");
          setOnboardingCompletado(false);
        } else {
          cargarHistorial();
        }
      } else {
        cargarHistorial();
      }
    } catch (err) {
      console.error("Error al verificar menú inicial:", err);
      cargarHistorial();
    }
  };

  const cargarHistorial = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dias-guardados`);
      if (res.ok) {
        const data = await res.json();
        setHistorial(data);
      }
    } catch (err) {
      console.error("Error al cargar historial:", err);
    }
  };

  // Start micro recording
  async function iniciarGrabacion(tipo = "diario") {
    setErrorText("");
    setResultado(null);
    setAudioUrl("");
    setIsPaused(false);
    setTipoGrabacion(tipo);
    
    // Stop any ongoing narration
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setReproduciendoVoz(false);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        if (tipo === "config") {
          procesarAudioConfig(blob, "config.webm");
        } else {
          procesarAudio(blob, "grabacion.webm");
        }
      };

      mediaRecorder.current.start();
      if (tipo === "config") {
        setOnboardingFase("grabando_config");
      } else {
        setFase("grabando");
      }
      setTiempoGrabacion(0);
      timerInterval.current = setInterval(() => {
        setTiempoGrabacion((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
      setErrorText("No pudimos acceder a tu micrófono. ¿Permitiste los accesos? Puedes usar el modo texto abajo.");
    }
  }

  function detenerGrabacion() {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      clearInterval(timerInterval.current);
      setIsPaused(false);
    }
  }

  // Pause recording
  function pausarGrabacion() {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.pause();
      setIsPaused(true);
      clearInterval(timerInterval.current);
    }
  }

  // Resume recording
  function reanudarGrabacion() {
    if (mediaRecorder.current && mediaRecorder.current.state === "paused") {
      mediaRecorder.current.resume();
      setIsPaused(false);
      timerInterval.current = setInterval(() => {
        setTiempoGrabacion((prev) => prev + 1);
      }, 1000);
    }
  }

  // Text-To-Speech (Voz) Helper using Web Speech API
  function hablarTexto(texto) {
    if (!("speechSynthesis" in window)) return;

    if (reproduciendoVoz) {
      window.speechSynthesis.cancel();
      setReproduciendoVoz(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "es-MX";

    utterance.onend = () => {
      setReproduciendoVoz(false);
    };
    utterance.onerror = (e) => {
      console.error("Error en SpeechSynthesis:", e);
      setReproduciendoVoz(false);
    };

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => voice.lang.includes("es-MX") || voice.lang.includes("es-"));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    setReproduciendoVoz(true);
    window.speechSynthesis.speak(utterance);
  }

  // Upload recording to backend
  async function procesarAudio(audioBlob, filename, fecha = null) {
    setFase("procesando");
    const form = new FormData();
    form.append("audio", audioBlob, filename);
    if (fecha) {
      form.append("fecha", fecha);
    }

    try {
      const res = await fetch(`${API_BASE}/api/registrar-dia`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error en el servidor");
      }

      const data = await res.json();
      setResultado(data);
      setFase("resumen");
      cargarHistorial();
      // Clear insights after recording new data
      setInsights(null);
      hablarTexto(data.resumen);
    } catch (err) {
      console.error("Error al procesar audio:", err);
      setErrorText(err.message || "Error de red al conectar con el backend.");
      setFase("inicio");
    }
  }

  // Send manual text entry
  async function enviarTextoManual() {
    if (!textoManual.trim()) return;
    setFase("procesando");
    setErrorText("");

    const form = new FormData();
    form.append("transcripcion_manual", textoManual);
    if (fechaManual) {
      form.append("fecha", fechaManual);
    }

    try {
      const res = await fetch(`${API_BASE}/api/registrar-dia`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error en el servidor");
      }

      const data = await res.json();
      setResultado(data);
      setFase("resumen");
      setTextoManual("");
      cargarHistorial();
      setInsights(null);
      hablarTexto(data.resumen);
    } catch (err) {
      console.error("Error al procesar texto manual:", err);
      setErrorText(err.message || "Error al enviar la nota de texto.");
      setFase("inicio");
    }
  }

  // Demo audios handler
  async function probarConDemo(diaNum) {
    setErrorText("");
    setResultado(null);
    setFase("procesando");
    
    // Play the audio for the user first to make the demo immersive!
    const audioFilename = `dia${diaNum}.mp3`;
    const audioPath = `/demo_audios/${audioFilename}`;
    setAudioUrl(audioPath);
    
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.src = audioPath;
      audioPlaybackRef.current.play().catch(e => console.log("Auto-playback blocked/failed, proceeding to backend."));
    }

    try {
      // Fetch the audio file from public folder
      const audioResponse = await fetch(audioPath);
      if (!audioResponse.ok) {
        throw new Error("No se pudo cargar el audio demo del servidor frontend.");
      }
      const blob = await audioResponse.blob();

      // Determine date offset: Dia 1 is Monday (-2 days), Dia 2 is Tuesday (-1 day), Dia 3 is Wednesday (Today)
      const offsetDays = diaNum === 1 ? -2 : diaNum === 2 ? -1 : 0;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + offsetDays);
      const targetDateStr = targetDate.toISOString().split("T")[0];

      // Send to backend
      await procesarAudio(blob, audioFilename, targetDateStr);
    } catch (err) {
      console.error("Error en demo:", err);
      setErrorText(`Error al cargar el demo ${diaNum}: ${err.message}`);
      setFase("inicio");
    }
  }

  // Prepopulate Monday and Tuesday demo data instantly to verify weekly insights
  async function precargarHistorialDemo() {
    setLoadingInsights(true);
    setErrorText("");
    
    // Create base dates
    const date1 = new Date();
    date1.setDate(date1.getDate() - 2);
    const date1Str = date1.toISOString().split("T")[0];

    const date2 = new Date();
    date2.setDate(date2.getDate() - 1);
    const date2Str = date2.toISOString().split("T")[0];

    const demoPayload = [
      {
        fecha: date1Str,
        transcripcion: "Pues hoy estuvo tranquilo, vendí como 20 de rajas y 15 de frijol, el mole casi no se movió, me sobraron como 8. Gasté 180 en gas y 50 en tortillas."
      },
      {
        fecha: date2Str,
        transcripcion: "Hoy sí estuvo bueno, se me acabó todo el picadillo bien rápido, tuve que hacer más rajas a medio día porque también se acabaron. El chicharrón otra vez me sobró harto. Gasté 200 en insumos y 40 en bolsas."
      }
    ];

    try {
      const res = await fetch(`${API_BASE}/api/cargar-demo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(demoPayload)
      });

      if (res.ok) {
        await cargarHistorial();
        // Trigger weekly insights automatically now that we have data
        await verInsightsSemana();
      } else {
        throw new Error("No se pudo precargar la información de prueba.");
      }
    } catch (err) {
      console.error("Error al precargar demo:", err);
      setErrorText(err.message);
    } finally {
      setLoadingInsights(false);
    }
  }

  // Get Capa 5 Insights
  async function verInsightsSemana() {
    setLoadingInsights(true);
    setErrorText("");
    try {
      const res = await fetch(`${API_BASE}/api/insights-semana`);
      if (!res.ok) throw new Error("Error al consultar insights.");
      const data = await res.json();
      setInsights(data.insights);
    } catch (err) {
      console.error("Error al obtener insights:", err);
      setErrorText("Error al calcular los insights semanales.");
    } finally {
      setLoadingInsights(false);
    }
  }

  // Onboarding audio processing
  async function procesarAudioConfig(audioBlob, filename) {
    setOnboardingFase("procesando_config");
    setErrorText("");
    const form = new FormData();
    form.append("audio", audioBlob, filename);

    try {
      const res = await fetch(`${API_BASE}/api/configurar-menu-voz`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error en el servidor");
      }

      const data = await res.json();
      if (data.productos && data.productos.length > 0) {
        setMenuEditable(data.productos);
      } else {
        setMenuEditable([{ producto: "", precio: 0 }]);
        setErrorText("No pudimos entender qué vendes del audio. Por favor agrégalos manualmente en la tabla.");
      }
      setOnboardingFase("formulario");
    } catch (err) {
      console.error("Error al procesar audio de menú:", err);
      setErrorText(err.message || "Error al conectar con el backend.");
      setOnboardingFase("eleccion");
    }
  }

  // Onboarding manual text processing
  async function enviarTextoManualConfig() {
    if (!textoManualConfig.trim()) return;
    setOnboardingFase("procesando_config");
    setErrorText("");

    const form = new FormData();
    form.append("texto_manual", textoManualConfig);

    try {
      const res = await fetch(`${API_BASE}/api/configurar-menu-voz`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error en el servidor");
      }

      const data = await res.json();
      if (data.productos && data.productos.length > 0) {
        setMenuEditable(data.productos);
      } else {
        setMenuEditable([{ producto: "", precio: 0 }]);
        setErrorText("No detectamos productos en tu texto. Por favor agrégalos en la tabla.");
      }
      setOnboardingFase("formulario");
      setTextoManualConfig("");
    } catch (err) {
      console.error("Error al procesar texto de menú:", err);
      setErrorText(err.message || "Error al enviar la configuración.");
      setOnboardingFase("eleccion");
    }
  }

  // Save menu from onboarding
  async function guardarMenuOnboarding() {
    const productosValidos = menuEditable.filter(p => p.producto.trim() !== "");
    if (productosValidos.length === 0) {
      setErrorText("Debes agregar al menos un producto con nombre.");
      return;
    }
    
    setErrorText("");
    try {
      const res = await fetch(`${API_BASE}/api/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productosValidos)
      });
      
      if (!res.ok) {
        throw new Error("No se pudo guardar el menú en el servidor.");
      }
      
      localStorage.setItem("changarro_onboarding_completado", "true");
      setOnboardingCompletado(true);
      setFase("inicio");
      cargarHistorial();
    } catch (err) {
      console.error("Error al guardar menú:", err);
      setErrorText(err.message);
    }
  }

  // Load Monday-Wednesday demo menu
  async function usarMenuDemo() {
    const menuDemo = [
      { producto: "rajas con queso", precio: 13 },
      { producto: "frijol con chorizo", precio: 13 },
      { producto: "picadillo", precio: 14 },
      { producto: "mole", precio: 15 },
      { producto: "chicharrón en salsa verde", precio: 14 }
    ];
    
    setErrorText("");
    try {
      const res = await fetch(`${API_BASE}/api/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuDemo)
      });
      
      if (!res.ok) {
        throw new Error("No se pudo guardar el menú demo en el servidor.");
      }
      
      localStorage.setItem("changarro_onboarding_completado", "true");
      setOnboardingCompletado(true);
      setFase("inicio");
      cargarHistorial();
    } catch (err) {
      console.error("Error al cargar menú demo:", err);
      setErrorText(err.message);
    }
  }

  // Open menu editor from dashboard
  async function abrirEdicionMenu() {
    setErrorText("");
    try {
      const res = await fetch(`${API_BASE}/api/menu`);
      if (res.ok) {
        const data = await res.json();
        setMenuEditable(data);
        setIsEditingMenu(true);
      } else {
        throw new Error("No se pudo cargar el menú actual.");
      }
    } catch (err) {
      console.error("Error al cargar menú:", err);
      setErrorText(err.message);
    }
  }

  // Save edited menu
  async function guardarEdicionMenu() {
    const productosValidos = menuEditable.filter(p => p.producto.trim() !== "");
    if (productosValidos.length === 0) {
      setErrorText("Debes dejar al menos un producto.");
      return;
    }
    
    setErrorText("");
    try {
      const res = await fetch(`${API_BASE}/api/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productosValidos)
      });
      
      if (!res.ok) {
        throw new Error("No se pudo guardar el menú en el servidor.");
      }
      
      setIsEditingMenu(false);
    } catch (err) {
      console.error("Error al guardar cambios del menú:", err);
      setErrorText(err.message);
    }
  }

  // Table row modifiers
  function agregarFilaMenu() {
    setMenuEditable([...menuEditable, { producto: "", precio: 0 }]);
  }

  function eliminarFilaMenu(index) {
    const nuevo = [...menuEditable];
    nuevo.splice(index, 1);
    setMenuEditable(nuevo);
  }

  function cambiarFilaMenu(index, campo, valor) {
    const nuevo = [...menuEditable];
    nuevo[index][campo] = campo === "precio" ? parseFloat(valor) || 0 : valor;
    setMenuEditable(nuevo);
  }

  // Clear SQLite DB for fresh runs
  async function limpiarBaseDatos() {
    if (!window.confirm("¿Seguro que quieres borrar toda la libreta de cuentas?")) return;
    setErrorText("");
    try {
      const res = await fetch(`${API_BASE}/api/limpiar-db`, { method: "DELETE" });
      if (res.ok) {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          setReproduciendoVoz(false);
        }
        setHistorial([]);
        setResultado(null);
        setInsights(null);
        setFase("inicio");
        
        const resetProductos = window.confirm("¿También deseas borrar tus productos configurados y reiniciar el onboarding de inicio?");
        if (resetProductos) {
          await fetch(`${API_BASE}/api/menu`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([])
          });
          localStorage.removeItem("changarro_onboarding_completado");
          setOnboardingCompletado(false);
          setOnboardingFase("eleccion");
        }
      }
    } catch (err) {
      console.error("Error al limpiar DB:", err);
      setErrorText("No se pudo limpiar la base de datos.");
    }
  }

  // Format date helper (e.g. 2026-07-31 -> Viernes, 31 de Julio)
  const formatearFecha = (strFecha) => {
    const [año, mes, día] = strFecha.split("-").map(Number);
    const dateObj = new Date(año, mes - 1, día);
    return dateObj.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <main className={`app-container ${!onboardingCompletado ? "onboarding-mode" : ""} ${isEditingMenu ? "editor-mode" : ""}`}>
      {/* Invisible HTML5 Audio element for demo playback */}
      <audio ref={audioPlaybackRef} style={{ display: "none" }} controls />

      {/* Main Ledger Header */}
      <header className="ledger-header">
        <div className="header-titles">
          <h1>El Changarro Sabe</h1>
          <p className="subtitle">Libreta de cuentas por voz con inteligencia local</p>
        </div>
      </header>

      <section className="ledger-page">
        <div className="ledger-content">
          
          {errorText && (
            <div className="alert-message error">
              <Icons.AlertCircle className="icon-alert" />
              <span>{errorText}</span>
            </div>
          )}

          {!onboardingCompletado ? (
            <div className="onboarding-widget">
              <h2 className="onboarding-title">¡Bienvenido, Socio!</h2>
              <p className="onboarding-subtitle">
                Antes de empezar a llevar tus cuentas, dime: <strong>¿Qué vendes en tu negocio y a qué precio?</strong>
              </p>

              {onboardingFase === "eleccion" && (
                <>
                  <div className="onboarding-choice-container">
                    <button className="choice-card" onClick={() => iniciarGrabacion("config")}>
                      <div className="choice-header">
                        <Icons.Microphone className="choice-icon" />
                        <span>Configurar por voz</span>
                      </div>
                      <div className="choice-desc">
                        Graba un audio diciendo tus productos y precios. Ej: <em>"Vendo tacos de guisado a 13 pesos"</em>.
                      </div>
                    </button>

                    <button 
                      className="choice-card" 
                      onClick={() => {
                        setMenuEditable([{ producto: "", precio: 0 }]);
                        setOnboardingFase("formulario");
                      }}
                    >
                      <div className="choice-header">
                        <Icons.Edit className="choice-icon" />
                        <span>Llenar formulario a mano</span>
                      </div>
                      <div className="choice-desc">
                        Abre una tabla para escribir los nombres de tus productos y sus precios uno por uno.
                      </div>
                    </button>
                  </div>

                  <div className="toggle-manual-entry">
                    <button className="btn-link" onClick={() => setMostrarConfigManual(!mostrarConfigManual)}>
                      <Icons.Text className="icon-btn-inline" />
                      <span>{mostrarConfigManual ? "Ocultar entrada de texto" : "Escribir configuración en texto"}</span>
                    </button>
                  </div>

                  {mostrarConfigManual && (
                    <div className="manual-entry-card" style={{ marginTop: "1rem" }}>
                      <div className="form-group">
                        <label>Escribe lo que vendes y su precio:</label>
                        <textarea 
                          placeholder='Ej: "Vendo tacos de guisado a 13 pesos. También Coca Cola a 17 pesos."' 
                          value={textoManualConfig}
                          onChange={(e) => setTextoManualConfig(e.target.value)}
                        />
                      </div>
                      <button className="btn-primary" onClick={enviarTextoManualConfig} disabled={!textoManualConfig.trim()}>
                        Procesar texto
                      </button>
                    </div>
                  )}

                  <div className="onboarding-demo-box">
                    <p>¿Solo quieres ver cómo funciona la app?</p>
                    <button className="btn-secondary" onClick={usarMenuDemo}>
                      <Icons.Info className="icon-btn-inline" />
                      <span>Cargar negocio de prueba (Tacos "El Salto")</span>
                    </button>
                  </div>
                </>
              )}

              {onboardingFase === "grabando_config" && (
                <div className="recording-active">
                  <div className="pulse-container">
                    <div className={`pulse-ring ring-1 ${isPaused ? "paused" : ""}`}></div>
                    <div className={`pulse-ring ring-2 ${isPaused ? "paused" : ""}`}></div>
                    <div className={`pulse-ring ring-3 ${isPaused ? "paused" : ""}`}></div>
                    <div className="pulse-microphone">
                      {isPaused ? <Icons.Pause className="mic-icon" /> : <Icons.Microphone className="mic-icon" />}
                    </div>
                  </div>
                  <span className="timer">00:{tiempoGrabacion < 10 ? `0${tiempoGrabacion}` : tiempoGrabacion}</span>
                  <p className="pulse-sub">
                    {isPaused ? "Grabación pausada... continúa cuando quieras." : "Dime qué vendes y a qué precio..."}
                  </p>
                  <p className="example-text" style={{ fontSize: "0.85rem", opacity: 0.8, fontStyle: "italic", margin: "1rem 0", lineHeight: "1.4" }}>
                    Ejemplo: "Vendo tacos de guisado a 13 pesos" o "Vendo hamburguesas a 45 pesos y papas a 25"
                  </p>
                  <div className="recording-controls">
                    {isPaused ? (
                      <button className="btn-pausar resume" onClick={reanudarGrabacion}>
                        <Icons.Play className="icon-btn-inline" />
                        <span>Continuar</span>
                      </button>
                    ) : (
                      <button className="btn-pausar" onClick={pausarGrabacion}>
                        <Icons.Pause className="icon-btn-inline" />
                        <span>Pausar</span>
                      </button>
                    )}
                    <button className="btn-detener" onClick={detenerGrabacion}>
                      <Icons.Stop className="icon-btn-inline" />
                      <span>Ya terminé</span>
                    </button>
                  </div>
                </div>
              )}

              {onboardingFase === "procesando_config" && (
                <div className="processing-widget">
                  <div className="loader-container">
                    <div className="loader-spinner"></div>
                  </div>
                  <h3>Configurando tu changarro...</h3>
                  <p>Estamos extrayendo tus productos y precios usando inteligencia artificial local.</p>
                </div>
              )}

              {onboardingFase === "formulario" && (
                <div className="product-editor-section" style={{ marginTop: 0 }}>
                  <h4>Confirma tus Productos</h4>
                  <p className="help-text" style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: "1.4" }}>
                    Edita los nombres o precios si es necesario, o agrega nuevos.
                  </p>
                  
                  <table className="product-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th style={{ width: "40px" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuEditable.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <input 
                              type="text" 
                              className="product-input"
                              placeholder="Ej. Tacos de guisado"
                              value={item.producto}
                              onChange={(e) => cambiarFilaMenu(idx, "producto", e.target.value)}
                            />
                          </td>
                          <td>
                            <div className="price-input-wrapper">
                              <span className="price-symbol">$</span>
                              <input 
                                type="number" 
                                className="product-input"
                                placeholder="0.00"
                                value={item.precio || ""}
                                onChange={(e) => cambiarFilaMenu(idx, "precio", e.target.value)}
                              />
                            </div>
                          </td>
                          <td>
                            <button className="btn-remove-row" onClick={() => eliminarFilaMenu(idx)} title="Eliminar producto">
                              <Icons.Close className="icon-small" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="table-actions">
                    <button className="btn-add-row" onClick={agregarFilaMenu}>
                      <Icons.Plus className="icon-btn-inline" />
                      <span>Agregar Producto</span>
                    </button>
                  </div>

                  <div className="btn-actions-footer">
                    <button className="btn-primary" onClick={guardarMenuOnboarding}>
                      <Icons.Sparkles className="icon-btn-inline" />
                      <span>Guardar y Empezar</span>
                    </button>
                    <button 
                      className="btn-link" 
                      onClick={() => {
                        setErrorText("");
                        setOnboardingFase("eleccion");
                      }}
                    >
                      Atrás
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isEditingMenu ? (
            <div className="product-editor-section" style={{ marginTop: 0 }}>
              <div className="title-with-icon">
                <Icons.Settings className="title-icon" />
                <h4>Editar Productos del Changarro</h4>
              </div>
              <p className="help-text" style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", lineHeight: "1.4" }}>
                Modifica los precios o agrega nuevos productos. Estos cambios se aplicarán a los nuevos registros de ventas.
              </p>
              
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th style={{ width: "40px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {menuEditable.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input 
                          type="text" 
                          className="product-input"
                          placeholder="Ej. Tacos de guisado"
                          value={item.producto}
                          onChange={(e) => cambiarFilaMenu(idx, "producto", e.target.value)}
                        />
                      </td>
                      <td>
                        <div className="price-input-wrapper">
                          <span className="price-symbol">$</span>
                          <input 
                            type="number" 
                            className="product-input"
                            placeholder="0.00"
                            value={item.precio || ""}
                            onChange={(e) => cambiarFilaMenu(idx, "precio", e.target.value)}
                          />
                        </div>
                      </td>
                      <td>
                        <button className="btn-remove-row" onClick={() => eliminarFilaMenu(idx)} title="Eliminar producto">
                          <Icons.Close className="icon-small" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="table-actions">
                <button className="btn-add-row" onClick={agregarFilaMenu}>
                  <Icons.Plus className="icon-btn-inline" />
                  <span>Agregar Producto</span>
                </button>
              </div>

              <div className="btn-actions-footer">
                <button className="btn-primary" onClick={guardarEdicionMenu}>
                  <Icons.Sparkles className="icon-btn-inline" />
                  <span>Guardar Cambios</span>
                </button>
                <button 
                  className="btn-link" 
                  onClick={() => {
                    setErrorText("");
                    setIsEditingMenu(false);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="dashboard-grid">
              
              <div className="dashboard-main-col">
                <div className="header-actions-top">
                  <button className="btn-config-menu" onClick={abrirEdicionMenu}>
                    <Icons.Settings className="icon-btn-inline" />
                    <span>Mis Productos</span>
                  </button>
                </div>

                {/* MAIN RECORDING CONTROL SECTION */}
                {fase === "inicio" && (
                  <div className="recording-widget">
                    <p className="instruction-text">
                      Cuéntame cómo le fue a tu negocio al cerrar hoy (ventas, gastos o inventario). Te escucharé y sacaré las cuentas.
                    </p>

                    <button className="btn-grabar" onClick={iniciarGrabacion}>
                      <Icons.Microphone className="icon" />
                      <span>Grabar mi día</span>
                    </button>

                    <div className="toggle-manual-entry">
                      <button className="btn-link" onClick={() => setMostrarManual(!mostrarManual)}>
                        <Icons.Text className="icon-btn-inline" />
                        <span>{mostrarManual ? "Ocultar entrada de texto" : "Escribir texto manualmente"}</span>
                      </button>
                    </div>

                    {mostrarManual && (
                      <div className="manual-entry-card">
                        <div className="form-group">
                          <label>Fecha de registro (opcional):</label>
                          <input 
                            type="date" 
                            value={fechaManual} 
                            onChange={(e) => setFechaManual(e.target.value)} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Escribe lo que pasó hoy:</label>
                          <textarea 
                            placeholder='Ej: "Hoy vendí 10 tacos de mole y 5 de picadillo. Pagué 100 de tortillas y me sobró bastante guisado de rajas."' 
                            value={textoManual}
                            onChange={(e) => setTextoManual(e.target.value)}
                          />
                        </div>
                        <button className="btn-primary" onClick={enviarTextoManual} disabled={!textoManual.trim()}>
                          Enviar registro escrito
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* RECORDING IN PROGRESS ANIMATION */}
                {fase === "grabando" && (
                  <div className="recording-active">
                    <div className="pulse-container">
                      <div className={`pulse-ring ring-1 ${isPaused ? "paused" : ""}`}></div>
                      <div className={`pulse-ring ring-2 ${isPaused ? "paused" : ""}`}></div>
                      <div className={`pulse-ring ring-3 ${isPaused ? "paused" : ""}`}></div>
                      <div className="pulse-microphone">
                        {isPaused ? <Icons.Pause className="mic-icon" /> : <Icons.Microphone className="mic-icon" />}
                      </div>
                    </div>
                    <span className="timer">00:{tiempoGrabacion < 10 ? `0${tiempoGrabacion}` : tiempoGrabacion}</span>
                    <p className="pulse-sub">
                      {isPaused ? "Grabación pausada... cuando gustes puedes continuar." : "Te estoy escuchando... Habla naturalmente de tus ventas y gastos."}
                    </p>
                    <div className="recording-controls">
                      {isPaused ? (
                        <button className="btn-pausar resume" onClick={reanudarGrabacion}>
                          <Icons.Play className="icon-btn-inline" />
                          <span>Continuar</span>
                        </button>
                      ) : (
                        <button className="btn-pausar" onClick={pausarGrabacion}>
                          <Icons.Pause className="icon-btn-inline" />
                          <span>Pausar</span>
                        </button>
                      )}
                      <button className="btn-detener" onClick={detenerGrabacion}>
                        <Icons.Stop className="icon-btn-inline" />
                        <span>Ya terminé</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* LOADING AND COMPUTING STATE */}
                {fase === "procesando" && (
                  <div className="processing-widget">
                    <div className="loader-container">
                      <div className="loader-spinner"></div>
                    </div>
                    <h3>Haciendo cuentas...</h3>
                    <p>Whisper está transcribiendo y Gemma está extrayendo tus datos contables de forma local.</p>
                  </div>
                )}

                {/* DAILY ACCOUNT RECEIPT RESULT */}
                {fase === "resumen" && resultado && (
                  <div className="receipt-card">
                    <div className="receipt-header">
                      <span className="receipt-stamp">EL CHANGARRO SABE</span>
                      <span className="receipt-date">
                        <Icons.Calendar className="icon-inline" />
                        {formatearFecha(resultado.fecha)}
                      </span>
                    </div>
                    
                    <div className="receipt-divider"></div>

                    <div className="receipt-profit-box">
                      <span className="profit-title">GANANCIA DEL DÍA</span>
                      <span className={`profit-amount ${resultado.consolidado.ganancia_dia >= 0 ? "pos" : "neg"}`}>
                        ${resultado.consolidado.ganancia_dia.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="currency">pesos mexicanos (MXN)</span>
                    </div>

                    <div className="receipt-divider"></div>

                    <div className="receipt-details">
                      <div className="receipt-section">
                        <h5>Ventas registradas</h5>
                        {resultado.registros_extraidos.ventas.length === 0 ? (
                          <p className="empty-text">No se registraron ventas en este audio.</p>
                        ) : (
                          <ul className="receipt-list">
                            {resultado.registros_extraidos.ventas.map((v, i) => (
                              <li key={i}>
                                <span className="item-name">{v.producto.charAt(0).toUpperCase() + v.producto.slice(1)}</span>
                                <span className="item-calc">{v.amount || v.cantidad} x ${v.precio_unitario}</span>
                                <span className="item-total">${((v.amount || v.cantidad) * v.precio_unitario).toFixed(2)}</span>
                                {v.es_estimado && <span className="item-badge">estimado</span>}
                              </li>
                            ))}
                            <li className="section-total">
                              <span>Total Ventas:</span>
                              <span>${resultado.consolidado.total_ventas.toFixed(2)}</span>
                            </li>
                          </ul>
                        )}
                      </div>

                      <div className="receipt-section">
                        <h5>Gastos registrados</h5>
                        {resultado.registros_extraidos.gastos.length === 0 ? (
                          <p className="empty-text">No se registraron gastos hoy.</p>
                        ) : (
                          <ul className="receipt-list">
                            {resultado.registros_extraidos.gastos.map((g, i) => (
                              <li key={i}>
                                <span className="item-name">{g.concepto}</span>
                                <span className="item-total">-${g.monto.toFixed(2)}</span>
                              </li>
                            ))}
                            <li className="section-total">
                              <span>Total Gastos:</span>
                              <span>-${resultado.consolidado.total_gastos.toFixed(2)}</span>
                            </li>
                          </ul>
                        )}
                      </div>

                      {resultado.registros_extraidos.notas_inventario.length > 0 && (
                        <div className="receipt-section">
                          <h5>Notas de Inventario</h5>
                          <ul className="receipt-notes">
                            {resultado.registros_extraidos.notas_inventario.map((n, i) => (
                              <li key={i} className={`note-item ${n.tipo}`}>
                                <span className={`status-dot ${n.tipo === "se_acabo" ? "out-of-stock" : "in-stock"}`}></span>
                                <strong>{n.producto}:</strong> {n.tipo === "se_acabo" ? "Se acabó todo" : "Sobró"} ({n.cantidad_aproximada})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="receipt-divider"></div>

                    <div className="narrative-box">
                      <span className="narrative-quote-icon">“</span>
                      <p className="narrative-text">{resultado.resumen}</p>
                      <button 
                        className={`btn-voz ${reproduciendoVoz ? "activo" : ""}`} 
                        onClick={() => hablarTexto(resultado.resumen)}
                        title={reproduciendoVoz ? "Detener voz" : "Escuchar en voz alta"}
                      >
                        {reproduciendoVoz ? <Icons.VolumeX className="icon-btn-inline" /> : <Icons.Volume2 className="icon-btn-inline" />}
                        <span>{reproduciendoVoz ? "Detener voz" : "Leer en voz alta"}</span>
                      </button>
                    </div>

                    <div className="receipt-divider"></div>

                    <details className="raw-audio-details">
                      <summary>Ver transcripción cruda del audio</summary>
                      <div className="raw-transcription">
                        "{resultado.transcripcion}"
                      </div>
                    </details>

                    <button 
                      className="btn-primary" 
                      onClick={() => {
                        if ("speechSynthesis" in window) {
                          window.speechSynthesis.cancel();
                          setReproduciendoVoz(false);
                        }
                        setFase("inicio");
                      }}
                    >
                      <Icons.ArrowLeft className="icon-btn-inline" />
                      <span>Registrar otro día</span>
                    </button>
                  </div>
                )}

                {/* DANGEROUS ZONE: CLEAR DATA */}
                <footer className="ledger-footer-actions">
                  <button className="btn-danger" onClick={limpiarBaseDatos}>
                    <Icons.Trash className="icon-btn-inline" />
                    <span>Limpiar Libreta de Cuentas</span>
                  </button>
                </footer>
              </div>

              <div className="dashboard-side-col">
                {/* WEEKLY INSIGHTS OR PATTERNS SECTION */}
                <section className="insights-container">
                  <div className="section-header-box">
                    <div className="title-with-icon">
                      <Icons.Sparkles className="title-icon" />
                      <h3>Mi Libreta Semanal</h3>
                    </div>
                    <p>Recomendaciones y análisis acumulado de los últimos 7 días.</p>
                  </div>

                  {loadingInsights ? (
                    <div className="insights-loading">
                      <div className="loader-spinner"></div>
                      <p>Gemma está revisando tus notas de la semana...</p>
                    </div>
                  ) : insights ? (
                    <div className="insights-paper-card">
                      <div className="title-with-icon">
                        <Icons.Info className="title-icon-small" />
                        <h4>Consejos del Changarro</h4>
                      </div>
                      <p className="insights-content-text">{insights}</p>
                      <button className="btn-outline-small" onClick={verInsightsSemana}>
                        <Icons.Refresh className="icon-btn-inline" />
                        <span>Actualizar análisis</span>
                      </button>
                    </div>
                  ) : (
                    <div className="insights-placeholder">
                      <p>¿Quieres ver los patrones de venta de tu semana y recomendaciones personalizadas?</p>
                      <div className="insights-placeholder-actions">
                        <button className="btn-secondary" onClick={verInsightsSemana}>
                          Calcular insights semanales
                        </button>
                        <button className="btn-outline" onClick={precargarHistorialDemo}>
                          Precargar historial de demo + analizar
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                {/* ACCOUNT HISTORICAL TIMELINE */}
                {historial.length > 0 && (
                  <section className="history-container">
                    <div className="title-with-icon">
                      <Icons.Calendar className="title-icon" />
                      <h3>Registro de Cuentas Pasadas</h3>
                    </div>
                    <div className="history-timeline">
                      {historial.map((dia) => (
                        <div key={dia.id} className="history-item-card">
                          <div className="history-meta">
                            <span className="history-date">{formatearFecha(dia.fecha)}</span>
                            <span className={`history-profit ${dia.ganancia_dia >= 0 ? "pos" : "neg"}`}>
                              ${dia.ganancia_dia.toFixed(2)}
                            </span>
                          </div>
                          <p className="history-summary">{dia.resumen_narrado}</p>
                          <details className="history-details">
                            <summary>Detalles del día</summary>
                            <div className="details-expanded">
                              <p className="history-trans"><strong>Escuché:</strong> "{dia.transcripcion}"</p>
                              <div className="details-columns">
                                <div>
                                  <strong>Ventas ({dia.ventas.length}):</strong>
                                  <ul>
                                    {dia.ventas.map((v, idx) => (
                                      <li key={idx}>
                                        {v.producto.charAt(0).toUpperCase() + v.producto.slice(1)} x{v.cantidad} (${(v.cantidad * v.precio_unitario).toFixed(2)})
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <strong>Gastos ({dia.gastos.length}):</strong>
                                  <ul>
                                    {dia.gastos.map((g, idx) => (
                                      <li key={idx}>{g.concepto}: -${g.monto.toFixed(2)}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

            </div>
          )}

        </div>
      </section>
    </main>
  );
}
