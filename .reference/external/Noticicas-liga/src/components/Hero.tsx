import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Side: Image */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-3/5 relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop" 
                alt="Athlete running" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-green/10 rounded-full blur-3xl -z-10" />
          </motion.div>
          
          {/* Right Side: Content Card */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-2/5"
          >
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-50 relative">
              <span className="inline-block bg-brand-green text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded mb-6 uppercase">
                DESTACADO
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-gray-900 leading-[0.95] mb-6 uppercase">
                VELOCIDAD PURA EN EL CORAZÓN DEL CHOCÓ
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                La delegación regional rompe récords históricos en las eliminatorias nacionales, consolidando al Chocó como la cuna de los velocistas más rápidos del país.
              </p>
              <button className="flex items-center gap-3 bg-slate-700 text-white px-8 py-4 rounded-lg font-bold hover:bg-slate-800 transition-all group">
                LEER ARTÍCULO COMPLETO
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
