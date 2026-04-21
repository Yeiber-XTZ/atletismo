/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Search, 
  User, 
  Target, 
  Eye, 
  Users, 
  ShieldCheck, 
  Medal, 
  Timer, 
  Flag, 
  FileText, 
  Gavel, 
  Scale, 
  Download, 
  Globe, 
  Share2, 
  Mail, 
  Zap,
  TrendingUp,
  Trophy,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

const Navbar = () => (
  <header className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100">
    <nav className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-black italic tracking-tighter text-primary">LA LIGA</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a className="text-primary border-b-2 border-primary font-black pb-1 text-sm uppercase tracking-tight" href="#">Inicio</a>
        <a className="text-gray-600 font-medium hover:text-primary transition-colors text-sm uppercase tracking-tight" href="#">La Federación</a>
        <a className="text-gray-600 font-medium hover:text-primary transition-colors text-sm uppercase tracking-tight" href="#">Calendario</a>
        <a className="text-gray-600 font-medium hover:text-primary transition-colors text-sm uppercase tracking-tight" href="#">Competencias</a>
        <a className="text-gray-600 font-medium hover:text-primary transition-colors text-sm uppercase tracking-tight" href="#">Estadísticas</a>
        <a className="text-gray-600 font-medium hover:text-primary transition-colors text-sm uppercase tracking-tight" href="#">Documentos</a>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-gray-500 hover:text-primary p-2 rounded-full transition-all">
          <Search size={20} />
        </button>
        <button className="text-gray-500 hover:text-primary p-2 rounded-full transition-all">
          <User size={20} />
        </button>
        <button className="hidden lg:block bg-primary text-white px-6 py-2 font-headline font-bold uppercase text-sm tracking-widest [clip-path:polygon(0_0,95%_0,100%_100%,5%_100%)] hover:bg-primary-dim transition-colors">
          Afiliarse
        </button>
      </div>
    </nav>
  </header>
);

const Hero = () => (
  <section className="relative h-[800px] flex items-center overflow-hidden bg-gray-950">
    <div className="absolute inset-0 opacity-50">
      <img 
        alt="Dynamic low angle shot of sprinters" 
        className="w-full h-full object-cover" 
        src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop" 
        referrerPolicy="no-referrer"
      />
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/40 to-transparent"></div>
    <div className="container mx-auto px-8 relative z-10">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <span className="inline-block bg-primary text-white font-headline font-black px-4 py-1 mb-6 skew-x-[-12deg] text-lg uppercase">Impacto Pacífico</span>
        <h1 className="font-headline font-black text-6xl md:text-8xl text-white leading-[0.9] uppercase italic tracking-tighter mb-8">
          LA LIGA
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl font-medium leading-relaxed">
          Forjando campeones con pasión tropical desde el corazón del Pacífico colombiano.
        </p>
        <div className="mt-12 flex flex-wrap gap-4">
          <button className="bg-primary text-white px-10 py-4 font-headline font-black uppercase tracking-widest text-lg hover:bg-primary-dim transition-colors [clip-path:polygon(0_0,90%_0,100%_100%,10%_100%)]">
            Explorar Historia
          </button>
          <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 font-headline font-black uppercase tracking-widest text-lg hover:bg-white/20 transition-colors [clip-path:polygon(10%_0,100%_0,90%_100%,0%_100%)]">
            Ver Organigrama
          </button>
        </div>
      </motion.div>
    </div>
    <div className="absolute bottom-12 right-12 hidden lg:flex gap-4">
      <div className="bg-black/40 backdrop-blur-md p-6 border-l-4 border-primary">
        <span className="block text-primary font-headline font-black text-3xl">40+</span>
        <span className="text-white text-xs uppercase tracking-widest font-bold">Clubes Afiliados</span>
      </div>
      <div className="bg-black/40 backdrop-blur-md p-6 border-l-4 border-secondary-fixed">
        <span className="block text-secondary-fixed font-headline font-black text-3xl">1.2k</span>
        <span className="text-white text-xs uppercase tracking-widest font-bold">Atletas Activos</span>
      </div>
    </div>
  </section>
);

const History = () => (
  <section className="py-24 bg-white relative">
    <div className="container mx-auto px-8">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <h2 className="font-headline font-black text-5xl text-gray-900 uppercase italic tracking-tighter relative mb-12 speed-line">
            Nuestra Historia
          </h2>
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed font-medium">
            <p>Nacida bajo el sol ardiente del Chocó, nuestra liga no es solo una organización deportiva; es el latido de un pueblo que corre, salta y lanza con la fuerza de la selva y el mar.</p>
            <p>Desde nuestra fundación, hemos transformado la carencia en potencia, convirtiendo calles de tierra en pistas de oro y jóvenes soñadores en referentes internacionales.</p>
          </div>
          <div className="mt-12 p-8 bg-gray-50 border-l-4 border-primary flex items-center gap-6 rounded-r-lg transition-all hover:bg-gray-100">
            <div className="bg-primary/10 text-primary p-4 rounded-full">
              <TrendingUp size={32} />
            </div>
            <div>
              <h4 className="font-headline font-bold text-xl uppercase tracking-tight text-gray-900">Transformación Continua</h4>
              <p className="text-gray-500">Llevamos décadas rediseñando el futuro del deporte pacífico.</p>
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gray-100 -skew-x-6 scale-105 group-hover:scale-110 transition-transform"></div>
          <img 
            alt="Sports photography collage" 
            className="w-full h-[500px] object-cover relative z-10 [clip-path:polygon(0_0,100%_5%,100%_100%,0_95%)]" 
            src="https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop" 
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  </section>
);

const MissionVision = () => (
  <section className="py-24 bg-gray-50 relative overflow-hidden">
    <div className="container mx-auto px-8 relative z-10">
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div 
          whileHover={{ y: -10 }}
          className="bg-white p-12 shadow-sm hover:shadow-xl transition-all duration-500 border-t-4 border-primary rounded-xl"
        >
          <Target className="text-primary size-12 mb-6" />
          <h3 className="font-headline font-black text-4xl text-gray-900 uppercase italic mb-6">Misión</h3>
          <p className="text-gray-600 text-xl leading-relaxed">
            Impulsar el desarrollo integral de los atletas en la región del Pacífico, proporcionando infraestructuras de excelencia y programas de formación técnica que honren nuestra herencia cultural y competitiva.
          </p>
        </motion.div>
        <motion.div 
          whileHover={{ y: -10 }}
          className="bg-white p-12 shadow-sm hover:shadow-xl transition-all duration-500 border-t-4 border-tertiary rounded-xl"
        >
          <Eye className="text-tertiary size-12 mb-6" />
          <h3 className="font-headline font-black text-4xl text-gray-900 uppercase italic mb-6">Visión</h3>
          <p className="text-gray-600 text-xl leading-relaxed">
            Ser reconocidos para el 2030 como el principal semillero de talentos olímpicos de Colombia, destacando por un modelo de gestión deportiva sostenible, transparente e inclusivo.
          </p>
        </motion.div>
      </div>
    </div>
  </section>
);

const Principles = () => {
  const principles = [
    { icon: <Users size={32} />, title: "Inclusión", desc: "Puertas abiertas para cada talento del pacífico sin distinción alguna." },
    { icon: <ShieldCheck size={32} />, title: "Transparencia", desc: "Claridad absoluta en el manejo de recursos y procesos selectivos." },
    { icon: <Medal size={32} />, title: "Excelencia", desc: "Búsqueda incansable de la calidad técnica y el alto rendimiento." },
    { icon: <Users size={32} />, title: "Comunidad", desc: "Fortalecimiento del tejido social a través del deporte regional." },
    { icon: <Clock size={32} />, title: "Disciplina", desc: "El rigor como base fundamental para alcanzar el éxito deportivo." },
    { icon: <Flag size={32} />, title: "Identidad", desc: "Orgullo por nuestras raíces chocoanas y espíritu resiliente." }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-8">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="font-headline font-black text-5xl text-gray-900 uppercase italic tracking-tighter mb-4">Principios Institucionales</h2>
          <p className="text-gray-500 text-lg">El ADN que guía cada una de nuestras decisiones y competencias.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {principles.map((p, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="p-10 border border-gray-100 hover:border-primary/30 hover:bg-gray-50 group transition-all duration-300 rounded-xl"
            >
              <div className="text-primary mb-4 group-hover:scale-110 transition-transform">{p.icon}</div>
              <h4 className="font-headline font-bold text-2xl uppercase text-gray-900 group-hover:text-primary mb-2">{p.title}</h4>
              <p className="text-gray-500">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Governance = () => (
  <section className="py-24 bg-gray-950 text-white">
    <div className="container mx-auto px-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-2xl">
          <h2 className="font-headline font-black text-5xl uppercase italic tracking-tighter mb-4 text-primary">Órganos de Dirección</h2>
          <p className="text-gray-400 text-lg">Estructura administrativa que garantiza la estabilidad y crecimiento institucional.</p>
        </div>
        <div className="hidden md:block h-1 w-32 bg-primary"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-800 border border-gray-800">
        {[
          { label: "Liderazgo Principal", title: "Presidencia" },
          { label: "Soporte Ejecutivo", title: "Vicepresidencia" },
          { label: "Gestión Administrativa", title: "Secretaría General" },
          { label: "Control Financiero", title: "Tesorería" },
          { label: "Planeación Estratégica", title: "Junta Directiva" },
          { label: "Ética y Normativa", title: "Comité Disciplinario" }
        ].map((item, i) => (
          <div key={i} className="p-12 bg-gray-950 hover:bg-gray-900 transition-colors group cursor-default">
            <span className="text-primary font-headline font-black text-sm uppercase tracking-widest block mb-4 group-hover:translate-x-2 transition-transform">{item.label}</span>
            <h4 className="font-headline font-bold text-2xl uppercase">{item.title}</h4>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Normative = () => (
  <section className="py-24 bg-white">
    <div className="container mx-auto px-8">
      <div className="grid lg:grid-cols-3 gap-16">
        <div className="lg:col-span-1">
          <h2 className="font-headline font-black text-5xl text-gray-900 uppercase italic tracking-tighter mb-8 leading-tight">Marco Normativo</h2>
          <p className="text-gray-500 text-lg leading-relaxed mb-8">Nuestros cimientos legales aseguran una operación profesional alineada con los estándares deportivos nacionales e internacionales.</p>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg inline-flex items-center gap-4">
            <ShieldCheck className="text-primary size-8" />
            <span className="font-headline font-bold uppercase text-primary tracking-tight text-sm">Vigencia 2024-2025</span>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {[
            { icon: <FileText className="text-primary size-10" />, title: "Estatutos Institucionales" },
            { icon: <Gavel className="text-primary size-10" />, title: "Reglamento Interno" },
            { icon: <Scale className="text-primary size-10" />, title: "Código de Ética" }
          ].map((doc, i) => (
            <motion.div 
              key={i}
              whileHover={{ x: 10 }}
              className="group flex items-center justify-between p-8 bg-gray-50 hover:bg-white border border-gray-100 hover:border-primary/30 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center gap-6">
                {doc.icon}
                <h4 className="font-headline font-bold text-2xl uppercase text-gray-900">{doc.title}</h4>
              </div>
              <Download className="text-gray-400 group-hover:text-primary size-8 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Transparency = () => (
  <section className="py-24 bg-gray-50 relative overflow-hidden">
    <div className="container mx-auto px-8 relative z-10 text-center">
      <span className="font-headline font-black text-primary uppercase tracking-[0.3em] mb-6 block text-xl">Buen Gobierno</span>
      <h2 className="font-headline font-black text-5xl md:text-7xl text-gray-900 uppercase italic mb-12 max-w-5xl mx-auto leading-none">Transparencia y Gestión de Cara a la Comunidad</h2>
      <div className="flex flex-wrap justify-center gap-6">
        <button className="bg-primary text-white px-12 py-5 font-headline font-black uppercase tracking-widest text-xl hover:bg-primary-dim transition-all [clip-path:polygon(5%_0,100%_0,95%_100%,0%_100%)]">
          Ver Documentos Públicos
        </button>
        <button className="bg-white text-primary border-2 border-primary px-12 py-5 font-headline font-black uppercase tracking-widest text-xl hover:bg-primary hover:text-white transition-all [clip-path:polygon(0%_0,95%_0,100%_100%,5%_100%)]">
          Solicitar Información
        </button>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-gray-950 text-white py-16">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 w-full max-w-screen-2xl mx-auto px-8">
      <div className="col-span-1 md:col-span-1">
        <span className="text-xl font-black text-primary italic block mb-6 uppercase tracking-tighter">LA LIGA</span>
        <p className="text-gray-400 font-body leading-relaxed mb-8">El epicentro del desarrollo atlético en el Pacífico colombiano. Forjando el futuro, paso a paso.</p>
        <div className="flex gap-4">
          <button className="text-gray-400 hover:text-primary transition-colors"><Globe size={24} /></button>
          <button className="text-gray-400 hover:text-primary transition-colors"><Share2 size={24} /></button>
          <button className="text-gray-400 hover:text-primary transition-colors"><Mail size={24} /></button>
        </div>
      </div>
      <div>
        <h5 className="font-headline font-black uppercase text-sm tracking-[0.2em] mb-8 text-gray-500">Institucional</h5>
        <ul className="space-y-4">
          <li><a className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 block" href="#">Privacidad</a></li>
          <li><a className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 block" href="#">Términos de Uso</a></li>
          <li><a className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 block" href="#">Transparencia</a></li>
        </ul>
      </div>
      <div>
        <h5 className="font-headline font-black uppercase text-sm tracking-[0.2em] mb-8 text-gray-500">Comunicación</h5>
        <ul className="space-y-4">
          <li><a className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 block" href="#">Contacto</a></li>
          <li><a className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 block" href="#">Prensa</a></li>
        </ul>
      </div>
      <div className="bg-gray-900 p-8 rounded-xl border border-gray-800">
        <h5 className="font-headline font-black uppercase text-sm tracking-[0.2em] mb-6 text-primary">Sede Principal</h5>
        <p className="text-gray-400 mb-4">Calle del Deporte #45-12<br/>Quibdó, Chocó - Colombia</p>
        <a className="text-primary font-bold hover:underline" href="mailto:info@laliga.co">info@laliga.co</a>
      </div>
    </div>
    <div className="mt-16 pt-8 border-t border-gray-900 w-full max-w-screen-2xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-gray-500 text-sm">© 2024 La Liga Chocó. Energía y Velocidad.</p>
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-gray-600">Desarrollado con</span>
        <Zap className="text-primary size-5" />
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <History />
        <MissionVision />
        <Principles />
        <Governance />
        <Normative />
        <Transparency />
      </main>
      <Footer />
    </div>
  );
}
