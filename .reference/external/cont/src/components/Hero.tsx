import { motion } from 'motion/react';

export default function Hero() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-24">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="lg:col-span-8"
      >
        <span className="text-secondary font-bold tracking-widest text-sm mb-4 block uppercase">Contacto Directo</span>
        <h1 className="font-headline font-black text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-primary italic uppercase -ml-1">
          Conecta con el<br/>
          <span className="text-outline">Movimiento</span>
        </h1>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="lg:col-span-4 pb-4"
      >
        <p className="text-lg text-on-surface-variant max-w-sm border-l-4 border-secondary-container pl-6">
          Llevamos el atletismo del Chocó al siguiente nivel. Escríbenos para patrocinios, inscripciones o prensa.
        </p>
      </motion.div>
    </div>
  );
}
