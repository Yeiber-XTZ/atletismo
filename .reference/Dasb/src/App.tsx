/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  LayoutDashboard, 
  Building2, 
  Star, 
  Calendar, 
  Trophy, 
  Newspaper, 
  HelpCircle, 
  Search, 
  Bell, 
  LogOut, 
  Save, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Code,
  Bolt,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('global');

  return (
    <div className="flex min-h-screen bg-background text-on-surface selection:bg-primary/20">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-outline-variant bg-surface py-6 md:flex z-50">
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Building2 className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-headline text-sm font-black uppercase leading-none tracking-tight">
                Liga Atletismo
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Global Config" 
            active={activeTab === 'global'} 
            onClick={() => setActiveTab('global')} 
          />
          <SidebarItem 
            icon={<Building2 size={20} />} 
            label="Institutional" 
            active={activeTab === 'institutional'} 
            onClick={() => setActiveTab('institutional')} 
          />
          <SidebarItem 
            icon={<Star size={20} />} 
            label="Hero Section" 
            active={activeTab === 'hero'} 
            onClick={() => setActiveTab('hero')} 
          />
          <SidebarItem 
            icon={<Calendar size={20} />} 
            label="Calendar" 
            active={activeTab === 'calendar'} 
            onClick={() => setActiveTab('calendar')} 
          />
          <SidebarItem 
            icon={<Trophy size={20} />} 
            label="Records" 
            active={activeTab === 'records'} 
            onClick={() => setActiveTab('records')} 
          />
          <SidebarItem 
            icon={<Newspaper size={20} />} 
            label="News" 
            active={activeTab === 'news'} 
            onClick={() => setActiveTab('news')} 
          />
        </nav>

        <div className="mt-auto px-6">
          <a href="#" className="flex items-center gap-3 py-3 text-slate-400 transition-colors hover:text-primary">
            <HelpCircle size={20} />
            <span className="text-xs font-medium">Help Center</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-outline-variant bg-surface/80 px-8 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h2 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface">
              Admin Chocó Athlétique
            </h2>
            <div className="rounded bg-primary-container px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary">
              Live
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden items-center rounded-lg bg-surface-container-low px-4 py-2 sm:flex">
              <Search className="text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search parameters..." 
                className="w-48 border-none bg-transparent px-2 text-xs font-medium placeholder-slate-400 focus:ring-0"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="text-slate-500 transition-colors hover:text-primary">
                <Bell size={20} />
              </button>
              <button className="text-slate-500 transition-colors hover:text-primary">
                <Settings size={20} />
              </button>
              <div className="flex items-center gap-3 border-l border-outline-variant pl-2">
                <div className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant">
                  <img 
                    src="https://picsum.photos/seed/admin/100/100" 
                    alt="Admin" 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <button className="font-headline text-xs font-bold uppercase text-slate-600 transition-colors hover:text-primary">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="mx-auto max-w-7xl px-8 py-12">
          <div className="mb-16 flex items-end justify-between">
            <div>
              <span className="mb-2 block font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Configuration Dashboard
              </span>
              <h3 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">
                Control <span className="text-primary">Panel</span>
              </h3>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-2 text-[10px] font-bold uppercase text-slate-500 ambient-shadow">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary"></span>
              System Synchronized
            </div>
          </div>

          <div className="space-y-20">
            {/* 01. Global Config */}
            <section id="global" className="scroll-mt-24">
              <SectionHeader number="01" title="Global Config" />
              <div className="rounded-2xl border border-outline-variant bg-surface p-10 ambient-shadow">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                  <div className="space-y-8">
                    <InputGroup label="Site Name" defaultValue="Liga de Atletismo del Chocó" />
                    <div>
                      <label className="mb-3 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Logo URL
                      </label>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          defaultValue="https://brand.assets/logo_choco.png"
                          className="flex-1 rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm font-medium transition-all focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-outline-variant bg-surface text-slate-400">
                          <ImageIcon size={20} />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <ColorPicker label="Primary Color" color="#006B1B" />
                      <ColorPicker label="Secondary Color" color="#FDE047" />
                    </div>
                  </div>
                  <div className="space-y-8">
                    <TextAreaGroup 
                      label="Contact Info" 
                      placeholder="Calle 25 #4-52, Quibdó, Chocó. Tel: +57 604 671 2233" 
                      className="h-32"
                    />
                    <TextAreaGroup 
                      label="Social Links (JSON)" 
                      defaultValue='{ "facebook": "fb.com/chocoatletico", "instagram": "@chocoatletico" }'
                      className="h-24 font-mono text-[11px] text-slate-500"
                    />
                  </div>
                </div>
                <div className="mt-10 flex justify-end">
                  <button className="flex items-center gap-2 rounded-lg bg-primary px-10 py-3.5 font-headline font-bold text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-95">
                    SAVE SETTINGS
                    <Save size={18} />
                  </button>
                </div>
              </div>
            </section>

            {/* 02. Institutional Content */}
            <section id="institutional" className="scroll-mt-24">
              <SectionHeader number="02" title="Institutional Content" />
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                  <div className="rounded-2xl border border-outline-variant bg-surface p-8 ambient-shadow">
                    <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-primary">
                      Federation Description
                    </label>
                    <textarea 
                      className="h-40 w-full rounded-xl border border-outline-variant bg-surface-container-low p-6 text-sm leading-relaxed transition-all focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10 outline-none"
                      defaultValue="La Liga de Atletismo del Chocó es la entidad rectora del deporte base en el departamento. Nuestra misión es potenciar el talento innato de los jóvenes chocoanos, brindando estructuras de alto rendimiento que les permitan brillar en escenarios nacionales e internacionales."
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="rounded-2xl border border-outline-variant bg-surface p-8 ambient-shadow">
                      <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-primary">
                        Mission
                      </label>
                      <textarea 
                        className="h-32 w-full rounded-xl border border-outline-variant bg-surface-container-low p-5 text-sm leading-relaxed transition-all focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10 outline-none"
                        defaultValue="Fomentar y desarrollar el atletismo en el Chocó, promoviendo la inclusión social y la excelencia deportiva."
                      />
                    </div>
                    <div className="rounded-2xl border border-outline-variant bg-surface p-8 ambient-shadow">
                      <label className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-primary">
                        Vision
                      </label>
                      <textarea 
                        className="h-32 w-full rounded-xl border border-outline-variant bg-surface-container-low p-5 text-sm leading-relaxed transition-all focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10 outline-none"
                        defaultValue="Ser la liga líder en Colombia para el año 2028, reconocida por formar medallistas olímpicos de talla mundial."
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col rounded-2xl border border-outline-variant bg-surface-container-low p-8">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary/5">
                    <Bolt className="text-primary" size={20} />
                  </div>
                  <h5 className="mb-4 font-headline text-base font-bold text-on-surface">Institutional Tips</h5>
                  <p className="mb-auto text-xs leading-relaxed text-slate-500">
                    Mantén las descripciones concisas y potentes. Usa verbos de acción como "Liderar", "Transformar" y "Ganar" para reflejar el espíritu competitivo de nuestra liga.
                  </p>
                  <button className="mt-8 w-full rounded-lg border border-primary bg-surface py-3.5 font-headline font-bold text-primary shadow-sm transition-all hover:bg-primary hover:text-white">
                    UPDATE CONTENT
                  </button>
                </div>
              </div>
            </section>

            {/* 03. Hero Section */}
            <section id="hero" className="scroll-mt-24">
              <SectionHeader number="03" title="Hero Section" />
              <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface ambient-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-5">
                  <div className="p-10 lg:col-span-3">
                    <div className="space-y-8">
                      <InputGroup 
                        label="Hero Main Title" 
                        defaultValue="VELOCIDAD QUE CORRE POR LAS VENAS" 
                        className="font-headline text-2xl font-black"
                      />
                      <InputGroup 
                        label="Hero Subtitle" 
                        defaultValue="Entrena con los mejores atletas del Pacífico colombiano" 
                        className="font-medium text-slate-500"
                      />
                      <InputGroup 
                        label="Cover Image URL" 
                        defaultValue="https://images.chocoatletico.com/hero-bg.jpg" 
                        className="font-mono text-xs text-primary"
                      />
                      <div className="flex gap-4 pt-4">
                        <button className="rounded-lg bg-primary px-10 py-3.5 font-headline font-bold text-white transition-all hover:shadow-lg hover:shadow-primary/20">
                          SAVE CHANGES
                        </button>
                        <button className="rounded-lg bg-surface-container-low px-10 py-3.5 font-headline font-bold text-slate-600 transition-all hover:bg-surface-container-highest">
                          PREVIEW HERO
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative min-h-[350px] lg:col-span-2">
                    <img 
                      src="https://picsum.photos/seed/athlete/800/600" 
                      alt="Hero Preview" 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-8 text-white">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-70">Live Preview</span>
                      <h6 className="font-headline text-xl font-black uppercase italic tracking-tight">Power & Speed</h6>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 04. Competition Calendar */}
            <section id="calendar" className="scroll-mt-24">
              <SectionHeader number="04" title="Competition Calendar" />
              <div className="rounded-2xl border border-outline-variant bg-surface p-10 ambient-shadow">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Code className="text-primary" size={20} />
                    <span className="font-headline text-xs font-bold uppercase text-on-surface">Event Data (JSON)</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200"></span>
                  </div>
                </div>
                <div className="mb-8 rounded-xl border border-outline-variant bg-surface-container-low p-8 font-mono text-[13px] leading-relaxed text-slate-600">
                  <pre>
{`[
  {
    "id": "EVT-2024-001",
    "name": "Grand Prix del Pacífico",
    "date": "2024-06-15",
    "location": "Estadio La Flora, Quibdó",
    "status": "active"
  },
  {
    "id": "EVT-2024-002",
    "name": "Nacional de Velocidad",
    "date": "2024-08-22",
    "location": "Istmina Central",
    "status": "pending"
  }
]`}
                  </pre>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] italic text-slate-400">Always validate JSON syntax before deploying updates.</p>
                  <button className="rounded-lg bg-primary px-12 py-3.5 font-headline font-bold text-white transition-all hover:shadow-lg hover:shadow-primary/20">
                    PUBLISH UPDATES
                  </button>
                </div>
              </div>
            </section>

            {/* 05. Records Table */}
            <section id="records" className="scroll-mt-24">
              <SectionHeader number="05" title="Records Table" />
              <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface ambient-shadow">
                <div className="flex items-center justify-between border-b border-outline-variant px-8 py-6">
                  <h5 className="font-headline text-sm font-bold uppercase tracking-tight text-on-surface">
                    Athlete Performance Records
                  </h5>
                  <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-primary transition-all hover:bg-primary-container">
                    <PlusCircle size={20} />
                    <span className="text-[10px] font-black uppercase">New Entry</span>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-surface-container-low text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        <th className="px-8 py-4">Athlete / Event</th>
                        <th className="px-8 py-4">Category</th>
                        <th className="px-8 py-4">Mark/Time</th>
                        <th className="px-8 py-4">Date Set</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant text-[13px]">
                      <RecordRow 
                        name="Jhonathan Córdoba" 
                        event="100m Planos" 
                        category="U20" 
                        mark="10.12s" 
                        date="12/03/2023" 
                      />
                      <RecordRow 
                        name="Marlenys Palacios" 
                        event="Salto Largo" 
                        category="Senior" 
                        mark="6.45m" 
                        date="05/11/2022" 
                      />
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end border-t border-outline-variant p-8">
                  <button className="rounded-lg bg-primary px-10 py-3.5 font-headline font-bold text-white transition-all hover:shadow-lg">
                    COMMIT CHANGES
                  </button>
                </div>
              </div>
            </section>
          </div>

          <footer className="mt-24 flex flex-col items-center justify-between gap-6 border-t border-outline-variant pt-10 md:flex-row">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              © 2024 Liga de Atletismo del Chocó - Admin Core v2.5.0
            </p>
            <div className="flex gap-8">
              <FooterLink label="Documentation" />
              <FooterLink label="System Status" />
              <FooterLink label="Changelog" />
            </div>
          </footer>
        </div>
      </main>

      {/* Contextual FAB */}
      <button className="group fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/20 transition-all hover:scale-110 active:scale-90">
        <Bolt size={24} />
        <span className="pointer-events-none absolute right-16 rounded bg-on-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white opacity-0 transition-opacity group-hover:opacity-100">
          Quick Actions
        </span>
      </button>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
        active 
          ? 'bg-surface-container-low text-primary font-bold' 
          : 'text-slate-500 hover:bg-surface-container-low hover:text-primary'
      }`}
    >
      <span className={active ? 'text-primary' : 'text-slate-400'}>{icon}</span>
      <span className="font-headline text-xs tracking-tight">{label}</span>
    </button>
  );
}

function SectionHeader({ number, title }: { number: string, title: string }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="h-px w-8 bg-primary/30"></div>
      <h4 className="font-headline text-sm font-extrabold uppercase tracking-[0.2em] text-slate-400">
        {number}. {title}
      </h4>
    </div>
  );
}

function InputGroup({ label, defaultValue, className = "" }: { label: string, defaultValue: string, className?: string }) {
  return (
    <div>
      <label className="mb-3 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <input 
        type="text" 
        defaultValue={defaultValue}
        className={`w-full rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm font-medium transition-all focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 outline-none ${className}`}
      />
    </div>
  );
}

function TextAreaGroup({ label, defaultValue = "", placeholder = "", className = "" }: { label: string, defaultValue?: string, placeholder?: string, className?: string }) {
  return (
    <div>
      <label className="mb-3 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <textarea 
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm font-medium transition-all focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 outline-none resize-none ${className}`}
      />
    </div>
  );
}

function ColorPicker({ label, color }: { label: string, color: string }) {
  return (
    <div>
      <label className="mb-3 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-2">
        <div className="h-7 w-7 rounded" style={{ backgroundColor: color }}></div>
        <input 
          type="text" 
          defaultValue={color}
          className="w-full border-none bg-transparent text-[11px] font-bold uppercase focus:ring-0"
        />
      </div>
    </div>
  );
}

function RecordRow({ name, event, category, mark, date }: { name: string, event: string, category: string, mark: string, date: string }) {
  return (
    <tr className="transition-colors hover:bg-surface-container-low/50">
      <td className="px-8 py-5">
        <div className="font-bold text-on-surface">{name}</div>
        <div className="text-[11px] italic text-slate-400">{event}</div>
      </td>
      <td className="px-8 py-5 text-slate-600">{category}</td>
      <td className="px-8 py-5 font-bold text-primary">{mark}</td>
      <td className="px-8 py-5 text-slate-400">{date}</td>
      <td className="px-8 py-5 text-right">
        <div className="flex justify-end gap-2">
          <button className="text-slate-300 transition-colors hover:text-primary">
            <Edit2 size={18} />
          </button>
          <button className="text-slate-300 transition-colors hover:text-red-500">
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function FooterLink({ label }: { label: string }) {
  return (
    <a href="#" className="text-[10px] font-bold uppercase text-slate-400 transition-colors hover:text-primary">
      {label}
    </a>
  );
}

