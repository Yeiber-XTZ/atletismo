/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Search, 
  Bell, 
  User, 
  ArrowRight, 
  FileText, 
  Bolt, 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  BookOpen, 
  Gavel, 
  Download, 
  Share2, 
  Mail 
} from "lucide-react";
import { useState, useEffect } from "react";

// --- Components ---

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 bg-emerald-50/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(11,54,29,0.08)]">
      <div className="text-2xl font-black italic uppercase text-emerald-900 tracking-tighter">
        Chocó Athletics
      </div>
      <div className="hidden md:flex items-center space-x-8">
        <a className="text-emerald-700 border-b-2 border-emerald-700 pb-1 font-headline uppercase text-xs tracking-wider" href="#">Competitions</a>
        <a className="text-emerald-900/60 font-medium hover:text-emerald-900 font-headline uppercase text-xs tracking-wider transition-all duration-300" href="#">Athletes</a>
        <a className="text-emerald-900/60 font-medium hover:text-emerald-900 font-headline uppercase text-xs tracking-wider transition-all duration-300" href="#">Records</a>
        <a className="text-emerald-900/60 font-medium hover:text-emerald-900 font-headline uppercase text-xs tracking-wider transition-all duration-300" href="#">News</a>
      </div>
      <div className="flex items-center space-x-6">
        <div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full">
          <Search className="w-4 h-4 text-outline mr-2" />
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-48 font-body outline-none" 
            placeholder="Search events..." 
            type="text" 
          />
        </div>
        <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-headline text-xs uppercase tracking-widest hover:scale-95 transition-transform duration-300">
          Tickets
        </button>
        <div className="flex space-x-3">
          <Bell className="w-5 h-5 text-emerald-900 cursor-pointer" />
          <User className="w-5 h-5 text-emerald-900 cursor-pointer" />
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative h-[819px] w-full overflow-hidden kinetic-slant bg-inverse-surface">
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover opacity-60 mix-blend-overlay" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1nU-WGs9VafJfqITWEsZ-5jSB9-sV1ln3iA7N5Dae2kXkM6tl28Q6lfTWNWyICwDSyu_ZFGGXNR1xWF0_5HT5ifQhbyhk20OZXTYBcK5Wcft9bY04CxO7zOrSzOyR3Q3keUClXObVNmnKEmBHcCu7UAFxsvDYU8CQNvslUrWo1oR5D9_zs2yku9GMRaPB5QjnCNBrhsu096AWmMG3IMK4SzR-9SM7nFhuXH_eGQGdalkcavR1vaDJP0YGEfT0rD1PdXzORUMyqAWF" 
          alt="Sprinter in motion"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-on-background via-transparent to-transparent opacity-80"></div>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 h-full flex flex-col justify-center px-8 md:px-20 max-w-7xl mx-auto"
      >
        <div className="inline-block bg-secondary text-on-secondary px-4 py-1 mb-6 font-headline text-xs uppercase tracking-[0.3em] slant-right w-fit">
          Season 2024
        </div>
        <h1 className="text-white text-6xl md:text-9xl font-black italic uppercase leading-tight tracking-tighter mb-4">
          CALENDARIO DE<br/>
          <span className="text-primary-fixed">COMPETENCIAS</span>
        </h1>
        <p className="text-surface-container-low max-w-xl font-body text-lg mb-8 leading-relaxed">
          Siente el pulso de la selva. La Liga de Atletismo del Chocó presenta su temporada más explosiva hasta la fecha. Velocidad pura, técnica ancestral.
        </p>
        <div className="flex items-center space-x-4">
          <button className="bg-primary-fixed text-on-primary-fixed px-10 py-4 font-headline font-bold italic uppercase tracking-widest flex items-center group">
            EXPLORE EVENTS 
            <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </motion.div>
    </section>
  );
};

const FeaturedCompetition = () => {
  return (
    <section className="px-8 md:px-20 -mt-32 relative z-20 mb-24">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-surface-container-lowest grid md:grid-cols-2 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.12)]"
        >
          <div className="p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center text-tertiary font-headline text-xs uppercase tracking-widest mb-6">
                <span className="w-12 h-[1px] bg-tertiary mr-4"></span>
                Featured Competition
              </div>
              <h2 className="text-5xl font-black italic uppercase text-on-background mb-4 tracking-tighter">Grand Prix Chocó</h2>
              <p className="text-on-surface-variant font-body mb-8">Estadio Olímpico de Quibdó | 14-16 de Mayo, 2024</p>
              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="border-l-2 border-primary-container pl-4">
                  <div className="text-primary font-black text-3xl font-headline italic">12</div>
                  <div className="text-[10px] uppercase tracking-widest text-outline">Días</div>
                </div>
                <div className="border-l-2 border-primary-container pl-4">
                  <div className="text-primary font-black text-3xl font-headline italic">08</div>
                  <div className="text-[10px] uppercase tracking-widest text-outline">Horas</div>
                </div>
                <div className="border-l-2 border-primary-container pl-4">
                  <div className="text-primary font-black text-3xl font-headline italic">45</div>
                  <div className="text-[10px] uppercase tracking-widest text-outline">Mins</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="bg-on-background text-white px-8 py-3 font-headline text-xs uppercase tracking-widest hover:bg-primary transition-colors">Results</button>
              <button className="bg-surface-container-highest text-on-surface px-8 py-3 font-headline text-xs uppercase tracking-widest flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Tech Specs
              </button>
            </div>
          </div>
          <div className="relative h-96 md:h-full bg-surface-container-low overflow-hidden">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrsbJg4luN0cBZdcOAPFGn__EHYVE9MBinYHe6Ccn2hFUAIJZRIpLodCJhCKZnwf7NHsr0ChH4mUjOnI6BpUCwApgvDzMdrl-OncMRsN-Kfmx7diQsj5ti-Nz8SVKNLJOl7mAeBZhS7o-bITDYNheLHG1LhG6pvtjLxNzbYZhtLkt8A24jDnN9xJ6r4yL0StH4W5U8sOKqtFGrsKKKsgMMe7eRhI8WMy_RY5udm5WoIvRGd47NTzPASjA564G4vEzQt3iqktHc9wvq" 
              alt="Stadium"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-8 right-8 bg-secondary-container text-on-secondary-container px-6 py-2 font-headline font-bold italic uppercase tracking-tighter">
              Major Event
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const LiveResults = () => {
  return (
    <section className="bg-surface py-24">
      <div className="max-w-7xl mx-auto px-8 md:px-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="text-secondary font-headline text-xs uppercase tracking-widest mb-4">Live Updates</div>
            <h3 className="text-5xl font-black italic uppercase text-on-background tracking-tighter">RECIBIENDO RESULTADOS</h3>
          </div>
          <div className="bg-surface-container-highest p-6 flex items-center space-x-6">
            <div className="flex -space-x-3">
              <img className="w-12 h-12 rounded-full border-4 border-surface object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1MWNt2zY3c2r1qVV9NgwYomHYphoGO-mAqKKmmljN7PlmBgrZH9trg8UeVUF5nvK0JydTxZc8nnsFOGtzWBwPPInFt7GTaCLdOdY42W1lfyhV54g73JXqVihhT8S3IhlB5k6uLOlqtRNxGinVGEytrZBsudepCcCOi89Kof3FO1EnkBxsiVSVn3mzSHa-Tw91fzD6eoqQ0bMQlQXcCtNTLkh25fcWdeutLJrktNOybZ-d69b0e_o81BmRCHR7CMKr0f26oGvR9PLU" alt="Athlete 1" referrerPolicy="no-referrer" />
              <img className="w-12 h-12 rounded-full border-4 border-surface object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvWdKw7BFo5RO3aWp6eAxmeay8rr0UMLVfjRLz7hoFLE9JjIhtmGi-iorzJ_aShcYLuVe4lLvSea891i0UK6ejxkrjbSYSd3RpIGJiF8Wy1MjZl_fiKFbjzzILbGHpRATysSOT8i7DSgjacZ08b5dKG2kbVet0D2DF-3O34gAszgJnq5HHWaDk_Af7-mFr3I3fTzPTTgL0z_vJmlR5Kji_Fq5Hbj3uwo9i7Fckk53DXjaQzQxo74gU1RneoYomcIY46AZnPQeCceab" alt="Athlete 2" referrerPolicy="no-referrer" />
              <img className="w-12 h-12 rounded-full border-4 border-surface object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2uDWv2wUSri4KGSSHt-k8K-v6AQV-5LNLuqEAD9LZSFOUf6WUpSyeKue9iP3A5Ha4IIN_pL432dvGQn5Qo9hkCiNjHOg8vHITH6xRDq_UEK1oyNt_jmpvzlqscljJyfAh5j-o1Hub0h7h6jZTxgO4CnyD1RPs9zD4__t_RX29Qsi1xSvFDlsWY5V45wvHteAPzFqJduTuzji2cbNpGmU3ktbPv-0eRK83YU82d1XEUODFjSaNC04aR-yitHKmzLMWdCks4NA-oqaP" alt="Athlete 3" referrerPolicy="no-referrer" />
            </div>
            <div className="text-xs font-headline uppercase tracking-widest text-on-surface-variant">
              <span className="block text-primary font-bold">Live Now</span>
              100m Dash Finals
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-surface-container-lowest p-8 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-surface">
                    <th className="pb-6 font-headline text-[10px] uppercase tracking-widest text-outline">Pos</th>
                    <th className="pb-6 font-headline text-[10px] uppercase tracking-widest text-outline">Athlete</th>
                    <th className="pb-6 font-headline text-[10px] uppercase tracking-widest text-outline">Club</th>
                    <th className="pb-6 font-headline text-[10px] uppercase tracking-widest text-outline">Mark</th>
                    <th className="pb-6 font-headline text-[10px] uppercase tracking-widest text-outline">Diff</th>
                  </tr>
                </thead>
                <tbody className="font-body text-sm">
                  {[
                    { pos: "01", name: "Mateo Mosquera", club: "Pacífico Athletic", mark: "10.12s", diff: "-", active: true },
                    { pos: "02", name: "Luis Caicedo", club: "Chocó Runners", mark: "10.24s", diff: "+0.12", active: false },
                    { pos: "03", name: "Yerson Perea", club: "Istmina Track Club", mark: "10.31s", diff: "+0.19", active: false },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors group">
                      <td className={`py-6 font-headline font-black italic text-2xl group-hover:translate-x-1 transition-transform ${row.active ? 'text-secondary' : 'text-on-surface-variant'}`}>{row.pos}</td>
                      <td className="py-6 font-bold text-on-background">{row.name}</td>
                      <td className="py-6 text-on-surface-variant">{row.club}</td>
                      <td className={`py-6 font-headline font-bold ${row.active ? 'text-primary' : ''}`}>{row.mark}</td>
                      <td className="py-6 text-outline">{row.diff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-on-background p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <Bolt className="text-secondary w-10 h-10 mb-6" />
                <h4 className="text-2xl font-black italic uppercase mb-2">Power Record</h4>
                <p className="text-surface-container-low font-body text-sm mb-6">New regional record set in Long Jump during qualifying rounds today.</p>
                <a className="font-headline text-xs uppercase tracking-widest text-secondary-container border-b border-secondary-container pb-1" href="#">Read Analysis</a>
              </div>
              <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 text-white fill-current" />
            </div>
            <div className="bg-tertiary p-8 text-white">
              <h4 className="text-lg font-black italic uppercase mb-4">Medal Count</h4>
              <div className="space-y-4">
                {[
                  { club: "Pacífico Athletic", count: 12, percent: "80%" },
                  { club: "Chocó Runners", count: 8, percent: "50%" },
                ].map((medal, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center text-xs font-headline uppercase tracking-widest mb-2">
                      <span>{medal.club}</span>
                      <span className="text-secondary-fixed">{medal.count} Medals</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full">
                      <div className="h-full bg-secondary-fixed rounded-full" style={{ width: medal.percent }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const UpcomingEvents = () => {
  const events = [
    { date: "JUNIO 05 - 08", title: "Intercolegiados Pacífico", tags: ["Sprint", "Relay"], location: "Quibdó, Chocó" },
    { date: "JULIO 12", title: "Copa de la Selva", tags: ["Marathon", "Trail"], location: "Condoto" },
    { date: "AGOSTO 20 - 25", title: "Nacionales Chocó", tags: ["Combined", "Throws"], location: "Istmina" },
  ];

  return (
    <section className="py-24 max-w-7xl mx-auto px-8 md:px-20">
      <div className="flex justify-between items-center mb-12">
        <h3 className="text-4xl font-black italic uppercase tracking-tighter">PRÓXIMAS Citas</h3>
        <div className="flex space-x-2">
          <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant/20">
        {events.map((event, i) => (
          <motion.div 
            key={i}
            whileHover={{ backgroundColor: "var(--color-surface-bright)" }}
            className="bg-surface-container-lowest p-8 transition-all group cursor-pointer"
          >
            <div className="text-tertiary font-headline text-xs font-bold mb-6">{event.date}</div>
            <h4 className="text-2xl font-black italic uppercase mb-4 leading-none group-hover:text-primary transition-colors">{event.title}</h4>
            <div className="flex flex-wrap gap-2 mb-8">
              {event.tags.map((tag, j) => (
                <span key={j} className="px-3 py-1 bg-surface-container-low text-on-surface-variant text-[10px] font-headline uppercase">{tag}</span>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <div className="text-[10px] uppercase font-headline tracking-widest text-outline">{event.location}</div>
              <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const TechnicalStandards = () => {
  return (
    <section className="bg-emerald-900 py-24 text-white kinetic-slant-reverse">
      <div className="max-w-7xl mx-auto px-8 md:px-20 pt-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-secondary font-headline text-xs uppercase tracking-widest mb-4">Technical Standards</div>
            <h3 className="text-5xl font-black italic uppercase mb-8 tracking-tighter">REGLAMENTACIÓN Y SOPORTE</h3>
            <p className="text-emerald-100/60 font-body mb-10 leading-relaxed text-lg">
              Accede a la base de datos oficial para entrenadores, atletas y delegados técnicos. Mantén el estándar de excelencia de la Chocó Athletics League.
            </p>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-emerald-800/50 hover:bg-emerald-800 transition-colors border-l-4 border-secondary cursor-pointer group">
                <BookOpen className="w-6 h-6 mr-4 text-secondary" />
                <div className="flex-grow">
                  <div className="font-headline text-sm uppercase italic font-bold">Rulebook 2024 (PDF)</div>
                  <div className="text-[10px] text-emerald-100/40 uppercase">V 4.2 | 12.5 MB</div>
                </div>
                <Download className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center p-4 bg-emerald-800/50 hover:bg-emerald-800 transition-colors border-l-4 border-emerald-700 cursor-pointer group">
                <Gavel className="w-6 h-6 mr-4 text-emerald-400" />
                <div className="flex-grow">
                  <div className="font-headline text-sm uppercase italic font-bold">Anti-Doping Standards</div>
                  <div className="text-[10px] text-emerald-100/40 uppercase">V 1.0 | 5.2 MB</div>
                </div>
                <Download className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform"></div>
            <img 
              className="relative z-10 w-full h-[500px] object-cover rounded-2xl shadow-2xl" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjDqySrJUHV6bbpzBBHFknnoEcbz6KPamwi2M7OKzp35v-nzpITv7hgtSrBeKkkyfSMebGJFE3RfizEA4MS7WjhXUo56w0XdH8INzsVntBNT02tot1zWKRXKb3CIS1nJAyVEuA-ahwgdpKrJzunz2H3W4WJb7KiqhfmAteyezKu5xizT4DfsXLsX-p_Kl7ShG6NsGoNQlbskYyOY4-JKWUjeZI2-L0jEc9_3ja8lD9CLQ4H7i6Bujz6Ny9ZKfF8CvXNgy60OOlf-OO" 
              alt="Tropical foliage"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-emerald-950 text-white w-full py-20 px-8 flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
      <div className="flex flex-col items-center md:items-start">
        <div className="text-2xl font-black italic uppercase tracking-tighter mb-4">
          Chocó Athletics
        </div>
        <div className="text-emerald-100/50 font-headline text-[10px] uppercase tracking-widest">
          © 2024 Chocó Athletics League. Kinetic Tropics System.
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        <a className="text-emerald-100/50 hover:text-secondary-fixed transition-colors font-headline text-[10px] uppercase tracking-widest" href="#">Privacy Policy</a>
        <a className="text-emerald-100/50 hover:text-secondary-fixed transition-colors font-headline text-[10px] uppercase tracking-widest" href="#">Anti-Doping</a>
        <a className="text-emerald-100/50 hover:text-secondary-fixed transition-colors font-headline text-[10px] uppercase tracking-widest" href="#">Technical Standards</a>
        <a className="text-emerald-100/50 hover:text-secondary-fixed transition-colors font-headline text-[10px] uppercase tracking-widest" href="#">Contact</a>
      </div>
      <div className="flex space-x-4">
        <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer group">
          <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer group">
          <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  return (
    <div className="min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar />
      <main className="mt-20">
        <Hero />
        <FeaturedCompetition />
        <LiveResults />
        <UpcomingEvents />
        <TechnicalStandards />
      </main>
      <Footer />
    </div>
  );
}
