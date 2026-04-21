import { motion } from "motion/react";
import { ChevronRight, Dumbbell, RefreshCw } from "lucide-react";

export default function BlogGrid() {
  return (
    <section>
      <div className="editorial-grid">
        {/* Article 1 */}
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="col-span-12 md:col-span-6 lg:col-span-4 bg-white p-6 rounded-xl kinetic-shadow hover:bg-surface-bright transition-colors group cursor-pointer"
        >
          <div className="aspect-[4/3] mb-6 overflow-hidden rounded-lg">
            <img 
              alt="Athlete focus" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuACfQtoiirsLdCUlOLefTckgpff7xZlf8VRrwu7UZ-u63R8oKyDxZUm4LzN9LuVwGWJ3zSs4Bfxt0Ca4P07zUBRciYvJ6k86qEpZgEWJR3E4ng2fahoO6dIa4bnpiJG3giqDunw3qNRJaPI54Or__nqXEb8u8SZIFPhUFi8XSb7BmAJsAaj_YbGK96beTMcAr1INQq0Zbmi1O0EIN69DrFYdE5Smr6QEHus7zHbNiwotUsqn74MxfwttOIF41ox7_ugQpD1NNNaVvGX" 
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-[10px] font-black text-tertiary uppercase tracking-widest block mb-3">Entrevista</span>
          <h3 className="text-2xl font-bold font-headline mb-4 leading-tight group-hover:text-primary transition-colors">
            Sandra Ibargüen: "El atletismo me salvó la vida"
          </h3>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            Conversamos con la promesa del salto largo sobre sus inicios en Quibdó y sus metas internacionales para este 2024.
          </p>
          <div className="text-primary font-bold uppercase tracking-widest text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
            Leer más <ChevronRight className="w-4 h-4" />
          </div>
        </motion.article>

        {/* Gallery Article */}
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="col-span-12 md:col-span-6 lg:col-span-4 bg-white p-6 rounded-xl kinetic-shadow hover:bg-surface-bright transition-colors group cursor-pointer"
        >
          <div className="grid grid-cols-2 gap-2 mb-6 aspect-[4/3] rounded-lg overflow-hidden">
            <img 
              alt="Gallery 1" 
              className="h-full w-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT3fR6vF-kjt2rQx_lFJFmwORCnwoeOPBQCKnBkh8pjOTURhaJELmbgS9dpdVsyJvKBVnwVVIIwGoUKM2zNbvCpftOGB8Q5Wnki4l-SXcXs14EMLRUCEyC2plDjScSTD5XnaNyIricohJb0hxyHZEY_eGYbd1mVJSMLikwHXn2O1rTajhmMoegIXZgjB-N8_u1V6WIY24xPyJ_4U4uWAhYlGQFacA9G9PY7UboHEAzit3cCCLUeFy5XtnCOsntKeHlXKsto-aveFZ4" 
              referrerPolicy="no-referrer"
            />
            <div className="grid grid-rows-2 gap-2">
              <img 
                alt="Gallery 2" 
                className="h-full w-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCSMR3FmMoxLTtJ5DB1hLU77Fa_Bx4Dip5HlRbol4CPhMs7tnHmhbhngR5r4baABrSLlSIWlBRQpmbGkp-iT8mWxRWTLjSUP2-hNKIi9YGQ0NOr9r89XJfD-MhvCWCQinErZA2KG7ildbDSmCCzoFgPGVTv-3MvkBYMEB3IT7XQvcZV-ciy9isRWpU0wtFgkpCK6zq-dL_9jRiO9OP1-b1FcE9FNjxHKhnAJN2l-JeQD1ZyVAws2lNeO6dePLzuKJKzFDk_EOn7OzL" 
                referrerPolicy="no-referrer"
              />
              <div className="relative">
                <img 
                  alt="Gallery 3" 
                  className="h-full w-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5dGndMQvdmrPLsZXqGR9cgJhdlW7uZhYyI-C9yPrdHzEG740sfI4-ud0zltNlkcpIqNrYYTuhDcjvaDcVec2qHIuGSmb07TT7NApbOtoWDdEOArxIn6q_xGD7hL_nww2bTdqFscOObElFMytbLCDze3tOjJGjffhtryKzWsGQCZF3qYQHtM1cug1tRjWZMjQTldUNgHgBeGL2qiQMgK1gKTw4Ak22KpYe8-EVvG4egYQgxLQ6fGPcgJS3WXS0zHhen2FAoFTXobCd" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-inverse-surface/60 flex items-center justify-center">
                  <span className="text-white font-black font-headline text-xl">+12</span>
                </div>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-black text-tertiary uppercase tracking-widest block mb-3">Galería</span>
          <h3 className="text-2xl font-bold font-headline mb-4 leading-tight group-hover:text-primary transition-colors">
            Crónica visual: El regional de Quibdó en imágenes
          </h3>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            Los momentos más emocionantes del último encuentro regional capturados por el lente de Carlos Murillo.
          </p>
          <div className="text-primary font-bold uppercase tracking-widest text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
            Ver galería <ChevronRight className="w-4 h-4" />
          </div>
        </motion.article>

        {/* Technical Article */}
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="col-span-12 md:col-span-6 lg:col-span-4 bg-white p-6 rounded-xl kinetic-shadow hover:bg-surface-bright transition-colors group cursor-pointer"
        >
          <div className="aspect-[4/3] mb-6 overflow-hidden rounded-lg bg-surface-container flex items-center justify-center p-8">
            <Dumbbell className="text-primary w-24 h-24 opacity-20" />
          </div>
          <span className="text-[10px] font-black text-tertiary uppercase tracking-widest block mb-3">Técnico</span>
          <h3 className="text-2xl font-bold font-headline mb-4 leading-tight group-hover:text-primary transition-colors">
            Nutrición para climas tropicales de alta humedad
          </h3>
          <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
            Guía esencial para atletas que entrenan en condiciones de calor extremo. Tips de hidratación y recuperación.
          </p>
          <div className="text-primary font-bold uppercase tracking-widest text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
            Leer más <ChevronRight className="w-4 h-4" />
          </div>
        </motion.article>

        {/* Special Banner Section */}
        <motion.article 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="col-span-12 lg:col-span-7 bg-surface-container p-12 rounded-xl flex flex-col md:flex-row gap-8 items-center group overflow-hidden"
        >
          <div className="flex-1 z-10">
            <span className="text-[10px] font-black text-tertiary uppercase tracking-widest block mb-3">Competición</span>
            <h3 className="text-3xl font-black font-headline mb-6 leading-none group-hover:text-primary transition-colors uppercase">
              Calendario Oficial: Temporada 2024-2025
            </h3>
            <p className="text-on-surface-variant text-base mb-8 max-w-md">
              Consulta todas las fechas de los próximos encuentros departamentales y nacionales.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:shadow-lg transition-all"
            >
              Descargar PDF
            </motion.button>
          </div>
          <div className="w-full md:w-1/2 -mr-16 lg:-mr-24 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <img 
              alt="Running tracks" 
              className="rounded-xl shadow-2xl" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFuog8T1lWohyUY0_GF3JyTB6V-JcWXGzoakW0qPTF1Nv5dlQo0-S_W66kp3bCWRIGwtZkoglUmUzKiy6cm3E3jP3gJ4CKxqJrnbYt2X9E1lT5yKKD9MRWaGRXeY1fhwXoyoMuGfXPvIl5yEo3kd8bzXBYXvGS778lxIbRF92JONB62naTE8TebIsns9kdKmSGVZIPXfXcR7iYSpvqr6T0pl2YxHxU_wp8L1kY_SfkCNAfxK2e_GkoEf-qny9ZFmjQKYMF3mf24wRu" 
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.article>
      </div>

      {/* Load More Section */}
      <div className="mt-20 flex flex-col items-center">
        <div className="w-16 h-1 bg-surface-container-highest mb-8"></div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-12 py-5 bg-surface-container-highest text-on-surface font-black font-headline uppercase tracking-widest text-sm rounded-full hover:bg-primary hover:text-on-primary transition-all group flex items-center gap-4"
        >
          Cargar más artículos
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        </motion.button>
      </div>
    </section>
  );
}
