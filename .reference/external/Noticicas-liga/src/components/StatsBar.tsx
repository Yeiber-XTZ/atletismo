import { motion } from 'motion/react';

const stats = [
  { label: 'RÉCORD REGIONAL 100M', value: '10.12s', color: 'border-brand-green' },
  { label: 'ATLETAS FEDERADOS', value: '1,240', color: 'border-blue-500' },
  { label: 'MEDALLAS ORO 2024', value: '42', color: 'border-brand-green' },
  { label: 'CLUBES ACTIVOS', value: '18', color: 'border-blue-500' },
];

export default function StatsBar() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`pl-6 border-l-4 ${stat.color}`}
            >
              <p className="text-[10px] font-bold text-gray-400 tracking-wider mb-1 uppercase">
                {stat.label}
              </p>
              <p className="text-3xl font-display font-black text-brand-dark">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
