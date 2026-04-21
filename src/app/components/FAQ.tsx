import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronDown, Search } from "lucide-react";

interface FAQProps {
  onClose: () => void;
}

const faqs = [
  {
    category: "Compra de Boletos",
    questions: [
      {
        q: "¿Cómo compro boletos en TicketX?",
        a: "Navega por los eventos disponibles, selecciona el evento de tu interés, elige tus asientos en el mapa interactivo, completa tus datos de pago y recibirás tus boletos por email instantáneamente."
      },
      {
        q: "¿Puedo comprar múltiples boletos en una sola transacción?",
        a: "Sí, puedes seleccionar múltiples asientos en el mapa de asientos durante el proceso de compra. Todos los boletos se procesarán en una sola transacción."
      },
      {
        q: "¿Hay un límite de boletos por compra?",
        a: "El límite varía según el evento. Generalmente puedes comprar hasta 8 boletos por transacción. Algunos eventos exclusivos pueden tener límites menores."
      },
      {
        q: "¿Los precios incluyen cargos adicionales?",
        a: "Los precios mostrados son base. Se añadirán cargos por servicio y procesamiento durante el checkout. Todos los cargos se muestran claramente antes de confirmar tu compra."
      }
    ]
  },
  {
    category: "Pagos y Facturación",
    questions: [
      {
        q: "¿Qué métodos de pago aceptan?",
        a: "Aceptamos Visa, MasterCard, American Express, PayPal, transferencias bancarias y pagos en efectivo en tiendas autorizadas. Todos los pagos son procesados de forma segura."
      },
      {
        q: "¿Es seguro pagar en TicketX?",
        a: "Absolutamente. Utilizamos encriptación SSL de nivel bancario y cumplimos con los estándares PCI DSS. No almacenamos información de tarjetas de crédito en nuestros servidores."
      },
      {
        q: "¿Puedo obtener una factura?",
        a: "Sí, recibirás un recibo por email automáticamente. Si necesitas una factura fiscal, puedes solicitarla en la sección 'Mis Boletos' dentro de las 24 horas posteriores a la compra."
      },
      {
        q: "¿Qué pasa si mi pago falla?",
        a: "Si tu pago no se procesa, los asientos seleccionados se liberarán automáticamente. Verifica tus datos bancarios y vuelve a intentar. Si el problema persiste, contacta a tu banco o prueba otro método de pago."
      }
    ]
  },
  {
    category: "Entrega de Boletos",
    questions: [
      {
        q: "¿Cómo recibo mis boletos?",
        a: "Los boletos electrónicos se envían inmediatamente a tu email. También puedes acceder a ellos en cualquier momento desde la sección 'Mis Boletos' en tu cuenta."
      },
      {
        q: "¿Necesito imprimir mis boletos?",
        a: "No es necesario. Puedes mostrar tus boletos digitales desde tu teléfono. Cada boleto incluye un código QR que se escanea en la entrada del evento."
      },
      {
        q: "No recibí mi email de confirmación",
        a: "Verifica tu carpeta de spam. Si no lo encuentras, inicia sesión en 'Mis Boletos' para acceder a tus compras. Si aún tienes problemas, contacta a soporte."
      },
      {
        q: "¿Puedo reenviar mis boletos?",
        a: "Sí, desde 'Mis Boletos' puedes reenviar el email de confirmación a cualquier dirección o usar la función de transferencia para enviar boletos a otra persona."
      }
    ]
  },
  {
    category: "Reembolsos y Cambios",
    questions: [
      {
        q: "¿Puedo cancelar mi compra y obtener un reembolso?",
        a: "Puedes cancelar hasta 48 horas antes del evento para un reembolso completo menos los cargos por servicio. Algunos eventos pueden tener políticas diferentes, verifica los términos específicos."
      },
      {
        q: "¿Qué pasa si el evento se cancela?",
        a: "Si un evento es cancelado por el organizador, recibirás un reembolso completo automáticamente, incluyendo todos los cargos. El reembolso se procesa en 7-10 días hábiles."
      },
      {
        q: "¿Puedo cambiar mis asientos después de comprar?",
        a: "Sujeto a disponibilidad, puedes cambiar tus asientos hasta 72 horas antes del evento. Ve a 'Mis Boletos' y selecciona la opción 'Modificar asientos'."
      },
      {
        q: "¿Cómo funciona el proceso de reembolso?",
        a: "Los reembolsos se procesan al método de pago original. Las tarjetas de crédito tardan 7-10 días hábiles, PayPal 3-5 días, y transferencias bancarias hasta 14 días."
      }
    ]
  },
  {
    category: "En el Evento",
    questions: [
      {
        q: "¿Qué necesito llevar al evento?",
        a: "Lleva tu boleto electrónico (en tu teléfono o impreso), una identificación oficial válida y la tarjeta de crédito usada para la compra (si es requerido por el evento)."
      },
      {
        q: "¿Puedo entrar con mi boleto digital si mi teléfono se queda sin batería?",
        a: "Te recomendamos tener tu boleto impreso como respaldo o tomar una captura de pantalla. En casos de emergencia, contacta al personal del evento con tu ID de confirmación."
      },
      {
        q: "¿Los asientos son numerados?",
        a: "La mayoría de nuestros eventos tienen asientos numerados, lo cual se indica claramente durante la compra. Los boletos de admisión general se especifican como tales."
      },
      {
        q: "¿Qué pasa si pierdo mi boleto?",
        a: "No te preocupes. Inicia sesión en 'Mis Boletos' para acceder a tus compras en cualquier momento. Si tienes problemas, contacta a soporte con tu ID de confirmación."
      }
    ]
  }
];

export function FAQ({ onClose }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
          <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-black mb-1">Preguntas Frecuentes</h1>
                <p className="text-zinc-600">Encuentra respuestas rápidas a tus dudas</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar preguntas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="p-8">
            {filteredFaqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-10">
                <h2 className="text-xl font-bold text-black mb-4 pb-2 border-b-2 border-black">
                  {category.category}
                </h2>
                
                <div className="space-y-3">
                  {category.questions.map((faq, questionIndex) => {
                    const key = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openIndex === key;

                    return (
                      <div key={questionIndex} className="border border-zinc-200">
                        <button
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
                        >
                          <span className="font-semibold text-black pr-4">{faq.q}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-zinc-600 flex-shrink-0 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-4 text-zinc-700 leading-relaxed">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-zinc-600">No se encontraron preguntas que coincidan con tu búsqueda.</p>
              </div>
            )}

            <div className="mt-12 bg-zinc-100 p-8 text-center">
              <h3 className="text-xl font-bold text-black mb-2">¿No encontraste lo que buscabas?</h3>
              <p className="text-zinc-600 mb-4">
                Nuestro equipo de soporte está listo para ayudarte
              </p>
              <button className="px-6 py-3 bg-black text-white font-semibold hover:bg-zinc-800 transition-colors">
                Contactar Soporte
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
