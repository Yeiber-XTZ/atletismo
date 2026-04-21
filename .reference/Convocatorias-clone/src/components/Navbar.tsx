import { motion } from "motion/react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-outline-variant/30">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
        <div className="text-2xl font-black italic text-primary tracking-tighter font-headline">
          CHOCÓ ATHLÉTIQUE
        </div>
        <div className="hidden md:flex gap-8 items-center">
          {["Competitions", "Results", "Clubs", "Athletes"].map((item) => (
            <a
              key={item}
              className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-300 font-label text-xs uppercase tracking-wider"
              href="#"
            >
              {item}
            </a>
          ))}
          <a
            className="text-primary border-b-2 border-secondary font-bold font-label text-xs uppercase tracking-wider"
            href="#"
          >
            News
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:block font-label text-xs font-bold text-on-surface-variant px-4 py-2 hover:text-primary transition-colors">
            LOGIN
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary text-white font-headline font-bold uppercase italic px-6 py-2 tracking-tighter transform -skew-x-12 hover:bg-primary-dim transition-all text-sm"
          >
            Register
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
