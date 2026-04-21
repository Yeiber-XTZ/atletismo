/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  FileDown, 
  BookOpen, 
  Book,
  ChevronDown
} from "lucide-react";

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-[0_20px_40px_rgba(11,54,29,0.08)]">
    <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
      <div className="text-2xl font-black italic tracking-tighter text-primary font-headline">
        LIGA ATLETISMO CHOCÓ
      </div>
      <div className="hidden md:flex items-center gap-8 font-headline uppercase tracking-tight font-black text-sm">
        <a className="text-primary border-b-4 border-primary pb-1" href="#">Resultados</a>
        <a className="text-tertiary font-medium hover:text-primary transition-colors duration-300" href="#">Atletas</a>
        <a className="text-tertiary font-medium hover:text-primary transition-colors duration-300" href="#">Calendario</a>
        <a className="text-tertiary font-medium hover:text-primary transition-colors duration-300" href="#">Registros</a>
      </div>
      <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-headline font-bold uppercase tracking-wider transform active:scale-95 transition-transform">
        Descargas
      </button>
    </div>
    <div className="bg-gradient-to-r from-primary to-transparent h-[2px] absolute bottom-0 w-full"></div>
  </nav>
);

const Hero = () => (
  <section className="relative w-full h-[500px] overflow-hidden kinetic-slant bg-inverse-surface">
    <img 
      className="absolute inset-0 w-full h-full object-cover opacity-60" 
      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz-NN2FIFIIpBP5SpxqI-R6YdtCHDBdnCJYUxJbPT8dD0QBgyqfMy4kh3KchaxwnQpWSM5DYDMXHFCUT1do5p96hPV5SHQptIn7S_94nJVqMOzwNWeCWQp-M3geGGjSkxBbvrvPsdzgUzs1ttiSgw6nUMNBkUCpvwvtmYdvb69FZ9uZ3hwfw9gw99dZAS_U2_MZzQ5BAtAjXxKGZW3wNZC1bikHRATOGmCRM3m7Ria2mAwPDYXLbA6rFU7YNMxUJ78GoKvgCpRqgg7"
      alt="Sprinter in motion"
      referrerPolicy="no-referrer"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-transparent to-transparent"></div>
    <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center">
      <motion.span 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="text-secondary font-headline font-black uppercase tracking-[0.3em] mb-4"
      >
        Temporada 2024
      </motion.span>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-white font-headline text-6xl md:text-8xl font-black italic tracking-tighter leading-tight"
      >
        RESULTADOS <br/> DE <span className="text-primary-container">ÉLITE</span>
      </motion.h1>
    </div>
  </section>
);

const Filters = () => (
  <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_40px_rgba(11,54,29,0.08)]"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input 
            className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-lg font-body focus:ring-2 focus:ring-primary outline-none" 
            placeholder="Buscar atleta o competencia..." 
            type="text"
          />
        </div>
        <div>
          <label className="block text-[0.6875rem] font-headline font-bold text-tertiary uppercase mb-2">Evento</label>
          <div className="relative">
            <select className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg font-body appearance-none cursor-pointer outline-none">
              <option>Grand Prix Quibdó</option>
              <option>Interclubes Istmina</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-[0.6875rem] font-headline font-bold text-tertiary uppercase mb-2">Categoría</label>
          <div className="relative">
            <select className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg font-body appearance-none cursor-pointer outline-none">
              <option>100m Planos</option>
              <option>400m Vallas</option>
              <option>Salto Largo</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
          </div>
        </div>
        <div className="flex items-end">
          <button className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-lg font-headline font-bold flex items-center justify-center gap-2 hover:bg-secondary transition-colors group">
            <Filter className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            FILTRAR
          </button>
        </div>
      </div>
    </motion.div>
  </section>
);

const ResultsTable = () => {
  const results = [
    {
      pos: "01",
      name: "Andrés Caicedo",
      category: "Juvenil A",
      club: "Club Velocidad Chocó",
      time: "10.12s",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCx900aqjILNGxfTzZIl9C1EpOIf45CsGaQEqbC4csgVCGT4ny7XhNdH8hICbdvNlMaLUivRUK0XlA7CbW92QtCjcYLcjW52Dkmhr9cixuVToyWJr1fHEvt6NrALVAy-3MTRUgAYoz_FIWcMmO6Q918NtgLVi9AG3soO-OmTfsnmN5mQpcOb5U6VV2Rf2LV6R1QigySLzU5QRfqvuJiixmGdsrvnzMHSH3WNZRdt5M4BN0wmE8vPq4KOxAe5m4QZHovPB8PGFR8Ndfs",
      isGold: true
    },
    {
      pos: "02",
      name: "Mariana Murillo",
      category: "Élite",
      club: "Istmina Track Club",
      time: "10.28s",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFKDb8E-dNE8nsZeoqRulPcRkewjWh96c2ARqaLYjkFNnZqduqSK7pNkl-7o2FPSpRpTYRyU2sBNPQe7_f2qRZCo3kZKCnX1-AHh6fMIvmR1i1mr1pVOD4jAl7qrumC5PVrD9PqNv9ID185mL986Af-G7hcwRIoS5lRzzF2H2PACKOGdla8sEKK2fpZa7S6sZc8VS52fR2yt_Y-gyyzDX8X9_3PH9MeVbUV99OKghKbYX45dxvOvp1YMyrkxbYYB3pYfKLD0RiiS1q",
      isGold: false
    },
    {
      pos: "03",
      name: "Kevin Moreno",
      category: "Juvenil B",
      club: "Titanes del Atrato",
      time: "10.45s",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaHYDPf8aKxFat62IeOBFERcY3C4rj36O8wpqfvELWV_q1qK83JbyWiQdbVbfM3oNwvjoZzCu0Wrtln52_v1zVIBF_HErpkC9aeB7zRCukFRfvKzJMATUe-syRg3hAmatCHtnBIKZYHiCRnwkKJK3EfbYitncQrYKKZiQEYvcgHBXlkmIzokACLrwG7FikCy9OiAlnt-z2wV2aJrq8nLWjCcFf-v9p7r9g7iOZrizUE2Jd5ROWZRFElSERDyzsz90RlIUb1SatxAdA",
      isGold: false
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex justify-between items-end mb-10">
        <h2 className="font-headline text-3xl font-black italic text-primary uppercase leading-none">Últimos Resultados</h2>
        <div className="h-[4px] flex-grow mx-8 bg-surface-container-high mb-2"></div>
        <span className="text-tertiary font-headline font-bold text-sm cursor-pointer hover:underline">VER TODO EL HISTORIAL</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-4">
          <thead>
            <tr className="text-left text-on-surface-variant font-headline uppercase text-xs tracking-widest">
              <th className="px-6 py-2">Puesto</th>
              <th className="px-6 py-2">Atleta</th>
              <th className="px-6 py-2">Club</th>
              <th className="px-6 py-2">Marca / Tiempo</th>
              <th className="px-6 py-2 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="font-body">
            {results.map((result, idx) => (
              <motion.tr 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-surface-container-lowest group hover:bg-surface-bright transition-all"
              >
                <td className="px-6 py-6 rounded-l-xl">
                  <span className={`${result.isGold ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'} font-headline font-black italic px-4 py-2 rounded-lg text-xl`}>
                    {result.pos}
                  </span>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <img 
                      className="w-12 h-12 rounded-full object-cover" 
                      src={result.img} 
                      alt={result.name}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-bold text-lg text-on-surface">{result.name}</p>
                      <p className="text-xs text-outline uppercase font-semibold">{result.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 font-semibold text-tertiary">{result.club}</td>
                <td className="px-6 py-6">
                  <span className="font-headline font-bold text-2xl text-primary italic">{result.time}</span>
                </td>
                <td className="px-6 py-6 rounded-r-xl text-right">
                  <button className="p-3 bg-surface-container-low text-primary rounded-lg hover:bg-primary hover:text-white transition-all">
                    <Download className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const RecordBreakers = () => {
  const records = [
    {
      name: "Elena Valoyes",
      value: "7.15 m",
      desc: "Salto Largo - Quibdó 2024",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAl0vfrrhY9r89MdGmkpLcbQFG29JbVLm4hf4Nu2fKsAYTJJCtRsuGUvYDCgZ9kFV81H4pHflOWRMaiN7lJ6xsRH-VGIU-D0ax1OHdEhfnUqVe1lUEzcCn37s1yNzbdAGxgsNpZesXGieNV7mD2DGHfnN-NE5aneuBNDCQCoIqqL8SjHS1GiHrr-9mO1Cujeqy2EW4UKvimoMKvkHlX4NqP9n1pEwbo1r6TTpS893aXJrqt__TuqO-9TrQRhlOCMri9JyOvO9xfIaO2",
      badge: "NUEVO RÉCORD"
    },
    {
      name: "Carlos Serna",
      value: "45.82 s",
      desc: "400m Planos - Departamental",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTEBpewzbvjPnh0rXKJ__8r9Eeo_mSjFST5oJmQO4BxM57OiM1r-PeTaisWjkdLr0CTOa83wBORXwOZG2affJq8uRBKt5V-Q_yYPHfFE7cUgBm66FTJCOJLhGRXLRcFWyY7KTfL7krrgBOYzdabmS2QEAcFq7fISaxfZP1kezfy_po_jZRaT6nUb_ZbFn1ANzjOcRfM2QKIWTuBDyBpjWIEZ4JObvbY9Wfmht0lKXade4uiGbTTMr_qamgXoSAIJwkpy1cvDD9cMGo"
    },
    {
      name: "Luis Hinestroza",
      value: "10.05 s",
      desc: "100m Planos - Nacional",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBnaspZQ5nvtCEwuSGQTNtdqx5mk5hm8LUZRjtUh26gtsgHj7lqk5IhEdD6cK0tY__pUzuk2DofexVb7YKNJNxAYXeu-g-8F-dC--VVdnVtI1Bvhnjg15o_PKe3eabDjEkTToywyfLCDyLZT8vHe_Ufr-0A-9Jj4JJNHsEsTPw9cU25meFWiCveCk-l0jNb5GKcWjKEh--ZwN67eikGRkIaMSaeKOlMkhS-h0HYZl5TL69dE5Q6s62NykAiUyouFmNMyBfynxkN-2Le"
    }
  ];

  return (
    <section className="bg-inverse-surface py-24 kinetic-slant-reverse overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="font-headline text-5xl font-black italic text-primary-container leading-none uppercase">Récord Breakers</h2>
          <p className="text-surface-variant mt-4 font-body tracking-wide">Los atletas que definieron nuevos límites este mes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {records.map((record, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden group"
            >
              <div className="relative h-80 overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  src={record.img} 
                  alt={record.name}
                  referrerPolicy="no-referrer"
                />
                {record.badge && (
                  <div className="absolute top-4 left-4 bg-secondary text-on-secondary px-3 py-1 font-headline font-bold text-xs rounded">
                    {record.badge}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-white font-headline text-2xl font-bold uppercase tracking-tight">{record.name}</h3>
                <p className="text-primary-container font-headline font-black italic text-4xl mt-2">{record.value}</p>
                <p className="text-surface-variant text-sm mt-1 uppercase tracking-widest font-bold">{record.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Downloads = () => (
  <section className="max-w-7xl mx-auto px-6 py-24">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-primary text-on-primary p-12 rounded-xl flex flex-col justify-between relative overflow-hidden group cursor-pointer"
      >
        <FileText className="w-48 h-48 absolute -bottom-10 -right-10 opacity-10 rotate-12 transition-transform group-hover:scale-125" />
        <div>
          <h4 className="font-headline text-3xl font-black italic mb-4">REPORTE COMPLETO</h4>
          <p className="text-primary-container max-w-xs font-body mb-8">Obtén el desglose detallado de todos los atletas y tiempos de la temporada actual en formato PDF.</p>
        </div>
        <button className="bg-white text-primary px-8 py-4 rounded-lg font-headline font-black uppercase tracking-tighter self-start flex items-center gap-4 hover:bg-secondary-container hover:text-on-secondary-container transition-colors">
          Descargar PDF <FileDown className="w-5 h-5" />
        </button>
      </motion.div>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-secondary-container text-on-secondary-container p-12 rounded-xl flex flex-col justify-between relative overflow-hidden group cursor-pointer"
      >
        <BookOpen className="w-48 h-48 absolute -bottom-10 -right-10 opacity-10 -rotate-12 transition-transform group-hover:scale-125" />
        <div>
          <h4 className="font-headline text-3xl font-black italic mb-4">LIBRO DE RÉCORDS 2024</h4>
          <p className="text-secondary-dim max-w-xs font-body mb-8">La historia viva del atletismo chocoano. Todas las marcas históricas actualizadas hasta hoy.</p>
        </div>
        <button className="bg-inverse-surface text-primary-container px-8 py-4 rounded-lg font-headline font-black uppercase tracking-tighter self-start flex items-center gap-4 hover:opacity-90 transition-opacity">
          Consultar Libro <Book className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-inverse-surface text-primary-container font-body uppercase tracking-widest text-xs py-12 px-6">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="text-secondary-container font-headline font-black italic text-xl">LIGA CHOCÓ</div>
      <div className="flex gap-8">
        <a className="hover:text-white transition-colors" href="#">Privacidad</a>
        <a className="hover:text-white transition-colors" href="#">Términos</a>
        <a className="hover:text-white transition-colors" href="#">Federación</a>
        <a className="hover:text-white transition-colors" href="#">Contacto</a>
      </div>
      <p className="text-outline-variant">© 2024 Liga de Atletismo del Chocó - Energía Tropical</p>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <Hero />
        <Filters />
        <ResultsTable />
        <RecordBreakers />
        <Downloads />
      </main>
      <Footer />
    </div>
  );
}
