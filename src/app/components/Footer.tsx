import { motion } from "framer-motion";
import { Instagram, Twitter, Linkedin, MapPin, ShieldCheck, ArrowUpRight, Users, Flame } from "lucide-react";
import { ConcertAd } from "./ConcertAd";

export const Footer = ({ 
  setShowSupport, setShowFAQ, setShowMyTickets, setShowContact 
}: any) => {
  return (
    <footer className="bg-white pt-20 pb-10 px-6 lg:px-20 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <div className="w-full">
          <ConcertAd />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-xs">X</span>
                </div>
                <span className="text-xl font-black tracking-tighter italic">TICKETX</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                1,240 personas buscando boletos ahora
              </div>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed uppercase font-medium max-w-xs">
              Tu plataforma de confianza para los mejores eventos y experiencias inolvidables.
            </p>
          </div>

          <div className="space-y-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 flex items-center gap-2">
              <Flame size={12} className="text-red-500" /> Top Sellers
            </h4>
            <ul className="flex flex-col gap-3 text-sm font-semibold text-zinc-500">
              <li className="group cursor-pointer flex items-center justify-between hover:text-black transition-colors">
                Sabrina Carpenter <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
              <li className="group cursor-pointer flex items-center justify-between hover:text-black transition-colors">
                Coachella 2026 <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
              <li className="group cursor-pointer flex items-center justify-between hover:text-black transition-colors">
                Taylor Swift <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Ayuda</h4>
            <nav className="flex flex-col gap-3 text-sm font-semibold text-zinc-500">
              <button onClick={() => setShowSupport(true)} className="hover:text-black text-left transition-colors">Soporte</button>
              <button onClick={() => setShowFAQ(true)} className="hover:text-black text-left transition-colors">Preguntas</button>
              <button onClick={() => setShowContact(true)} className="hover:text-black text-left transition-colors">Contacto</button>
            </nav>
          </div>

          <div className="space-y-5 flex flex-col items-start lg:items-end">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
              <MapPin size={14} className="text-red-500" />
              CDMX
            </div>
            <div className="flex gap-4">
              <Instagram size={18} className="text-zinc-400 hover:text-black cursor-pointer transition-colors" />
              <Twitter size={18} className="text-zinc-400 hover:text-black cursor-pointer transition-colors" />
              <Linkedin size={18} className="text-zinc-400 hover:text-black cursor-pointer transition-colors" />
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-zinc-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            <span>© 2026 TICKETX</span>
            <a href="#" className="hover:text-black">Privacidad</a>
            <a href="#" className="hover:text-black">Términos</a>
          </div>

          <div className="flex items-center gap-3 text-green-600/70 font-bold text-[10px] uppercase tracking-tighter">
            <ShieldCheck size={14} />
            Sitio Seguro · SSL Encrypted
          </div>
        </div>
      </div>
    </footer>
  );
}; 