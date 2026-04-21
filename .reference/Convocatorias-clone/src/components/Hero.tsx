import { motion } from "motion/react";
import { Megaphone } from "lucide-react";

export default function Hero() {
  return (
    <header className="relative h-[700px] w-full overflow-hidden bg-inverse-surface">
      <div className="absolute inset-0 opacity-50">
        <img
          alt="Athletes in motion"
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      
      <div className="relative z-10 h-full max-w-screen-2xl mx-auto px-8 flex flex-col justify-center items-start">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 inline-flex items-center gap-2 bg-secondary text-on-secondary px-3 py-1 font-label text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <Megaphone size={14} fill="currentColor" />
          Última Oportunidad
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="font-headline font-black italic text-6xl md:text-8xl text-white tracking-tighter leading-none mb-6"
        >
          CONVOCATORIAS<br />
          <span className="text-secondary">ABIERTAS</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-xl text-lg text-gray-300 font-medium mb-10 leading-relaxed"
        >
          El futuro del atletismo chocoano se construye hoy. Participa en las pruebas de selección para el equipo departamental.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-4"
        >
          <button className="bg-primary text-white font-headline font-black text-lg italic px-8 py-4 transform -skew-x-12 hover:scale-105 transition-transform">
            POSTULARSE AHORA
          </button>
          <button className="border-2 border-white text-white font-headline font-black text-lg italic px-8 py-4 transform -skew-x-12 hover:bg-white hover:text-black transition-all">
            VER CALENDARIO
          </button>
        </motion.div>
      </div>
    </header>
  );
}
