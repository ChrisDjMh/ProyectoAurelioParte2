import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, DollarSign, TrendingUp, Users, RefreshCw,
  Loader2, AlertCircle, FileText, Download, Building,
  ChevronDown, ChevronUp, Calendar, CreditCard, Landmark
} from "lucide-react";

interface ContadorDashboardProps {
  onClose: () => void;
}

interface Resumen {
  total_ordenes: number;
  total_recaudado: number;
  total_organizadores: number;
  total_comisiones: number;
  total_premium: number;
}

interface StripeBalance {
  disponible: number;
  pendiente: number;
}

interface EventoFinanciero {
  evento_id: number;
  evento: string;
  fecha: string;
  ubicacion: string;
  organizador: string;
  negocio: string;
  email_organizador: string;
  boletos_vendidos: number;
  total_recaudado: number;
  pago_organizador: number;
  comision_ticketx: number;
  ultimo_pago: string | null;
}

interface PagoHistorial {
  pago_id: number;
  referencia: string;
  metodo: string;
  estado_pago: string;
  fecha_pago: string;
  total: number;
  usuario: string;
  email_usuario: string;
  evento: string;
  organizador: string;
}

const API = "http://localhost:3001/api/pagos";
const fmt = (n: number) => `$${Number(n || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

// Tasa promedio efectiva de Stripe en México (basado en tus datos: ~4.88%)
const TASA_STRIPE_ESTIMADA = 0.0488; 

export function ContadorDashboard({ onClose }: ContadorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"resumen" | "eventos" | "historial">("resumen");
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [stripeBalance, setStripeBalance] = useState<StripeBalance | null>(null);
  const [eventos, setEventos] = useState<EventoFinanciero[]>([]);
  const [historial, setHistorial] = useState<PagoHistorial[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // ── Fetches ──────────────────────────────────────────────────
  const fetchResumen = useCallback(async () => {
    setLoading(true);
    try {
      const [resDb, resStripe] = await Promise.all([
        fetch(`${API}/contador/resumen`),
        fetch(`${API}/stripe-balance`)
      ]);

      if (resDb.ok) setResumen(await resDb.json());
      
      if (resStripe.ok) {
        const stripeData = await resStripe.json();
        const disponible = stripeData.available.reduce((acc: number, val: any) => acc + val.amount, 0) / 100;
        const pendiente = stripeData.pending.reduce((acc: number, val: any) => acc + val.amount, 0) / 100;
        setStripeBalance({ disponible, pendiente });
      }
    } catch (error) { 
      console.error("Error cargando resumen:", error);
    } finally { 
      setLoading(false); 
    }
  }, []);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/contador/por-evento`);
      setEventos(await res.json());
    } catch { setEventos([]); }
    finally { setLoading(false); }
  }, []);

  const fetchHistorial = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/contador/historial`);
      setHistorial(await res.json());
    } catch { setHistorial([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchResumen(); }, [fetchResumen]);
  useEffect(() => {
    if (activeTab === "eventos") fetchEventos();
    if (activeTab === "historial") fetchHistorial();
  }, [activeTab, fetchEventos, fetchHistorial]);

  // ── Generar PDF ───────────────────────────────────────────────
  const generarPDF = async () => {
    setGeneratingPDF(true);

    const [resData, evData] = await Promise.all([
      fetch(`${API}/contador/resumen`).then(r => r.json()),
      fetch(`${API}/contador/por-evento`).then(r => r.json()),
    ]);

    const comisionStripeGlobal = resData.total_recaudado * TASA_STRIPE_ESTIMADA;
    const ingresoNetoGlobal = resData.total_comisiones - comisionStripeGlobal;

    const fechaHoy = new Date().toLocaleDateString("es-ES", {
      day: "numeric", month: "long", year: "numeric"
    });

    const filasEventos = (evData as EventoFinanciero[]).map(e => {
      const stripeEstimado = e.total_recaudado * TASA_STRIPE_ESTIMADA;
      const ticketxNeto = e.comision_ticketx - stripeEstimado;

      return `
        <tr>
          <td>${e.evento}</td>
          <td>${e.organizador}<br/><small style="color:#666">${e.negocio}</small></td>
          <td style="text-align:right">${fmt(e.total_recaudado)}</td>
          <td style="text-align:right;color:#16a34a">${fmt(e.pago_organizador)}</td>
          <td style="text-align:right;color:#dc2626">-${fmt(stripeEstimado)}</td>
          <td style="text-align:right;color:#7c3aed;font-weight:bold">${fmt(ticketxNeto)}</td>
        </tr>
      `;
    }).join("");

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: Arial, sans-serif; color: #111; padding: 40px; }
          .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; padding-bottom:16px; border-bottom:2px solid #000; }
          .logo { font-size:28px; font-weight:900; letter-spacing:-1px; }
          .meta { text-align:right; font-size:12px; color:#555; }
          .title { font-size:20px; font-weight:700; margin-bottom:24px; }
          .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:32px; }
          .kpi { background:#f5f5f5; border:1px solid #e0e0e0; border-radius:8px; padding:14px; }
          .kpi-label { font-size:11px; color:#666; text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
          .kpi-value { font-size:20px; font-weight:700; }
          table { width:100%; border-collapse:collapse; font-size:13px; }
          thead tr { background:#000; color:#fff; }
          thead th { padding:10px 8px; text-align:left; font-weight:600; }
          tbody tr:nth-child(even) { background:#fafafa; }
          tbody td { padding:9px 8px; border-bottom:1px solid #eee; vertical-align:top; }
          .footer { margin-top:40px; padding-top:16px; border-top:1px solid #ddd; font-size:11px; color:#999; text-align:center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">TICKETX</div>
            <div style="font-size:13px;color:#555;margin-top:4px;">Reporte Financiero de Rendimientos</div>
          </div>
          <div class="meta">
            <div>Generado: ${fechaHoy}</div>
            <div style="margin-top:4px;font-weight:600">CONFIDENCIAL</div>
          </div>
        </div>

        <div class="title">Resumen de Ingresos y Comisiones</div>
        <div class="kpis">
          <div class="kpi">
            <div class="kpi-label">Volumen Bruto</div>
            <div class="kpi-value">${fmt(resData.total_recaudado)}</div>
          </div>
          <div class="kpi">
            <div class="kpi-label">A Organizadores (90%)</div>
            <div class="kpi-value" style="color:#16a34a">${fmt(resData.total_organizadores)}</div>
          </div>
          <div class="kpi">
            <div class="kpi-label">Comisiones Stripe</div>
            <div class="kpi-value" style="color:#dc2626">-${fmt(comisionStripeGlobal)}</div>
          </div>
          <div class="kpi" style="background:#f3e8ff; border-color:#d8b4fe">
            <div class="kpi-label" style="color:#6b21a8">TicketX Neto</div>
            <div class="kpi-value" style="color:#7c3aed">${fmt(ingresoNetoGlobal)}</div>
          </div>
        </div>

        <div class="title" style="margin-top:32px">Desglose por Evento</div>
        <table>
          <thead>
            <tr>
              <th>Evento</th>
              <th>Organizador</th>
              <th style="text-align:right">Recaudado</th>
              <th style="text-align:right">A Organizador</th>
              <th style="text-align:right">Tarifa Stripe</th>
              <th style="text-align:right">Ganancia TicketX</th>
            </tr>
          </thead>
          <tbody>${filasEventos}</tbody>
        </table>

        <div class="footer">
          TicketX © ${new Date().getFullYear()} — Documento generado automáticamente.<br/>
          La tarifa de Stripe es una estimación del 4.88% por procesamiento de pagos con tarjeta de crédito/débito.
        </div>
      </body>
      </html>
    `;

    const ventana = window.open("", "_blank", "width=900,height=700");
    if (ventana) {
      ventana.document.write(html);
      ventana.document.close();
      ventana.onload = () => {
        ventana.print();
        setGeneratingPDF(false);
      };
    } else {
      setGeneratingPDF(false);
    }
  };

  // Cálculos globales para la vista resumen
  const comisionStripeCalculada = resumen ? resumen.total_recaudado * TASA_STRIPE_ESTIMADA : 0;
  const gananciaTicketXNeta = resumen ? resumen.total_comisiones - comisionStripeCalculada : 0;

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
          <div className="p-6 flex items-center justify-between bg-emerald-900 text-white">
            <div>
              <h1 className="text-3xl font-bold mb-1">Panel del Contador</h1>
              <p className="text-emerald-200 text-sm">Gestión financiera, comisiones y pasarelas</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generarPDF}
                disabled={generatingPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-900 font-semibold text-sm rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50"
              >
                {generatingPDF
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</>
                  : <><FileText className="w-4 h-4" /> Exportar PDF</>}
              </button>
              <button
                onClick={fetchResumen}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Actualizar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="border-b border-zinc-200 px-6">
            <div className="flex gap-8">
              {([
                { key: "resumen",   label: "Resumen de Comisiones" },
                { key: "eventos",   label: "Desglose por Evento" },
                { key: "historial", label: "Historial de Transacciones" },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 font-semibold text-sm border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-emerald-700 text-emerald-800"
                      : "border-transparent text-zinc-500 hover:text-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">

            {activeTab === "resumen" && (
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-20 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando datos...
                  </div>
                ) : resumen ? (
                  <>
                    {stripeBalance && (
                      <div className="p-5 bg-[#635BFF] text-white rounded-lg shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/20 rounded-lg">
                            <CreditCard className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-white/80 font-semibold uppercase tracking-wide mb-1">Saldo real en banco Stripe</p>
                            <div className="flex items-end gap-4">
                              <div>
                                <p className="text-3xl font-bold">{fmt(stripeBalance.disponible)}</p>
                                <p className="text-xs text-white/70">Disponible para transferir</p>
                              </div>
                              <div className="pb-1">
                                <p className="text-lg font-semibold text-white/90">{fmt(stripeBalance.pendiente)}</p>
                                <p className="text-xs text-white/60">Pendiente de liquidación</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="hidden md:block text-right">
                          <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-widest uppercase">
                            Sincronizado
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-zinc-500">
                          <DollarSign className="w-4 h-4" />
                          <p className="text-xs font-semibold uppercase tracking-wide">Volumen Bruto</p>
                        </div>
                        <p className="text-2xl font-bold text-black">{fmt(resumen.total_recaudado)}</p>
                        <p className="text-xs text-zinc-400 mt-1">Pagado por los clientes</p>
                        
                        <div className="mt-3 pt-3 border-t border-zinc-200 flex justify-between items-center text-xs">
                          <span className="text-zinc-500"><Users className="w-3 h-3 inline mr-1" />{resumen.total_ordenes} órdenes</span>
                        </div>
                      </div>

                      <div className="p-5 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-green-600">
                          <Building className="w-4 h-4" />
                          <p className="text-xs font-semibold uppercase tracking-wide">A Organizadores (90%)</p>
                        </div>
                        <p className="text-2xl font-bold text-green-700">{fmt(resumen.total_organizadores)}</p>
                        <p className="text-xs text-green-600 mt-1">Su parte intacta</p>
                      </div>

                      <div className="p-5 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-red-600">
                          <Landmark className="w-4 h-4" />
                          <p className="text-xs font-semibold uppercase tracking-wide">Tarifas Stripe (~4.8%)</p>
                        </div>
                        <p className="text-2xl font-bold text-red-700">-{fmt(comisionStripeCalculada)}</p>
                        <p className="text-xs text-red-600 mt-1">Costo de pasarela de pago</p>
                      </div>

                      <div className="p-5 bg-purple-50 border border-purple-200 rounded-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10"><TrendingUp className="w-16 h-16 text-purple-900" /></div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-2 text-purple-700">
                            <TrendingUp className="w-4 h-4" />
                            <p className="text-xs font-bold uppercase tracking-wide">TicketX (Ingreso Neto)</p>
                          </div>
                          <p className="text-3xl font-black text-purple-800">{fmt(gananciaTicketXNeta)}</p>
                          <p className="text-xs text-purple-600 mt-1 font-medium">10% - Tarifas Stripe</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">Nota sobre las tarifas de Stripe</p>
                        <p>Stripe cobra una comisión por cada tarjeta procesada. Para no afectar al organizador del evento, TicketX absorbe este costo deduciéndolo del 10% de comisión original. Los montos de Stripe son estimaciones basadas en un 4.88% promedio.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-zinc-400">
                    <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No se pudo cargar el resumen</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "eventos" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold text-black">
                    Comisiones por evento
                    <span className="ml-2 text-sm font-normal text-zinc-400">({eventos.length} eventos)</span>
                  </h2>
                  <button
                    onClick={fetchEventos}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-zinc-300 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Actualizar
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando...
                  </div>
                ) : eventos.length === 0 ? (
                  <div className="text-center py-20 text-zinc-400">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Aún no hay pagos confirmados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {eventos.map((ev) => {
                      const stripeEstimado = ev.total_recaudado * TASA_STRIPE_ESTIMADA;
                      const ticketxNeto = ev.comision_ticketx - stripeEstimado;

                      return (
                        <div key={ev.evento_id} className="border border-zinc-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setExpandedRow(expandedRow === ev.evento_id ? null : ev.evento_id)}
                            className="w-full p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors text-left"
                          >
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-emerald-700 text-sm">
                                {ev.organizador.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-black text-base leading-tight">{ev.evento}</p>
                                <p className="text-sm text-zinc-500 mt-0.5">
                                  {ev.organizador} · {ev.negocio}
                                </p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-zinc-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {fmtDate(ev.fecha)}
                                  </span>
                                  <span>{ev.boletos_vendidos} boletos vendidos</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 mr-4 flex-shrink-0">
                              <div className="text-right hidden md:block">
                                <p className="text-xs text-zinc-400">Volumen</p>
                                <p className="font-bold text-black">{fmt(ev.total_recaudado)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-green-600">Org (90%)</p>
                                <p className="font-bold text-green-700">{fmt(ev.pago_organizador)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-purple-600 font-bold">Ganancia Neta</p>
                                <p className="font-bold text-purple-700 text-lg">{fmt(ticketxNeto)}</p>
                              </div>
                            </div>

                            {expandedRow === ev.evento_id
                              ? <ChevronUp className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                              : <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0" />}
                          </button>

                          <AnimatePresence>
                            {expandedRow === ev.evento_id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-5 pb-5 pt-2 bg-zinc-50 border-t border-zinc-200">
                                  <div className="bg-white p-4 border border-zinc-200 rounded-lg">
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3 tracking-wider">Desglose de Distribución</h4>
                                    
                                    <div className="flex items-center justify-between mb-2 text-sm">
                                      <span className="text-zinc-600">Volumen Bruto Recaudado</span>
                                      <span className="font-bold text-black">{fmt(ev.total_recaudado)}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mb-2 text-sm">
                                      <span className="text-zinc-600 pl-4 border-l-2 border-green-500">Pago a Organizador (90%)</span>
                                      <span className="font-semibold text-green-600">{fmt(ev.pago_organizador)}</span>
                                    </div>

                                    <div className="flex items-center justify-between mb-2 text-sm">
                                      <span className="text-zinc-600 pl-4 border-l-2 border-red-500">Tarifa Stripe (~4.88%)</span>
                                      <span className="font-semibold text-red-600">-{fmt(stripeEstimado)}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-zinc-200 text-sm">
                                      <span className="text-purple-700 font-bold">Ganancia TicketX Neta</span>
                                      <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">{fmt(ticketxNeto)}</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "historial" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold text-black">
                    Historial de transacciones
                    <span className="ml-2 text-sm font-normal text-zinc-400">({historial.length})</span>
                  </h2>
                  <button
                    onClick={fetchHistorial}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-zinc-300 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Actualizar
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Cargando...
                  </div>
                ) : historial.length === 0 ? (
                  <div className="text-center py-20 text-zinc-400">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No hay transacciones registradas</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-zinc-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-zinc-900 text-white">
                          <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                          <th className="px-4 py-3 text-left font-semibold">Ref Stripe</th>
                          <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                          <th className="px-4 py-3 text-left font-semibold">Evento</th>
                          <th className="px-4 py-3 text-right font-semibold">Volumen Bruto</th>
                          <th className="px-4 py-3 text-right font-semibold">Org (90%)</th>
                          <th className="px-4 py-3 text-center font-semibold">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historial.map((p, i) => (
                          <tr key={p.pago_id} className={i % 2 === 0 ? "bg-white" : "bg-zinc-50"}>
                            <td className="px-4 py-3 text-zinc-600">{fmtDate(p.fecha_pago)}</td>
                            <td className="px-4 py-3 font-mono text-xs text-zinc-500 max-w-24 truncate" title={p.referencia}>
                              {p.referencia?.substring(0, 18)}...
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-black">{p.usuario}</p>
                            </td>
                            <td className="px-4 py-3 text-black font-medium max-w-32 truncate" title={p.evento}>{p.evento}</td>
                            <td className="px-4 py-3 text-right font-bold text-black">{fmt(p.total)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-green-700">{fmt(p.total * 0.90)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full uppercase">
                                {p.estado_pago}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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