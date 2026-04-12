import { motion } from "motion/react";
import { X, Shield, Lock, Eye, UserCheck, Database, Bell } from "lucide-react";

interface PrivacyProps {
  onClose: () => void;
}

export function Privacy({ onClose }: PrivacyProps) {
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
              <h1 className="text-3xl font-bold text-black mb-1">Política de Privacidad</h1>
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
                <Shield className="w-8 h-8 text-black flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-black mb-3">Compromiso con tu Privacidad</h2>
                  <p className="text-zinc-700 leading-relaxed">
                    En TicketX, valoramos y respetamos tu privacidad. Esta Política de Privacidad describe 
                    cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando utilizas 
                    nuestros servicios. Al usar TicketX, aceptas las prácticas descritas en esta política.
                  </p>
                </div>
              </div>
            </div>

            {/* Information We Collect */}
            <div className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <Database className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-black">1. Información que Recopilamos</h2>
              </div>
              <div className="pl-10 space-y-4">
                <div>
                  <h3 className="font-bold text-black mb-2">1.1 Información Personal</h3>
                  <p className="text-zinc-700 mb-2">Recopilamos información que tú nos proporcionas directamente:</p>
                  <ul className="list-disc pl-6 text-zinc-700 space-y-1">
                    <li>Nombre completo</li>
                    <li>Dirección de correo electrónico</li>
                    <li>Número de teléfono</li>
                    <li>Información de pago (procesada de forma segura por terceros)</li>
                    <li>Dirección de facturación</li>
                    <li>Preferencias de eventos y comunicaciones</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-black mb-2">1.2 Información de Uso</h3>
                  <p className="text-zinc-700 mb-2">Recopilamos automáticamente información sobre cómo usas nuestro servicio:</p>
                  <ul className="list-disc pl-6 text-zinc-700 space-y-1">
                    <li>Historial de navegación y búsqueda en la plataforma</li>
                    <li>Eventos visualizados y comprados</li>
                    <li>Dirección IP y datos de ubicación</li>
                    <li>Tipo de dispositivo y navegador</li>
                    <li>Páginas visitadas y tiempo de permanencia</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <UserCheck className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-black">2. Cómo Usamos tu Información</h2>
              </div>
              <div className="pl-10 space-y-3">
                <p className="text-zinc-700">Utilizamos tu información personal para:</p>
                <ul className="list-disc pl-6 text-zinc-700 space-y-2">
                  <li>Procesar y gestionar tus compras de boletos</li>
                  <li>Enviarte confirmaciones, boletos electrónicos y actualizaciones de eventos</li>
                  <li>Proporcionar soporte al cliente y responder a tus consultas</li>
                  <li>Personalizar tu experiencia y recomendarte eventos relevantes</li>
                  <li>Prevenir fraude y garantizar la seguridad de la plataforma</li>
                  <li>Cumplir con obligaciones legales y regulatorias</li>
                  <li>Mejorar nuestros servicios y desarrollar nuevas funcionalidades</li>
                  <li>Enviarte comunicaciones de marketing (con tu consentimiento)</li>
                </ul>
              </div>
            </div>

            {/* Data Sharing */}
            <div className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <Eye className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-black">3. Compartir Información</h2>
              </div>
              <div className="pl-10 space-y-4">
                <p className="text-zinc-700">
                  No vendemos tu información personal. Compartimos tu información solo en las siguientes circunstancias:
                </p>
                <ul className="list-disc pl-6 text-zinc-700 space-y-2">
                  <li><span className="font-semibold">Con organizadores de eventos:</span> Compartimos tu información de contacto con los organizadores de eventos que compres para fines de gestión del evento</li>
                  <li><span className="font-semibold">Proveedores de servicios:</span> Compartimos información con empresas que nos ayudan a operar (procesamiento de pagos, hosting, análisis)</li>
                  <li><span className="font-semibold">Cumplimiento legal:</span> Cuando sea requerido por ley o para proteger nuestros derechos legales</li>
                  <li><span className="font-semibold">Transferencias comerciales:</span> En caso de fusión, adquisición o venta de activos</li>
                </ul>
              </div>
            </div>

            {/* Data Security */}
            <div className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <Lock className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-black">4. Seguridad de los Datos</h2>
              </div>
              <div className="pl-10 space-y-3">
                <p className="text-zinc-700">
                  Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger tu información:
                </p>
                <ul className="list-disc pl-6 text-zinc-700 space-y-2">
                  <li>Encriptación SSL/TLS para todas las transmisiones de datos</li>
                  <li>Cumplimiento con estándares PCI DSS para información de pago</li>
                  <li>Acceso restringido a información personal solo a empleados autorizados</li>
                  <li>Auditorías de seguridad regulares</li>
                  <li>Protección contra malware y ataques cibernéticos</li>
                </ul>
                <p className="text-zinc-700">
                  Sin embargo, ningún sistema es 100% seguro. Te recomendamos proteger tus credenciales de acceso.
                </p>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-10">
              <div className="flex items-start gap-4 mb-4">
                <Bell className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                <h2 className="text-xl font-bold text-black">5. Tus Derechos</h2>
              </div>
              <div className="pl-10 space-y-3">
                <p className="text-zinc-700">Tienes los siguientes derechos sobre tu información personal:</p>
                <ul className="list-disc pl-6 text-zinc-700 space-y-2">
                  <li><span className="font-semibold">Acceso:</span> Solicitar una copia de tu información personal</li>
                  <li><span className="font-semibold">Rectificación:</span> Corregir información inexacta o incompleta</li>
                  <li><span className="font-semibold">Eliminación:</span> Solicitar la eliminación de tu información (sujeto a obligaciones legales)</li>
                  <li><span className="font-semibold">Portabilidad:</span> Recibir tus datos en un formato estructurado</li>
                  <li><span className="font-semibold">Oposición:</span> Oponerte al procesamiento de tus datos para marketing</li>
                  <li><span className="font-semibold">Restricción:</span> Limitar el procesamiento de tu información</li>
                </ul>
                <p className="text-zinc-700">
                  Para ejercer cualquiera de estos derechos, contáctanos en{" "}
                  <a href="mailto:privacidad@ticketx.com" className="font-semibold text-black hover:underline">
                    privacidad@ticketx.com
                  </a>
                </p>
              </div>
            </div>

            {/* Cookies */}
            <div className="mb-10">
              <div className="pl-0 space-y-3">
                <h2 className="text-xl font-bold text-black">6. Cookies y Tecnologías Similares</h2>
                <p className="text-zinc-700">
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso de la 
                  plataforma y personalizar contenido. Puedes gestionar las preferencias de cookies en la configuración 
                  de tu navegador. Ten en cuenta que deshabilitar cookies puede afectar la funcionalidad del sitio.
                </p>
              </div>
            </div>

            {/* Children's Privacy */}
            <div className="mb-10">
              <div className="pl-0 space-y-3">
                <h2 className="text-xl font-bold text-black">7. Privacidad de Menores</h2>
                <p className="text-zinc-700">
                  Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente 
                  información personal de menores. Si descubres que un menor ha proporcionado información, 
                  contáctanos inmediatamente.
                </p>
              </div>
            </div>

            {/* Changes to Policy */}
            <div className="mb-10">
              <div className="pl-0 space-y-3">
                <h2 className="text-xl font-bold text-black">8. Cambios a esta Política</h2>
                <p className="text-zinc-700">
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios 
                  significativos publicando la nueva política en nuestro sitio web y actualizando la fecha de 
                  "Última actualización". Te recomendamos revisar esta política periódicamente.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-zinc-100 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-black mb-3">Contacto</h2>
              <p className="text-zinc-700 mb-4">
                Si tienes preguntas sobre esta Política de Privacidad o cómo manejamos tu información, contáctanos:
              </p>
              <div className="space-y-2 text-zinc-700">
                <p><span className="font-semibold">Email:</span> privacidad@ticketx.com</p>
                <p><span className="font-semibold">Teléfono:</span> +52 55 5555 5555</p>
                <p><span className="font-semibold">Dirección:</span> Av. Paseo de la Reforma 505, Cuauhtémoc, 06500, CDMX</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
