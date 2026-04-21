import { Star, Brain } from "lucide-react";

export default function ValueSection() {
  return (
    <section className="bg-white py-24 border-t border-b border-outline overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-8">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="md:w-1/2">
            <span className="text-primary font-label text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">
              Alto Rendimiento
            </span>
            <h2 className="font-headline font-black italic text-5xl md:text-6xl text-on-surface leading-none mb-8 tracking-tighter uppercase">
              ¿POR QUÉ<br /><span className="text-primary">PARTICIPAR?</span>
            </h2>
            <p className="text-on-surface-variant text-base mb-10 max-w-lg">
              Buscamos no solo deportistas, sino embajadores del Chocó ante el mundo. Únete al programa de alto rendimiento más exigente de la región.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 border border-outline hover:border-primary/30 transition-colors">
                <Star className="text-primary mb-4" size={32} fill="currentColor" />
                <h4 className="font-headline font-bold text-on-surface uppercase text-xs mb-2 italic tracking-wider">Ranking Nacional</h4>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">Acceso directo a las competiciones federadas y puntos oficiales.</p>
              </div>
              <div className="p-6 border border-outline hover:border-primary/30 transition-colors">
                <Brain className="text-primary mb-4" size={32} />
                <h4 className="font-headline font-bold text-on-surface uppercase text-xs mb-2 italic tracking-wider">Coaching Élite</h4>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">Entrenadores con experiencia olímpica y metodología avanzada.</p>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="absolute -top-10 -left-10 text-[8rem] font-black text-on-surface/5 select-none font-headline italic leading-none">
              CHOCÓ
            </div>
            <img
              alt="Athletic coaching"
              className="relative z-10 w-full aspect-square object-cover border-8 border-white shadow-2xl"
              src="https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=2085&auto=format&fit=crop"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-6 -right-6 bg-secondary p-6 z-20 shadow-lg">
              <p className="font-headline font-black text-3xl text-on-secondary leading-none italic">+200</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-secondary">Becas Otorgadas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
