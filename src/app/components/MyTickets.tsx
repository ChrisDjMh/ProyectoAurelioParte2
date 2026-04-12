import { useState, useEffect } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { X, Ticket as TicketIcon, Calendar, MapPin } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { TicketDetail } from "./TicketDetail";

interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventLocation: string;
  eventImage: string;
  seats: string[];
  purchaseDate: string;
  totalPrice: string;
  qrCode: string;
}

interface MyTicketsProps {
  tickets: Ticket[];
  onClose: () => void;
  onCancelTicket?: (ticketId: string) => void;
}

export function MyTickets({ tickets, onClose, onCancelTicket }: MyTicketsProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [myTickets, setMyTickets] = useState<Ticket[]>(tickets);

  useEffect(() => {
    setMyTickets(tickets);
  }, [tickets]);

 

  return (
    <>
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
            className="max-w-6xl mx-auto bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-black mb-1">Mis boletos</h1>
                <p className="text-zinc-600">
                  {myTickets.length} {myTickets.length === 1 ? 'boleto' : 'boletos'} en total
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              {myTickets.length === 0 ? (
                <div className="text-center py-20">
                  <TicketIcon className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-black mb-2">
                    No tienes boletos aún
                  </h3>
                  <p className="text-zinc-600">
                    Comienza a explorar eventos y compra tus primeros boletos
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-white border border-zinc-200 hover:border-zinc-400 transition-all cursor-pointer overflow-hidden"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900">
                        <ImageWithFallback
                          src={ticket.eventImage}
                          alt={ticket.eventTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        <div className="absolute top-3 right-3">
                          <div className="px-3 py-1 bg-green-500 text-white text-xs font-semibold">
                            CONFIRMADO
                          </div>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
                            <TicketIcon className="w-4 h-4" />
                            <span>{ticket.seats.length} {ticket.seats.length === 1 ? 'boleto' : 'boletos'}</span>
                            <span className="mx-2">•</span>
                            <span className="font-mono">{ticket.seats.join(", ")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold text-black mb-3 text-lg group-hover:text-zinc-700 transition-colors">
                          {ticket.eventTitle}
                        </h3>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-zinc-600">
                            <Calendar className="w-4 h-4" />
                            <span>{ticket.eventDate} • {ticket.eventTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-600">
                            <MapPin className="w-4 h-4" />
                            <span>{ticket.eventVenue}</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-zinc-600 mb-1">Total pagado</p>
                            <p className="font-bold text-black text-lg">{ticket.totalPrice}</p>
                          </div>
                          <div className="px-5 py-2 bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition-colors">
                            Ver boleto
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedTicket && (
          <TicketDetail
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onCancelTicket={onCancelTicket}
          />
        )}
      </AnimatePresence>
    </>
  );
}