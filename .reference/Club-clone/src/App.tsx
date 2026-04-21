/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Search, 
  Ticket, 
  Building2, 
  Zap, 
  MapPin, 
  Share, 
  Star, 
  ArrowRight, 
  Dumbbell, 
  Gauge, 
  Activity, 
  Mountain, 
  Timer, 
  Users,
  Globe,
  PlayCircle
} from "lucide-react";

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(11,54,29,0.08)]">
    <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
      <div className="text-2xl font-black italic tracking-tighter text-primary font-headline uppercase">
        KINETIC LEAGUE
      </div>
      <div className="hidden md:flex gap-8 items-center">
        {["Leagues", "Athletes", "Live", "Schedule"].map((item) => (
          <a
            key={item}
            href="#"
            className="font-headline uppercase tracking-tighter font-bold text-tertiary opacity-80 hover:text-primary transition-all duration-300"
          >
            {item}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <input
            className="bg-surface-container-highest/30 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none w-48"
            placeholder="Search League..."
            type="text"
          />
        </div>
        <button className="bg-primary text-on-primary font-headline font-bold uppercase px-6 py-2 rounded-full skew-x-[-12deg] hover:scale-105 transition-transform cursor-pointer">
          Tickets
        </button>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative h-[870px] flex items-center overflow-hidden bg-inverse-surface">
    <div className="absolute inset-0 opacity-40">
      <img
        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHoyq2QQWK9FcgRhZi0QHu0lljzaOdhvA8KBgc9uKURzmMwmEbEBqFK3ZGFydup9o6SnQJ3V0zCzuzNT2rp1XRtdMM1xW8cK804NvIGXauSbkTuO8LxDtqCEYfXdJFVkaliwCJKO3pLMQbvfFXhINpyFQxOnloV7rkszMBNvbWwz_fRt2XEvd83rkHEPrJE1dAlnQAe6CiggfvjVtC48CZgOiLQ2VEXvct0xCDDFCIUd2M6tig2WnJ-OpesFmdm7zp09nlV1IyFHgm"
        alt="Elite sprinters"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-inverse-surface via-transparent to-transparent"></div>
    </div>
    <div className="container mx-auto px-8 relative z-10">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <span className="inline-block bg-secondary-container text-on-secondary-container px-4 py-1 font-headline font-black italic uppercase tracking-widest mb-6 skew-x-[-15deg]">
          AFILIADOS 2024
        </span>
        <h1 className="font-headline font-black italic text-6xl md:text-8xl text-surface uppercase leading-[0.9] tracking-tighter mb-8">
          NUESTROS CLUBES: <br />
          <span className="text-primary-container">EL CORAZÓN</span> <br />
          DE LA LIGA
        </h1>
        <div className="flex gap-4">
          <button className="bg-primary text-on-primary px-10 py-4 font-headline font-extrabold uppercase italic tracking-tighter text-xl slanted-edge hover:bg-primary-dim transition-colors cursor-pointer">
            Explorar Directorio
          </button>
        </div>
      </motion.div>
    </div>
    <div className="absolute bottom-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
      <div className="absolute top-1/4 right-0 w-[500px] h-[2px] bg-primary rotate-[-45deg]"></div>
      <div className="absolute top-1/3 right-0 w-[600px] h-[2px] bg-secondary-container rotate-[-45deg]"></div>
      <div className="absolute top-1/2 right-0 w-[700px] h-[2px] bg-tertiary rotate-[-45deg]"></div>
    </div>
  </section>
);

const Stats = () => (
  <section className="bg-surface-container-low relative -mt-16 z-20 kinetic-slant py-24">
    <div className="container mx-auto px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { label: "Clubes Federados", value: "42", icon: <Dumbbell className="w-6 h-6" />, color: "secondary", accent: "secondary" },
          { label: "Atletas Activos", value: "1.8K", icon: <Zap className="w-6 h-6" />, color: "primary", accent: "tertiary" },
          { label: "Municipios Representados", value: "12", icon: <MapPin className="w-6 h-6" />, color: "tertiary", accent: "primary" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col items-center md:items-start group"
          >
            <div className="relative">
              <span className="font-headline font-black text-8xl text-on-surface-variant leading-none group-hover:text-primary transition-colors">
                {stat.value}
              </span>
              <div className={`absolute -right-4 -top-4 w-12 h-12 bg-${stat.color}-container rounded-full flex items-center justify-center rotate-12`}>
                <div className={`text-on-${stat.color}-container`}>{stat.icon}</div>
              </div>
            </div>
            <p className={`font-headline font-bold uppercase tracking-widest text-primary mt-4 border-l-4 border-${stat.accent} pl-4`}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const EliteClubs = () => (
  <section className="py-32 bg-surface">
    <div className="container mx-auto px-8 mb-16">
      <div className="flex items-end justify-between border-b-2 border-surface-container-highest pb-8">
        <h2 className="font-headline font-black italic text-5xl uppercase tracking-tighter text-on-surface">
          Clubes Élite
        </h2>
        <p className="font-label text-tertiary max-w-xs text-right uppercase font-bold tracking-widest">
          Reconocimiento por desempeño y trayectoria regional.
        </p>
      </div>
    </div>
    <div className="space-y-12 container mx-auto px-8">
      {[
        {
          name: "RAYOS DEL ATRATO",
          location: "Quibdó",
          level: "Nivel Oro",
          desc: "Líderes en formación de velocistas olímpicos. El club con mayor número de medallas en los últimos Juegos Regionales.",
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSu0VVsNcl8nXPijvPYmOAelA_zPLcwaH91O-kjSFrz9aOWIMnhYN9TW43BQcrqEJKQdJBLK023OuYE5HW7QwpPr_c61JfEpAqpf_ppn_LRTm-vRUowBhEBjdzZx8iOYDfJSnCTqDVUtF0rW1ttUHDfW6ndm3UJ1qQztzUk6ScHZGs0vfq_h_xxKfF1-9B-I2U5ogG8Cx9GXRj_aM4kNTOmnbfQ7gNcNpyJojoGQGH22kSJLTzCVPx1-cUJgZetkl6J4OP3IgdALE0"
        },
        {
          name: "GUEPARDOS DEL SAN JUAN",
          location: "Istmina",
          level: "Nivel Oro",
          desc: "Especialistas en saltos y pruebas de campo. Cuna de los talentos más explosivos del pacífico.",
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgpHrjfW1AfJ8aUSxh75XMIeLBDgYUkigtbUgsdahGy52wifFHPKBHkpWr7LhY5rg-hPfT3l0A3oLpWtHmnZlDPHWwYCIiTVnP9seNweDLTJsi1McA4PkbaHCv5Kfaf846CVWztSXWAV6vu6MKE7sisjhthRyJZEgzT4YGX7eCRL-HP_MhsgxiFtga9KZlRE6HXe1r7YlEqaDTaMILx2HaEBMShwlWhuWJWRJqshZAS5ZEjo2PtaMLPh-6QpNy0fivNpNEmCjs9e5E"
        }
      ].map((club, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative h-[450px] overflow-hidden group"
        >
          <img
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            src={club.img}
            alt={club.name}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="max-w-2xl">
              <div className="flex gap-4 mb-4">
                <span className="bg-primary text-on-primary px-3 py-1 font-headline font-bold uppercase text-xs">
                  {club.location}
                </span>
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 font-headline font-bold uppercase text-xs">
                  {club.level}
                </span>
              </div>
              <h3 className="font-headline font-black text-6xl text-surface uppercase italic tracking-tighter leading-none mb-4">
                {club.name}
              </h3>
              <p className="text-surface/80 font-body text-lg line-clamp-2">
                {club.desc}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex gap-2 mb-6">
                <div className="w-12 h-12 bg-surface/10 backdrop-blur-md rounded-full flex items-center justify-center border border-surface/20 cursor-pointer hover:bg-surface/20 transition-colors">
                  <Share className="w-5 h-5 text-surface" />
                </div>
                <div className="w-12 h-12 bg-surface/10 backdrop-blur-md rounded-full flex items-center justify-center border border-surface/20 cursor-pointer hover:bg-surface/20 transition-colors">
                  <Star className="w-5 h-5 text-surface" />
                </div>
              </div>
              <button className="bg-surface text-inverse-surface px-8 py-3 font-headline font-black uppercase italic tracking-tighter slanted-edge hover:bg-primary-container transition-colors cursor-pointer">
                Ver Perfil
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

const Directory = () => (
  <section className="py-24 bg-surface-container-low">
    <div className="container mx-auto px-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
        <h2 className="font-headline font-black italic text-4xl uppercase tracking-tighter text-on-surface text-center md:text-left">
          Directorio General
        </h2>
        <div className="flex gap-4">
          {["Todos", "Juveniles", "Sénior"].map((filter, i) => (
            <button
              key={filter}
              className={`px-6 py-2 font-headline font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                i === 0 ? "bg-surface-container-highest text-primary border-b-2 border-primary" : "bg-transparent text-on-surface-variant hover:text-primary"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { name: "TITANES DE TADÓ", type: "Fuerza & Resistencia", athletes: 85, icon: <Dumbbell className="w-12 h-12" /> },
          { name: "HALCONES DE CONDOTO", type: "Velocidad Pura", athletes: 120, icon: <Gauge className="w-12 h-12" /> },
          { name: "GUERREROS DE NUQUÍ", type: "Atletismo de Playa", athletes: 45, icon: <Activity className="w-12 h-12" /> },
          { name: "SIERRAS DE NOVITA", type: "Cross Country", athletes: 32, icon: <Mountain className="w-12 h-12" /> },
          { name: "DELFINES DEL BAUDÓ", type: "Triatlón", athletes: 64, icon: <Timer className="w-12 h-12" /> },
          { name: "CENTRO DE CARMEN DE ATRATO", type: "Multideportivo", athletes: 210, icon: <Users className="w-12 h-12" /> },
        ].map((club, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="bg-surface p-8 shadow-sm group hover:bg-primary-container transition-all duration-300 relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity text-primary">
              {club.icon}
            </div>
            <h4 className="font-headline font-black text-2xl text-on-surface uppercase italic mb-2">
              {club.name}
            </h4>
            <p className="font-label text-tertiary text-xs uppercase font-bold mb-6">
              {club.type}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant font-bold text-sm">
                {club.athletes} Atletas
              </span>
              <ArrowRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-2 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section className="relative py-32 overflow-hidden">
    <div className="absolute inset-0 bg-primary">
      <img
        className="w-full h-full object-cover opacity-30 mix-blend-overlay"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8OIdxPVSv3LZ_I1dUfpmxkVGexRt2_nbhjAtbN48ic37pYaYFDGEEQpFmY6d5NWFd7M551vuLdeZ2Zav8eLsxMt7ju0myEwRn0PoMRFf2w7GoBVBLtt1FXDUKiPfB9X49C91GDRhSHz-Tg30ncyu6IZi39XCR37t70wqKI0iSuumlPISA2O-Q3sIozIP3vsLgMiLLSbmeomKsoXKACj1jMhQg-b2wuy5E5-bbOMfO2IWOwiuZc9aWw29029HqFL-lLftUNNKbc6PA"
        alt="Motion blur"
        referrerPolicy="no-referrer"
      />
    </div>
    <div className="container mx-auto px-8 relative z-10 flex flex-col items-center text-center">
      <h2 className="font-headline font-black italic text-5xl md:text-7xl text-on-primary uppercase tracking-tighter mb-8 leading-none">
        ¿QUIERES SER PARTE <br /> DE LA ÉLITE?
      </h2>
      <p className="text-primary-container font-headline font-bold uppercase tracking-[0.2em] mb-12 max-w-xl">
        ÚNETE A LA RED DE CLUBES MÁS IMPORTANTE DEL PACÍFICO COLOMBIANO Y LLEVA TU ENTRENAMIENTO AL SIGUIENTE NIVEL.
      </p>
      <button className="bg-secondary-container text-on-secondary-container px-16 py-6 font-headline font-black italic text-2xl uppercase tracking-tighter slanted-edge hover:scale-105 transition-transform hover:shadow-2xl cursor-pointer">
        ÚNETE AHORA
      </button>
    </div>
    <div className="absolute top-0 left-0 w-full h-2 bg-secondary-container/20 -rotate-1"></div>
    <div className="absolute bottom-0 left-0 w-full h-4 bg-tertiary-container/20 rotate-2"></div>
  </section>
);

const Footer = () => (
  <footer className="bg-inverse-surface text-primary-container py-20 px-8">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
      <div className="max-w-md">
        <div className="text-secondary-container font-black italic text-3xl font-headline mb-6 tracking-tighter">
          KINETIC LEAGUE
        </div>
        <p className="font-headline text-xs uppercase tracking-widest text-outline-variant leading-relaxed">
          IMPULSANDO EL TALENTO ATLÉTICO DE LA REGIÓN DEL CHOCÓ HACIA EL ESCENARIO MUNDIAL. PASIÓN, VELOCIDAD Y EXCELENCIA.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full md:w-auto">
        {[
          { title: "Comunidad", links: ["Clubes", "Atletas", "Sponsors"] },
          { title: "Legal", links: ["Privacy Policy", "Terms of Service"] },
          { title: "Soporte", links: ["Contact Support", "FAQ"] },
        ].map((col) => (
          <div key={col.title} className="flex flex-col gap-4">
            <span className="font-headline text-xs uppercase tracking-[0.2em] font-black text-white mb-2">
              {col.title}
            </span>
            {col.links.map((link) => (
              <a
                key={link}
                className="font-headline text-xs uppercase tracking-widest text-outline-variant hover:text-white transition-colors"
                href="#"
              >
                {link}
              </a>
            ))}
          </div>
        ))}
        <div className="flex flex-col gap-4">
          <span className="font-headline text-xs uppercase tracking-[0.2em] font-black text-white mb-2">
            Social
          </span>
          <div className="flex gap-4">
            <Globe className="w-5 h-5 text-outline-variant hover:text-secondary-container cursor-pointer" />
            <PlayCircle className="w-5 h-5 text-outline-variant hover:text-secondary-container cursor-pointer" />
            <Share className="w-5 h-5 text-outline-variant hover:text-secondary-container cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
    <div className="mt-20 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="font-headline text-[10px] uppercase tracking-[0.3em] text-outline-variant">
        © 2024 KINETIC TROPICS SPORTS. ALL RIGHTS RESERVED.
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
        <span className="font-headline text-[10px] uppercase tracking-widest text-white">
          Live Status: Active System
        </span>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="pt-20">
        <Hero />
        <Stats />
        <EliteClubs />
        <Directory />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
