import { motion } from "motion/react";
import { X, FileText, AlertCircle, CreditCard, RefreshCw, ShieldAlert, Scale } from "lucide-react";

interface TermsProps {
  onClose: () => void;
}

export function Terms({ onClose }: TermsProps) {
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
              <h1 className="text-3xl font-bold text-black mb-1">Términos y Condiciones</h1>
              <p className="text-zinc-600">Última actualización: 9 de Abril, 2026</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8">
            {/* Introduction */}
            <div className="mb-10">
              <div className="flex items-start gap-4 mb-6">
                <FileText className="w-8 h-8 text-black flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-black mb-3">Acuerdo de Servicio</h2>
                  <p className="text-zinc-700 leading-relaxed">
                    Bienvenido a TicketX. Estos Términos y Condiciones ("Términos") rigen tu uso de nuestro 
                    sitio web y servicios. Al acceder o usar TicketX, aceptas estar vinculado por estos Términos. 
                    Si no estás de acuerdo, por favor no uses nuestros servicios.
                  </p>
                </div>
              </div>
            </div>

            {/* Use of Service */}
            <div className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <Scale className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-black">1. Uso del Servicio</h2>
              </div>
              <div className="pl-10 space-y-4">
                <div>
                  <h3 className="font-bold text-black mb-2">1.1 Elegibilidad</h3>
                  <p className="text-zinc-700">
                    Debes tener al menos 18 años de edad para usar TicketX. Al crear una cuenta, declaras 
                    que tienes la capacidad legal para celebrar contratos vinculantes.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">1.2 Cuenta de Usuario</h3>
                  <p className="text-zinc-700 mb-2">Eres responsable de:</p>
                  <ul className="list-disc pl-6 text-zinc-700 space-y-1">
                    <li>Mantener la confidencialidad de tus credenciales de inicio de sesión</li>
                    <li>Todas las actividades que ocurran bajo tu cuenta</li>
                    <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
                    <li>Proporcionar información precisa y actualizada</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">1.3 Uso Prohibido</h3>
                  <p className="text-zinc-700 mb-2">No puedes:</p>
                  <ul className="list-disc pl-6 text-zinc-700 space-y-1">
                    <li>Usar el servicio para actividades ilegales o no autorizadas</li>
                    <li>Revender boletos a precios inflados (según la ley aplicable)</li>
                    <li>Usar bots o automatización para comprar boletos</li>
                    <li>Intentar acceder sin autorización a sistemas o cuentas</li>
                    <li>Transmitir virus, malware o código malicioso</li>
                    <li>Interferir con el funcionamiento del servicio</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Ticket Purchase */}
            <div className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <CreditCard className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-black">2. Compra de Boletos</h2>
              </div>
              <div className="pl-10 space-y-4">
                <div>
                  <h3 className="font-bold text-black mb-2">2.1 Proceso de Compra</h3>
                  <p className="text-zinc-700">
                    Al completar una compra, aceptas pagar el precio del boleto más los cargos aplicables 
                    (impuestos, cargos por servicio). Los precios están sujetos a cambios sin previo aviso 
                    hasta que se complete la compra.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">2.2 Confirmación</h3>
                  <p className="text-zinc-700">
                    Recibirás un email de confirmación con tus boletos electrónicos. Es tu responsabilidad 
                    verificar que la información sea correcta. Los boletos también estarán disponibles en 
                    tu cuenta de TicketX.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">2.3 Cargos y Tarifas</h3>
                  <p className="text-zinc-700 mb-2">Los precios finales incluyen:</p>
                  <ul className="list-disc pl-6 text-zinc-700 space-y-1">
                    <li>Precio base del boleto establecido por el organizador</li>
                    <li>Cargo por servicio de TicketX</li>
                    <li>Cargo por procesamiento de pago</li>
                    <li>Impuestos aplicables según la jurisdicción</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">2.4 Límites de Compra</h3>
                  <p className="text-zinc-700">
                    Podemos imponer límites en la cantidad de boletos que puedes comprar para un evento 
                    específico para garantizar acceso justo para todos los clientes.
                  </p>
                </div>
              </div>
            </div>

            {/* Cancellations and Refunds */}
            <div className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <RefreshCw className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-black">3. Cancelaciones y Reembolsos</h2>
              </div>
              <div className="pl-10 space-y-4">
                <div>
                  <h3 className="font-bold text-black mb-2">3.1 Cancelación por el Cliente</h3>
                  <p className="text-zinc-700">
                    Puedes solicitar un reembolso hasta 48 horas antes del evento. Los cargos por servicio 
                    no son reembolsables. Los reembolsos se procesan al método de pago original en 7-10 días hábiles.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">3.2 Cancelación del Evento</h3>
                  <p className="text-zinc-700">
                    Si un evento es cancelado por el organizador, recibirás un reembolso completo automáticamente, 
                    incluyendo todos los cargos. Si el evento es pospuesto, tus boletos son válidos para la nueva 
                    fecha, o puedes solicitar un reembolso.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">3.3 Excepciones</h3>
                  <p className="text-zinc-700 mb-2">Los reembolsos no están disponibles para:</p>
                  <ul className="list-disc pl-6 text-zinc-700 space-y-1">
                    <li>Eventos que ya han ocurrido</li>
                    <li>Boletos marcados como "No Reembolsable"</li>
                    <li>Cambios menores en el lineup o programa</li>
                    <li>Decisión personal de no asistir</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Event Access */}
            <div className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <ShieldAlert className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-black">4. Acceso a Eventos</h2>
              </div>
              <div className="pl-10 space-y-4">
                <div>
                  <h3 className="font-bold text-black mb-2">4.1 Admisión</h3>
                  <p className="text-zinc-700">
                    Tu boleto es solo para admisión y está sujeto a los términos y condiciones del organizador 
                    del evento. TicketX no es responsable de las políticas del venue o del evento.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">4.2 Requisitos de Entrada</h3>
                  <p className="text-zinc-700 mb-2">Puedes ser requerido a presentar:</p>
                  <ul className="list-disc pl-6 text-zinc-700 space-y-1">
                    <li>Tu boleto electrónico (código QR)</li>
                    <li>Identificación oficial válida</li>
                    <li>La tarjeta de crédito usada para la compra (en algunos eventos)</li>
                    <li>Prueba de vacunación u otros requisitos de salud (según el evento)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">4.3 Denegación de Entrada</h3>
                  <p className="text-zinc-700">
                    El organizador del evento puede negar la entrada por violación de las reglas del venue, 
                    comportamiento inapropiado, boleto no válido, o incumplimiento de requisitos. No se 
                    otorgarán reembolsos en estos casos.
                  </p>
                </div>
              </div>
            </div>

            {/* Liability */}
            <div className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-black">5. Limitación de Responsabilidad</h2>
              </div>
              <div className="pl-10 space-y-3">
                <p className="text-zinc-700">
                  TicketX actúa como intermediario entre compradores y organizadores de eventos. No somos 
                  responsables de:
                </p>
                <ul className="list-disc pl-6 text-zinc-700 space-y-2">
                  <li>La calidad, seguridad o legalidad de los eventos</li>
                  <li>La capacidad de los organizadores para realizar los eventos</li>
                  <li>Lesiones, pérdidas o daños que ocurran en los eventos</li>
                  <li>Disputas entre compradores y organizadores</li>
                  <li>Fallas técnicas fuera de nuestro control</li>
                </ul>
                <p className="text-zinc-700 mt-4">
                  En la máxima medida permitida por la ley, nuestra responsabilidad total no excederá el 
                  monto que pagaste por los boletos en cuestión.
                </p>
              </div>
            </div>

            {/* Intellectual Property */}
            <div className="mb-10">
              <div className="pl-0 space-y-3">
                <h2 className="text-xl font-bold text-black">6. Propiedad Intelectual</h2>
                <p className="text-zinc-700">
                  Todo el contenido en TicketX (logos, texto, gráficos, software) es propiedad de TicketX 
                  o sus licenciantes y está protegido por leyes de propiedad intelectual. No puedes usar, 
                  copiar, modificar o distribuir nuestro contenido sin permiso expreso.
                </p>
              </div>
            </div>

            {/* Changes to Terms */}
            <div className="mb-10">
              <div className="pl-0 space-y-3">
                <h2 className="text-xl font-bold text-black">7. Modificaciones</h2>
                <p className="text-zinc-700">
                  Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios 
                  entrarán en vigor inmediatamente después de su publicación. Tu uso continuado del servicio 
                  después de los cambios constituye tu aceptación de los nuevos Términos.
                </p>
              </div>
            </div>

            {/* Governing Law */}
            <div className="mb-10">
              <div className="pl-0 space-y-3">
                <h2 className="text-xl font-bold text-black">8. Ley Aplicable</h2>
                <p className="text-zinc-700">
                  Estos Términos se rigen por las leyes de México. Cualquier disputa será resuelta en los 
                  tribunales competentes de la Ciudad de México.
                </p>
              </div>
            </div>

            {/* Termination */}
            <div className="mb-10">
              <div className="pl-0 space-y-3">
                <h2 className="text-xl font-bold text-black">9. Terminación</h2>
                <p className="text-zinc-700">
                  Podemos suspender o terminar tu acceso a TicketX en cualquier momento por violación de 
                  estos Términos, actividad fraudulenta, o por cualquier otra razón a nuestra discreción. 
                  Puedes cerrar tu cuenta en cualquier momento contactándonos.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-zinc-100 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-black mb-3">Contacto Legal</h2>
              <p className="text-zinc-700 mb-4">
                Si tienes preguntas sobre estos Términos y Condiciones, contáctanos:
              </p>
              <div className="space-y-2 text-zinc-700">
                <p><span className="font-semibold">Email Legal:</span> legal@ticketx.com</p>
                <p><span className="font-semibold">Teléfono:</span> +52 55 5555 5555</p>
                <p><span className="font-semibold">Dirección:</span> Av. Paseo de la Reforma 505, Cuauhtémoc, 06500, CDMX</p>
              </div>
            </div>

            {/* Acceptance */}
            <div className="mt-8 bg-black text-white p-6 rounded-lg">
              <p className="text-center">
                Al usar TicketX, reconoces que has leído, entendido y aceptas estar vinculado 
                por estos Términos y Condiciones.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
