/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_DOCUMENTS, CATEGORIES } from './constants';
import { Document } from './types';

export default function App() {
  const [selectedDoc, setSelectedDoc] = useState<Document>(MOCK_DOCUMENTS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-surface-bright/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(11,54,29,0.08)]">
        <div className="flex justify-between items-center px-8 py-4 w-full max-w-screen-2xl mx-auto">
          <div className="text-2xl font-black text-primary italic font-headline uppercase tracking-tight">
            Chocó Athletic Vault
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-primary border-b-4 border-primary pb-1 font-headline uppercase tracking-tight" href="#">Documents</a>
            <a className="text-tertiary font-medium font-headline uppercase tracking-tight hover:bg-surface-container-highest transition-colors px-2 py-1" href="#">Records</a>
            <a className="text-tertiary font-medium font-headline uppercase tracking-tight hover:bg-surface-container-highest transition-colors px-2 py-1" href="#">Rules</a>
            <a className="text-tertiary font-medium font-headline uppercase tracking-tight hover:bg-surface-container-highest transition-colors px-2 py-1" href="#">Governance</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="bg-primary text-on-primary px-6 py-2 font-headline font-bold uppercase tracking-widest slanted-edge hover:scale-95 duration-200 ease-in-out">
              Sign In
            </button>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-20 px-8 max-w-screen-2xl mx-auto flex-grow">
        {/* Hero Search Section */}
        <section className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative py-12 px-10 rounded-xl bg-surface-container-low overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[15rem] translate-x-20 -translate-y-10" style={{ fontVariationSettings: "'FILL' 1" }}>folder_open</span>
            </div>
            <h1 className="font-headline text-5xl font-black text-primary uppercase mb-4 tracking-tighter">
              Public Document Repository
            </h1>
            <p className="text-lg text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
              Access official statutes, technical regulations, and assembly minutes of the Chocó Athletic Federation. Transparent governance for a faster future.
            </p>
            
            {/* Large Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
              <div className="flex-grow relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">search</span>
                <input 
                  className="w-full pl-12 pr-6 py-4 bg-white border-none rounded-lg shadow-sm focus:ring-2 focus:ring-primary text-on-surface font-medium" 
                  placeholder="Search by name, year or document type..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <select className="bg-white border-none px-6 py-4 rounded-lg shadow-sm font-label text-sm font-bold uppercase tracking-wider text-on-surface-variant">
                  <option>All Categories</option>
                  <option>Statutes</option>
                  <option>Regulations</option>
                  <option>Assembly Acts</option>
                </select>
                <button className="bg-secondary text-on-secondary-container px-8 py-4 font-headline font-bold uppercase tracking-widest slanted-edge hover:brightness-110 transition-all">
                  Filter
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Document Grid (Left/Center) */}
          <div className="lg:col-span-8">
            <div className="flex justify-between items-end mb-8 border-b-4 border-surface-container pb-4">
              <h2 className="font-headline text-2xl font-extrabold uppercase text-primary italic">Recent Publications</h2>
              <span className="font-label text-xs font-bold text-tertiary bg-tertiary-container px-3 py-1 rounded-full uppercase tracking-tighter">
                {MOCK_DOCUMENTS.length} Documents Found
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_DOCUMENTS.map((doc, index) => (
                <motion.div 
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedDoc(doc)}
                  className={`group cursor-pointer p-6 rounded-xl transition-all border-l-4 ${doc.accentColor} shadow-sm hover:shadow-md ${selectedDoc.id === doc.id ? 'bg-surface-bright' : 'bg-surface-container-lowest hover:bg-surface-bright'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>{doc.icon}</span>
                    <span className="bg-tertiary/10 text-tertiary font-label text-[10px] font-black uppercase px-2 py-1 rounded">
                      {doc.type} • {doc.size}
                    </span>
                  </div>
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors uppercase leading-tight">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">
                    {doc.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-bold text-outline uppercase">Published: {doc.publishedDate}</span>
                    <div className="flex gap-2">
                      <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors" title="Previsualizar">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors" title="Descargar">
                        <span className="material-symbols-outlined">download</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Preview Panel (Right) */}
          <aside className="lg:col-span-4">
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedDoc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="sticky top-28 bg-white border border-outline-variant/15 rounded-2xl overflow-hidden shadow-xl"
              >
                <div className="bg-primary p-4 flex justify-between items-center">
                  <h4 className="font-headline text-on-primary font-bold uppercase tracking-wider text-sm">Preview Panel</h4>
                  <span className="material-symbols-outlined text-on-primary">open_in_full</span>
                </div>
                <div className="p-6 bg-surface-container-low/30 min-h-[500px] flex flex-col">
                  <div className="mb-4">
                    <h5 className="font-headline text-lg font-black text-primary leading-tight uppercase">{selectedDoc.title}</h5>
                    <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest mt-1">Official Document • {selectedDoc.type}</p>
                  </div>
                  
                  <div className="flex-grow bg-white border border-outline-variant/20 rounded shadow-inner p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80 flex items-end justify-center pb-8">
                      <button className="bg-primary text-on-primary px-6 py-3 font-headline font-bold uppercase tracking-widest text-xs flex items-center gap-2 slanted-edge hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-sm">download</span> Descargar Full Document
                      </button>
                    </div>
                    
                    {/* Mock Document Content */}
                    <div className="space-y-4 opacity-40 select-none">
                      <div className="h-4 bg-surface-variant rounded w-3/4"></div>
                      <div className="h-4 bg-surface-variant rounded w-full"></div>
                      <div className="h-4 bg-surface-variant rounded w-5/6"></div>
                      <div className="h-4 bg-surface-variant rounded w-4/6"></div>
                      <div className="h-32 bg-surface-container-highest rounded w-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-outline-variant">image</span>
                      </div>
                      <div className="h-4 bg-surface-variant rounded w-full"></div>
                      <div className="h-4 bg-surface-variant rounded w-full"></div>
                      <div className="h-4 bg-surface-variant rounded w-1/2"></div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-on-surface-variant uppercase">Signatory:</span>
                      <span className="text-on-surface">{selectedDoc.signatory || 'Comité Ejecutivo'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-on-surface-variant uppercase">Hash ID:</span>
                      <span className="text-on-surface font-mono">{selectedDoc.hashId || 'CH-XXXX-XX'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-on-surface-variant uppercase">Status:</span>
                      <span className="text-primary font-bold uppercase tracking-tighter">{selectedDoc.status || 'Verified Official'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </aside>
        </div>

        {/* Featured Categories Grid */}
        <section className="mt-24">
          <h2 className="font-headline text-3xl font-black text-primary uppercase mb-10 tracking-tighter slanted-edge bg-surface-variant inline-block pr-12 pl-4 py-2">
            Deep Archive Explorer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, index) => (
              <motion.div 
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${cat.bgColor} p-8 flex flex-col gap-4 kinetic-slant cursor-pointer`}
              >
                <span className="material-symbols-outlined text-primary text-4xl">{cat.icon}</span>
                <h3 className="font-headline font-bold text-xl uppercase">{cat.title}</h3>
                <p className="text-xs text-on-surface-variant font-medium">{cat.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low w-full mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 w-full max-w-screen-2xl mx-auto gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="font-headline font-bold text-primary text-xl uppercase">Chocó Athletic Federation</div>
            <div className="font-body text-sm text-tertiary">
              © 2024 Chocó Athletic Federation. Kinetic Tropics Digital Systems.
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-tertiary font-body text-sm hover:text-primary transition-all opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
            <a className="text-tertiary font-body text-sm hover:text-primary transition-all opacity-80 hover:opacity-100" href="#">Terms of Service</a>
            <a className="text-tertiary font-body text-sm hover:text-primary transition-all opacity-80 hover:opacity-100" href="#">Accessibility</a>
            <a className="text-tertiary font-body text-sm hover:text-primary transition-all opacity-80 hover:opacity-100" href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
