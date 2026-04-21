import { Search } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-bottom border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <span className="text-brand-green font-display font-extrabold text-xl tracking-tighter">
              ATHLETICS IN MOTION
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm font-medium text-brand-green border-b-2 border-brand-green pb-1">Liga</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-brand-green transition-colors">Deportivo</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-brand-green transition-colors">Comunidad</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-brand-green transition-colors">Clubes</a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-brand-green transition-colors">Contacto</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-gray-100 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 w-48"
              />
            </div>
            <button className="bg-brand-green text-white px-6 py-2 rounded-md text-sm font-bold hover:bg-brand-green/90 transition-all">
              INICIAR SESIÓN
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
