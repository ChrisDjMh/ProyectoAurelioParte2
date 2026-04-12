import { motion } from "motion/react";
import { X, Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import { useState } from "react";

interface ContactProps {
  onClose: () => void;
}

export function Contact({ onClose }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el mensaje
    alert("Mensaje enviado exitosamente. Te responderemos pronto.");
    onClose();
  };

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
          className="max-w-5xl mx-auto bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">Contacto</h1>
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
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-bold text-black mb-6">Información de Contacto</h2>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black mb-1">Oficinas Principales</h3>
                      <p className="text-zinc-600">
                        Av. Paseo de la Reforma 505<br />
                        Cuauhtémoc, 06500<br />
                        Ciudad de México, CDMX
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black mb-1">Teléfono</h3>
                      <p className="text-zinc-600">
                        <a href="tel:+525555555555" className="hover:text-black transition-colors">
                          +52 55 5555 5555
                        </a>
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">Lunes a Domingo, 24/7</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black mb-1">Email</h3>
                      <p className="text-zinc-600">
                        <a href="mailto:info@ticketx.com" className="hover:text-black transition-colors">
                          info@ticketx.com
                        </a>
                      </p>
                      <p className="text-zinc-600">
                        <a href="mailto:soporte@ticketx.com" className="hover:text-black transition-colors">
                          soporte@ticketx.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black mb-1">Redes Sociales</h3>
                      <div className="space-y-1">
                        <p className="text-zinc-600">
                          <a href="#" className="hover:text-black transition-colors">Facebook: @TicketX</a>
                        </p>
                        <p className="text-zinc-600">
                          <a href="#" className="hover:text-black transition-colors">Twitter: @TicketX_MX</a>
                        </p>
                        <p className="text-zinc-600">
                          <a href="#" className="hover:text-black transition-colors">Instagram: @ticketx.oficial</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="bg-zinc-100 p-6 rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <Clock className="w-6 h-6 mt-1" />
                    <div>
                      <h3 className="font-bold text-black mb-3">Horario de Atención</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-600">Lunes - Viernes:</span>
                          <span className="font-semibold text-black">9:00 AM - 9:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600">Sábados:</span>
                          <span className="font-semibold text-black">10:00 AM - 8:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600">Domingos:</span>
                          <span className="font-semibold text-black">10:00 AM - 6:00 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-600 border-t border-zinc-300 pt-3 mt-3">
                    Soporte telefónico disponible 24/7 para emergencias
                  </p>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold text-black mb-6">Envíanos un Mensaje</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Tu nombre"
                      className="w-full px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Asunto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="¿En qué podemos ayudarte?"
                      className="w-full px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Escribe tu mensaje aquí..."
                      rows={6}
                      className="w-full px-4 py-3 border border-zinc-300 focus:border-black focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-black text-white font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Enviar Mensaje
                  </button>

                  <p className="text-sm text-zinc-600 text-center">
                    Nos comprometemos a responder en menos de 24 horas hábiles
                  </p>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
