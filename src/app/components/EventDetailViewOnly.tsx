import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, MapPin, Clock, Users } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallback";
import { PurchaseModal } from "./PurchaseModal";

interface EventDetailProps {
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    image: string;
    price: string;
    category: string;
    description: string;
    time: string;
    venue: string;
    tickets: number;
  };
  isPremiumUser?: boolean;
  currentUser?: { id: number; nombre: string; email: string } | null;
  onClose: () => void;

  onRequireLogin: () => void; 
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

export function EventDetailViewOnly({ 
  event, 
  isPremiumUser, 
  currentUser, 
  onClose, 
  onRequireLogin,
  onPurchaseComplete 
}: EventDetailProps) {
  const [showPurchase, setShowPurchase] = useState(false);




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
          className="max-w-4xl mx-auto bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-2 bg-white rounded-full hover:bg-zinc-100 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative aspect-[21/9] overflow-hidden bg-zinc-900">
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            <div className="absolute bottom-8 left-8">
              <span className="px-3 py-1 bg-white text-xs font-semibold text-black uppercase tracking-wide">
                {event.category}
              </span>
            </div>
          </div>

          <div className="p-12">
            <h1 className="text-5xl font-bold text-black mb-8 leading-tight">
              {event.title}
            </h1>

            <div className="grid grid-cols-2 gap-6 mb-12 pb-12 border-b border-zinc-200">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-zinc-600 mt-1" />
                <div>
                  <p className="text-sm text-zinc-600 mb-1">Fecha</p>
                  <p className="font-semibold text-black">{event.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-zinc-600 mt-1" />
                <div>
                  <p className="text-sm text-zinc-600 mb-1">Hora</p>
                  <p className="font-semibold text-black">{event.time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-zinc-600 mt-1" />
                <div>
                  <p className="text-sm text-zinc-600 mb-1">Ubicación</p>
                  <p className="font-semibold text-black">{event.venue}</p>
                  <p className="text-sm text-zinc-600">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-zinc-600 mt-1" />
                <div>
                  <p className="text-sm text-zinc-600 mb-1">Disponibilidad</p>
                  <p className="font-semibold text-black">{event.tickets} tickets</p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-black mb-4">Acerca del evento</h2>
              <p className="text-zinc-700 leading-relaxed">
                {event.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-zinc-200">
              <div>
                <p className="text-sm text-zinc-600 mb-1">Precio desde</p>
                <p className="text-4xl font-bold text-black">{event.price}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>

    <AnimatePresence>
      {showPurchase && (
        <PurchaseModal
          event={{
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            venue: event.venue,
            price: event.price,
            location: event.location,
            image: event.image,
            tickets: event.tickets,
          }}
          isPremiumUser={isPremiumUser}
          currentUser={currentUser}
          onClose={() => setShowPurchase(false)}
          onPurchaseComplete={onPurchaseComplete}
        />
      )}
    </AnimatePresence>
    </>
  );
}