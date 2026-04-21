import { motion } from "motion/react";
import { X, Calendar, MapPin, Clock, Download, Share2, AlertTriangle, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";
import { ImageWithFallback } from "./ImageWithFallback";
import { useState, useRef, useEffect } from "react";
import { toPng, toBlob } from "html-to-image";

interface TicketDetailProps {
  ticket: {
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
  };
  onClose: () => void;
  onCancelTicket?: (ticketId: string) => void;
}

export function TicketDetail({ ticket, onClose, onCancelTicket }: TicketDetailProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [safeImage, setSafeImage] = useState(ticket.eventImage); 
  

  const ticketRef = useRef<HTMLDivElement>(null);
  

  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelTicket = async () => {
    setIsCanceling(true);
    
    try {
      const res = await fetch("http://localhost:3001/api/pagos/cancelar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: ticket.id,
       
          asientos: ticket.seats, 
          evento_id: ticket.eventId 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al cancelar el boleto");


      if (onCancelTicket) {
        onCancelTicket(ticket.id);
        onClose();
      }
    } catch (error: any) {
      console.error("Error al cancelar:", error);
      alert(error.message || "Hubo un problema al intentar cancelar el boleto.");
    } finally {
      setIsCanceling(false);
    }
  };

  


  useEffect(() => {
    const fetchImageAsBase64 = async () => {
      try {
      
        const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(ticket.eventImage)}&t=${Date.now()}`;
        const response = await fetch(proxyUrl);
        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setSafeImage(reader.result as string); 
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error convirtiendo imagen", error);
      }
    };
    fetchImageAsBase64();
  }, [ticket.eventImage]);


  const handleDownload = async () => {
    if (!ticketRef.current) return;
    
    try {
    
      setIsDownloading(true);
      

      await new Promise((resolve) => setTimeout(resolve, 150));
      
      const options = {
        quality: 1,
        pixelRatio: 2, 
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: {
          transform: 'none',
          boxShadow: 'none',
          margin: '0',
        },
        filter: (node: any) => {
          return node.getAttribute ? node.getAttribute("data-hide") !== "true" : true;
        }
      };

      await toPng(ticketRef.current, options);
      
      const dataUrl = await toPng(ticketRef.current, options);
      
      const link = document.createElement("a");
      link.download = `Boleto-${ticket.eventTitle.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      
    } catch (error) {
      console.error("Error al descargar el boleto:", error);
      alert("Hubo un problema al generar la imagen del boleto.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!ticketRef.current) return;

    try {
      setIsDownloading(true); 
      await new Promise((resolve) => setTimeout(resolve, 150));

      const options = {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: {
          transform: 'none',
          boxShadow: 'none',
          margin: '0',
        },
        filter: (node: any) => node.getAttribute ? node.getAttribute("data-hide") !== "true" : true
      };

    
      await toBlob(ticketRef.current, options);
      const blob = await toBlob(ticketRef.current, options);

      if (!blob) throw new Error("No se pudo generar la imagen para compartir");


      const file = new File([blob], `Boleto-${ticket.eventTitle.replace(/\s+/g, '-')}.png`, { type: 'image/png' });

      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Mi boleto para ${ticket.eventTitle}`,
          text: `¡Ya tengo mi boleto para ${ticket.eventTitle}! Nos vemos el ${ticket.eventDate} en ${ticket.eventVenue}.`,
          files: [file]
        });
      } 
     
      else if (navigator.share) {
        await navigator.share({
          title: `Boleto para ${ticket.eventTitle}`,
          text: `¡Ya tengo mi boleto para ${ticket.eventTitle}! Será el ${ticket.eventDate} en ${ticket.eventVenue}.`
        });
      } 
    
      else {
        await navigator.clipboard.writeText(`¡Tengo mi boleto para ${ticket.eventTitle}! Será el ${ticket.eventDate} en ${ticket.eventVenue}.`);
        alert("¡Detalles del evento copiados al portapapeles!");
      }

    } catch (error: any) {
 
      if (error.name !== 'AbortError') {
        console.error("Error al compartir:", error);
        alert("Hubo un problema al intentar compartir el boleto.");
      }
    } finally {
      setIsDownloading(false);
    }
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
          className="max-w-2xl mx-auto bg-white relative"
          onClick={(e) => e.stopPropagation()}
          ref={ticketRef} 
          key={ticket.id} 
        >

          <button
            onClick={onClose}
            data-hide="true" 
            className="absolute top-8 right-8 p-2 bg-white rounded-full hover:bg-zinc-100 transition-colors z-10 shadow-md"
          >
            <X className="w-6 h-6" />
          </button>

 
       <div className="relative aspect-[16/7] overflow-hidden bg-zinc-900">
            <ImageWithFallback
            
              src={safeImage}
              alt={ticket.eventTitle}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                {ticket.eventTitle}
              </h1>
              <p className="text-white/80">Boleto confirmado</p>
            </div>
          </div>

          <div className="p-8">
   
            <div className="flex justify-center mb-8 pb-8 border-b border-zinc-200">
              <div className="bg-white p-6 rounded-lg border-2 border-zinc-200">
                <QRCode
                  value={ticket.qrCode}
                  size={200}
                  level="H"
                  className="w-full h-auto"
                />
                <p className="text-center mt-4 text-sm text-zinc-600 font-mono">
                  {ticket.id.toUpperCase()}
                </p>
              </div>
            </div>

  
            <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-zinc-200">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-zinc-600 mt-1" />
                <div>
                  <p className="text-sm text-zinc-600 mb-1">Fecha</p>
                  <p className="font-semibold text-black">{ticket.eventDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-zinc-600 mt-1" />
                <div>
                  <p className="text-sm text-zinc-600 mb-1">Hora</p>
                  <p className="font-semibold text-black">{ticket.eventTime}</p>
                </div>
              </div>

              <div className="col-span-2 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-zinc-600 mt-1" />
                <div>
                  <p className="text-sm text-zinc-600 mb-1">Ubicación</p>
                  <p className="font-semibold text-black">{ticket.eventVenue}</p>
                  <p className="text-sm text-zinc-600">{ticket.eventLocation}</p>
                </div>
              </div>
            </div>

 
            <div className="mb-8 pb-8 border-b border-zinc-200">
              <h3 className="font-semibold text-black mb-3">Asientos</h3>
              <div className="flex flex-wrap gap-2">
                {ticket.seats.map((seat) => (
                  <div
                    key={seat}
                    className="px-4 py-2 bg-black text-white font-mono font-semibold"
                  >
                    {seat}
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-600 mt-3">
                Total de boletos: {ticket.seats.length}
              </p>
            </div>

      
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-zinc-600">Fecha de compra</p>
                <p className="font-semibold text-black">{ticket.purchaseDate}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-zinc-600">Total pagado</p>
                <p className="text-2xl font-bold text-black">{ticket.totalPrice}</p>
              </div>
            </div>

      
           <div data-hide="true">
              <div className="flex gap-3">
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex-1 px-6 py-3 bg-black text-white font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isDownloading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                  ) : (
                    <><Download className="w-5 h-5" /> Descargar boleto</>
                  )}
                </button>
                <button 
                  onClick={handleShare} 
                  disabled={isDownloading} 
                  className="px-6 py-3 border-2 border-black text-black font-semibold hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isDownloading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> ...</>
                  ) : (
                    <><Share2 className="w-5 h-5" /> Compartir</>
                  )}
                </button>
              </div>

           
              {onCancelTicket && !showCancelConfirm && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full mt-3 px-6 py-3 border-2 border-red-600 text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Cancelar boleto
                </button>
              )}

     
              {showCancelConfirm && (
                <div className="mt-6 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-900 mb-2">
                        ¿Estás seguro que deseas cancelar este boleto?
                      </h4>
                      <p className="text-sm text-red-800">
                        Esta acción no se puede deshacer. Se te reembolsará el monto completo a tu método de pago original.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelTicket}
                      disabled={isCanceling}
                      className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isCanceling ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Cancelando...</>
                      ) : (
                        "Sí, cancelar boleto"
                      )}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 px-6 py-3 border-2 border-zinc-300 text-black font-semibold hover:bg-zinc-100 transition-colors"
                    >
                      No, mantener boleto
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}