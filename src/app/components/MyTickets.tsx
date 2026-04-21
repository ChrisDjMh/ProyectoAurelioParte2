import { useState, useEffect } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { X, Ticket as TicketIcon, Calendar, MapPin, Clock, Ban, AlertTriangle } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { TicketDetail } from "./TicketDetail";
import { PurchaseModal } from "./PurchaseModal";

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
  estado: 'creado' | 'disponible' | 'reservado' | 'pagado' | 'usado' | 'cancelado';
}

interface MyTicketsProps {
  tickets: Ticket[];
  onClose: () => void;
  onCancelTicket?: (ticketId: string) => void;
  isPremiumUser?: boolean; 
  currentUser?: { id: number; nombre: string; email: string } | null;
}

const getConfigEstado = (estado?: string) => {
  const estadoSeguro = estado || 'desconocido';

  switch (estadoSeguro) {
    case 'pagado':
      return { 
        bgBadge: 'bg-green-500', 
        textoBadge: 'CONFIRMADO', 
        textoPrecio: 'Total pagado',
        textoBoton: 'Ver boleto', 
        bgBoton: 'bg-black hover:bg-zinc-800 text-white' 
      };
    case 'reservado':
      return { 
        bgBadge: 'bg-amber-500', 
        textoBadge: 'RESERVADO', 
        textoPrecio: 'Total a pagar',
        textoBoton: 'Completar pago', 
        bgBoton: 'bg-amber-500 hover:bg-amber-600 text-white' 
      };
    case 'cancelado':
      return { 
        bgBadge: 'bg-red-500', 
        textoBadge: 'CANCELADO', 
        textoPrecio: 'Monto cancelado',
        textoBoton: 'Cancelado', 
        bgBoton: 'bg-zinc-200 text-zinc-500 cursor-not-allowed' 
      };
    default:
      return { 
        bgBadge: 'bg-zinc-500', 
        textoBadge: estadoSeguro.toUpperCase(), 
        textoPrecio: 'Total',
        textoBoton: 'Ver detalle', 
        bgBoton: 'bg-black hover:bg-zinc-800 text-white' 
      };
  }
};

export function MyTickets({ tickets, onClose, onCancelTicket, isPremiumUser, currentUser }: MyTicketsProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [myTickets, setMyTickets] = useState<Ticket[]>([...tickets].reverse());
  
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [pendingEventData, setPendingEventData] = useState<any>(null); 
  const [selectedTicketForPayment, setSelectedTicketForPayment] = useState<Ticket | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [ticketToCancel, setTicketToCancel] = useState<Ticket | null>(null);

  useEffect(() => {
    setMyTickets([...tickets].reverse());
  }, [tickets]);

  const handleActionClick = (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation(); 

    if (ticket.estado === 'cancelado') {
      return; 
    }

    if (ticket.estado === 'reservado') {
      const totalAmountStr = ticket.totalPrice.replace(/[^0-9.]/g, ""); 
      const totalAmountNum = parseFloat(totalAmountStr) || 0;
      const numberOfSeats = ticket.seats.length > 0 ? ticket.seats.length : 1;
      const pricePerSeat = totalAmountNum / numberOfSeats;

      setPendingEventData({
        id: ticket.eventId,
        title: ticket.eventTitle,
        date: ticket.eventDate,
        time: ticket.eventTime,
        venue: ticket.eventVenue,
        location: ticket.eventLocation,
        image: ticket.eventImage,
        price: `$${pricePerSeat.toFixed(2)}`, 
        tickets: 100,
        seatsioEventKey: ticket.eventId,
      });
      
      setSelectedTicketForPayment(ticket);
      setIsPurchaseModalOpen(true);
    } else if (ticket.estado === 'pagado') {
    setSelectedTicket(ticket);
  }
  };

  const handleCancelClick = (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation(); 
    setTicketToCancel(ticket);
  };

  const confirmCancel = () => {
  if (ticketToCancel && onCancelTicket) {
    const cleanId = ticketToCancel.id.replace('ORD-', '');
    onCancelTicket(cleanId); 
    setSuccessMessage('Cancelando reserva...');
  }
  setTicketToCancel(null);
};

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
            className="max-w-6xl mx-auto bg-white rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-8 py-6 flex items-center justify-between rounded-t-xl">
              <div>
                <h1 className="text-3xl font-bold text-black mb-1">Mis boletos</h1>
                <p className="text-zinc-600">
                  {myTickets.length} {myTickets.length === 1 ? 'orden' : 'órdenes'} en total
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
                  {myTickets.map((ticket, index) => {
                    const config = getConfigEstado(ticket.estado);
                    
                    return (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group bg-white border border-zinc-200 transition-all overflow-hidden ${
                          ticket.estado !== 'cancelado' ? 'hover:border-zinc-400 cursor-pointer' : 'opacity-80'
                        }`}
                       onClick={() => {
                          if (ticket.estado === 'pagado') setSelectedTicket(ticket);
                        }}
                      >
                        <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900">
                          <ImageWithFallback
                            src={ticket.eventImage}
                            alt={ticket.eventTitle}
                            className={`w-full h-full object-cover transition-transform duration-500 ${
                              ticket.estado === 'reservado' ? 'opacity-80 grayscale-[20%]' : 
                              ticket.estado === 'cancelado' ? 'opacity-50 grayscale' : 
                              'group-hover:scale-105'
                            }`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          
                          <div className="absolute top-3 right-3">
                            <div className={`px-3 py-1 text-white text-xs font-semibold shadow-sm ${config.bgBadge}`}>
                              {config.textoBadge}
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
                            
                            {ticket.estado === 'reservado' && (
                              <div className="flex items-center gap-2 text-sm text-amber-600 font-medium mt-2 bg-amber-50 p-2 rounded">
                                <Clock className="w-4 h-4" />
                                <span>Pendiente de pago</span>
                              </div>
                            )}
                            {ticket.estado === 'cancelado' && (
                              <div className="flex items-center gap-2 text-sm text-red-600 font-medium mt-2 bg-red-50 p-2 rounded">
                                <Ban className="w-4 h-4" />
                                <span>Esta orden fue cancelada</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-zinc-500 mb-1">{config.textoPrecio}</p>
                              <p className={`font-bold text-lg ${ticket.estado === 'cancelado' ? 'text-zinc-400 line-through' : 'text-black'}`}>
                                {ticket.totalPrice}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {ticket.estado === 'reservado' && (
                                <button 
                                  className="px-4 py-2 text-sm font-semibold rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                                  onClick={(e) => handleCancelClick(e, ticket)}
                                >
                                  Cancelar
                                </button>
                              )}

                              <button 
                                className={`px-5 py-2 text-sm font-semibold rounded transition-colors ${config.bgBoton}`}
                                onClick={(e) => handleActionClick(e, ticket)}
                              >
                                {config.textoBoton}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
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
            onCancelTicket={(ticketId) => {
              if (onCancelTicket) {
                const cleanId = ticketId.replace('ORD-', '');
                onCancelTicket(cleanId);
                
                setMyTickets((prev) => 
                  prev.map(t => t.id === ticketId ? { ...t, estado: 'cancelado' } : t)
                );
                
                setSelectedTicket(null); 
                
                setSuccessMessage('Reserva cancelada con éxito y asientos liberados.');
                setTimeout(() => {
                  setSuccessMessage(null);
                }, 3000);
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPurchaseModalOpen && pendingEventData && selectedTicketForPayment && (
          <PurchaseModal
            event={pendingEventData}
            isPremiumUser={isPremiumUser}
            currentUser={currentUser}
            initialStep="payment" 
            preselectedSeats={selectedTicketForPayment.seats}
            existingOrderId={parseInt(selectedTicketForPayment.id.replace('ORD-', ''))} 
            
            onClose={() => setIsPurchaseModalOpen(false)}
            onPurchaseComplete={(updatedData) => {
              setMyTickets((prevTickets) =>
                prevTickets.map((t) =>
                  t.id === updatedData.id 
                    ? { ...t, estado: 'pagado' } 
                    : t
                )
              );
              setIsPurchaseModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
          {ticketToCancel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
              onClick={() => setTicketToCancel(null)}
            >
              <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900 mb-2">
                      ¿Estás seguro que deseas cancelar esta reserva?
                    </h4>
                    <p className="text-sm text-red-800">
                      Esta acción no se puede deshacer. Los asientos que habías seleccionado volverán a estar disponibles para el público.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={confirmCancel}
                    className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Sí, cancelar
                  </button>
                  <button
                    onClick={() => setTicketToCancel(null)}
                    className="flex-1 px-4 py-3 border-2 border-zinc-300 text-black font-semibold rounded hover:bg-zinc-100 transition-colors text-sm"
                  >
                    No, mantener
                  </button>
                </div>
              </div>
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-green-50 border-2 border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
          >
            <div className="bg-green-100 p-1 rounded-full">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span className="font-semibold text-sm">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}