'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";

// --- DEFINIZIONE COLORI ---
const primaryColorClass = "text-[#14b8a6]";
const bgPrimaryClass = "bg-[#14b8a6]";
const hoverBgPrimaryClass = "hover:bg-[#0d9488]"; // Una tonalità leggermente più scura per l'hover
const bgLightClass = "bg-[#f0fdfa]";
const borderPrimaryClass = "border-[#14b8a6]";
const focusRingClass = "focus:ring-[#14b8a6]";

// -- ICONE SVG INLINE --
const Icons = {
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
  Scan: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /></svg>,
  Pill: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>,
  AlertTriangle: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
  FileText: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
  ExternalLink: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>,
  ChevronDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
};

export default function Ricerca({ isAuthenticated: initialAuth = false }) {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [risultati, setRisultati] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // NUOVO: Stato per gestire la paginazione
  const ITEMS_PER_PAGE = 5;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setIsUserAuthenticated(data.isAuthenticated);
      } catch (err) {
        console.error("Errore verifica auth", err);
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();

    if (searchQuery.length < 3) {
      setRisultati([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/farmaci/cerca?q=${encodeURIComponent(searchQuery)}`);

        if (!res.ok) throw new Error("Errore API");

        const data = await res.json();
        setRisultati(data.farmaci || []);
        setHasSearched(true);
        setVisibleCount(ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Errore ricerca:", error);
        setRisultati([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsUserAuthenticated(false);
      window.location.href = '/Pages/Autenticazione';
    } catch (err) {
      console.error("Errore logout", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14b8a6]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <div className="fixed top-0 w-full z-50">
        <Navbar isAuthenticated={isUserAuthenticated} onLogout={handleLogout} />
      </div>

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">
              Accesso libero - Nessuna registrazione richiesta
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Database Farmaci <span className={primaryColorClass}>AIFA</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Cerca informazioni dettagliate su qualsiasi farmaco autorizzato in Italia.
              Dati ufficiali verificati e sempre aggiornati.
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-12 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icons.Search />
                  </div>
                  <input
                    placeholder="Cerca per nome farmaco, principio attivo o codice AIC..."
                    className={`w-full h-14 pl-12 pr-4 text-base bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 ${focusRingClass} transition-all placeholder:text-slate-400`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className={`w-5 h-5 border-2 ${borderPrimaryClass} border-t-transparent rounded-full animate-spin`}></div>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className={`h-14 px-8 ${bgPrimaryClass} ${hoverBgPrimaryClass} text-white font-medium rounded-lg transition-colors flex items-center justify-center`}
                >
                  Cerca
                </button>
              </form>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-400">
                <button className="flex items-center gap-2 hover:text-slate-700 transition-colors">
                  <Icons.Scan />
                  Scansiona barcode
                </button>
                <span>•</span>
                <span>Esempio: "Tachipirina", "Paracetamolo"</span>
              </div>
            </div>
          </div>

          {/* LISTA FARMACI */}
          {hasSearched && risultati.length > 0 ?(
            <div className="space-y-4 max-w-4xl mx-auto"> {/* max-w-4xl limita la larghezza */}
              {risultati.slice(0, visibleCount).map((medicine, index) => (
                <div
                  key={medicine.codice_aic || index}
                  // Card più compatta (p-5, rounded-2xl)
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-300"
                  style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s backwards` }}
                >
                  {/* Contenuto Superiore */}
                  <div className="flex flex-col md:flex-row gap-5 items-start">

                    {/* Icona più piccola (w-12 h-12) */}
                    <div className={`w-12 h-12 rounded-full ${bgLightClass} flex items-center justify-center shrink-0 ${primaryColorClass}`}>
                      <Icons.Pill />
                    </div>

                    <div className="flex-1 w-full">
                      {/* Titolo e Badge sulla stessa riga */}
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 leading-tight">
                            {medicine.denominazione} {medicine.dosaggio}
                          </h3>
                          <p className={`${primaryColorClass} font-medium text-sm`}>
                            {medicine.principio_attivo}
                          </p>
                        </div>
                        {/* Badge Formato Compatto */}
                        <span className={`border ${borderPrimaryClass} ${primaryColorClass} bg-white px-3 py-0.5 rounded-full text-xs font-bold whitespace-nowrap hidden sm:inline-block`}>
                          {medicine.unita_misura}
                        </span>
                      </div>

                      <p className="text-slate-500 text-sm mb-3 leading-snug line-clamp-2">
                        {medicine.descrizione}
                      </p>

                      {/* Metadati Piccoli */}
                      <div className="flex flex-wrap items-center gap-3 text-xs mb-4 text-slate-500">
                        <span className="font-bold text-slate-700">{medicine.ragione_sociale}</span>
                        <span>• AIC: {medicine.codice_aic}</span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          {medicine.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Azioni Compatte */}
                  <div className="border-t border-slate-100 pt-3 mt-1 flex flex-wrap items-center gap-2">

                    {/* Pulsanti Info (Outline e Piccoli) */}
                    <button className={`flex items-center px-3 py-1.5 text-xs font-bold ${primaryColorClass} bg-white border ${borderPrimaryClass} rounded-full hover:${bgLightClass} transition-colors`}>
                      <span className="mr-1.5 scale-75"><Icons.Info /></span> Scheda
                    </button>

                    <button className={`flex items-center px-3 py-1.5 text-xs font-bold ${primaryColorClass} bg-white border ${borderPrimaryClass} rounded-full hover:${bgLightClass} transition-colors`}>
                      <span className="mr-1.5 scale-75"><Icons.FileText /></span> Foglietto
                    </button>

                    {/* Pulsante Aggiungi (Tutto a destra) */}
                    <button className={`flex items-center px-4 py-1.5 text-xs font-bold text-white ${bgPrimaryClass} ${hoverBgPrimaryClass} rounded-lg transition-colors shadow-sm ml-auto w-full md:w-auto justify-center`}>
                      <span className="mr-1.5 scale-90"><Icons.Plus /></span> Aggiungi al mio armadietto
                    </button>
                  </div>

                </div>
              ))}

              {/* Load More Button */}
              {visibleCount < risultati.length && (
                <div className="text-center pt-6 pb-4">
                  <button
                    onClick={loadMore}
                    className={`inline-flex items-center px-6 py-2 border border-slate-200 shadow-sm text-sm font-bold rounded-full text-slate-600 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${focusRingClass} transition-all`}
                  >
                    Carica altri
                    <span className="ml-2"><Icons.ChevronDown /></span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="w-16 h-16 text-slate-300 mx-auto mb-4 flex items-center justify-center">
                <Icons.Pill />
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900">Nessun risultato trovato</h3>
              <p className="text-slate-500">
                Prova con un altro termine di ricerca o verifica l'ortografia.
              </p>
            </div>
          )}

          {/* Empty State - Before Search */}
          {!hasSearched && (
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                <div className={`bg-white p-6 rounded-xl border border-slate-200 text-center hover:border-[#14b8a6] transition-colors`}>
                  <div className={`w-12 h-12 rounded-xl ${bgLightClass} flex items-center justify-center mx-auto mb-4 ${primaryColorClass}`}>
                    <Icons.Pill />
                  </div>
                  <h3 className="font-bold mb-2 text-slate-900">Database Ufficiale</h3>
                  <p className="text-sm text-slate-500">
                    Dati provenienti direttamente dall'Agenzia Italiana del Farmaco
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-center hover:border-green-200 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-4 text-green-600">
                    <Icons.FileText />
                  </div>
                  <h3 className="font-bold mb-2 text-slate-900">Informazioni Complete</h3>
                  <p className="text-sm text-slate-500">
                    Schede tecniche, foglietti illustrativi e controindicazioni
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-center hover:border-amber-200 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-4 text-amber-600">
                    <Icons.AlertTriangle />
                  </div>
                  <h3 className="font-bold mb-2 text-slate-900">Verifica Interazioni</h3>
                  <p className="text-sm text-slate-500">
                    Controlla le interazioni tra farmaci per la tua sicurezza
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} MediGuard. Dati forniti da AIFA.
        </div>
      </footer>

      {/* Animazione custom */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}