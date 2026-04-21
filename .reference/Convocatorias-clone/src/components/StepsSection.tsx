import { FileText, Edit3, UploadCloud, CheckCircle } from "lucide-react";

const steps = [
  {
    id: "1",
    number: "01",
    title: "Revisa Bases",
    description: "Lee los requisitos de edad, categoría y tiempos mínimos.",
    icon: FileText,
  },
  {
    id: "2",
    number: "02",
    title: "Formulario",
    description: "Completa tus datos personales y deportivos en el portal.",
    icon: Edit3,
  },
  {
    id: "3",
    number: "03",
    title: "Documentos",
    description: "Sube tu certificado médico y documento de identidad.",
    icon: UploadCloud,
  },
  {
    id: "4",
    number: "04",
    title: "Pruebas Físicas",
    description: "Asiste a la fecha y lugar asignado para las pruebas de campo.",
    icon: CheckCircle,
    highlight: true,
  },
];

export default function StepsSection() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-screen-2xl mx-auto px-8">
        <div className="text-center mb-16">
          <span className="text-primary font-label text-[10px] font-black uppercase tracking-[0.4em]">Proceso de Selección</span>
          <h2 className="font-headline font-black text-4xl italic text-on-surface uppercase mt-2">PASOS PARA TU REGISTRO</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id} 
                className={`p-8 border relative group transition-all ${
                  step.highlight 
                    ? "bg-primary border-primary shadow-xl" 
                    : "bg-white border-outline hover:border-primary/50"
                }`}
              >
                <span className={`font-headline font-black text-5xl absolute top-4 right-4 transition-colors ${
                  step.highlight ? "text-white/10" : "text-gray-100 group-hover:text-primary/10"
                }`}>
                  {step.number}
                </span>
                <Icon className={`${step.highlight ? "text-secondary" : "text-primary"} mb-6`} size={40} fill={step.highlight ? "currentColor" : "none"} />
                <h3 className={`font-headline font-bold text-sm mb-3 italic uppercase ${step.highlight ? "text-white" : "text-on-surface"}`}>
                  {step.title}
                </h3>
                <p className={`text-xs leading-relaxed ${step.highlight ? "text-white/80" : "text-on-surface-variant"}`}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
