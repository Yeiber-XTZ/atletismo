import { Share2, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-outline py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 max-w-screen-2xl mx-auto items-center">
        <div className="flex flex-col gap-2">
          <div className="text-lg font-black italic text-primary font-headline">CHOCÓ ATHLÉTIQUE</div>
          <p className="text-on-surface-variant text-xs font-body">© 2024 Chocó Athlétique. Kinetic Excellence.</p>
        </div>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
          {["Privacy Policy", "Terms of Service", "Contact Us"].map((link) => (
            <a
              key={link}
              className="text-on-surface-variant font-label text-[10px] uppercase tracking-wider hover:text-primary transition-all"
              href="#"
            >
              {link}
            </a>
          ))}
        </div>
        
        <div className="flex justify-end gap-3">
          <a className="w-8 h-8 flex items-center justify-center border border-outline text-on-surface-variant hover:bg-primary hover:text-white transition-colors rounded-none" href="#">
            <Share2 size={18} />
          </a>
          <a className="w-8 h-8 flex items-center justify-center border border-outline text-on-surface-variant hover:bg-primary hover:text-white transition-colors rounded-none" href="#">
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
