import React from "react";
import { Calendar, MapPin, Ban } from "lucide-react";
import { Convocatoria } from "../types";

interface ConvocatoriaCardProps {
  convocatoria: Convocatoria;
  key?: string | number;
}

export default function ConvocatoriaCard({ convocatoria }: ConvocatoriaCardProps) {
  const isClosed = convocatoria.status === 'cerrada';
  const isUpcoming = convocatoria.status === 'proximamente';
  const isOpen = convocatoria.status === 'abierta';

  return (
    <article className={`group bg-white border border-outline hover:shadow-xl hover:border-primary/20 transition-all duration-300 ${isClosed ? 'opacity-70 bg-surface-container-low' : ''}`}>
      <div className="h-44 overflow-hidden relative">
        <img
          alt={convocatoria.title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isClosed ? 'grayscale' : isUpcoming ? 'grayscale group-hover:grayscale-0' : ''}`}
          src={convocatoria.image}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-0 left-0">
          <span className={`font-headline font-black italic px-4 py-1 text-[10px] tracking-widest uppercase ${
            isOpen ? 'bg-primary text-white' : 
            isUpcoming ? 'bg-secondary text-on-secondary' : 
            'bg-gray-400 text-white'
          }`}>
            {convocatoria.status}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <span className="text-tertiary font-label text-[10px] font-black uppercase tracking-[0.2em] block mb-2 opacity-70">
          Categoría: {convocatoria.category}
        </span>
        <h3 className={`font-headline font-bold text-xl leading-tight mb-4 uppercase italic ${isClosed ? 'text-on-surface/60' : 'text-on-surface'}`}>
          {convocatoria.title}
        </h3>
        
        <div className="space-y-3 mb-6">
          {convocatoria.deadline && (
            <div className="flex items-center gap-3">
              <Calendar className="text-primary" size={20} fill={isOpen ? "currentColor" : "none"} />
              <div className="text-[11px]">
                <p className="uppercase opacity-50 font-bold">Cierre de Inscripción</p>
                <p className="font-bold">{convocatoria.deadline}</p>
              </div>
            </div>
          )}
          {convocatoria.openingDate && (
            <div className="flex items-center gap-3">
              <Calendar className="text-primary" size={20} fill="currentColor" />
              <div className="text-[11px]">
                <p className="uppercase opacity-50 font-bold">Apertura</p>
                <p className="font-bold">{convocatoria.openingDate}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            {isClosed ? <Ban className="text-on-surface-variant/50" size={20} /> : <MapPin className="text-primary" size={20} />}
            <span className={`text-[11px] font-bold uppercase ${isClosed ? 'text-on-surface-variant/50 italic' : ''}`}>
              {isClosed ? 'Inscripciones finalizadas' : convocatoria.location}
            </span>
          </div>
        </div>
        
        <button 
          disabled={isClosed}
          className={`w-full font-headline font-bold italic py-3 text-sm transition-all uppercase tracking-widest transform -skew-x-6 ${
            isClosed ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
            isUpcoming ? 'border border-on-surface text-on-surface hover:bg-on-surface hover:text-white' :
            'bg-primary text-white hover:bg-black'
          }`}
        >
          {isClosed ? 'Finalizada' : isUpcoming ? 'Ver Detalles' : 'Postularse'}
        </button>
      </div>
    </article>
  );
}
