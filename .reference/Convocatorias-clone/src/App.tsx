/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FilterBar from "./components/FilterBar";
import ConvocatoriaCard from "./components/ConvocatoriaCard";
import ValueSection from "./components/ValueSection";
import StepsSection from "./components/StepsSection";
import Footer from "./components/Footer";
import { Convocatoria } from "./types";

const sampleConvocatorias: Convocatoria[] = [
  {
    id: "1",
    title: "Grand Prix Chocó: 100m & 200m",
    category: "Velocidad",
    status: "abierta",
    deadline: "30 de Noviembre, 2024",
    location: "Estadio La Flora, Quibdó",
    image: "https://images.unsplash.com/photo-1530549387074-d56a99e148c9?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Ruta del Atrato: 10K & Media Maratón",
    category: "Larga Distancia",
    status: "proximamente",
    openingDate: "01 de Diciembre, 2024",
    location: "Malecón de Quibdó",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Talentos del Pacífico: Sub-14",
    category: "Semilleros",
    status: "cerrada",
    location: "Varios Municipios",
    image: "https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=2070&auto=format&fit=crop",
  },
];

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <FilterBar />
      
      <main className="max-w-screen-2xl mx-auto px-8 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleConvocatorias.map((conv) => (
            <ConvocatoriaCard key={conv.id} convocatoria={conv} />
          ))}
        </div>
      </main>
      
      <ValueSection />
      <StepsSection />
      <Footer />
    </div>
  );
}
