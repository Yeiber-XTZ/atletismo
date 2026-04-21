import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Information Grid (Left/Top) */}
      <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
        {/* Email Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-surface-container-low p-8 flex flex-col gap-4 group hover:bg-surface-bright transition-colors duration-300"
        >
          <div className="w-12 h-12 bg-primary flex items-center justify-center text-on-primary">
            <Mail size={24} />
          </div>
          <div>
            <h3 className="font-headline font-bold text-primary uppercase text-xs tracking-widest mb-1">Escríbenos</h3>
            <p className="text-xl font-medium font-headline lowercase">info@chocokinetic.co</p>
          </div>
        </motion.div>

        {/* Phone Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-surface-container-low p-8 flex flex-col gap-4 group hover:bg-surface-bright transition-colors duration-300"
        >
          <div className="w-12 h-12 bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <Phone size={24} />
          </div>
          <div>
            <h3 className="font-headline font-bold text-secondary uppercase text-xs tracking-widest mb-1">Llámanos</h3>
            <p className="text-xl font-medium font-headline">+57 604 123 4567</p>
          </div>
        </motion.div>

        {/* Sede Card */}
        <div className="md:col-span-2 bg-surface-container-lowest p-8 flex flex-col gap-4 border-t-8 border-primary-container shadow-[0_20px_40px_rgba(11,54,29,0.04)]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-headline font-bold text-primary uppercase text-xs tracking-widest mb-1">Nuestra Sede</h3>
              <p className="text-2xl font-headline font-bold leading-tight">Villa Deportiva Quibdó,<br/>Sector El Jardín</p>
            </div>
            <MapPin size={36} className="text-outline-variant" />
          </div>
        </div>

        {/* Map Component */}
        <div className="md:col-span-2 h-64 relative overflow-hidden bg-surface-container-highest group">
          <div className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-700">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAuSpzQmbMhhg7f_21CJ9ahXoY0P2f-5yXrEiBJeBs7UdUPDlnhIoUAoRQiC0hAb0OZxjmMHVRVIDhx_huu0TMfsNNBt1qtoN8eQUQkjPpGbaY5HSFDSSKtKXEt96gYPPlKHPXZA-dsnA5yIB9WXDtdxvJRe-Q6ONMNZNSAXpI_mvB2-permT65VUIk0NErK3cIxVvgvbqBGONen__h2DA0zeMTWXVZLgHtD3hPYpR2kYbGudPXbcY9-UlRFuP6yIYZIa6nyiACa_8" 
              alt="Centro de entrenamiento"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-tighter text-primary">
            Centro de Entrenamiento High-Performance
          </div>
        </div>
      </div>

      {/* Contact Form (Right/Bottom) */}
      <div className="lg:col-span-7 bg-white p-1 md:p-12 relative">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary-container/20 -z-10"></div>
        <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="relative group">
              <label className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-outline group-focus-within:text-primary transition-colors">Nombre Completo</label>
              <input 
                className="w-full bg-surface-container-low border-none p-6 text-on-surface focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" 
                placeholder="Tu nombre aquí" 
                type="text"
              />
            </div>
            <div className="relative group">
              <label className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-outline group-focus-within:text-primary transition-colors">Email</label>
              <input 
                className="w-full bg-surface-container-low border-none p-6 text-on-surface focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" 
                placeholder="email@ejemplo.com" 
                type="email"
              />
            </div>
          </div>
          <div className="relative group">
            <label className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-outline group-focus-within:text-primary transition-colors">Interés</label>
            <select className="w-full bg-surface-container-low border-none p-6 text-on-surface focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none appearance-none font-bold">
              <option>Afiliación de Atleta</option>
              <option>Patrocinio y Alianzas</option>
              <option>Prensa y Medios</option>
              <option>Otras Consultas</option>
            </select>
          </div>
          <div className="relative group">
            <label className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-outline group-focus-within:text-primary transition-colors">Mensaje</label>
            <textarea 
              className="w-full bg-surface-container-low border-none p-6 text-on-surface focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none resize-none" 
              placeholder="Cuéntanos cómo podemos ayudarte a mover el mundo..." 
              rows={5}
            ></textarea>
          </div>
          <div className="flex items-center justify-end">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary text-on-primary px-12 py-5 btn-slant-right flex items-center gap-4 group hover:bg-primary-dim transition-all shadow-xl shadow-primary/20" 
              type="submit"
            >
              <span className="font-headline font-black uppercase tracking-tighter text-lg">Enviar Mensaje</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
