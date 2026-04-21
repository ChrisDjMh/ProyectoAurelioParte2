import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Plus, Calendar, Users, TrendingUp,
  Eye, Edit, Trash2, CheckCircle2, AlertCircle, ImageIcon, Loader2, QrCode
} from "lucide-react";
import jsQR from "jsqr";

interface OrganizerDashboardProps {
  onClose: () => void;
  currentUser: { id: number; nombre: string; role: string };
}

interface OrganizerEvent {
  id: number;
  titulo: string;
  fecha: string;
  ubicacion: string;
  capacidad: number;
  precio: number;
  imagen: string | null;
  categoria: string;
  estado: "borrador" | "publicado" | "cancelado" | "finalizado";
  boletos_vendidos?: number;
}

const EMPTY_FORM = {
  titulo: "",
  descripcion: "",
  fecha: "",
  hora: "",
  ubicacion: "",
  capacidad: "",
  precio: "",
  imagen: "",
  imagen_banner: "",
  categoria: "Musica",
};

export function OrganizerDashboard({ onClose, currentUser }: OrganizerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "create" | "scanner">("overview");
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const [qrInput, setQrInput] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{
    valido: boolean;
    motivo: string;
    mensaje: string;
    evento?: string;
    asiento?: string;
    usado_at?: string;
  } | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "scanner") {
      stopCamera();
    }
  }, [activeTab]);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraLoading(false);
    setCameraError(null);
  };

  const startCamera = async () => {
    stopCamera();
    setCameraLoading(true);
    setCameraError(null);
    setScanResult(null);

    setCameraActive(true);

    await new Promise(resolve => setTimeout(resolve, 50));

    if (!videoRef.current) {
      setCameraError("No se pudo inicializar el visor de cámara.");
      setCameraLoading(false);
      setCameraActive(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: 1280, height: 720 }
        });
        console.log("✅ Cámara trasera obtenida");
      } catch (envError) {
        console.warn("⚠️ Falló cámara trasera, usando cualquier cámara:", envError);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 }
        });
        console.log("✅ Cámara genérica obtenida");
      }

      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("autoplay", "true");
      video.load();

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout: el video no se pudo iniciar después de 10 segundos"));
        }, 10000);

        const handleReady = () => {
          clearTimeout(timeout);
          video.play()
            .then(() => {
              console.log("🎥 Video reproduciéndose correctamente");
              resolve();
            })
            .catch((e) => {
              console.error("❌ video.play() rechazado:", e);
              reject(new Error(`No se pudo reproducir el video: ${e.message}`));
            });
        };

        if (video.readyState >= 2) {
          handleReady();
        } else {
          video.addEventListener("canplay", handleReady, { once: true });
          video.addEventListener("error", () => {
            clearTimeout(timeout);
            reject(new Error("Error en el elemento de video"));
          });
        }
      });

      setCameraLoading(false);
      console.log("🔄 Iniciando detección de QR...");

      const detectQR = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !streamRef.current) {
          animationFrameRef.current = requestAnimationFrame(detectQR);
          return;
        }

        if (video.videoWidth === 0 || video.videoHeight === 0) {
          animationFrameRef.current = requestAnimationFrame(detectQR);
          return;
        }

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          animationFrameRef.current = requestAnimationFrame(detectQR);
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          console.log("📸 QR detectado:", code.data);
          stopCamera();
          setQrInput(code.data);
          await new Promise(resolve => setTimeout(resolve, 300));
          handleEscanearWithCode(code.data);
          return;
        }

        animationFrameRef.current = requestAnimationFrame(detectQR);
      };

      detectQR(); 

    } catch (err: any) {
      console.error("🔴 Error en startCamera:", err);
      let mensaje = "Error al iniciar la cámara.";
      if (err.name === "NotAllowedError") mensaje = "Permiso de cámara denegado. Concede acceso e inténtalo de nuevo.";
      else if (err.name === "NotFoundError") mensaje = "No se encontró ninguna cámara en este dispositivo.";
      else if (err.message.includes("Timeout")) mensaje = "La cámara no respondió a tiempo. Verifica que no esté siendo usada por otra aplicación.";
      else mensaje = err.message;

      setCameraError(mensaje);
      setCameraLoading(false);
      stopCamera();
    }
  };

  const handleEscanearWithCode = async (code: string) => {
    if (!code.trim()) return;
    setScanLoading(true);
    setScanResult(null);
    try {
      const res = await fetch("http://localhost:3001/api/validacion/escanear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo_qr: code.trim() }),
      });
      const data = await res.json();
      setScanResult(data);
    } catch {
      setScanResult({
        valido: false,
        motivo: "error",
        mensaje: "❌ Error de conexión con el servidor.",
      });
    } finally {
      setScanLoading(false);
    }
  };

  const handleEscanear = () => {
    handleEscanearWithCode(qrInput);
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch(`http://localhost:3001/api/eventos/organizador/${currentUser.id}`);
      const data = await res.json();
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const validate = (): boolean => {
    const errors: Partial<typeof EMPTY_FORM> = {};
    if (!form.titulo.trim()) errors.titulo = "El nombre del evento es obligatorio";
    else if (form.titulo.trim().length < 5) errors.titulo = "El nombre debe tener al menos 5 caracteres";
    if (!form.fecha) errors.fecha = "La fecha es obligatoria";
    else if (new Date(`${form.fecha}T${form.hora || "00:00"}`) <= new Date()) errors.fecha = "La fecha debe ser futura";
    if (!form.ubicacion.trim()) errors.ubicacion = "La ubicación es obligatoria";
    if (!form.descripcion.trim()) errors.descripcion = "Agrega una descripción del evento";
    else if (form.descripcion.trim().length < 20) errors.descripcion = "La descripción debe tener al menos 20 caracteres";
    if (!form.precio) errors.precio = "El precio es obligatorio";
    else if (isNaN(Number(form.precio)) || Number(form.precio) < 0) errors.precio = "El precio debe ser un número válido (0 para gratis)";
    if (!form.capacidad) errors.capacidad = "La capacidad es obligatoria";
    else if (isNaN(Number(form.capacidad)) || Number(form.capacidad) < 1) errors.capacidad = "La capacidad mínima es 1 persona";
    if (form.imagen.trim() !== "") {
      try { new URL(form.imagen); } catch { errors.imagen = "Ingresa una URL válida (https://...)"; }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof EMPTY_FORM]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (name === "imagen") setImagePreviewError(false);
  };

  const handleSubmit = async (estadoEvento: "borrador" | "publicado") => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitResult(null);
    const fechaHora = `${form.fecha} ${form.hora || "20:00"}:00`;
    try {
      const res = await fetch("http://localhost:3001/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizador_id: currentUser.id,
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          fecha: fechaHora,
          ubicacion: form.ubicacion.trim(),
          capacidad: Number(form.capacidad),
          precio: Number(form.precio),
          imagen: form.imagen.trim() || null,
          imagen_banner: form.imagen_banner.trim() || null,
          categoria: form.categoria,
          estado: estadoEvento,
        }),
      });
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error(`Error ${res.status}: respuesta inesperada`); }
      if (!res.ok) throw new Error(data.mensaje || "Error al crear el evento");
      setSubmitResult({
        ok: true,
        msg: estadoEvento === "publicado" ? "¡Evento publicado exitosamente!" : "Evento guardado como borrador",
      });
      setForm(EMPTY_FORM);
      setFormErrors({});
      fetchMyEvents();
    } catch (err: any) {
      setSubmitResult({ ok: false, msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = events.filter(e => e.estado === "publicado").length;
  const draftCount = events.filter(e => e.estado === "borrador").length;
  const estadoStyle = (estado: string) => {
    switch (estado) {
      case "publicado": return "bg-green-100 text-green-800";
      case "borrador": return "bg-yellow-100 text-yellow-800";
      case "cancelado": return "bg-red-100 text-red-800";
      default: return "bg-zinc-100 text-zinc-800";
    }
  };
  const estadoLabel = (estado: string) => ({
    publicado: "Publicado", borrador: "Borrador", cancelado: "Cancelado", finalizado: "Finalizado",
  }[estado] ?? estado);

  const FieldError = ({ name }: { name: keyof typeof EMPTY_FORM }) =>
    formErrors[name] ? (
      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 ml-1 text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {formErrors[name]}
      </motion.p>
    ) : null;

  const inputClass = (name: keyof typeof EMPTY_FORM) =>
    `w-full px-4 py-3 border focus:outline-none transition-colors text-sm ${
      formErrors[name] ? "border-red-400 bg-red-50 focus:border-red-500" : "border-zinc-300 focus:border-black"
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto bg-white rounded-xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="border-b border-zinc-200 p-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">Panel de Organizadores</h1>
              <p className="text-zinc-500 text-sm">
                Bienvenido, <span className="font-semibold text-black">{currentUser.nombre}</span>
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="border-b border-zinc-200 px-6">
            <div className="flex gap-8">
              {(["overview", "events", "create", "scanner"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSubmitResult(null); }}
                  className={`py-4 font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === tab ? "border-black text-black" : "border-transparent text-zinc-500 hover:text-black"
                  }`}
                >
                  {tab === "overview" ? "Resumen" : tab === "events" ? "Mis eventos" : tab === "create" ? "Crear evento" : "Validar boletos"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "scanner" && (
              <div className="p-6">
                <div className="max-w-lg mx-auto py-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <QrCode className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-black">Validar boletos</h2>
                    <p className="text-zinc-500 text-sm mt-1">Ingresa el código QR o escanea con la cámara</p>
                  </div>

                  <AnimatePresence>
                    {cameraActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative mb-6 rounded-xl overflow-hidden bg-black"
                      >
                        <video
                          ref={videoRef}
                          className="w-full h-64 object-cover bg-black"
                          autoPlay
                          muted
                          playsInline
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute inset-0 border-2 border-white/30 pointer-events-none">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-green-400 rounded-lg opacity-80" />
                        </div>
                        <button
                          onClick={stopCamera}
                          className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <p className="absolute bottom-2 left-0 right-0 text-center text-white text-sm bg-black/50 py-1">
                          Apunta el código QR dentro del recuadro
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {cameraLoading && (
                    <div className="mb-6 p-6 bg-zinc-50 rounded-xl flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                      <span className="text-zinc-600">Iniciando cámara...</span>
                    </div>
                  )}

                  {cameraError && !cameraActive && !cameraLoading && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-red-700 font-medium">{cameraError}</p>
                        <button
                          onClick={startCamera}
                          className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                        >
                          Reintentar
                        </button>
                      </div>
                    </div>
                  )}

                  {!cameraActive && !cameraLoading && (
                    <>
                      <button
                        onClick={startCamera}
                        className="w-full mb-4 py-3 border-2 border-dashed border-zinc-300 rounded-xl text-zinc-600 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <QrCode className="w-5 h-5" />
                        Activar cámara
                      </button>

                      <div className="flex gap-2 mb-6">
                        <input
                          type="text"
                          value={qrInput}
                          onChange={e => { setQrInput(e.target.value); setScanResult(null); }}
                          onKeyDown={e => e.key === "Enter" && handleEscanear()}
                          placeholder="Ej: TKT-1-C4-1776145952271"
                          className="flex-1 px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none text-sm rounded-lg"
                        />
                        <button
                          onClick={handleEscanear}
                          disabled={scanLoading || !qrInput.trim()}
                          className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {scanLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                          Validar
                        </button>
                      </div>
                    </>
                  )}

                  <AnimatePresence>
                    {scanResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`p-6 rounded-xl border-2 text-center ${
                          scanResult.valido ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                          scanResult.valido ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {scanResult.valido ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : <AlertCircle className="w-8 h-8 text-red-600" />}
                        </div>
                        <p className={`text-xl font-bold mb-2 ${scanResult.valido ? "text-green-700" : "text-red-700"}`}>
                          {scanResult.mensaje}
                        </p>
                        {scanResult.evento && <p className="text-sm text-zinc-600 mt-2"><strong>Evento:</strong> {scanResult.evento}</p>}
                        {scanResult.asiento && <p className="text-sm text-zinc-600"><strong>Asiento:</strong> {scanResult.asiento}</p>}
                        {scanResult.usado_at && scanResult.motivo === "ya_usado" && (
                          <p className="text-xs text-zinc-400 mt-2">Escaneado el {new Date(scanResult.usado_at).toLocaleString("es-ES")}</p>
                        )}
                        <button
                          onClick={() => { setScanResult(null); setQrInput(""); }}
                          className="mt-4 px-4 py-2 text-sm font-semibold border border-zinc-300 rounded-lg hover:bg-white transition-colors"
                        >
                          Validar otro boleto
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: <Calendar className="w-5 h-5" />, label: "Publicados", value: activeCount },
                   
                    { icon: <Users className="w-5 h-5" />, label: "Total eventos", value: events.length },
                    
                  ].map(stat => (
                    <div key={stat.label} className="p-6 bg-zinc-50 border border-zinc-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3 text-zinc-500">{stat.icon}<p className="text-xs font-semibold uppercase tracking-wide">{stat.label}</p></div>
                      <p className="text-3xl font-bold text-black">{stat.value}</p>
                    </div>
                  ))}
                </div>
                {events.filter(e => e.estado === "publicado").length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-black mb-4">Eventos publicados</h2>
                    <div className="space-y-3">
                      {events.filter(e => e.estado === "publicado").map(event => {
                        const lugaresDisponibles = Math.max(0, event.capacidad - (event.boletos_vendidos || 0));
                        return (
                          <div key={event.id} className="p-4 border border-zinc-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {event.imagen ? (
                                <img src={event.imagen} alt={event.titulo} className="w-12 h-12 object-cover rounded-lg" onError={e => (e.target as HTMLImageElement).style.display = "none"} />
                              ) : (
                                <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center"><ImageIcon className="w-5 h-5 text-zinc-400" /></div>
                              )}
                              <div>
                                <h3 className="font-semibold text-black">{event.titulo}</h3>
                                <p className="text-sm text-zinc-500">
                                  {new Date(event.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })} · {event.ubicacion}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-black">${Number(event.precio).toLocaleString()}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">{lugaresDisponibles.toLocaleString()} lugares disp.</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "events" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-black">Todos los eventos <span className="ml-2 text-sm font-normal text-zinc-500">({events.length})</span></h2>
                  <button onClick={() => setActiveTab("create")} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors rounded-lg">
                    <Plus className="w-4 h-4" /> Nuevo evento
                  </button>
                </div>
                {loadingEvents ? (
                  <div className="flex items-center justify-center py-20 text-zinc-400"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando eventos...</div>
                ) : events.length === 0 ? (
                  <div className="text-center py-20 text-zinc-400"><Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-semibold">No tienes eventos aún</p><p className="text-sm mt-1">Crea tu primer evento para empezar</p></div>
                ) : (
                  events.map(event => (
                    <div key={event.id} className="p-5 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors">
                      <div className="flex items-start gap-4">
                        {event.imagen ? (
                          <img src={event.imagen} alt={event.titulo} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" onError={e => (e.target as HTMLImageElement).style.display = "none"} />
                        ) : (
                          <div className="w-20 h-20 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0"><ImageIcon className="w-7 h-7 text-zinc-300" /></div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-black">{event.titulo}</h3>
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${estadoStyle(event.estado)}`}>{estadoLabel(event.estado)}</span>
                            </div>
                           
                          </div>
                          <p className="text-sm text-zinc-500 mb-3">📅 {new Date(event.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })} · 📍 {event.ubicacion}</p>
                          <div className="flex gap-6 text-sm">
                            <div><span className="text-zinc-400">Precio</span><p className="font-bold text-black">${Number(event.precio).toLocaleString()}</p></div>
                            <div><span className="text-zinc-400">Capacidad</span><p className="font-bold text-black">{event.capacidad.toLocaleString()}</p></div>
                            <div><span className="text-zinc-400">Categoría</span><p className="font-bold text-black">{event.categoria}</p></div>
                            <div><span className="text-zinc-400">Vendidos</span><p className="font-bold text-black">{event.boletos_vendidos || 0}</p></div>
                            <div><span className="text-zinc-400">Recaudado</span><p className="font-bold text-emerald-600">${((event.boletos_vendidos || 0) * Number(event.precio)).toLocaleString()}</p></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "create" && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-black mb-6">Crear nuevo evento</h2>
                <AnimatePresence>
                  {submitResult && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${submitResult.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
                      {submitResult.ok ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                      <p className="font-semibold text-sm">{submitResult.msg}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="space-y-5">
                  <div><label className="block text-sm font-semibold text-black mb-1.5">Nombre del evento <span className="text-red-500">*</span></label><input name="titulo" value={form.titulo} onChange={handleChange} type="text" placeholder="Ej: Festival de verano 2026" className={inputClass("titulo")} /><FieldError name="titulo" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold text-black mb-1.5">Fecha <span className="text-red-500">*</span></label><input name="fecha" value={form.fecha} onChange={handleChange} type="date" min={new Date().toISOString().split("T")[0]} className={inputClass("fecha")} /><FieldError name="fecha" /></div>
                    <div><label className="block text-sm font-semibold text-black mb-1.5">Hora</label><input name="hora" value={form.hora} onChange={handleChange} type="time" className="w-full px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm" /></div>
                  </div>
                  <div><label className="block text-sm font-semibold text-black mb-1.5">Ubicación <span className="text-red-500">*</span></label><input name="ubicacion" value={form.ubicacion} onChange={handleChange} type="text" placeholder="Ciudad o nombre del lugar" className={inputClass("ubicacion")} /><FieldError name="ubicacion" /></div>
                  <div><label className="block text-sm font-semibold text-black mb-1.5">Descripción <span className="text-red-500">*</span></label><textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={4} placeholder="Describe tu evento (mínimo 20 caracteres)..." className={`${inputClass("descripcion")} resize-none`} /><div className="flex justify-between items-start"><FieldError name="descripcion" /><span className={`text-xs mt-1 ml-auto ${form.descripcion.length < 20 ? "text-zinc-400" : "text-green-600"}`}>{form.descripcion.length}/20 mín.</span></div></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold text-black mb-1.5">Precio (MXN) <span className="text-red-500">*</span></label><input name="precio" value={form.precio} onChange={handleChange} type="number" min="0" step="0.01" placeholder="0 para gratis" className={inputClass("precio")} /><FieldError name="precio" /></div>
                    <div><label className="block text-sm font-semibold text-black mb-1.5">Capacidad <span className="text-red-500">*</span></label><input name="capacidad" value={form.capacidad} onChange={handleChange} type="number" min="1" placeholder="Número de lugares" className={inputClass("capacidad")} /><FieldError name="capacidad" /></div>
                  </div>
                  <div><label className="block text-sm font-semibold text-black mb-1.5">Categoría</label><select name="categoria" value={form.categoria} onChange={handleChange} className="w-full px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm bg-white"><option value="Musica">Música</option><option value="Deportes">Deportes</option><option value="Entretenimiento">Entretenimiento</option><option value="Conferencias">Conferencias</option><option value="Otros">Otros</option></select></div>
                  <div><label className="block text-sm font-semibold text-black mb-1.5">Imagen del evento<span className="ml-1 text-xs font-normal text-zinc-400">(URL pública)</span></label><div className="relative"><ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" /><input name="imagen" value={form.imagen} onChange={handleChange} type="url" placeholder="https://ejemplo.com/imagen.jpg" className={`w-full pl-11 pr-4 py-3 border focus:outline-none transition-colors text-sm ${formErrors.imagen ? "border-red-400 bg-red-50" : "border-zinc-300 focus:border-black"}`} /></div><FieldError name="imagen" /><p className="mt-1.5 ml-1 text-xs text-zinc-400">Sube tu imagen a <a href="https://imgur.com" target="_blank" rel="noreferrer" className="underline hover:text-black">imgur.com</a> o similar y pega la URL aquí</p><AnimatePresence>{form.imagen && !formErrors.imagen && !imagePreviewError && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden"><p className="text-xs text-zinc-400 mb-1.5 font-semibold uppercase tracking-wide">Vista previa</p><img src={form.imagen} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-zinc-200" onError={() => setImagePreviewError(true)} /></motion.div>)}{imagePreviewError && form.imagen && (<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-amber-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />No se pudo cargar la imagen. Verifica que la URL sea accesible.</motion.p>)}</AnimatePresence></div>
                  <div><label className="block text-sm font-semibold text-black mb-1.5">Imagen Banner<span className="ml-1 text-xs font-normal text-zinc-400">(para el carrusel principal — formato panorámico recomendado)</span></label><div className="relative"><ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" /><input name="imagen_banner" value={form.imagen_banner} onChange={handleChange} type="url" placeholder="https://ejemplo.com/banner.jpg" className="w-full pl-11 pr-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm" /></div><p className="mt-1.5 ml-1 text-xs text-zinc-400">Usa imágenes de al menos <strong>1280×480px</strong>. Recomendado: <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="underline hover:text-black">unsplash.com</a> (gratis y alta resolución)</p><AnimatePresence>{form.imagen_banner && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden"><p className="text-xs text-zinc-400 mb-1.5 font-semibold uppercase tracking-wide">Vista previa banner</p><img src={form.imagen_banner} alt="Banner preview" className="w-full h-32 object-cover rounded-lg border border-zinc-200" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /></motion.div>)}</AnimatePresence></div>
                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => handleSubmit("publicado")} disabled={submitting} className="flex-1 py-3 bg-black text-white font-semibold hover:bg-zinc-800 transition-colors rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">{submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</> : <><CheckCircle2 className="w-4 h-4" /> Publicar evento</>}</button>
                    <button type="button" onClick={() => handleSubmit("borrador")} disabled={submitting} className="px-6 py-3 border border-zinc-300 text-black font-semibold hover:bg-zinc-100 transition-colors rounded-lg disabled:opacity-50">Guardar borrador</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}