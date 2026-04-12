import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, User, Check, AlertCircle, Crown, Loader2, CreditCard } from "lucide-react";

// ── Inicializar Stripe (fuera del componente) ─────────────────────
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

// ── Tipos (sin cambios) ───────────────────────────────────────────
interface PurchaseModalProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    price: string;
    location?: string;
    image?: string;
    tickets: number;
  };
  isPremiumUser?: boolean;
  currentUser?: { id: number; nombre: string; email: string } | null;
  onClose: () => void;
  onPurchaseComplete?: (ticketData: {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventVenue: string;
    eventLocation: string;
    eventImage: string;
    seats: string[];
    totalPrice: string;
  }) => void;
}

interface Seat {
  id: string;
  row: string;
  number: number;
  status: "available" | "occupied" | "selected";
  isVIP: boolean;
}

const generateDynamicSeats = (capacity: number, occupiedList: string[]): Seat[] => {
  const seats: Seat[] = [];
  let seatsPerRow = 12;
  if (capacity > 200) seatsPerRow = Math.ceil(capacity / 26);
  const totalRows = Math.ceil(capacity / seatsPerRow);

  const getRowLetter = (index: number) => {
    let letter = "";
    let temp = index;
    while (temp >= 0) {
      letter = String.fromCharCode(65 + (temp % 26)) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  let count = 0;
  for (let r = 0; r < totalRows; r++) {
    const rowLetter = getRowLetter(r);
    const isVIP = r < 2;
    for (let i = 1; i <= seatsPerRow; i++) {
      if (count >= capacity) break;
      const seatId = `${rowLetter}${i}`;
      seats.push({
        id: seatId, row: rowLetter, number: i,
        status: occupiedList.includes(seatId) ? "occupied" : "available",
        isVIP,
      });
      count++;
    }
  }
  return seats;
};

// ── Formulario de pago Stripe ─────────────────────────────────────
function StripePaymentForm({
  totalPrice,
  selectedSeats,
  event,
  currentUser,
  ordenId,
  onSuccess,
  onError,
}: {
  totalPrice: number;
  selectedSeats: Seat[];
  event: PurchaseModalProps["event"];
  currentUser: PurchaseModalProps["currentUser"];
  ordenId: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg("");

    // Confirmar el pago con Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMsg(error.message || "Error al procesar el pago");
      setLoading(false);
      onError(error.message || "Pago rechazado");
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Notificar al backend que confirme la orden
      try {
        const res = await fetch("http://localhost:3001/api/pagos/confirmar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_intent_id: paymentIntent.id,
            orden_id: ordenId,
            email_usuario: currentUser?.email || "",
            nombre_usuario: currentUser?.nombre || "",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensaje);
        onSuccess();
      } catch (err: any) {
        onError(err.message);
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resumen */}
      <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-lg">
        <h3 className="font-bold text-black mb-3">Resumen de compra</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedSeats.map((s) => (
            <span key={s.id} className="px-3 py-1 bg-blue-600 text-white font-semibold text-sm rounded">
              {s.id}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between font-bold text-lg border-t border-zinc-200 pt-3">
          <span>Total a pagar</span>
          <span>${totalPrice.toLocaleString()} MXN</span>
        </div>
      </div>

      {/* Stripe Payment Element — renderiza tarjeta, OXXO, etc. */}
      <div className="border border-zinc-200 rounded-lg p-4">
        <PaymentElement />
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900">
          Pago seguro procesado por Stripe. No almacenamos datos de tarjetas.
        </p>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 bg-black text-white font-semibold text-lg hover:bg-zinc-800 transition-colors rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
        ) : (
          <><CreditCard className="w-5 h-5" /> Confirmar y pagar ${totalPrice.toLocaleString()} MXN</>
        )}
      </button>
    </form>
  );
}

// ── Componente principal ──────────────────────────────────────────
export function PurchaseModal({ event, isPremiumUser, currentUser, onClose, onPurchaseComplete }: PurchaseModalProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [step, setStep] = useState<"seats" | "payment" | "confirmation" | "error">("seats");

  // Estado Stripe
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [ordenId, setOrdenId] = useState<number | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoadingSeats(true);
        const res = await fetch(`http://localhost:3001/api/eventos/${event.id}/asientos-ocupados`);
        const data = await res.json();
        setSeats(generateDynamicSeats(data.capacidad, data.asientosOcupados));
      } catch {
        setSeats(generateDynamicSeats(event.tickets || 120, []));
      } finally {
        setLoadingSeats(false);
      }
    };
    fetchSeats();
  }, [event.id, event.tickets]);

  const selectedSeats = seats.filter((s) => s.status === "selected");
  const totalSeats = selectedSeats.length;
  const pricePerSeat = parseFloat(event.price.replace(/[^0-9.]/g, ""));
  const totalPrice = totalSeats * pricePerSeat;

  const toggleSeat = (seatId: string) => {
    setSeats((prev) =>
      prev.map((seat) => {
        if (seat.id !== seatId || seat.status === "occupied") return seat;
        if (seat.isVIP && !isPremiumUser) return seat;
        return { ...seat, status: seat.status === "selected" ? "available" : "selected" };
      })
    );
  };

  // Crear PaymentIntent al ir al pago
  const handleContinueToPayment = async () => {
    if (totalSeats === 0) return;
    setLoadingPayment(true);
    setPaymentError("");

    try {
      const res = await fetch("http://localhost:3001/api/pagos/crear-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evento_id: event.id,
          usuario_id: currentUser?.id || 1,
          asientos: selectedSeats.map((s) => s.id),
          total: totalPrice,
          email_usuario: currentUser?.email || "",
        }),
      });

      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); }
      catch { throw new Error(`Error ${res.status} del servidor`); }

      if (!res.ok) throw new Error(data.mensaje);

      setClientSecret(data.clientSecret);
      setOrdenId(data.orden_id);
      setStep("payment");
    } catch (err: any) {
      setPaymentError(err.message);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (onPurchaseComplete) {
      onPurchaseComplete({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventVenue: event.venue,
        eventLocation: event.location || "",
        eventImage: event.image || "",
        seats: selectedSeats.map((s) => s.id),
        totalPrice: `$${totalPrice.toLocaleString()}`,
      });
    }
    setStep("confirmation");
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.isVIP) {
      if (seat.status === "occupied") return "bg-zinc-400 border-zinc-400 cursor-not-allowed";
      if (seat.status === "selected") return "bg-amber-500 border-amber-500 text-white shadow-lg";
      if (!isPremiumUser) return "bg-amber-100 border-amber-300 cursor-not-allowed opacity-60";
      return "bg-amber-100 border-amber-300 hover:bg-amber-200";
    }
    switch (seat.status) {
      case "available": return "bg-zinc-100 hover:bg-blue-100 border-zinc-300 hover:border-blue-400";
      case "occupied":  return "bg-zinc-400 border-zinc-400 cursor-not-allowed";
      case "selected":  return "bg-blue-600 border-blue-600 text-white";
    }
  };

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
          className="max-w-6xl mx-auto bg-white rounded-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-zinc-200 p-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">{event.title}</h1>
              <p className="text-zinc-600">{event.date} • {event.time} • {event.venue}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* ── PASO 1: Selección de asientos ── */}
          {step === "seats" && (
            <div className="p-6">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-black mb-6">Selecciona tus asientos</h2>
                  <div className="bg-zinc-900 text-white text-center py-3 mb-8 font-semibold rounded">ESCENARIO</div>

                  <div className="flex flex-wrap gap-4 mb-6 text-sm">
                    {[
                      { color: "bg-zinc-100 border-zinc-300", label: "Disponible" },
                      { color: "bg-blue-600 border-blue-600", label: "Seleccionado" },
                      { color: "bg-zinc-400 border-zinc-400", label: "Ocupado" },
                      { color: "bg-amber-100 border-amber-300", label: "VIP", icon: true },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-6 h-6 ${item.color} border-2 rounded`} />
                        <span className="text-zinc-600 flex items-center gap-1">
                          {item.icon && <Crown className="w-4 h-4 text-amber-600" />}
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {!isPremiumUser && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                      <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900">Asientos VIP exclusivos para Premium</p>
                        <p className="text-xs text-amber-800 mt-0.5">Las filas A y B son VIP. Suscríbete a Premium para acceder.</p>
                      </div>
                    </div>
                  )}

                  {loadingSeats ? (
                    <div className="flex flex-col items-center py-16 text-zinc-400">
                      <Loader2 className="w-10 h-10 animate-spin mb-4" />
                      <p className="font-semibold">Cargando disponibilidad...</p>
                    </div>
                  ) : (
                    <div className="space-y-3 overflow-x-auto pb-4">
                      {Array.from(new Set(seats.map((s) => s.row))).map((row) => (
                        <div key={row} className="flex items-center gap-2">
                          <div className="w-8 font-bold text-black text-center flex-shrink-0">{row}</div>
                          <div className="flex gap-2 min-w-max">
                            {seats.filter((s) => s.row === row).map((seat) => (
                              <button
                                key={seat.id}
                                onClick={() => toggleSeat(seat.id)}
                                disabled={seat.status === "occupied"}
                                className={`w-10 h-10 border-2 rounded transition-all font-semibold text-xs ${getSeatColor(seat)}`}
                                title={`Asiento ${seat.id}`}
                              >
                                {seat.number}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resumen lateral */}
                <div className="lg:col-span-1">
                  <div className="sticky top-6 border border-zinc-200 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-black mb-4">Resumen</h3>
                    {selectedSeats.length > 0 ? (
                      <>
                        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                          {selectedSeats.map((seat) => (
                            <div key={seat.id} className="flex items-center justify-between text-sm">
                              <span className="font-semibold">Asiento {seat.id}</span>
                              <button onClick={() => toggleSeat(seat.id)} className="text-red-600 text-xs font-semibold">Quitar</button>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-zinc-200 pt-3 space-y-2 mb-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-600">Tickets</span>
                            <span className="font-semibold">{totalSeats}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-600">Precio c/u</span>
                            <span className="font-semibold">{event.price}</span>
                          </div>
                          <div className="flex justify-between text-lg border-t pt-2 font-bold">
                            <span>Total</span>
                            <span>${totalPrice.toLocaleString()} MXN</span>
                          </div>
                        </div>

                        {paymentError && (
                          <p className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded">{paymentError}</p>
                        )}

                        <button
                          onClick={handleContinueToPayment}
                          disabled={loadingPayment}
                          className="w-full py-3 bg-black text-white font-semibold hover:bg-zinc-800 transition-colors rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {loadingPayment
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparando pago...</>
                            : "Continuar al pago"}
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-12 text-zinc-400">
                        <User className="w-12 h-12 mx-auto mb-3" />
                        <p>Selecciona tus asientos para continuar</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PASO 2: Pago con Stripe ── */}
          {step === "payment" && clientSecret && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <button onClick={() => setStep("seats")} className="mb-6 text-sm font-semibold text-zinc-600 hover:text-black">
                  ← Volver a selección de asientos
                </button>
                <h2 className="text-2xl font-bold text-black mb-6">Pago seguro</h2>

                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: { theme: "stripe", variables: { colorPrimary: "#000" } },
                  }}
                >
                  <StripePaymentForm
                    totalPrice={totalPrice}
                    selectedSeats={selectedSeats}
                    event={event}
                    currentUser={currentUser}
                    ordenId={ordenId!}
                    onSuccess={handlePaymentSuccess}
                    onError={(msg) => setPaymentError(msg)}
                  />
                </Elements>
              </div>
            </div>
          )}

          {/* ── PASO 3: Confirmación ── */}
          {step === "confirmation" && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto text-center py-12">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-12 h-12 text-green-600" />
                </motion.div>
                <h2 className="text-4xl font-bold text-black mb-4">¡Compra exitosa!</h2>
                <p className="text-xl text-zinc-600 mb-2">Tus tickets han sido confirmados.</p>
                <p className="text-sm text-zinc-500 mb-8">
                  Recibirás un email de confirmación con tus códigos QR en {currentUser?.email || "tu correo"}.
                </p>

                <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-lg mb-8 text-left">
                  <h3 className="font-bold mb-3">Resumen</h3>
                  <p className="text-sm text-zinc-600 mb-1"><strong>Evento:</strong> {event.title}</p>
                  <p className="text-sm text-zinc-600 mb-1"><strong>Fecha:</strong> {event.date} • {event.time}</p>
                  <p className="text-sm text-zinc-600 mb-3"><strong>Lugar:</strong> {event.venue}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSeats.map((s) => (
                      <span key={s.id} className="px-3 py-1 bg-black text-white font-semibold text-sm rounded">{s.id}</span>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold border-t pt-3">
                    <span>Total pagado</span>
                    <span>${totalPrice.toLocaleString()} MXN</span>
                  </div>
                </div>

                <button onClick={onClose} className="w-full py-3 bg-black text-white font-semibold hover:bg-zinc-800 rounded-lg">
                  Volver al inicio
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}