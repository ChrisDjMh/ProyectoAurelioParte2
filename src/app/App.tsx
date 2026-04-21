import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, User, Building, Shield, Ticket, Calculator } from "lucide-react";
import { EventCard } from "./components/EventCard";
import { EventDetail } from "./components/EventDetail";
import { ImageWithFallback } from "./components/ImageWithFallback";
import { LoginRegisterModal } from "./components/LoginRegisterModal";
import { OrganizerDashboard } from "./components/OrganizerDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { MyTickets } from "./components/MyTickets";
import { Support } from "./components/Support";
import { FAQ } from "./components/FAQ";
import { Contact } from "./components/Contact";
import { Privacy } from "./components/Privacy";
import { Terms } from "./components/Terms";
import { PremiumSubscription } from "./components/PremiumSubscription";
import { ContadorDashboard } from "./components/ContadorDashboard";
import { EventDetailViewOnly } from "./components/EventDetailViewOnly";
import { Footer } from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLoginPage } from "./components/AdminLoginPage";

type UserRole = "usuario" | "organizador" | "administrador" | "contador";

interface CurrentUser {
  id: number;
  nombre: string;
  email: string;
  role: UserRole;
  tipo?: "Normal" | "Premium";
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  imagen_banner?: string;
  price: string;
  category: string;
  description: string;
  time: string;
  venue: string;
  tickets: number;
  seatsioEventKey: string;
}

interface TicketData {
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
  estado?: any;
}

function MainApp() {
  const [events, setEvents] = useState<Event[]>([]);
  const [carouselEvents, setCarouselEvents] = useState<Event[]>([]);
  const [myTickets, setMyTickets] = useState<TicketData[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  const [showLoginRegister, setShowLoginRegister] = useState(false);
  const [showOrganizerDashboard, setShowOrganizerDashboard] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPremiumSubscription, setShowPremiumSubscription] = useState(false);
  const [showContadorDashboard, setShowContadorDashboard] = useState(false);

  const categories = ["Todos", "Musica", "Deportes", "Entretenimiento"];

  useEffect(() => {
    const fetchFreshUserData = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;
      
      const parsedUser = JSON.parse(storedUser);
      
      try {
        const res = await fetch("http://localhost:3001/api/auth/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: parsedUser.id, role: parsedUser.role })
        });
        
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.usuario);
          localStorage.setItem("user", JSON.stringify(data.usuario));
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Error al verificar la sesión:", error);
      }
    };
    fetchFreshUserData();
  }, []);

  useEffect(() => {
    fetch("http://localhost:3001/api/eventos")
      .then((res) => res.json())
      .then((data) => {
        const formattedEvents: Event[] = data.map((item: any) => {
          const dateObj = new Date(item.fecha);
          const timeString = dateObj.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
          return {
            id: item.id.toString(),
            title: item.titulo,
            date: dateObj.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }),
            location: item.ubicacion,
            image: item.imagen,
            imagen_banner: item.imagen_banner || null,
            price: `$${item.precio}`,
            category: item.categoria,
            description: item.descripcion || "Sin descripción disponible",
            time: timeString !== "00:00" ? timeString : "20:00",
            venue: item.ubicacion,
            tickets: item.capacidad,
            seatsioEventKey: item.seatsio_event_key || item.id.toString()
          };
        });
        setEvents(formattedEvents);
        setCarouselEvents([...formattedEvents].sort(() => 0.5 - Math.random()).slice(0, 6));
      })
      .catch((err) => console.error("Error al conectar con la API:", err));
  }, []);

  useEffect(() => {
    const fetchMisBoletos = async () => {
      if (currentUser?.role === "usuario" && events.length > 0) {
        try {
          const res = await fetch(`http://localhost:3001/api/pagos/usuarios/${currentUser.id}/boletos`);
          if (res.ok) {
            const data = await res.json();
            const completados = data.map((boleto: any) => {
              const info = events.find((e) => String(e.id) === String(boleto.evento_id || boleto.eventId));
              return {
                ...boleto,
                eventTitle: boleto.eventTitle || info?.title || "Evento Desconocido",
                eventImage: boleto.eventImage || info?.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
                id: boleto.id?.toString().includes('ORD-') ? boleto.id : boleto.id?.toString().includes('TKT-') ? boleto.id : `TKT-${boleto.id}`,
                seats: boleto.seats || boleto.asientos || []
              };
            });
            setMyTickets(completados);
          }
        } catch (error) {
          console.error("Error al cargar boletos:", error);
        }
      } else if (!currentUser) {
        setMyTickets([]);
      }
    };
    fetchMisBoletos();
  }, [currentUser, events]);

  useEffect(() => {
    if (carouselEvents.length <= 1 || heroPaused) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % carouselEvents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselEvents.length, heroPaused]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setSearchQuery("");
    scrollToEvents();
  };

  const scrollToEvents = () => {
    document.querySelector("#events-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePurchaseComplete = (ticketData: Omit<TicketData, "id" | "purchaseDate" | "qrCode">) => {
    const newTicket: TicketData = {
      id: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...ticketData,
      purchaseDate: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
      qrCode: `TICKETX-${ticketData.eventId}-${Date.now()}-${ticketData.seats.join("-")}`,
      estado: 'pagado'
    };
    setMyTickets((prev) => [...prev, newTicket]);
  };

 const handleCancelTicket = async (ticketId: string) => {
  const ticket = myTickets.find(
    t => t.id === ticketId || 
         t.id === `ORD-${ticketId}` || 
         t.id.replace('ORD-', '') === ticketId
  );

  if (!ticket) {
    console.error('Ticket no encontrado:', ticketId);
    return;
  }

  try {
    const res = await fetch('http://localhost:3001/api/pagos/cancelar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticket_id: ticket.id.includes('ORD-') ? ticket.id : `ORD-${ticketId}`,
        asientos: ticket.seats,
        evento_id: ticket.eventId,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje);


    setMyTickets(prev =>
      prev.map(t =>
        t.id === ticket.id ? { ...t, estado: 'cancelado' } : t
      )
    );
  } catch (err: any) {
    console.error('Error al cancelar:', err.message);
    alert('No se pudo cancelar: ' + err.message);
  }
};

  const handlePremiumSubscription = () => {
    if (currentUser) {
      const updatedUser = { ...currentUser, tipo: "Premium" as const };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowPremiumSubscription(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchCategory = activeCategory === "Todos" || e.category === activeCategory;
    const matchSearch = searchQuery.trim() === "" || 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const isUsuario = currentUser?.role === "usuario";
  const isOrganizador = currentUser?.role === "organizador";
  const isAdmin = currentUser?.role === "administrador";
  const isContador = currentUser?.role === "contador";
  const isPremium = currentUser?.tipo === "Premium";

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-black hover:opacity-80 transition-opacity">TICKETX</a>
          
          <nav className="hidden md:flex items-center gap-8">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => handleCategoryClick(cat)} 
                className={`text-sm font-semibold transition-colors ${activeCategory === cat ? "text-black" : "text-zinc-600 hover:text-black"}`}
              >
                {cat}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {showSearch && (
                  <motion.input 
                    initial={{ width: 0, opacity: 0 }} 
                    animate={{ width: 200, opacity: 1 }} 
                    exit={{ width: 0, opacity: 0 }} 
                    transition={{ duration: 0.2 }}
                    autoFocus 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory("Todos"); scrollToEvents(); }} 
                    onKeyDown={(e) => e.key === "Escape" && setShowSearch(false)}
                    placeholder="Buscar eventos..." 
                    className="px-3 py-1.5 text-sm border border-zinc-300 rounded-full focus:outline-none focus:border-black" 
                  />
                )}
              </AnimatePresence>
              <button onClick={() => { setShowSearch(!showSearch); setSearchQuery(""); }} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {!currentUser ? (
              <button onClick={() => setShowLoginRegister(true)} className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 rounded-full">
                <User className="w-5 h-5" />
                <span className="text-sm font-semibold">Iniciar Sesión</span>
              </button>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm font-semibold text-black">{currentUser.nombre.split(" ")[0]}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isAdmin       ? "bg-red-100 text-red-700"         :
                    isContador    ? "bg-emerald-100 text-emerald-700" :
                    isOrganizador ? "bg-blue-100 text-blue-700"       :
                    isPremium     ? "bg-yellow-100 text-yellow-700"   :
                                    "bg-zinc-200 text-zinc-600"
                  }`}>
                    {isAdmin ? "Admin" : isContador ? "Contador" : isOrganizador ? "Organizador" : isPremium ? "Premium" : "Normal"}
                  </span>
                </div>

                {isUsuario && (
                  <>
                    <button onClick={() => setShowMyTickets(true)} className="flex items-center gap-1.5 px-3 py-2 hover:bg-zinc-100 rounded-full transition-colors text-sm font-semibold">
                      <Ticket className="w-4 h-4" />
                      Mis boletos
                    </button>

                    {!isPremium && (
                      <button onClick={() => setShowPremiumSubscription(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-white font-bold text-xs rounded-full transition-all" title="Hazte Premium">
                        <span>♛</span> HAZTE VIP
                      </button>
                    )}

                    {isPremium && (
                      <button onClick={() => setShowPremiumSubscription(true)} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 rounded-full transition-colors" title="Ver mis beneficios VIP">
                        <span className="text-yellow-600 text-sm">♛</span>
                        <span className="text-xs font-bold text-yellow-700">Premium</span>
                      </button>
                    )}
                  </>
                )}

                {isOrganizador && (
                  <button onClick={() => setShowOrganizerDashboard(true)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors" title="Panel Organizador">
                    <Building className="w-5 h-5" />
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => setShowAdminDashboard(true)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-colors" title="Administración">
                    <Shield className="w-5 h-5" />
                  </button>
                )}
                {isContador && (
                  <button onClick={() => setShowContadorDashboard(true)} className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-full transition-colors" title="Contabilidad">
                    <Calculator className="w-5 h-5" />
                  </button>
                )}

                <div className="w-px h-5 bg-zinc-300 mx-1" />

                <button onClick={handleLogout} className="text-sm font-semibold text-zinc-400 hover:text-red-600 transition-colors px-2 py-1 rounded-full hover:bg-red-50" title="Cerrar sesión">
                  Salir
                </button>
              </div>
            )}
            <button className="md:hidden p-2 hover:bg-zinc-100 rounded-full"><Menu className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <section className="relative h-screen flex items-center overflow-hidden" onMouseEnter={() => setHeroPaused(true)} onMouseLeave={() => setHeroPaused(false)}>
        <div className="absolute inset-0 bg-zinc-900">
          <AnimatePresence mode="wait">
            <motion.div key={heroIndex} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 0.75, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="w-full h-full">
              <ImageWithFallback src={carouselEvents.length > 0 ? carouselEvents[heroIndex].imagen_banner || carouselEvents[heroIndex].image : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80"} alt="Hero" className="w-full h-full object-cover" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <AnimatePresence mode="wait">
            {carouselEvents.length > 0 && (
              <motion.div key={`content-${heroIndex}`} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl">
                <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5 border border-white/25">
                  {carouselEvents[heroIndex].category} · Evento destacado
                </span>
                <h2 className="text-6xl md:text-7xl font-bold text-white mb-4 leading-tight">{carouselEvents[heroIndex].title}</h2>
                <p className="text-lg text-white/80 mb-6 leading-relaxed line-clamp-2">{carouselEvents[heroIndex].description}</p>
                <div className="flex flex-wrap items-center gap-5 mb-8 text-sm">
                  <div className="flex items-center gap-2"><span className="text-white/50">📅</span><span className="font-semibold text-white">{carouselEvents[heroIndex].date}</span></div>
                  <div className="w-px h-4 bg-white/30" />
                  <div className="flex items-center gap-2"><span className="text-white/50">📍</span><span className="font-semibold text-white">{carouselEvents[heroIndex].location}</span></div>
                  <div className="w-px h-4 bg-white/30" />
                  <div className="flex items-center gap-2"><span className="text-white/50">🎟</span><span className="font-semibold text-white">Desde {carouselEvents[heroIndex].price}</span></div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setSelectedEvent(carouselEvents[heroIndex])} className="px-8 py-4 bg-white text-black font-bold text-sm hover:bg-zinc-100 transition-colors rounded-lg">Comprar tickets</button>
                  <button onClick={scrollToEvents} className="px-8 py-4 border-2 border-white/50 text-white font-bold text-sm hover:bg-white/10 transition-colors rounded-lg">Ver todos los eventos</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {carouselEvents.length > 1 && (
          <div className="absolute bottom-10 left-0 right-0 z-20 max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex gap-2">
              {carouselEvents.map((event, idx) => (
                <button key={event.id} onClick={() => { setHeroIndex(idx); setHeroPaused(true); }} className={`relative overflow-hidden rounded-lg transition-all duration-300 flex-shrink-0 ${idx === heroIndex ? "w-32 h-16 ring-2 ring-white opacity-100" : "w-16 h-16 opacity-40 hover:opacity-70"}`}>
                  <ImageWithFallback src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30" />
                  {idx === heroIndex && (
                    <div className="absolute inset-0 flex items-end p-1.5">
                      <p className="text-white text-xs font-bold leading-tight line-clamp-1">{event.title}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => { setHeroIndex((i) => (i - 1 + carouselEvents.length) % carouselEvents.length); setHeroPaused(true); }} className="w-10 h-10 rounded-full border-2 border-white/50 bg-black/20 backdrop-blur-sm text-white text-xl font-bold hover:bg-white/20 hover:border-white transition-all flex items-center justify-center">‹</button>
              <div className="flex items-center gap-2">
                {carouselEvents.map((_, idx) => (
                  <button key={idx} onClick={() => { setHeroIndex(idx); setHeroPaused(true); }} className={`rounded-full transition-all duration-300 ${idx === heroIndex ? "w-8 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"}`} />
                ))}
              </div>
              <button onClick={() => { setHeroIndex((i) => (i + 1) % carouselEvents.length); setHeroPaused(true); }} className="w-10 h-10 rounded-full border-2 border-white/50 bg-black/20 backdrop-blur-sm text-white text-xl font-bold hover:bg-white/20 hover:border-white transition-all flex items-center justify-center">›</button>
            </div>
          </div>
        )}

        {!heroPaused && carouselEvents.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
            <motion.div key={heroIndex} className="h-full bg-white/70" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 5, ease: "linear" }} />
          </div>
        )}
      </section>

      <section className="py-24 bg-white" id="events-section">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-12">
            {searchQuery.trim() !== "" ? `Resultados para "${searchQuery}"` : activeCategory === "Todos" ? "Próximos eventos" : activeCategory}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} {...event} onClick={() => setSelectedEvent(event)} />
            ))}
            {filteredEvents.length === 0 && (
              <div className="col-span-full text-center py-20 text-zinc-400">
                <p className="text-xl font-semibold mb-2">Sin resultados</p>
                <p className="text-sm">No encontramos eventos para <span className="font-semibold text-black">"{searchQuery}"</span></p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer 
        setShowSupport={setShowSupport}
        setShowFAQ={setShowFAQ}
        setShowMyTickets={setShowMyTickets}
        setShowContact={setShowContact}
        setShowPrivacy={setShowPrivacy}
        setShowTerms={setShowTerms}
      />

      <AnimatePresence>
        {selectedEvent && (
          (isAdmin || isOrganizador || isContador) ? (
            <EventDetailViewOnly event={selectedEvent} isPremiumUser={isPremium} currentUser={currentUser} onClose={() => setSelectedEvent(null)} onPurchaseComplete={handlePurchaseComplete} onRequireLogin={() => setShowLoginRegister(true)} />
          ) : (
            <EventDetail event={selectedEvent} isPremiumUser={isPremium} currentUser={currentUser} onClose={() => setSelectedEvent(null)} onPurchaseComplete={handlePurchaseComplete} onRequireLogin={() => { setShowLoginRegister(true); }} 
            onGoToMyTickets={() => {
            setSelectedEvent(null);  
            setShowMyTickets(true);  
          }} />
          )
        )}
        {showLoginRegister && <LoginRegisterModal onClose={() => setShowLoginRegister(false)} onLoginSuccess={(u) => { setCurrentUser(u); setShowLoginRegister(false); }} />}
        {showOrganizerDashboard && currentUser && isOrganizador && <OrganizerDashboard onClose={() => setShowOrganizerDashboard(false)} currentUser={currentUser} />}
        {showAdminDashboard && isAdmin && <AdminDashboard onClose={() => setShowAdminDashboard(false)} />}
        {showContadorDashboard && isContador && <ContadorDashboard onClose={() => setShowContadorDashboard(false)} />}
        {showMyTickets && <MyTickets onClose={() => setShowMyTickets(false)} tickets={myTickets} onCancelTicket={handleCancelTicket} currentUser={currentUser} isPremiumUser={isPremium} />}
        {showSupport && <Support onClose={() => setShowSupport(false)} />}
        {showFAQ && <FAQ onClose={() => setShowFAQ(false)} />}
        {showContact && <Contact onClose={() => setShowContact(false)} />}
        {showPrivacy && <Privacy onClose={() => setShowPrivacy(false)} />}
        {showTerms && <Terms onClose={() => setShowTerms(false)} />}
        {showPremiumSubscription && currentUser && <PremiumSubscription currentUser={currentUser} onClose={() => setShowPremiumSubscription(false)} onSubscribe={handlePremiumSubscription} />}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<MainApp />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}