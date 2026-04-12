import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Plus, Calendar, Users, DollarSign, TrendingUp,
  Eye, Edit, Trash2, CheckCircle2, AlertCircle, ImageIcon, Loader2
} from "lucide-react";

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

// Valores iniciales del formulario
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
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "create">("overview");
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Estado del formulario
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // Cargar eventos del organizador
  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setLoadingEvents(true);
    try {
      // Ahora le pedimos al backend SOLO los eventos de este organizador
      const res = await fetch(`http://localhost:3001/api/eventos/organizador/${currentUser.id}`);
      const data = await res.json();
      setEvents(data); // Ya no necesitas hacer el .filter() en el frontend
    } catch {
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  // ── Validaciones del formulario ──────────────────────────────────
  const validate = (): boolean => {
    const errors: Partial<typeof EMPTY_FORM> = {};

    if (!form.titulo.trim())
      errors.titulo = "El nombre del evento es obligatorio";
    else if (form.titulo.trim().length < 5)
      errors.titulo = "El nombre debe tener al menos 5 caracteres";

    if (!form.fecha)
      errors.fecha = "La fecha es obligatoria";
    else if (new Date(`${form.fecha}T${form.hora || "00:00"}`) <= new Date())
      errors.fecha = "La fecha debe ser futura";

    if (!form.ubicacion.trim())
      errors.ubicacion = "La ubicación es obligatoria";

    if (!form.descripcion.trim())
      errors.descripcion = "Agrega una descripción del evento";
    else if (form.descripcion.trim().length < 20)
      errors.descripcion = "La descripción debe tener al menos 20 caracteres";

    if (!form.precio)
      errors.precio = "El precio es obligatorio";
    else if (isNaN(Number(form.precio)) || Number(form.precio) < 0)
      errors.precio = "El precio debe ser un número válido (0 para gratis)";

    if (!form.capacidad)
      errors.capacidad = "La capacidad es obligatoria";
    else if (isNaN(Number(form.capacidad)) || Number(form.capacidad) < 1)
      errors.capacidad = "La capacidad mínima es 1 persona";

    if (form.imagen.trim() !== "") {
      try { new URL(form.imagen); }
      catch { errors.imagen = "Ingresa una URL válida (https://...)"; }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (formErrors[name as keyof typeof EMPTY_FORM]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
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
        fecha: fechaHora,           // ← "2026-06-15 20:00:00"
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
    try {
      data = JSON.parse(text);
    } catch {
      // El backend devolvió HTML — mostrar el status para diagnosticar
      throw new Error(`Error ${res.status}: respuesta inesperada del servidor`);
    }

      if (!res.ok) throw new Error(data.mensaje || "Error al crear el evento");

      setSubmitResult({
        ok: true,
        msg: estadoEvento === "publicado"
          ? "¡Evento publicado exitosamente!"
          : "Evento guardado como borrador",
      });

      setForm(EMPTY_FORM);
      setFormErrors({});
      fetchMyEvents(); // Recargar lista

    } catch (err: any) {
      setSubmitResult({ ok: false, msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Estadísticas del resumen ─────────────────────────────────────
 const activeCount = events.filter((e) => e.estado === "publicado").length;
  const draftCount = events.filter((e) => e.estado === "borrador").length;
  
  // Cálculos de capacidad y ventas
  const capacidadTotal = events.reduce((acc, e) => acc + e.capacidad, 0);
  const vendidosTotal = events.reduce((acc, e) => acc + (Number(e.boletos_vendidos) || 0), 0);
  const disponiblesTotal = Math.max(0, capacidadTotal - vendidosTotal);

  // ── Helper: color de estado ──────────────────────────────────────
  const estadoStyle = (estado: string) => {
    switch (estado) {
      case "publicado": return "bg-green-100 text-green-800";
      case "borrador":  return "bg-yellow-100 text-yellow-800";
      case "cancelado": return "bg-red-100 text-red-800";
      default:          return "bg-zinc-100 text-zinc-800";
    }
  };

  const estadoLabel = (estado: string) => ({
    publicado: "Publicado", borrador: "Borrador",
    cancelado: "Cancelado", finalizado: "Finalizado",
  }[estado] ?? estado);

  // ── Campo con error helper ───────────────────────────────────────
  const FieldError = ({ name }: { name: keyof typeof EMPTY_FORM }) =>
    formErrors[name] ? (
      <motion.p
        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
        className="mt-1.5 ml-1 text-xs text-red-500 flex items-center gap-1"
      >
        <AlertCircle className="w-3 h-3" /> {formErrors[name]}
      </motion.p>
    ) : null;

  const inputClass = (name: keyof typeof EMPTY_FORM) =>
    `w-full px-4 py-3 border focus:outline-none transition-colors text-sm ${
      formErrors[name]
        ? "border-red-400 bg-red-50 focus:border-red-500"
        : "border-zinc-300 focus:border-black"
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto bg-white rounded-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
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

          {/* Tabs */}
          <div className="border-b border-zinc-200 px-6">
            <div className="flex gap-8">
              {(["overview", "events", "create"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSubmitResult(null); }}
                  className={`py-4 font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-black text-black"
                      : "border-transparent text-zinc-500 hover:text-black"
                  }`}
                >
                  {tab === "overview" ? "Resumen" : tab === "events" ? "Mis eventos" : "Crear evento"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">

            {/* ── TAB: RESUMEN ──────────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* 1. Regresamos a las 4 tarjetas originales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: <Calendar className="w-5 h-5" />, label: "Publicados", value: activeCount },
                    { icon: <Edit className="w-5 h-5" />, label: "Borradores", value: draftCount },
                    { icon: <Users className="w-5 h-5" />, label: "Total eventos", value: events.length },
                    { icon: <TrendingUp className="w-5 h-5" />, label: "Capacidad total",
                      value: events.reduce((acc, e) => acc + e.capacidad, 0).toLocaleString() },
                  ].map((stat) => (
                    <div key={stat.label} className="p-6 bg-zinc-50 border border-zinc-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3 text-zinc-500">
                        {stat.icon}
                        <p className="text-xs font-semibold uppercase tracking-wide">{stat.label}</p>
                      </div>
                      <p className="text-3xl font-bold text-black">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* 2. Modificamos la lista para mostrar los lugares disponibles por evento */}
                {events.filter(e => e.estado === "publicado").length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-black mb-4">Eventos publicados</h2>
                    <div className="space-y-3">
                      {events.filter(e => e.estado === "publicado").map((event) => {
                        // Calculamos los lugares restantes en tiempo real
                        const lugaresDisponibles = Math.max(0, event.capacidad - (event.boletos_vendidos || 0));

                        return (
                          <div key={event.id} className="p-4 border border-zinc-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {event.imagen ? (
                                <img src={event.imagen} alt={event.titulo}
                                  className="w-12 h-12 object-cover rounded-lg"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center">
                                  <ImageIcon className="w-5 h-5 text-zinc-400" />
                                </div>
                              )}
                              <div>
                                <h3 className="font-semibold text-black">{event.titulo}</h3>
                                <p className="text-sm text-zinc-500">
                                  {new Date(event.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                                  {" · "}{event.ubicacion}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-black">${Number(event.precio).toLocaleString()}</p>
                              {/* Aquí se refleja el cambio visual */}
                              <p className="text-xs text-zinc-500 mt-0.5">
                                {lugaresDisponibles.toLocaleString()} lugares disp.
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: MIS EVENTOS ──────────────────────────────────── */}
            {activeTab === "events" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-black">
                    Todos los eventos
                    <span className="ml-2 text-sm font-normal text-zinc-500">({events.length})</span>
                  </h2>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors rounded-lg"
                  >
                    <Plus className="w-4 h-4" /> Nuevo evento
                  </button>
                </div>

                {loadingEvents ? (
                  <div className="flex items-center justify-center py-20 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando eventos...
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-20 text-zinc-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No tienes eventos aún</p>
                    <p className="text-sm mt-1">Crea tu primer evento para empezar</p>
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="p-5 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors">
                      <div className="flex items-start gap-4">
                        {event.imagen ? (
                          <img src={event.imagen} alt={event.titulo}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-20 h-20 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-7 h-7 text-zinc-300" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-black">{event.titulo}</h3>
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${estadoStyle(event.estado)}`}>
                                {estadoLabel(event.estado)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors" title="Ver">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-red-500" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-zinc-500 mb-3">
                            📅 {new Date(event.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                            {" · "}📍 {event.ubicacion}
                          </p>
                          <div className="flex gap-6 text-sm">
                            <div>
                              <span className="text-zinc-400">Precio</span>
                              <p className="font-bold text-black">${Number(event.precio).toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-zinc-400">Capacidad</span>
                              <p className="font-bold text-black">{event.capacidad.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-zinc-400">Categoría</span>
                              <p className="font-bold text-black">{event.categoria}</p>
                            </div>
                            <div>
                              <span className="text-zinc-400">Vendidos</span>
                              {/* Usamos || 0 por si el backend aún no manda el dato, para que no truene */}
                              <p className="font-bold text-black">{event.boletos_vendidos || 0}</p>
                            </div>
                            <div>
                              <span className="text-zinc-400">Recaudado</span>
                              <p className="font-bold text-emerald-600">
                                ${((event.boletos_vendidos || 0) * Number(event.precio)).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── TAB: CREAR EVENTO ─────────────────────────────────── */}
            {activeTab === "create" && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-black mb-6">Crear nuevo evento</h2>

                {/* Resultado del submit */}
                <AnimatePresence>
                  {submitResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                        submitResult.ok
                          ? "bg-green-50 border border-green-200 text-green-700"
                          : "bg-red-50 border border-red-200 text-red-600"
                      }`}
                    >
                      {submitResult.ok
                        ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                      <p className="font-semibold text-sm">{submitResult.msg}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-5">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">
                      Nombre del evento <span className="text-red-500">*</span>
                    </label>
                    <input name="titulo" value={form.titulo} onChange={handleChange}
                      type="text" placeholder="Ej: Festival de verano 2026"
                      className={inputClass("titulo")} />
                    <FieldError name="titulo" />
                  </div>

                  {/* Fecha y Hora */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-black mb-1.5">
                        Fecha <span className="text-red-500">*</span>
                      </label>
                      <input name="fecha" value={form.fecha} onChange={handleChange}
                        type="date" min={new Date().toISOString().split("T")[0]}
                        className={inputClass("fecha")} />
                      <FieldError name="fecha" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-black mb-1.5">Hora</label>
                      <input name="hora" value={form.hora} onChange={handleChange}
                        type="time" className="w-full px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm" />
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">
                      Ubicación <span className="text-red-500">*</span>
                    </label>
                    <input name="ubicacion" value={form.ubicacion} onChange={handleChange}
                      type="text" placeholder="Ciudad o nombre del lugar"
                      className={inputClass("ubicacion")} />
                    <FieldError name="ubicacion" />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                      rows={4} placeholder="Describe tu evento (mínimo 20 caracteres)..."
                      className={`${inputClass("descripcion")} resize-none`} />
                    <div className="flex justify-between items-start">
                      <FieldError name="descripcion" />
                      <span className={`text-xs mt-1 ml-auto ${form.descripcion.length < 20 ? "text-zinc-400" : "text-green-600"}`}>
                        {form.descripcion.length}/20 mín.
                      </span>
                    </div>
                  </div>

                  {/* Precio y Capacidad */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-black mb-1.5">
                        Precio (MXN) <span className="text-red-500">*</span>
                      </label>
                      <input name="precio" value={form.precio} onChange={handleChange}
                        type="number" min="0" step="0.01" placeholder="0 para gratis"
                        className={inputClass("precio")} />
                      <FieldError name="precio" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-black mb-1.5">
                        Capacidad <span className="text-red-500">*</span>
                      </label>
                      <input name="capacidad" value={form.capacidad} onChange={handleChange}
                        type="number" min="1" placeholder="Número de lugares"
                        className={inputClass("capacidad")} />
                      <FieldError name="capacidad" />
                    </div>
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">Categoría</label>
                    <select name="categoria" value={form.categoria} onChange={handleChange}
                      className="w-full px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm bg-white">
                      <option value="Musica">Música</option>
                      <option value="Deportes">Deportes</option>
                      <option value="Entretenimiento">Entretenimiento</option>
                      <option value="Conferencias">Conferencias</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>

                  {/* Imagen (URL) */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">
                      Imagen del evento
                      <span className="ml-1 text-xs font-normal text-zinc-400">(URL pública)</span>
                    </label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input name="imagen" value={form.imagen} onChange={handleChange}
                        type="url" placeholder="https://ejemplo.com/imagen.jpg"
                        className={`w-full pl-11 pr-4 py-3 border focus:outline-none transition-colors text-sm ${
                          formErrors.imagen
                            ? "border-red-400 bg-red-50"
                            : "border-zinc-300 focus:border-black"
                        }`} />
                    </div>
                    <FieldError name="imagen" />
                    <p className="mt-1.5 ml-1 text-xs text-zinc-400">
                      Sube tu imagen a <a href="https://imgur.com" target="_blank" rel="noreferrer"
                        className="underline hover:text-black">imgur.com</a> o similar y pega la URL aquí
                    </p>

                    {/* Preview de la imagen */}
                    <AnimatePresence>
                      {form.imagen && !formErrors.imagen && !imagePreviewError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden"
                        >
                          <p className="text-xs text-zinc-400 mb-1.5 font-semibold uppercase tracking-wide">Vista previa</p>
                          <img
                            src={form.imagen} alt="Preview"
                            className="w-full h-40 object-cover rounded-lg border border-zinc-200"
                            onError={() => setImagePreviewError(true)}
                          />
                        </motion.div>
                      )}
                      {imagePreviewError && form.imagen && (
                        <motion.p
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="mt-2 text-xs text-amber-600 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3" />
                          No se pudo cargar la imagen. Verifica que la URL sea accesible.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                {/* Imagen Banner (Hero) */}
                  <div>
                    <label className="block text-sm font-semibold text-black mb-1.5">
                      Imagen Banner
                      <span className="ml-1 text-xs font-normal text-zinc-400">
                        (para el carrusel principal — formato panorámico recomendado)
                      </span>
                    </label>
                    <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      name="imagen_banner"
                      value={form.imagen_banner}
                      onChange={handleChange}
                      type="url"
                      placeholder="https://ejemplo.com/banner.jpg"
                      className="w-full pl-11 pr-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors text-sm"
                    />
                  </div>
                  <p className="mt-1.5 ml-1 text-xs text-zinc-400">
                    Usa imágenes de al menos <strong>1280×480px</strong>. Recomendado:{" "}
                    <a href="https://unsplash.com" target="_blank" rel="noreferrer"
                      className="underline hover:text-black">unsplash.com</a> (gratis y alta resolución)
                  </p>

                  {/* Preview del banner */}
                  <AnimatePresence>
                    {form.imagen_banner && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <p className="text-xs text-zinc-400 mb-1.5 font-semibold uppercase tracking-wide">
                          Vista previa banner
                        </p>
                        <img
                          src={form.imagen_banner}
                          alt="Banner preview"
                          className="w-full h-32 object-cover rounded-lg border border-zinc-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                  {/* Botones */}
                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSubmit("publicado")}
                      disabled={submitting}
                      className="flex-1 py-3 bg-black text-white font-semibold hover:bg-zinc-800 transition-colors rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Publicar evento</>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmit("borrador")}
                      disabled={submitting}
                      className="px-6 py-3 border border-zinc-300 text-black font-semibold hover:bg-zinc-100 transition-colors rounded-lg disabled:opacity-50"
                    >
                      Guardar borrador
                    </button>
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