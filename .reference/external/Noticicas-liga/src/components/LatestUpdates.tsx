import { ChevronLeft, ChevronRight, ArrowRight, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

const updates = [
  {
    tag: 'RESULTADOS',
    date: '12 Oct, 2024',
    title: 'Dominio Total en el Interligas de Relevos 4x100m',
    description: 'El equipo masculino senior asegura el primer puesto con un tiempo récord de 39.45s en una final electrizante contra Antioquia.',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop',
    link: 'VER DETALLES'
  },
  {
    tag: 'CONVOCATORIAS',
    date: '08 Oct, 2024',
    title: 'Búsqueda de Talentos: Categoría Sub-17',
    description: 'Abrimos inscripciones para las pruebas técnicas de velocidad y salto largo. Buscamos a los próximos representantes de nuestra bandera.',
    image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=2070&auto=format&fit=crop',
    link: 'APLICAR AHORA'
  },
  {
    tag: 'LOGROS',
    date: '05 Oct, 2024',
    title: 'Reconocimiento Nacional a la Gestión Deportiva',
    description: 'La Liga del Chocó ha sido galardonada como la organización con mayor crecimiento en infraestructura y programas de desarrollo juvenil.',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2093&auto=format&fit=crop',
    link: 'LEER MÁS'
  }
];

export default function LatestUpdates() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-display font-black text-gray-900 uppercase tracking-tight">
              ÚLTIMAS ACTUALIZACIONES
            </h2>
            <div className="h-1.5 w-20 bg-brand-green mt-4" />
          </div>
          
          <div className="flex gap-2">
            <button className="p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {updates.map((update, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={update.image} 
                  alt={update.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-brand-dark/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                    {update.tag}
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                  <Calendar className="w-4 h-4" />
                  {update.date}
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 mb-4 leading-tight group-hover:text-brand-green transition-colors">
                  {update.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                  {update.description}
                </p>
                <a href="#" className="inline-flex items-center gap-2 text-brand-green font-bold text-xs tracking-widest hover:gap-3 transition-all uppercase">
                  {update.link}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
