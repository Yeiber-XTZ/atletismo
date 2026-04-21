/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Bell, 
  User, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Facebook, 
  Instagram, 
  Twitter,
  Calendar as CalendarIcon,
  Trophy,
  Users,
  Newspaper,
  Download
} from "lucide-react";

const events = [
  {
    id: 1,
    date: "24",
    month: "OCTUBRE",
    status: "ABIERTO",
    category: "Velocidad y Saltos",
    title: "Grand Prix de Quibdó: Oro del Atrato",
    location: "Estadio de Atletismo, Quibdó",
    type: "primary",
    action: "INSCRIBIRSE"
  },
  {
    id: 2,
    date: "05",
    month: "NOVIEMBRE",
    status: "PRÓXIMAMENTE",
    category: "Lanzamientos",
    title: "Torneo Regional Sub-18 Istmina",
    location: "Villa Deportiva, Istmina",
    type: "tertiary",
    action: "NOTIFICARME"
  },
  {
    id: 3,
    date: "12",
    month: "OCTUBRE",
    status: "CERRADO",
    category: "Maratón de Selva",
    title: "Travesía Tadó: 15K Chocó Profundo",
    location: "Pista Municipal, Tadó",
    type: "closed",
    action: "VER RESULTADOS"
  }
];

export default function App() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 px-6 md:px-12 py-4 flex justify-between items-center shadow-[0_20px_40px_rgba(11,54,29,0.08)]">
        <div className="text-2xl font-black italic text-primary font-headline uppercase tracking-tight">
          CHOCÓ ATHLÉTIQUE
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-primary border-b-4 border-primary pb-1 font-headline font-black uppercase tracking-tight text-sm">Calendario</a>
          <a href="#" className="text-tertiary hover:text-primary transition-all duration-300 font-headline font-black uppercase tracking-tight text-sm">Resultados</a>
          <a href="#" className="text-tertiary hover:text-primary transition-all duration-300 font-headline font-black uppercase tracking-tight text-sm">Atletas</a>
          <a href="#" className="text-tertiary hover:text-primary transition-all duration-300 font-headline font-black uppercase tracking-tight text-sm">Noticias</a>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-primary hover:bg-surface-container-highest transition-all rounded-full">
            <Bell size={20} />
          </button>
          <button className="p-2 text-primary hover:bg-surface-container-highest transition-all rounded-full">
            <User size={20} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative w-full h-[500px] md:h-[614px] flex items-center overflow-hidden bg-inverse-surface kinetic-slant">
        <img 
          className="absolute inset-0 w-full h-full object-cover opacity-60" 
          src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop" 
          alt="Professional sprinter"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-inverse-surface via-transparent to-transparent"></div>
        <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-block px-4 py-1 bg-secondary-container text-on-secondary-container font-headline font-bold text-sm mb-4 speed-slant"
          >
            TEMPORADA 2024
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-8xl lg:text-9xl font-headline font-black text-on-primary italic leading-none tracking-tighter mb-6 uppercase"
          >
            AGENDA DE<br/><span className="text-primary-container">VELOCIDAD</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-surface-container-low max-w-xl font-medium"
          >
            Sigue el rastro de los atletas más veloces del Pacífico. Cada milisegundo cuenta en nuestra ruta hacia la gloria nacional.
          </motion.p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Filters & Events */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Filters */}
            <section className="p-6 bg-surface-container-low rounded-xl shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <label className="block text-[0.6875rem] font-headline font-bold text-tertiary uppercase tracking-widest">Mes del Evento</label>
                  <select className="w-full bg-surface-container-highest border-none rounded-sm font-body font-semibold text-on-surface focus:ring-2 focus:ring-primary p-3">
                    <option>Todos los meses</option>
                    <option>Octubre 2024</option>
                    <option>Noviembre 2024</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[0.6875rem] font-headline font-bold text-tertiary uppercase tracking-widest">Categoría</label>
                  <select className="w-full bg-surface-container-highest border-none rounded-sm font-body font-semibold text-on-surface focus:ring-2 focus:ring-primary p-3">
                    <option>Todas las categorías</option>
                    <option>Sub-18</option>
                    <option>Sub-20</option>
                    <option>Mayores</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[0.6875rem] font-headline font-bold text-tertiary uppercase tracking-widest">Municipio</label>
                  <select className="w-full bg-surface-container-highest border-none rounded-sm font-body font-semibold text-on-surface focus:ring-2 focus:ring-primary p-3">
                    <option>Todo el Chocó</option>
                    <option>Quibdó</option>
                    <option>Istmina</option>
                  </select>
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button className="bg-primary text-on-primary px-10 py-3 font-headline font-bold text-sm speed-slant hover:scale-105 transition-transform uppercase">
                    Filtrar
                  </button>
                </div>
              </div>
            </section>

            {/* Event List */}
            <section className="space-y-6">
              {events.map((event, idx) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`group relative bg-white overflow-hidden rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,107,27,0.12)] transition-all duration-500 border-l-[12px] ${
                    event.type === 'primary' ? 'border-primary' : 
                    event.type === 'tertiary' ? 'border-tertiary' : 
                    'border-on-surface-variant/20 grayscale opacity-75'
                  }`}
                >
                  <div className="flex flex-col md:flex-row p-8 gap-8 items-center">
                    <div className="text-center md:text-left min-w-[100px]">
                      <span className={`block text-4xl font-headline font-black leading-none ${
                        event.type === 'primary' ? 'text-primary' : 
                        event.type === 'tertiary' ? 'text-tertiary' : 
                        'text-on-surface-variant'
                      }`}>{event.date}</span>
                      <span className="block text-sm font-headline font-bold text-on-surface-variant uppercase tracking-widest">{event.month}</span>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-[0.6rem] font-headline font-black rounded-full uppercase ${
                          event.type === 'primary' ? 'bg-primary-container text-on-primary-container' : 
                          event.type === 'tertiary' ? 'bg-tertiary-container text-on-tertiary-container' : 
                          'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {event.status}
                        </span>
                        <span className="text-tertiary text-xs font-bold font-headline uppercase tracking-tighter">{event.category}</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-headline font-extrabold text-on-surface italic uppercase group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="w-full md:w-auto">
                      <button className={`w-full md:w-auto px-10 py-3 font-headline font-black italic rounded-sm transition-all ${
                        event.type === 'primary' ? 'border-2 border-primary text-primary hover:bg-primary hover:text-on-primary' : 
                        event.type === 'tertiary' ? 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-50' : 
                        'border-2 border-on-surface-variant text-on-surface-variant'
                      }`}>
                        {event.action}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </section>
          </div>

          {/* Right Column: Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-surface-container-high p-8 rounded-2xl shadow-xl sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-headline font-black text-xl italic uppercase text-primary tracking-tight">OCTUBRE 2024</h4>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-primary-container rounded transition-colors"><ChevronLeft size={20}/></button>
                  <button className="p-1 hover:bg-primary-container rounded transition-colors"><ChevronRight size={20}/></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-headline font-bold text-on-surface-variant mb-4">
                {['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'].map(d => <span key={d}>{d}</span>)}
              </div>
              
              <div className="grid grid-cols-7 gap-2 text-center font-body text-sm">
                {[...Array(3)].map((_, i) => <span key={i} className="p-2 opacity-30">2{8+i}</span>)}
                {[...Array(31)].map((_, i) => {
                  const day = i + 1;
                  const isToday = day === 24;
                  const isClosed = day === 12;
                  return (
                    <span 
                      key={day} 
                      className={`p-2 rounded cursor-pointer transition-all ${
                        isToday ? 'bg-primary text-on-primary font-black shadow-lg' : 
                        isClosed ? 'bg-on-surface text-surface font-bold' : 
                        'hover:bg-primary-container'
                      }`}
                    >
                      {day}
                    </span>
                  );
                })}
              </div>

              <div className="mt-8 pt-8 border-t border-primary/10">
                <h5 className="font-headline font-bold text-xs text-on-surface-variant uppercase mb-4 tracking-widest">Resumen Mensual</h5>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                    <span className="font-body text-sm font-semibold">Total Eventos</span>
                    <span className="font-headline font-black text-primary">08</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                    <span className="font-body text-sm font-semibold">Municipios</span>
                    <span className="font-headline font-black text-primary">04</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl overflow-hidden relative h-40 group cursor-pointer">
                <img 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  src="https://images.unsplash.com/photo-1530549387074-d5629d75b734?q=80&w=2070&auto=format&fit=crop" 
                  alt="Athletic track"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-primary/40 flex items-center justify-center p-4 text-center group-hover:bg-primary/60 transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <Download className="text-white" size={24} />
                    <span className="text-white font-headline font-black italic text-lg leading-tight uppercase">Descarga el Calendario Oficial PDF</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low mt-auto py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <div className="text-2xl font-black italic text-primary font-headline uppercase tracking-tight">
                CHOCÓ ATHLÉTIQUE
              </div>
              <p className="text-on-surface-variant font-medium max-w-md">
                Forjando el futuro del atletismo colombiano desde el corazón de la selva. Velocidad, potencia y tradición.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-white rounded-full text-primary hover:bg-primary hover:text-white transition-all">
                  <Facebook size={20} />
                </a>
                <a href="#" className="p-2 bg-white rounded-full text-primary hover:bg-primary hover:text-white transition-all">
                  <Instagram size={20} />
                </a>
                <a href="#" className="p-2 bg-white rounded-full text-primary hover:bg-primary hover:text-white transition-all">
                  <Twitter size={20} />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-primary font-black uppercase text-xs tracking-widest font-headline">Institución</h5>
              <ul className="space-y-2 font-body text-sm font-semibold">
                <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Federación</a></li>
                <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Privacidad</a></li>
                <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Términos</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-primary font-black uppercase text-xs tracking-widest font-headline">Soporte</h5>
              <ul className="space-y-2 font-body text-sm font-semibold">
                <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Contacto</a></li>
                <li><a href="#" className="text-on-surface-variant hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-primary/10 text-center">
            <p className="font-headline font-bold text-[0.65rem] tracking-[0.2em] text-primary/60 uppercase">
              © 2024 LIGA DE ATLETISMO DEL CHOCÓ. KINETIC TROPICS SYSTEM.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
