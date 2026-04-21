export default function Footer() {
  return (
    <footer className="w-full mt-20 bg-surface-container-low text-primary font-body text-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-12 py-16 w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="text-xl font-black italic text-primary font-headline uppercase tracking-tight">
            Chocó Athletic
          </div>
          <p className="opacity-80 text-on-surface-variant">
            Elevando el atletismo del pacífico colombiano a la escena global.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold uppercase tracking-widest mb-2 text-on-surface">Legal</h4>
          <a className="text-tertiary hover:underline decoration-2 underline-offset-4 opacity-80 hover:opacity-100 transition-all" href="#">Privacy Policy</a>
          <a className="text-tertiary hover:underline decoration-2 underline-offset-4 opacity-80 hover:opacity-100 transition-all" href="#">Terms of Service</a>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold uppercase tracking-widest mb-2 text-on-surface">Prensa</h4>
          <a className="text-tertiary hover:underline decoration-2 underline-offset-4 opacity-80 hover:opacity-100 transition-all" href="#">Media Kit</a>
          <a className="text-tertiary hover:underline decoration-2 underline-offset-4 opacity-80 hover:opacity-100 transition-all" href="#">Contact Us</a>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold uppercase tracking-widest mb-2 text-on-surface">Compañía</h4>
          <a className="text-tertiary hover:underline decoration-2 underline-offset-4 opacity-80 hover:opacity-100 transition-all" href="#">Careers</a>
        </div>
      </div>
      <div className="px-12 py-6 border-t border-primary/10 text-center opacity-60 text-on-surface-variant">
        © 2024 Kinetic Tropics Sports League. All rights reserved.
      </div>
    </footer>
  );
}
