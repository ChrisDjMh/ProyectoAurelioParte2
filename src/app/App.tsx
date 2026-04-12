import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Menu, User, Building, Shield, Ticket } from "lucide-react";
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

type UserRole = "usuario" | "organizador" | "administrador";

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
}

export default function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [carouselEvents, setCarouselEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [showLoginRegister, setShowLoginRegister] = useState(false);
  const [showOrganizerDashboard, setShowOrganizerDashboard] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [myTickets, setMyTickets] = useState<TicketData[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSupport, setShowSupport] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPremiumSubscription, setShowPremiumSubscription] = useState(false);
 
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // 2. Apenas carga la app, pedimos la info real a la Base de Datos
  useEffect(() => {
    const fetchFreshUserData = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return; // Si no hay sesión iniciada, no hacemos nada

      const parsedUser = JSON.parse(storedUser);

      try {
        const res = await fetch("http://localhost:3001/api/auth/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: parsedUser.id, role: parsedUser.role })
        });

        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.usuario); // ¡Se actualiza con la info de la BD!
          localStorage.setItem("user", JSON.stringify(data.usuario)); // Sincronizamos el caché
        } else {
          handleLogout(); // Si el usuario fue borrado de la BD, cerramos sesión
        }
      } catch (error) {
        console.error("Error al verificar la sesión:", error);
      }
    };

    fetchFreshUserData();
  }, []);

  useEffect(() => {
    const fetchMisBoletos = async () => {
      // Solo buscamos boletos si hay alguien logueado y es un usuario Normal/Premium
      if (currentUser && currentUser.role === "usuario") {
        try {
          const res = await fetch(`http://localhost:3001/api/pagos/usuarios/${currentUser.id}/boletos`);
          if (res.ok) {
            const data = await res.json();
            setMyTickets(data); // ¡Actualiza el estado con lo que viene de la base de datos!
          }
        } catch (error) {
          console.error("Error al cargar los boletos:", error);
        }
      } else {
        // Si cierra sesión, limpiamos sus boletos
        setMyTickets([]);
      }
    };

    fetchMisBoletos();
  }, [currentUser]);

  const categories = ["Todos", "Musica", "Deportes", "Entretenimiento"];
  const isUsuario = currentUser?.role === "usuario";
  const isOrganizador = currentUser?.role === "organizador";
  const isAdmin = currentUser?.role === "administrador";
  const isPremium = currentUser?.tipo === "Premium";

  useEffect(() => {
    fetch("http://localhost:3001/api/eventos")
      .then((res) => res.json())
      .then((data) => {
        const formattedEvents: Event[] = data.map((item: any) => {
          const dateObj = new Date(item.fecha);
          const timeString = dateObj.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
          const dateString = dateObj.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
          return {
            id: item.id.toString(),
            title: item.titulo,
            date: dateString,
            location: item.ubicacion,
            image: item.imagen,
            imagen_banner: item.imagen_banner || null,
            price: `$${item.precio}`,
            category: item.categoria,
            description: item.descripcion || "Sin descripción disponible",
            time: timeString !== "00:00" ? timeString : "20:00",
            venue: item.ubicacion,
            tickets: item.capacidad,
          };
        });
        setEvents(formattedEvents);

        const shuffled = [...formattedEvents].sort(() => 0.5 - Math.random());
        setCarouselEvents(shuffled.slice(0, 6));
      })
      .catch((err) => console.error("Error al conectar con la API:", err));
  }, []);

  useEffect(() => {
    if (carouselEvents.length <= 1 || heroPaused) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % carouselEvents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [events.length, heroIndex, heroPaused]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  const filteredEvents = events.filter((e) => {
    const matchCategory = activeCategory === "Todos" || e.category === activeCategory;
    const matchSearch =
      searchQuery.trim() === "" ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handlePurchaseComplete = (ticketData: Omit<TicketData, "id" | "purchaseDate" | "qrCode">) => {
    const newTicket: TicketData = {
      id: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...ticketData,
      purchaseDate: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }),
      qrCode: `TICKETX-${ticketData.eventId}-${Date.now()}-${ticketData.seats.join("-")}`,
    };
    setMyTickets((prev) => [...prev, newTicket]);
  };

  const scrollToEvents = () => {
    document.querySelector("#events-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setSearchQuery("");
    scrollToEvents();
  };
  const handleCancelTicket = (id: string) => {
  setMyTickets((prev) => prev.filter((t) => t.id !== id));
};

const handlePremiumSubscription = () => {
    if (currentUser) {
      // Solo actualizamos la vista de React
      const updatedUser = { ...currentUser, tipo: "Premium" as const };
      setCurrentUser(updatedUser);
      // Sincronizamos el caché local
      localStorage.setItem("user", JSON.stringify(updatedUser)); 
      
      setShowPremiumSubscription(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-white">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <a href="/" className="text-2xl font-bold text-black hover:opacity-80 transition-opacity">
            TICKETX
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className="text-sm font-semibold text-zinc-600 hover:text-black transition-colors"
              >
                {cat}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">

            {/* Buscador expandible */}
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
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setActiveCategory("Todos");
                      scrollToEvents();
                    }}
                    onKeyDown={(e) => e.key === "Escape" && setShowSearch(false)}
                    placeholder="Buscar eventos..."
                    className="px-3 py-1.5 text-sm border border-zinc-300 rounded-full focus:outline-none focus:border-black"
                  />
                )}
              </AnimatePresence>
              <button
                onClick={() => { setShowSearch(!showSearch); setSearchQuery(""); }}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Sin sesión */}
            {!currentUser && (
              <button
                onClick={() => setShowLoginRegister(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 rounded-full"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-semibold">Iniciar Sesión</span>
              </button>
            )}

            {/* Con sesión */}
            {currentUser && (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm font-semibold text-black">
                    {currentUser.nombre.split(" ")[0]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isAdmin       ? "bg-red-100 text-red-700"         :
                    isOrganizador ? "bg-blue-100 text-blue-700"       :
                    isPremium     ? "bg-yellow-100 text-yellow-700"   :
                                    "bg-zinc-200 text-zinc-600"
                  }`}>
                    {isAdmin ? "Admin" : isOrganizador ? "Organizador" : isPremium ? "Premium" : "Normal"}
                  </span>
                </div>

                {isUsuario && (
  <>
    {/* Mis Boletos */}
    <button onClick={() => setShowMyTickets(true)}
      className="p-2 hover:bg-zinc-100 rounded-full transition-colors" title="Mis Boletos">
      <Ticket className="w-5 h-5" />
    </button>

    {/* ✅ Botón VIP — solo si NO es Premium */}
    {!isPremium && (
      <button
        onClick={() => setShowPremiumSubscription(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-white font-bold text-xs rounded-full transition-all"
        title="Hazte Premium"
      >
        <span>♛</span> HAZTE VIP
      </button>
    )}

    {/* ✅ Badge dorado si YA es Premium */}
    {isPremium && (
    <button
      onClick={() => setShowPremiumSubscription(true)}
      className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 border border-yellow-300 rounded-full transition-colors"
      title="Ver mis beneficios VIP"
    >
      <span className="text-yellow-600 text-sm">♛</span>
      <span className="text-xs font-bold text-yellow-700">Premium</span>
    </button>
  )}
  </>
)}
                {isOrganizador && (
                  <button onClick={() => setShowOrganizerDashboard(true)}
                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors" title="Panel Organizador">
                    <Building className="w-5 h-5" />
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => setShowAdminDashboard(true)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-colors" title="Administración">
                    <Shield className="w-5 h-5" />
                  </button>
                )}

                <div className="w-px h-5 bg-zinc-300 mx-1" />

                <button onClick={handleLogout}
                  className="text-sm font-semibold text-zinc-400 hover:text-red-600 transition-colors px-2 py-1 rounded-full hover:bg-red-50"
                  title="Cerrar sesión">
                  Salir
                </button>
              </div>
            )}

            <button className="md:hidden p-2 hover:bg-zinc-100 rounded-full">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>{/* ← CIERRE DEL HEADER */}

      {/* ── HERO CARRUSEL ──────────────────────────────────────── */}
      <section
        className="relative h-screen flex items-center overflow-hidden"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        <div className="absolute inset-0 bg-zinc-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.75, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="w-full h-full"
            >
              <ImageWithFallback
                src={
                  carouselEvents.length > 0
                    ? carouselEvents[heroIndex].imagen_banner || carouselEvents[heroIndex].image
                    : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&q=80"
                }
                alt="Hero"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <AnimatePresence mode="wait">
            {carouselEvents.length > 0 && (
              <motion.div
                key={`content-${heroIndex}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl"
              >
                <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5 border border-white/25">
                  {carouselEvents[heroIndex].category} · Evento destacado
                </span>
                <h2 className="text-6xl md:text-7xl font-bold text-white mb-4 leading-tight">
                  {carouselEvents[heroIndex].title}
                </h2>
                <p className="text-lg text-white/80 mb-6 leading-relaxed line-clamp-2">
                  {carouselEvents[heroIndex].description}
                </p>
                <div className="flex flex-wrap items-center gap-5 mb-8 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-white/50">📅</span>
                    <span className="font-semibold text-white">{carouselEvents[heroIndex].date}</span>
                  </div>
                  <div className="w-px h-4 bg-white/30" />
                  <div className="flex items-center gap-2">
                    <span className="text-white/50">📍</span>
                    <span className="font-semibold text-white">{carouselEvents[heroIndex].location}</span>
                  </div>
                  <div className="w-px h-4 bg-white/30" />
                  <div className="flex items-center gap-2">
                    <span className="text-white/50">🎟</span>
                    <span className="font-semibold text-white">Desde {carouselEvents[heroIndex].price}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedEvent(carouselEvents[heroIndex])}
                    className="px-8 py-4 bg-white text-black font-bold text-sm hover:bg-zinc-100 transition-colors rounded-lg"
                  >
                    Comprar tickets
                  </button>
                  <button
                    onClick={scrollToEvents}
                    className="px-8 py-4 border-2 border-white/50 text-white font-bold text-sm hover:bg-white/10 transition-colors rounded-lg"
                  >
                    Ver todos los eventos
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controles: miniaturas + flechas + puntos */}
        {carouselEvents.length > 1 && (
          <div className="absolute bottom-10 left-0 right-0 z-20 max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex gap-2">
              {carouselEvents.map((event, idx) => (
                <button
                  key={event.id}
                  onClick={() => { setHeroIndex(idx); setHeroPaused(true); }}
                  className={`relative overflow-hidden rounded-lg transition-all duration-300 flex-shrink-0 ${
                    idx === heroIndex ? "w-32 h-16 ring-2 ring-white opacity-100" : "w-16 h-16 opacity-40 hover:opacity-70"
                  }`}
                >
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
              <button
                onClick={() => { setHeroIndex((i) => (i - 1 + carouselEvents.length) % carouselEvents.length); setHeroPaused(true); }}
                className="w-10 h-10 rounded-full border-2 border-white/50 bg-black/20 backdrop-blur-sm text-white text-xl font-bold hover:bg-white/20 hover:border-white transition-all flex items-center justify-center"
              >‹</button>

              <div className="flex items-center gap-2">
                {carouselEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setHeroIndex(idx); setHeroPaused(true); }}
                    className={`rounded-full transition-all duration-300 ${
                      idx === heroIndex ? "w-8 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => { setHeroIndex((i) => (i + 1) % carouselEvents.length); setHeroPaused(true); }}
                className="w-10 h-10 rounded-full border-2 border-white/50 bg-black/20 backdrop-blur-sm text-white text-xl font-bold hover:bg-white/20 hover:border-white transition-all flex items-center justify-center"
              >›</button>
            </div>
          </div>
        )}

        {!heroPaused && carouselEvents.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
            <motion.div
              key={heroIndex}
              className="h-full bg-white/70"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
            />
          </div>
        )}
      </section>

      {/* ── GRID DE EVENTOS ────────────────────────────────────── */}
      <section className="py-24 bg-white" id="events-section">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-12">
            {searchQuery.trim() !== ""
              ? `Resultados para "${searchQuery}"`
              : activeCategory === "Todos" ? "Próximos eventos" : activeCategory}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} {...event} onClick={() => setSelectedEvent(event)} />
            ))}
            {filteredEvents.length === 0 && (
              <div className="col-span-full text-center py-20 text-zinc-400">
                <p className="text-xl font-semibold mb-2">Sin resultados</p>
                <p className="text-sm">
                  No encontramos eventos para{" "}
                  <span className="font-semibold text-black">"{searchQuery}"</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ACTUALIZADO ────────────────────────────────── */}
      <footer className="py-16 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-black mb-4">TICKETX</h3>
              <p className="text-sm text-zinc-600">Tu plataforma de confianza.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Eventos</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                {categories.map(cat => (
                  <li key={cat}><button onClick={() => handleCategoryClick(cat)} className="hover:text-black">{cat}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ayuda</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li><button onClick={() => setShowSupport(true)} className="hover:text-black">Soporte</button></li>
                <li><button onClick={() => setShowFAQ(true)} className="hover:text-black">FAQ</button></li>
                <li><button onClick={() => setShowMyTickets(true)} className="hover:text-black">Mis Boletos</button></li>
                <li><button onClick={() => setShowContact(true)} className="hover:text-black">Contacto</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li><button onClick={() => setShowPrivacy(true)} className="hover:text-black">Privacidad</button></li>
                <li><button onClick={() => setShowTerms(true)} className="hover:text-black">Términos</button></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-zinc-600">
            <p>© 2026 TicketX. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* ── MODALES ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetail 
            event={selectedEvent} 
            isPremiumUser={isPremium} 
            currentUser={currentUser}  
            onClose={() => setSelectedEvent(null)} 
            onPurchaseComplete={handlePurchaseComplete}
            // ¡NUEVO! Conectamos la validación del EventDetail con el modal de login de la App
            onRequireLogin={() => {
              // Opcional: Cerrar el detalle del evento si lo prefieres
              // setSelectedEvent(null); 
              setShowLoginRegister(true);
            }} 
          />
        )}
        {showLoginRegister && (
          <LoginRegisterModal onClose={() => setShowLoginRegister(false)} onLoginSuccess={(userData) => { setCurrentUser(userData); setShowLoginRegister(false); }} />
        )}
        {showOrganizerDashboard && currentUser && isOrganizador && (
          <OrganizerDashboard onClose={() => setShowOrganizerDashboard(false)} currentUser={currentUser} />
        )}
        {showAdminDashboard && isAdmin && (
          <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
        )}
        {showMyTickets && (
          <MyTickets onClose={() => setShowMyTickets(false)} tickets={myTickets} onCancelTicket={handleCancelTicket} />
        )}
        {showSupport && <Support onClose={() => setShowSupport(false)} />}
        {showFAQ && <FAQ onClose={() => setShowFAQ(false)} />}
        {showContact && <Contact onClose={() => setShowContact(false)} />}
        {showPrivacy && <Privacy onClose={() => setShowPrivacy(false)} />}
        {showTerms && <Terms onClose={() => setShowTerms(false)} />}
        {showPremiumSubscription && currentUser && (
          <PremiumSubscription 
            currentUser={currentUser} // Ahora estamos 100% seguros de que no es null
            onClose={() => setShowPremiumSubscription(false)} 
            onSubscribe={handlePremiumSubscription} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}