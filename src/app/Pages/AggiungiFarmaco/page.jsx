'use client';

import { useState, useEffect } from "react";
import Link from "next/link"; // Assumo tu stia usando Next.js per i link, altrimenti usa <a>
import { Navbar } from "@/components/layout/Navbar"; // Assicurati che il percorso sia giusto

// --- ICONE SVG INLINE ---
const Icons = {
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  ),
  Pill: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
  ),
  Package: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-9"/></svg>
  ),
  Save: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
  )
};

export default function AggiungiFarmaco({ isAuthenticated: initialAuth = false }) {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
  
  // Stato del form
  const [formData, setFormData] = useState({
    nome: "", 
    principioAttivo: "", 
    dosaggio: "", 
    forma: "",
    quantita: "", 
    scadenza: "", 
    codiceAIC: "", 
    note: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setIsUserAuthenticated(data.isAuthenticated);
      } catch (err) {
        console.error("Errore verifica auth", err);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsUserAuthenticated(false);
      window.location.href = '/Pages/Autenticazione';
    } catch (err) {
      console.error("Errore logout", err);
    }
  };

  // Gestione Invio
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.nome || !formData.quantita) {
      alert("Per favore compila almeno Nome e Quantità.");
      setIsLoading(false);
      return;
    }

    // Simulazione chiamata API
    console.log("Dati inviati:", formData);
    
    // Simuliamo un ritardo di rete
    setTimeout(() => {
      alert(`${formData.nome} aggiunto con successo!`);
      setIsLoading(false);
      // Qui faresti il redirect: router.push('/inventario');
    }, 1000);
  };

  // Classi CSS riutilizzabili per mantenere il design pulito
  const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] transition-all";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* NAVBAR */}
      <Navbar isAuthenticated={isUserAuthenticated} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        
        {/* Header con Tasto Indietro */}
        <div className="mb-6">
          <Link href="Arnadietto" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-[#14b8a6] transition-colors mb-4">
            <div className="mr-1"><Icons.ArrowLeft /></div>
            Torna all'inventario
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Nuovo Farmaco</h1>
              <p className="text-slate-500 mt-1">Inserisci i dettagli del farmaco da aggiungere al tuo armadietto.</p>
            </div>
          </div>
        </div>

        {/* Card Principale del Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Intestazione Card */}
          <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="text-[#14b8a6]">
               <Icons.Pill />
            </div>
            <h2 className="font-semibold text-slate-800">Dettagli Prodotto</h2>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Riga 1: Nome e Principio Attivo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="nome" className={labelClass}>Nome Farmaco <span className="text-red-500">*</span></label>
                  <input 
                    id="nome" 
                    type="text"
                    placeholder="es. Tachipirina" 
                    className={inputClass}
                    value={formData.nome} 
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))} 
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="principioAttivo" className={labelClass}>Principio Attivo</label>
                  <input 
                    id="principioAttivo" 
                    type="text"
                    placeholder="es. Paracetamolo" 
                    className={inputClass}
                    value={formData.principioAttivo} 
                    onChange={(e) => setFormData(prev => ({ ...prev, principioAttivo: e.target.value }))} 
                  />
                </div>
              </div>

              {/* Riga 2: Dosaggio e Forma */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="dosaggio" className={labelClass}>Dosaggio</label>
                  <input 
                    id="dosaggio" 
                    type="text"
                    placeholder="es. 1000mg" 
                    className={inputClass}
                    value={formData.dosaggio} 
                    onChange={(e) => setFormData(prev => ({ ...prev, dosaggio: e.target.value }))} 
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="forma" className={labelClass}>Forma Farmaceutica</label>
                  <div className="relative">
                    <select 
                      id="forma"
                      className={`${inputClass} appearance-none bg-no-repeat bg-right pr-8`}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
                      value={formData.forma} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, forma: value }))}
                      onChange={(e) => setFormData(prev => ({ ...prev, forma: e.target.value }))}
                    >
                      <option value="" disabled>Seleziona forma</option>
                      <option value="compresse">Compresse</option>
                      <option value="capsule">Capsule</option>
                      <option value="sciroppo">Sciroppo</option>
                      <option value="gocce">Gocce</option>
                      <option value="bustine">Bustine</option>
                      <option value="fiale">Fiale</option>
                      <option value="crema">Crema/Pomata</option>
                      <option value="spray">Spray</option>
                      <option value="altro">Altro</option>
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100 my-2" />

              {/* Riga 3: Quantità e Scadenza */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label htmlFor="quantita" className={labelClass}>
                    <span className="flex items-center gap-2">
                       Quantità Totale <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Icons.Package />
                    </div>
                    <input 
                        id="quantita" 
                        type="number" 
                        placeholder="0" 
                        className={`${inputClass} pl-10`}
                        value={formData.quantita} 
                        onChange={(e) => setFormData(prev => ({ ...prev, quantita: e.target.value }))} 
                        required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Numero di unità (es. pillole o confezioni)</p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="scadenza" className={labelClass}>Data di Scadenza</label>
                  <input 
                    id="scadenza" 
                    type="date" 
                    className={inputClass}
                    value={formData.scadenza} 
                    onChange={(e) => setFormData(prev => ({ ...prev, scadenza: e.target.value }))} 
                  />
                </div>
              </div>

              {/* Riga 4: AIC e Note */}
              <div className="space-y-1">
                <label htmlFor="codiceAIC" className={labelClass}>Codice AIC</label>
                <input 
                  id="codiceAIC" 
                  type="text"
                  placeholder="es. 012745046" 
                  className={inputClass}
                  value={formData.codiceAIC} 
                  onChange={(e) => setFormData(prev => ({ ...prev, codiceAIC: e.target.value }))} 
                />
                <p className="text-xs text-slate-400 mt-1">Il codice identificativo che trovi sulla confezione.</p>
              </div>

              <div className="space-y-1">
                <label htmlFor="note" className={labelClass}>Note aggiuntive (opzionale)</label>
                <textarea 
                  id="note" 
                  rows={3}
                  placeholder="Esempio: Prendere dopo i pasti, conservare in frigo..." 
                  className={inputClass}
                  value={formData.note} 
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))} 
                />
              </div>

              {/* Footer Form: Pulsanti */}
              <div className="flex gap-4 pt-4 mt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                  onClick={() => window.history.back()}
                >
                  Annulla
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-[2] px-4 py-2.5 rounded-lg bg-[#14b8a6] text-white font-bold hover:bg-[#0d9488] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Icons.Save /> Salva Farmaco
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
};