import { motion } from "motion/react";
import { Play, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <header className="mb-12">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-7xl font-black font-headline text-on-surface uppercase tracking-tighter mb-4"
      >
        Blog de la <span className="text-primary italic">Liga</span>
      </motion.h1>
      <div className="w-24 h-2 bg-secondary mb-12"></div>
      
      <div className="editorial-grid">
        {/* Featured Video Post */}
        <motion.article 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 lg:col-span-8 group relative bg-surface-container-low overflow-hidden rounded-xl kinetic-shadow"
        >
          <div className="relative h-[500px]">
            <img 
              alt="Training video" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdUj1sgLgV0TyPjridxo-iRPgiJelXSqsGjbz9xPLhUg5z4qRRNEEeTrXHvRzz1mzz-zvw1GkS_laXY__uuRh-X2vISSJvNjpeiXLKhGRQ-tJ7JIKv_Td_uN6LGvjeVO36j49CPbaEcYloxJNr-oMUNgRiIbZWm8LGeu3Tz_TsMMQMkQJtAFkkg5UnaOSwas9jxCouWWL-Tc7It88s3ZQYvn8IAsJ58EK1yE30pYLpyV4Z0u_tLJgbS-6SvwLdJ9tA8TVQouQ1oV4q" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-transparent to-transparent opacity-80"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-24 h-24 bg-secondary-container rounded-full flex items-center justify-center cursor-pointer"
              >
                <Play className="text-on-secondary-container fill-current w-12 h-12" />
              </motion.div>
            </div>
            <div className="absolute bottom-0 p-10">
              <span className="inline-block px-4 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-black uppercase tracking-[0.2em] mb-4">Video</span>
              <h2 className="text-4xl font-black font-headline text-white leading-none uppercase mb-4 max-w-2xl">
                Ruta al Oro: Preparación técnica en el corazón del Chocó
              </h2>
              <button className="flex items-center gap-2 text-surface-bright font-bold uppercase tracking-widest text-xs group/btn">
                Ver video 
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </motion.article>

        {/* Sidebar Callout */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-primary p-8 rounded-xl flex flex-col justify-between h-full min-h-[300px]"
          >
            <div>
              <div className="text-surface-bright mb-4">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9v8l10-12h-9l1z"/></svg>
              </div>
              <h3 className="text-2xl font-black font-headline text-on-primary uppercase leading-tight">Únete a la nueva generación de campeones</h3>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white text-primary font-bold py-4 rounded-lg uppercase tracking-widest text-sm hover:bg-secondary-container transition-colors"
            >
              Inscripciones abiertas
            </motion.button>
          </motion.div>
        </aside>
      </div>
    </header>
  );
}
