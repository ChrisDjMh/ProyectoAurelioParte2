import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { SeatsioSeatingChart } from "@seatsio/seatsio-react";
import type { SeatingChart } from "@seatsio/seatsio-types";
import { X, Check, AlertCircle, Crown, Loader2, CreditCard, User } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

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
    seatsioEventKey?: string;
  };
  isPremiumUser?: boolean;
  currentUser?: { id: number; nombre: string; email: string } | null;
  onClose: () => void;
  onPurchaseComplete?: (ticketData: any) => void;
  onReservationCreated?: (ticketData: any) => void;
  initialStep?: "seats" | "payment";
  existingOrderId?: number;
  preselectedSeats?: string[];
  onGoToMyTickets?: () => void; 
}

interface SeatsioObject {
  label: string;
  labels: { displayedLabel: string; own: string; parent?: string };
  category?: { label: string; color: string; key: number };
  pricing?: { price: number };
  objectType: "Seat" | "GeneralAdmissionArea" | "Table" | "Booth";
}

function StripePaymentForm({ totalPrice, selectedSeats, currentUser, ordenId, onSuccess, onError }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setErrorMsg("");

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
      <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-lg">
        <h3 className="font-bold text-black mb-3">Resumen de compra</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedSeats.map((s: SeatsioObject) => (
            <span key={s.label} className="px-3 py-1 bg-blue-600 text-white font-semibold text-sm rounded">
              {s.labels.displayedLabel}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between font-bold text-lg border-t border-zinc-200 pt-3">
          <span>Total a pagar</span>
          <span>${totalPrice.toLocaleString()} MXN</span>
        </div>
      </div>

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

export function PurchaseModal({
  event,
  isPremiumUser,
  currentUser,
  onClose,
  onPurchaseComplete,
  onReservationCreated,
  initialStep = "seats",
  existingOrderId,
  preselectedSeats,
  onGoToMyTickets 
}: PurchaseModalProps) {

  const chartRef = useRef<SeatingChart | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<SeatsioObject[]>([]);
  const [holdToken, setHoldToken] = useState<string | null>(null);

  const [step, setStep] = useState<"seats" | "payment" | "confirmation">(initialStep);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [ordenId, setOrdenId] = useState<number | null>(existingOrderId || null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [selectionError, setSelectionError] = useState<string | null>(null);

    useEffect(() => {

    if (initialStep === "payment" && !clientSecret) {
      handleContinueToPayment();
    }
  }, []);

  const displaySeats: SeatsioObject[] = preselectedSeats
    ? preselectedSeats.map(id => ({ label: id, labels: { displayedLabel: id, own: id }, objectType: "Seat" } as SeatsioObject))
    : selectedObjects;

  const totalSeats = displaySeats.length;
  const pricePerSeat = parseFloat(event.price.replace(/[^0-9.]/g, ""));
  const totalPrice = totalSeats * pricePerSeat;

  const handleChartRendered = (chart: SeatingChart) => {
    chartRef.current = chart;
  };

  const handleSessionInitialized = (token: { token: string }) => {
    setHoldToken(token.token);
  };

  const handleObjectSelected = async (object: any) => {
  setSelectionError(null);

  const isVipSeat = object.category?.label?.toUpperCase() === "VIP";
  if (isVipSeat && !isPremiumUser) {
    setSelectionError("Este asiento es VIP y requiere suscripción Premium.");
    if (chartRef.current) chartRef.current.deselectObjects([object.label]);
    return;
  }

  try {
    const res = await fetch("http://localhost:3001/api/pagos/verificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        evento_id: event.id,
        asiento_label: object.label,
      }),
    });

    const data = await res.json();

    if (data.ocupado) {
      setSelectionError(
        `El asiento ${object.labels.displayedLabel} ya está ocupado. Por favor elige otro.`
      );
      if (chartRef.current) chartRef.current.deselectObjects([object.label]);
      return;
    }

    if (data.sincronizado) {
      console.info(`Asiento ${object.label} sincronizado: liberado en DB.`);
    }
  } catch (err) {
    console.warn("No se pudo verificar el asiento contra la DB:", err);
  }

  refreshSelection();
};

  const refreshSelection = async () => {
    if (!chartRef.current) return;
    const objects = await chartRef.current.listSelectedObjects();
    setSelectedObjects(objects as unknown as SeatsioObject[]);
  };

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
        asientos: displaySeats.map(s => s.label),
        hold_token: holdToken,
        total: totalPrice,
        email_usuario: currentUser?.email || "",
        orden_id: existingOrderId || null,  
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje);

    setClientSecret(data.clientSecret);
    setOrdenId(data.orden_id);

    if (!existingOrderId && onReservationCreated) {
      onReservationCreated({
        id: `ORD-${data.orden_id}`,
        eventId: event.id,
        seats: displaySeats.map(s => s.label),
        totalPrice: `$${totalPrice.toLocaleString()}`,
        estado: "reservado",
      });
    }

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
        id: existingOrderId ? `ORD-${existingOrderId}` : `ORD-${ordenId}`,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventVenue: event.venue,
        eventLocation: event.location || "",
        eventImage: event.image || "",
        seats: displaySeats.map(s => s.label),
        totalPrice: `$${totalPrice.toLocaleString()}`,
        estado: "pagado",
      });
    }
    setStep("confirmation");
  };

  const seatsioCategories = isPremiumUser
    ? [
        { category: "vip",     price: pricePerSeat * 2 },
        { category: "regular", price: pricePerSeat },
      ]
    : [
        { category: "regular", price: pricePerSeat },
      ];

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

          {step === "seats" && (
            <div className="p-6">
              {!isPremiumUser && (
                <div className="mb-4 bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                  <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Asientos VIP exclusivos para Premium</p>
                    <p className="text-xs text-amber-800 mt-0.5">Suscríbete a Premium para desbloquear los asientos VIP.</p>
                  </div>
                </div>
              )}

              {selectionError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> 
                  {selectionError}
                </motion.div>
              )}

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-black mb-4">Selecciona tus asientos</h2>
                  <div style={{ height: "500px" }}>
                    <SeatsioSeatingChart
                      workspaceKey={import.meta.env.VITE_SEATSIO_WORKSPACE_KEY}
                      event={event.seatsioEventKey}
                      region={import.meta.env.VITE_SEATSIO_REGION || "eu"}
                      session="start"
                      onSessionInitialized={handleSessionInitialized}
                      onChartRendered={handleChartRendered}
                      onObjectSelected={handleObjectSelected}
                      onObjectDeselected={refreshSelection}
                      pricing={seatsioCategories}
                      priceFormatter={(price: number) => `$${price.toLocaleString()} MXN`}
                      objectWithoutPricingSelectable={true}
                      maxSelectedObjects={10}
                      language="es"
                    />
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-6 border border-zinc-200 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-black mb-4">Resumen</h3>

                    {displaySeats.length > 0 ? (
                      <>
                        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                          {displaySeats.map((seat) => (
                            <div key={seat.label} className="flex items-center justify-between text-sm">
                              <span className="font-semibold">{seat.labels.displayedLabel}</span>
                              {seat.category && (
                                <span className="text-xs text-zinc-500">{seat.category.label}</span>
                              )}
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
                            : "Continuar al pago"
                          }
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

          {step === "payment" && (
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                {!preselectedSeats && (
                  <button
                    onClick={() => setStep("seats")}
                    className="mb-6 text-sm font-semibold text-zinc-600 hover:text-black"
                  >
                    ← Volver a selección de asientos
                  </button>
                )}
                <h2 className="text-2xl font-bold text-black mb-6">Pago seguro</h2>

                {loadingPayment ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
                  </div>
                ) : clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: { theme: "stripe", variables: { colorPrimary: "#000" } },
                    }}
                  >
                    <StripePaymentForm
                      totalPrice={totalPrice}
                      selectedSeats={displaySeats}
                      currentUser={currentUser}
                      ordenId={ordenId!}
                      onSuccess={handlePaymentSuccess}
                      onError={(msg: string) => setPaymentError(msg)}
                    />
                  </Elements>
                ) : (
                  <p className="text-red-500">{paymentError}</p>
                )}
              </div>
            </div>
          )}

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
                  Recibirás un email de confirmación con tus códigos QR en{" "}
                  {currentUser?.email || "tu correo"}.
                </p>
                
                <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-lg mb-8 text-left">
                  <h3 className="font-bold mb-3">Resumen de la orden</h3>
                  <p className="text-sm text-zinc-600 mb-1"><strong>Evento:</strong> {event.title}</p>
                  <p className="text-sm text-zinc-600 mb-1"><strong>Fecha:</strong> {event.date} • {event.time}</p>
                  <p className="text-sm text-zinc-600 mb-3"><strong>Lugar:</strong> {event.venue}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {displaySeats.map((s) => (
                      <span key={s.label} className="px-3 py-1 bg-black text-white font-semibold text-sm rounded">
                        {s.labels.displayedLabel}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold border-t border-zinc-200 pt-3">
                    <span>Total pagado</span>
                    <span>${totalPrice.toLocaleString()} MXN</span>
                  </div>
                </div>

            
                <button
                  onClick={() => {
                    onClose(); 
                    if (onGoToMyTickets) {
                      onGoToMyTickets(); 
                    }
                  }}
                  className="w-full py-3 bg-black text-white font-semibold hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Ir a mis boletos
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}