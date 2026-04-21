import { Search } from "lucide-react";

const categories = ["Todas", "Velocidad", "Larga Distancia", "Juvenil", "Élite"];

export default function FilterBar() {
  return (
    <section className="sticky top-[69px] z-40 bg-white py-4 border-b border-outline">
      <div className="max-w-screen-2xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-5 py-1.5 font-label text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                i === 0 ? "bg-primary text-white" : "bg-transparent text-on-surface-variant hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <input
            className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-none py-2 px-4 text-xs font-body focus:ring-1 focus:ring-primary outline-none"
            placeholder="Buscar convocatoria..."
            type="text"
          />
          <Search className="absolute right-3 top-2 text-on-surface-variant" size={18} />
        </div>
      </div>
    </section>
  );
}
