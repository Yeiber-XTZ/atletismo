import { Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low w-full mt-auto flex flex-col md:flex-row justify-between items-center py-12 px-8 gap-6 font-body text-sm">
      <div className="flex flex-col gap-2">
        <span className="font-headline font-bold text-primary text-xl">Chocó Kinetic</span>
        <p className="text-primary/70">© 2024 Liga de Atletismo del Chocó. Energía Tropical en Movimiento.</p>
      </div>
      <div className="flex gap-8">
        <a className="text-primary/70 hover:underline decoration-2 underline-offset-4 transition-opacity opacity-80 hover:opacity-100" href="#">Privacidad</a>
        <a className="text-primary/70 hover:underline decoration-2 underline-offset-4 transition-opacity opacity-80 hover:opacity-100" href="#">Términos</a>
        <a className="text-primary/70 hover:underline decoration-2 underline-offset-4 transition-opacity opacity-80 hover:opacity-100" href="#">Federación</a>
        <a className="text-primary/70 hover:underline decoration-2 underline-offset-4 transition-opacity opacity-80 hover:opacity-100" href="#">Soporte</a>
      </div>
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-all">
          <Share2 size={20} />
        </div>
      </div>
    </footer>
  );
}
