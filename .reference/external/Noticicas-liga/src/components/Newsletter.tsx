import { motion } from 'motion/react';

export default function Newsletter() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-brand-dark rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden shadow-2xl"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-light/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase leading-tight mb-6">
                MANTENTE EN EL CARRIL RÁPIDO
              </h2>
              <p className="text-brand-light/70 text-lg">
                Suscríbete para recibir notificaciones exclusivas sobre resultados en vivo, convocatorias y eventos regionales.
              </p>
            </div>
            
            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-light/50 w-full sm:w-80"
              />
              <button className="bg-brand-light text-brand-dark px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-brand-light/20">
                UNIRME
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
