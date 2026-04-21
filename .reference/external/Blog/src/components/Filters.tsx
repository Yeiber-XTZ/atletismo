import { motion } from "motion/react";

const categories = [
  { name: "Todos", active: true },
  { name: "Entrevista", active: false },
  { name: "Video", active: false },
  { name: "Galería", active: false },
  { name: "Técnico", active: false },
  { name: "Competición", active: false },
];

export default function Filters() {
  return (
    <div className="flex flex-wrap gap-3 mb-16 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map((cat, i) => (
        <motion.button
          key={cat.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i }}
          className={`px-6 py-2 rounded-full font-label font-bold text-xs uppercase tracking-widest transition-colors ${
            cat.active 
              ? "bg-primary text-on-primary" 
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest"
          }`}
        >
          {cat.name}
        </motion.button>
      ))}
    </div>
  );
}
