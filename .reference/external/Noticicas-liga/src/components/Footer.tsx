import { Share2, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="lg:col-span-1">
            <span className="text-brand-green font-display font-extrabold text-xl tracking-tighter block mb-6">
              ATHLETICS IN MOTION
            </span>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Transformando el talento del Chocó en excelencia mundial a través del deporte y la disciplina.
            </p>
            <div className="flex gap-4">
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-brand-green hover:text-white transition-all">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-brand-green hover:text-white transition-all">
                <Globe className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">DEPORTE</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-green transition-colors">Resultados</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-green transition-colors">Convocatorias</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-green transition-colors">Logros</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-green transition-colors">Anuncios</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">ORGANIZACIÓN</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-green transition-colors">Entrenamientos</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-green transition-colors">Institucional</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-green transition-colors">Transparencia</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-brand-green transition-colors">Privacidad</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">CONTACTO</h4>
            <ul className="space-y-4">
              <li className="text-sm text-gray-600">Villa Olímpica de Quibdó<br />Chocó, Colombia</li>
              <li><a href="mailto:info@ligachoco.co" className="text-sm font-bold text-brand-green">info@ligachoco.co</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-50 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            © 2024 Athletics in Motion. Chocó Region. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
