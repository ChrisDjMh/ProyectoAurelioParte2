import { motion } from "motion/react";
import { X, MessageCircle, Mail, Phone, Clock, HelpCircle } from "lucide-react";

interface SupportProps {
  onClose: () => void;
}

export function Support({ onClose }: SupportProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">Centro de Soporte</h1>
              <p className="text-zinc-600">Estamos aquí para ayudarte</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8">
            {/* Contact Methods */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-zinc-50 p-6 border border-zinc-200 text-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-black mb-2">Teléfono</h3>
                <p className="text-sm text-zinc-600 mb-3">Lun - Dom: 24/7</p>
                <a href="tel:+525555555555" className="text-black font-semibold hover:underline">
                  +52 55 5555 5555
                </a>
              </div>

              <div className="bg-zinc-50 p-6 border border-zinc-200 text-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-black mb-2">Email</h3>
                <p className="text-sm text-zinc-600 mb-3">Respuesta en 24h</p>
                <a href="mailto:soporte@ticketx.com" className="text-black font-semibold hover:underline">
                  soporte@ticketx.com
                </a>
              </div>

              <div className="bg-zinc-50 p-6 border border-zinc-200 text-center">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-black mb-2">Chat en Vivo</h3>
                <p className="text-sm text-zinc-600 mb-3">Lun - Vie: 9AM - 9PM</p>
                <button className="text-black font-semibold hover:underline">
                  Iniciar Chat
                </button>
              </div>
            </div>

            {/* Common Issues */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6" />
                Problemas Comunes
              </h2>
              
              <div className="space-y-4">
                <div className="border border-zinc-200 p-6 hover:border-zinc-400 transition-colors">
                  <h3 className="font-bold text-black mb-2">¿Cómo puedo cancelar o modificar mi pedido?</h3>
                  <p className="text-zinc-600">
                    Puedes cancelar o modificar tu pedido hasta 48 horas antes del evento. 
                    Dirígete a "Mis Boletos", selecciona el boleto y elige la opción de cancelar o modificar.
                  </p>
                </div>

                <div className="border border-zinc-200 p-6 hover:border-zinc-400 transition-colors">
                  <h3 className="font-bold text-black mb-2">No recibí mi boleto electrónico</h3>
                  <p className="text-zinc-600">
                    Verifica tu carpeta de spam. Si aún no lo encuentras, ve a "Mis Boletos" 
                    donde podrás descargarlo directamente. Si el problema persiste, contáctanos.
                  </p>
                </div>

                <div className="border border-zinc-200 p-6 hover:border-zinc-400 transition-colors">
                  <h3 className="font-bold text-black mb-2">¿Qué métodos de pago aceptan?</h3>
                  <p className="text-zinc-600">
                    Aceptamos todas las tarjetas de crédito y débito principales (Visa, MasterCard, 
                    American Express), PayPal, transferencias bancarias y pagos en efectivo en puntos autorizados.
                  </p>
                </div>

                <div className="border border-zinc-200 p-6 hover:border-zinc-400 transition-colors">
                  <h3 className="font-bold text-black mb-2">El evento fue cancelado, ¿cómo obtengo un reembolso?</h3>
                  <p className="text-zinc-600">
                    Si un evento es cancelado, se procesará automáticamente un reembolso completo 
                    a tu método de pago original dentro de 7-10 días hábiles. Recibirás un email de confirmación.
                  </p>
                </div>

                <div className="border border-zinc-200 p-6 hover:border-zinc-400 transition-colors">
                  <h3 className="font-bold text-black mb-2">¿Los boletos son transferibles?</h3>
                  <p className="text-zinc-600">
                    Sí, la mayoría de los boletos pueden ser transferidos a otra persona. 
                    Ve a "Mis Boletos", selecciona el boleto y usa la opción "Transferir". 
                    Algunos eventos tienen restricciones específicas.
                  </p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-black text-white p-8 rounded-lg">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-bold text-xl mb-4">Horarios de Atención</h3>
                  <div className="space-y-2 text-white/90">
                    <p><span className="font-semibold">Lunes a Viernes:</span> 9:00 AM - 9:00 PM</p>
                    <p><span className="font-semibold">Sábados:</span> 10:00 AM - 8:00 PM</p>
                    <p><span className="font-semibold">Domingos:</span> 10:00 AM - 6:00 PM</p>
                    <p className="pt-2 border-t border-white/20 mt-4">
                      <span className="font-semibold">Soporte telefónico 24/7</span> disponible para emergencias
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
