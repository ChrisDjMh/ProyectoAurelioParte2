import { useState } from "react";
import { motion } from "motion/react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, Crown, Check, Sparkles, Star, Zap, Loader2, AlertCircle, CreditCard } from "lucide-react";

// ── Inicializar Stripe ────────────────────────────────────────────
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  console.error("🚨 Error: Falta la clave VITE_STRIPE_PUBLISHABLE_KEY en el archivo .env");
}

const stripePromise = stripeKey ? loadStripe(stripeKey) : Promise.resolve(null);

// ── Tipos ─────────────────────────────────────────────────────────
interface PremiumSubscriptionProps {
  // Asegúrate de que tu interfaz CurrentUser incluya 'tipo'
  currentUser?: { id: number; nombre: string; email: string; tipo?: "Normal" | "Premium" } | null; 
  onClose: () => void;
  onSubscribe: () => void;
}

const LIFETIME_PRICE = 2990; // Precio único de por vida

// ── Formulario de Pago de Stripe ──────────────────────────────────
function StripePremiumForm({
  currentUser,
  onSuccess,
  onError,
}: {
  currentUser: PremiumSubscriptionProps["currentUser"];
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

    // 1. Confirmar pago con Stripe
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
      // 2. Notificar al backend para actualizar la DB
      try {
        const res = await fetch("http://localhost:3001/api/usuarios/upgrade-premium", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payment_intent_id: paymentIntent.id,
            usuario_id: currentUser?.id,
          }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.mensaje);
        
        onSuccess();
      } catch (err: any) {
        setErrorMsg(err.message);
        onError(err.message);
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 p-6 rounded-lg mb-6 text-center">
        <h3 className="font-bold text-amber-900 mb-2">Pago Único - Acceso Vitalicio</h3>
        <p className="text-3xl font-bold text-amber-600">${LIFETIME_PRICE.toLocaleString()} MXN</p>
      </div>

      <div className="border border-zinc-200 rounded-lg p-4">
        <PaymentElement />
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-semibold text-lg hover:from-amber-600 hover:to-yellow-700 transition-all rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Procesando pago...</>
        ) : (
          <><CreditCard className="w-5 h-5" /> Confirmar y pagar</>
        )}
      </button>
    </form>
  );
}

// ── Componente Principal ──────────────────────────────────────────
export function PremiumSubscription({ currentUser, onClose, onSubscribe }: PremiumSubscriptionProps) {
  const [step, setStep] = useState<"offer" | "payment" | "success">("offer");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Determinamos si el usuario ya es Premium
  const isAlreadyPremium = currentUser?.tipo === "Premium";

  const benefits = [
    { icon: Crown, title: "Acceso a asientos VIP", description: "Reserva las mejores ubicaciones en todos los eventos" },
    { icon: Zap, title: "Compra prioritaria", description: "Acceso anticipado a la venta de boletos antes que nadie" },
    { icon: Star, title: "Descuentos exclusivos", description: "Hasta 20% de descuento en eventos seleccionados" },
    { icon: Sparkles, title: "Sin comisiones", description: "0% de cargo por servicio en todas tus compras" },
  ];

  const handleContinueToPayment = async () => {
    setLoadingIntent(true);
    setPaymentError("");

    try {
      const res = await fetch("http://localhost:3001/api/pagos/premium/crear-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: currentUser?.id || 1,
          total: LIFETIME_PRICE,
          email_usuario: currentUser?.email || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje);

      setClientSecret(data.clientSecret);
      setStep("payment");
    } catch (err: any) {
      setPaymentError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoadingIntent(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep("success");
    setTimeout(() => {
      onSubscribe();
      onClose();
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen px-4 py-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {step === "offer" && (
            <>
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 p-12 text-white overflow-hidden text-center">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>

                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
                >
                  <Crown className="w-10 h-10" />
                </motion.div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4 relative z-10">
                  TicketX Premium
                </h1>
                <p className="text-lg md:text-xl text-white/90 relative z-10 max-w-2xl mx-auto">
                  {isAlreadyPremium 
                    ? "Tus beneficios exclusivos de por vida están activos." 
                    : "Desbloquea una experiencia sin límites con un único pago de por vida."}
                </p>
              </div>

              <div className="p-8 md:p-12">
                {/* Benefits Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start gap-4 p-6 bg-amber-50/50 rounded-xl border border-amber-100"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <benefit.icon className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-black mb-1">{benefit.title}</h3>
                        <p className="text-sm text-zinc-600">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* ESTADO 1: Ya es Premium -> Solo mostramos mensaje de estado */}
                {isAlreadyPremium ? (
                  <div className="text-center max-w-lg mx-auto bg-green-50 border border-green-200 rounded-xl p-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-900 mb-2">¡Suscripción Activa!</h3>
                    <p className="text-green-700">
                      Disfruta de todos tus beneficios VIP. Esta cuenta tiene acceso vitalicio.
                    </p>
                    <p className="text-sm text-green-600 mt-4 font-semibold">
                      Vinculado a: {currentUser?.email}
                    </p>
                  </div>
                ) : (
                  /* ESTADO 2: No es Premium -> Mostramos CTA de compra */
                  <div className="text-center max-w-lg mx-auto">
                    <div className="mb-6">
                      <span className="text-zinc-500 font-semibold uppercase tracking-wide text-sm">Acceso Vitalicio</span>
                      <div className="text-5xl font-bold text-black mt-2">
                        ${LIFETIME_PRICE.toLocaleString()} <span className="text-xl text-zinc-500 font-normal">MXN</span>
                      </div>
                      <p className="text-amber-600 font-semibold mt-2">Pago único. Sin suscripciones ocultas.</p>
                    </div>

                    {paymentError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {paymentError}
                      </div>
                    )}

                    <button
                      onClick={handleContinueToPayment}
                      disabled={loadingIntent}
                      className="w-full py-4 bg-black text-white font-bold text-lg hover:bg-zinc-800 transition-colors rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loadingIntent ? (
                        <><Loader2 className="w-6 h-6 animate-spin" /> Procesando...</>
                      ) : (
                        "Obtener Premium de por vida"
                      )}
                    </button>
                    <p className="text-sm text-zinc-500 mt-4">Vinculado a la cuenta: <strong>{currentUser?.email || "Cargando usuario..."}</strong></p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ... PASO 2 y PASO 3 de Stripe (payment y success) se mantienen igual ... */}
          {step === "payment" && clientSecret && (
            <div className="p-8 md:p-12">
              <div className="max-w-md mx-auto">
                <button
                  onClick={() => setStep("offer")}
                  className="mb-6 text-sm font-semibold text-zinc-600 hover:text-black transition-colors"
                >
                  ← Volver a los beneficios
                </button>

                <h2 className="text-3xl font-bold text-black mb-8">
                  Completar pago
                </h2>

                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: { theme: "stripe", variables: { colorPrimary: "#d97706" } },
                  }}
                >
                  <StripePremiumForm
                    currentUser={currentUser}
                    onSuccess={handlePaymentSuccess}
                    onError={(msg) => console.error(msg)}
                  />
                </Elements>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="p-12">
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-200"
                >
                  <Check className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-4xl font-bold text-black mb-4">
                  ¡Ya eres Premium!
                </h2>
                <p className="text-xl text-zinc-600 mb-8">
                  Tu cuenta ha sido actualizada con éxito.
                </p>

                <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl max-w-md mx-auto">
                  <p className="text-sm text-amber-900">
                    Se ha enviado el recibo de tu pago vitalicio a <br/><span className="font-bold">{currentUser?.email || "tu correo"}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}