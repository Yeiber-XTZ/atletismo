import { Search, Filter, Download, CheckCircle2, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { TOP_ATHLETES, RANKING_ATHLETES } from './constants';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-[0_20px_40px_rgba(11,54,29,0.08)]">
        <div className="flex justify-between items-center h-20 px-8 max-w-[1440px] mx-auto">
          <div className="text-2xl font-black italic text-primary tracking-tighter font-headline">
            Chocó Athlétique
          </div>
          <div className="hidden md:flex items-center space-x-8 font-headline uppercase tracking-tight font-bold text-sm">
            <a className="text-primary border-b-2 border-primary pb-1" href="#">Results</a>
            <a className="text-tertiary hover:text-primary transition-all duration-300" href="#">Athletes</a>
            <a className="text-tertiary hover:text-primary transition-all duration-300" href="#">Calendar</a>
            <a className="text-tertiary hover:text-primary transition-all duration-300" href="#">Records</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-primary p-2 hover:bg-surface-container-highest rounded-full transition-all">
              <Search size={20} />
            </button>
            <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-headline font-bold text-sm slant-edge active:scale-95 transition-transform">
              Sign In
            </button>
          </div>
        </div>
        <div className="bg-surface-container h-[1px] w-full"></div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-[450px] overflow-hidden bg-inverse-surface">
          <div className="absolute inset-0 opacity-60">
            <img 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop" 
              alt="Sprinter in mid-stride"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-inverse-surface via-inverse-surface/40 to-transparent"></div>
          <div className="relative max-w-[1440px] mx-auto px-8 h-full flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-4 py-1 bg-secondary-container text-on-secondary-container font-headline font-bold text-xs uppercase tracking-widest mb-4 w-fit"
            >
              Estadísticas Oficiales
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-headline font-extrabold text-6xl md:text-8xl text-surface uppercase -ml-1 tracking-tighter leading-none"
            >
              Ranking<br/><span className="text-secondary-fixed">Departamental</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-surface-variant max-w-xl mt-6 text-lg font-medium leading-relaxed"
            >
              Celebrando la excelencia atlética del Chocó. El podio donde la velocidad se encuentra con la selva.
            </motion.p>
          </div>
        </section>

        {/* Filter System */}
        <section className="bg-surface-container-low py-8 border-b border-outline-variant/15">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Categoría</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-surface-container-highest border-none rounded-lg font-body font-semibold text-on-surface py-3 px-4 focus:ring-2 focus:ring-primary">
                    <option>Mayores (Elite)</option>
                    <option>Sub-23</option>
                    <option>Juvenil</option>
                    <option>Cadetes</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={16} />
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Disciplina</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-surface-container-highest border-none rounded-lg font-body font-semibold text-on-surface py-3 px-4 focus:ring-2 focus:ring-primary">
                    <option>100 Metros Planos</option>
                    <option>200 Metros Planos</option>
                    <option>400 Metros Vallas</option>
                    <option>Salto Largo</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={16} />
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Género</label>
                <div className="flex gap-2">
                  <button className="flex-1 bg-primary text-on-primary font-bold py-3 rounded-lg text-sm">Masculino</button>
                  <button className="flex-1 bg-surface-container-highest text-on-surface-variant font-bold py-3 rounded-lg text-sm hover:bg-surface-variant transition-colors">Femenino</button>
                </div>
              </div>
              <div className="md:w-auto w-full">
                <button className="w-full md:w-auto bg-inverse-surface text-surface px-8 py-3 rounded-lg font-headline font-bold text-sm uppercase tracking-tight flex items-center justify-center gap-2 hover:bg-primary transition-colors">
                  <Filter size={18} />
                  Filtrar
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Podium Section */}
        <section className="py-16 bg-surface-container-lowest">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              {/* 2nd Place */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="order-2 md:order-1 flex flex-col items-center"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-outline-variant opacity-20 rounded-full blur group-hover:opacity-40 transition-opacity"></div>
                  <img 
                    className="relative w-40 h-40 rounded-full object-cover border-4 border-surface-container-high shadow-lg" 
                    src={TOP_ATHLETES[1].image} 
                    alt={TOP_ATHLETES[1].name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-surface-variant text-on-surface-variant w-10 h-10 rounded-full flex items-center justify-center font-headline font-black text-xl shadow-md">2</div>
                </div>
                <h3 className="mt-6 font-headline font-bold text-xl text-on-surface">{TOP_ATHLETES[1].name}</h3>
                <p className="text-tertiary font-bold text-xs uppercase tracking-widest">{TOP_ATHLETES[1].club}</p>
                <div className="mt-4 px-4 py-2 bg-surface-container rounded-full font-headline font-black text-primary">{TOP_ATHLETES[1].mark}</div>
              </motion.div>

              {/* 1st Place */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="order-1 md:order-2 flex flex-col items-center transform md:-translate-y-8"
              >
                <div className="relative group">
                  <div className="absolute -inset-4 bg-secondary-fixed opacity-30 rounded-full blur-xl group-hover:opacity-50 transition-opacity"></div>
                  <img 
                    className="relative w-56 h-56 rounded-full object-cover border-8 border-secondary-fixed shadow-2xl" 
                    src={TOP_ATHLETES[0].image} 
                    alt={TOP_ATHLETES[0].name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-3 -right-3 bg-secondary-fixed text-on-secondary-container w-14 h-14 rounded-full flex items-center justify-center font-headline font-black text-2xl shadow-lg border-4 border-surface-container-lowest">1</div>
                </div>
                <h3 className="mt-8 font-headline font-black text-3xl text-on-surface uppercase tracking-tighter">{TOP_ATHLETES[0].name}</h3>
                <p className="text-primary font-bold text-sm uppercase tracking-widest">{TOP_ATHLETES[0].club}</p>
                <div className="mt-4 px-8 py-3 kinetic-bg text-on-primary font-headline font-black text-2xl slant-edge shadow-xl">{TOP_ATHLETES[0].mark}</div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="order-3 flex flex-col items-center"
              >
                <div className="relative group">
                  <div className="absolute -inset-1 bg-[#CD7F32] opacity-20 rounded-full blur group-hover:opacity-40 transition-opacity"></div>
                  <img 
                    className="relative w-40 h-40 rounded-full object-cover border-4 border-surface-container-high shadow-lg" 
                    src={TOP_ATHLETES[2].image} 
                    alt={TOP_ATHLETES[2].name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-secondary-fixed-dim text-on-secondary-fixed w-10 h-10 rounded-full flex items-center justify-center font-headline font-black text-xl shadow-md">3</div>
                </div>
                <h3 className="mt-6 font-headline font-bold text-xl text-on-surface">{TOP_ATHLETES[2].name}</h3>
                <p className="text-tertiary font-bold text-xs uppercase tracking-widest">{TOP_ATHLETES[2].club}</p>
                <div className="mt-4 px-4 py-2 bg-surface-container rounded-full font-headline font-black text-primary">{TOP_ATHLETES[2].mark}</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Ranking Table */}
        <section className="pb-24 bg-surface-container-lowest">
          <div className="max-w-[1440px] mx-auto px-8">
            <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-inverse-surface text-surface font-headline uppercase text-[11px] tracking-[0.2em] font-black">
                      <th className="px-8 py-5">Rank</th>
                      <th className="px-8 py-5">Atleta</th>
                      <th className="px-8 py-5">Club / Municipio</th>
                      <th className="px-8 py-5 text-right">Marca Oficial</th>
                      <th className="px-8 py-5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {RANKING_ATHLETES.map((athlete) => (
                      <tr key={athlete.rank} className="hover:bg-surface-bright transition-colors group">
                        <td className="px-8 py-6 font-headline font-black text-2xl text-on-surface-variant group-hover:text-primary transition-colors">
                          {athlete.rank}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-surface-container-highest rounded-lg flex-shrink-0 overflow-hidden">
                              <img 
                                className="w-full h-full object-cover" 
                                src={athlete.image} 
                                alt={athlete.name}
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="font-bold text-on-surface">{athlete.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-on-surface-variant font-medium">{athlete.club}</td>
                        <td className="px-8 py-6 text-right font-headline font-bold text-primary text-xl">{athlete.mark}</td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center">
                            <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-1 rounded flex items-center gap-1">
                              <CheckCircle2 size={10} />
                              {athlete.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-on-surface-variant text-sm font-medium">Mostrando 7 de 142 registros oficiales temporada 2024.</p>
              <button className="bg-primary text-on-primary px-10 py-4 rounded-lg font-headline font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-lg hover:shadow-2xl transition-all slant-edge active:scale-95">
                <Download size={18} />
                Descargar Ranking Completo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-inverse-surface text-surface py-12 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-[1440px] mx-auto">
          <div className="mb-8 md:mb-0">
            <div className="text-lg font-bold text-secondary-container mb-2 font-headline italic">Chocó Athlétique</div>
            <div className="font-body text-sm tracking-wide text-outline-variant">© 2024 Kinetic Tropics League. All Rights Reserved.</div>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-body text-sm tracking-wide">
            <a className="text-outline-variant hover:text-white transition-colors" href="#">Privacy Policy</a>
            <a className="text-outline-variant hover:text-white transition-colors" href="#">Terms of Service</a>
            <a className="text-outline-variant hover:text-white transition-colors" href="#">Contact</a>
            <a className="text-outline-variant hover:text-white transition-colors" href="#">Press Kit</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
