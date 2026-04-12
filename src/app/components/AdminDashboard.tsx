import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Users, Calendar, Activity, Search,
  CheckCircle, XCircle, Loader2, Building,
  AlertCircle, RefreshCw, Trash2, Crown
} from "lucide-react";

interface AdminDashboardProps {
  onClose: () => void;
}

// ── Tipos ────────────────────────────────────────────────────────
interface Stats {
  total_usuarios: number;
  eventos_activos: number;
  organizadores_pendientes: number;
}

interface Organizador {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  negocio: string;
  descripcion: string | null;
  created_at: string;
}

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  tipo: "Normal" | "Premium";
  created_at: string;
}

interface OrgAprobado {
  id: number;
  nombre: string;
  email: string;
  negocio: string;
  telefono: string;
  estado: number;
  created_at: string;
}

const API = "http://localhost:3001/api/admin";

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "pendientes" | "usuarios">("overview");

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Pendientes
  const [pendientes, setPendientes] = useState<Organizador[]>([]);
  const [loadingPendientes, setLoadingPendientes] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionResult, setActionResult] = useState<{ id: number; ok: boolean; msg: string } | null>(null);

  // Usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [organizadores, setOrganizadores] = useState<OrgAprobado[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [searchUsuarios, setSearchUsuarios] = useState("");

  // ── Fetch stats ──────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`${API}/stats`);
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── Fetch pendientes ─────────────────────────────────────────
  const fetchPendientes = useCallback(async () => {
    setLoadingPendientes(true);
    try {
      const res = await fetch(`${API}/organizadores-pendientes`);
      const data = await res.json();
      setPendientes(data);
    } catch {
      setPendientes([]);
    } finally {
      setLoadingPendientes(false);
    }
  }, []);

  // ── Fetch usuarios ───────────────────────────────────────────
  const fetchUsuarios = useCallback(async () => {
    setLoadingUsuarios(true);
    try {
      const res = await fetch(`${API}/usuarios`);
      const data = await res.json();
      setUsuarios(data.usuarios || []);
      setOrganizadores(data.organizadores || []);
    } catch {
      setUsuarios([]);
      setOrganizadores([]);
    } finally {
      setLoadingUsuarios(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    if (activeTab === "pendientes") fetchPendientes();
    if (activeTab === "usuarios") fetchUsuarios();
  }, [activeTab, fetchPendientes, fetchUsuarios]);

  // ── Aprobar organizador ──────────────────────────────────────
  const handleAprobar = async (id: number) => {
    setActionLoading(id);
    setActionResult(null);
    try {
      const res = await fetch(`${API}/organizadores/${id}/aprobar`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje);
      setActionResult({ id, ok: true, msg: "Organizador aprobado ✓" });
      // Quitar de la lista y actualizar stats
      setPendientes((prev) => prev.filter((o) => o.id !== id));
      setStats((prev) => prev
        ? { ...prev, organizadores_pendientes: Math.max(0, prev.organizadores_pendientes - 1) }
        : prev
      );
    } catch (err: any) {
      setActionResult({ id, ok: false, msg: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Rechazar organizador ─────────────────────────────────────
  const handleRechazar = async (id: number) => {
    if (!confirm("¿Seguro que quieres rechazar y eliminar esta solicitud?")) return;
    setActionLoading(id);
    setActionResult(null);
    try {
      const res = await fetch(`${API}/organizadores/${id}/rechazar`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje);
      setActionResult({ id, ok: true, msg: "Solicitud rechazada" });
      setPendientes((prev) => prev.filter((o) => o.id !== id));
      setStats((prev) => prev
        ? { ...prev, organizadores_pendientes: Math.max(0, prev.organizadores_pendientes - 1) }
        : prev
      );
    } catch (err: any) {
      setActionResult({ id, ok: false, msg: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Eliminar usuario ─────────────────────────────────────────
  const handleEliminarUsuario = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;
    try {
      await fetch(`${API}/usuarios/${id}`, { method: "DELETE" });
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      setStats((prev) => prev
        ? { ...prev, total_usuarios: Math.max(0, prev.total_usuarios - 1) }
        : prev
      );
    } catch {
      alert("Error al eliminar usuario");
    }
  };

  // ── Filtro búsqueda usuarios ─────────────────────────────────
  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUsuarios.toLowerCase())
  );
  const filteredOrganizadores = organizadores.filter(
    (o) =>
      o.nombre.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
      o.email.toLowerCase().includes(searchUsuarios.toLowerCase()) ||
      o.negocio.toLowerCase().includes(searchUsuarios.toLowerCase())
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

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
          <div className="p-6 flex items-center justify-between bg-zinc-900 text-white">
            <div>
              <h1 className="text-3xl font-bold mb-1">Panel de Administración</h1>
              <p className="text-white/70 text-sm">Control total de la plataforma</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchStats}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Actualizar datos"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-zinc-200 px-6 bg-white">
            <div className="flex gap-8">
              {([
                { key: "overview",    label: "Resumen" },
                { key: "pendientes",  label: "Solicitudes pendientes",
                  badge: stats?.organizadores_pendientes },
                { key: "usuarios",    label: "Usuarios" },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.key
                      ? "border-black text-black"
                      : "border-transparent text-zinc-500 hover:text-black"
                  }`}
                >
                  {tab.label}
                  {"badge" in tab && tab.badge && tab.badge > 0 && (
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">

            {/* ── TAB: RESUMEN ─────────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {loadingStats ? (
                  <div className="flex items-center justify-center py-20 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando estadísticas...
                  </div>
                ) : stats ? (
                  <>
                    {/* KPI cards — sin "Pendientes" como pediste */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Users className="w-5 h-5 text-blue-600" />
                          <p className="text-sm font-semibold text-blue-900">Usuarios registrados</p>
                        </div>
                        <p className="text-4xl font-bold text-blue-900">
                          {stats.total_usuarios.toLocaleString()}
                        </p>
                        <p className="text-xs text-blue-600 mt-2">Desde la base de datos</p>
                      </div>

                      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="w-5 h-5 text-green-600" />
                          <p className="text-sm font-semibold text-green-900">Eventos publicados</p>
                        </div>
                        <p className="text-4xl font-bold text-green-900">
                          {stats.eventos_activos.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600 mt-2">Estado: publicado</p>
                      </div>

                      <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Activity className="w-5 h-5 text-orange-600" />
                          <p className="text-sm font-semibold text-orange-900">Solicitudes pendientes</p>
                        </div>
                        <p className="text-4xl font-bold text-orange-900">
                          {stats.organizadores_pendientes}
                        </p>
                        <p className="text-xs text-orange-600 mt-2">Organizadores por aprobar</p>
                        {stats.organizadores_pendientes > 0 && (
                          <button
                            onClick={() => setActiveTab("pendientes")}
                            className="mt-3 text-xs font-bold text-orange-700 underline hover:no-underline"
                          >
                            Ver solicitudes →
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Info rápida */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-5">
                      <h3 className="font-bold text-black mb-3 text-sm uppercase tracking-wide">
                        Acerca del rol de Administrador
                      </h3>
                      <ul className="space-y-2 text-sm text-zinc-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          Aprobar o rechazar solicitudes de nuevos organizadores
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          Ver todos los usuarios registrados en la plataforma
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          Eliminar usuarios si es necesario
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          Ver estadísticas en tiempo real de la plataforma
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-zinc-400">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No se pudieron cargar las estadísticas</p>
                    <button onClick={fetchStats} className="mt-3 text-sm underline text-zinc-500 hover:text-black">
                      Reintentar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: SOLICITUDES PENDIENTES ──────────────────────── */}
            {activeTab === "pendientes" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-black">Solicitudes de organizadores</h2>
                    <p className="text-sm text-zinc-500 mt-1">
                      Revisa y aprueba los registros de nuevos organizadores
                    </p>
                  </div>
                  <button
                    onClick={fetchPendientes}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-zinc-300 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Actualizar
                  </button>
                </div>

                {loadingPendientes ? (
                  <div className="flex items-center justify-center py-20 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando solicitudes...
                  </div>
                ) : pendientes.length === 0 ? (
                  <div className="text-center py-20 text-zinc-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30 text-green-500" />
                    <p className="font-semibold text-lg">¡Todo al día!</p>
                    <p className="text-sm mt-1">No hay solicitudes pendientes de aprobación</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {pendientes.map((org) => (
                        <motion.div
                          key={org.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border border-zinc-200 rounded-lg overflow-hidden"
                        >
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              {/* Info del organizador */}
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Building className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-black text-lg">{org.nombre}</h3>
                                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                      Pendiente
                                    </span>
                                  </div>
                                  <div className="space-y-0.5 text-sm text-zinc-600">
                                    <p>📧 {org.email}</p>
                                    <p>🏢 {org.negocio}</p>
                                    {org.telefono && <p>📞 {org.telefono}</p>}
                                    {org.descripcion && (
                                      <p className="text-zinc-500 italic mt-1">"{org.descripcion}"</p>
                                    )}
                                    <p className="text-xs text-zinc-400 mt-1">
                                      Solicitado el {formatDate(org.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Badge de estado de la acción */}
                              {actionResult?.id === org.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 flex-shrink-0 ${
                                    actionResult.ok
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {actionResult.ok
                                    ? <CheckCircle className="w-3 h-3" />
                                    : <AlertCircle className="w-3 h-3" />}
                                  {actionResult.msg}
                                </motion.div>
                              )}
                            </div>

                            {/* Botones de acción */}
                            <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-100">
                              <button
                                onClick={() => handleAprobar(org.id)}
                                disabled={actionLoading === org.id}
                                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors rounded-lg disabled:opacity-50"
                              >
                                {actionLoading === org.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Aprobar organización
                              </button>
                              <button
                                onClick={() => handleRechazar(org.id)}
                                disabled={actionLoading === org.id}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 font-semibold text-sm hover:bg-red-100 transition-colors rounded-lg disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" />
                                Rechazar
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: USUARIOS ────────────────────────────────────── */}
            {activeTab === "usuarios" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-black">Gestión de usuarios</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={searchUsuarios}
                      onChange={(e) => setSearchUsuarios(e.target.value)}
                      placeholder="Buscar por nombre, email..."
                      className="pl-9 pr-4 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-black w-64"
                    />
                  </div>
                </div>

                {loadingUsuarios ? (
                  <div className="flex items-center justify-center py-20 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando usuarios...
                  </div>
                ) : (
                  <div className="space-y-8">

                    {/* Usuarios normales */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-500 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Usuarios ({filteredUsuarios.length})
                      </h3>
                      {filteredUsuarios.length === 0 ? (
                        <p className="text-zinc-400 text-sm py-4">Sin resultados</p>
                      ) : (
                        <div className="space-y-2">
                          {filteredUsuarios.map((u) => (
                            <div
                              key={u.id}
                              className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-zinc-900 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                  {u.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-black text-sm">{u.nombre}</p>
                                    {u.tipo === "Premium" && (
                                      <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Crown className="w-3 h-3" /> Premium
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-zinc-500">{u.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="text-xs text-zinc-400 hidden sm:block">
                                  {formatDate(u.created_at)}
                                </p>
                                <button
                                  onClick={() => handleEliminarUsuario(u.id)}
                                  className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-lg transition-colors"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Organizadores aprobados */}
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-500 mb-3 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Organizadores aprobados ({filteredOrganizadores.filter(o => o.estado === 1).length})
                      </h3>
                      {filteredOrganizadores.filter(o => o.estado === 1).length === 0 ? (
                        <p className="text-zinc-400 text-sm py-4">Sin resultados</p>
                      ) : (
                        <div className="space-y-2">
                          {filteredOrganizadores.filter(o => o.estado === 1).map((o) => (
                            <div
                              key={o.id}
                              className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                  {o.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-black text-sm">{o.nombre}</p>
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                      Organizador
                                    </span>
                                  </div>
                                  <p className="text-xs text-zinc-500">{o.email} · {o.negocio}</p>
                                </div>
                              </div>
                              <p className="text-xs text-zinc-400 hidden sm:block">
                                {formatDate(o.created_at)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}