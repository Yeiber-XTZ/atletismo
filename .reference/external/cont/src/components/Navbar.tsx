import { motion } from 'motion/react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md flex justify-between items-center px-8 h-20 max-w-full">
      <div className="text-xl font-black italic text-primary font-headline uppercase tracking-tight">
        Chocó Kinetic
      </div>
      <div className="hidden md:flex gap-8 items-center">
        <a className="text-tertiary font-medium font-headline uppercase tracking-tight hover:text-primary transition-colors duration-300" href="#">Atletas</a>
        <a className="text-tertiary font-medium font-headline uppercase tracking-tight hover:text-primary transition-colors duration-300" href="#">Resultados</a>
        <a className="text-tertiary font-medium font-headline uppercase tracking-tight hover:text-primary transition-colors duration-300" href="#">Eventos</a>
        <a className="text-primary border-b-4 border-primary pb-1 font-headline uppercase tracking-tight" href="#">Contacto</a>
      </div>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-primary text-on-primary px-6 py-2 btn-slant-right font-headline font-bold uppercase tracking-tighter"
      >
        Afiliarse
      </motion.button>
    </nav>
  );
}
