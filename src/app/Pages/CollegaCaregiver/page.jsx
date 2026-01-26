'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";

// --- ICONE SVG INTERNE ---
const Icons = {
  Users: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Shield: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>,
  Heart: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  Eye: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  Bell: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  Smartphone: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>,
  ArrowRight: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  Copy: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Check: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  UserPlus: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" x2="20" y1="8" y2="14"/><line x1="23" x2="17" y1="11" y2="11"/></svg>,
};

// --- UI COMPONENTS ---
const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className} transition-all`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", disabled }) => {
  const base = "inline-flex items-center justify-center rounded-lg font-bold text-sm transition-all focus:outline-none h-12 px-6 disabled:opacity-50 disabled:cursor-not-allowed w-full";
  const variants = {
    primary: "bg-[#14b8a6] text-white hover:bg-[#0d9488] shadow-md hover:shadow-lg", // Teal
    secondary: "bg-[#f97316] text-white hover:bg-[#ea580c] shadow-md hover:shadow-lg", // Orange
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50",
    ghost: "text-slate-500 hover:bg-slate-100",
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

const Badge = ({ children }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 mb-6">
    {children}
  </span>
);

// --- TOAST NOTIFICATION COMPONENT ---
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  const bg = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600';
  return (
    <div className={`fixed bottom-6 right-6 ${bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50`}>
      {type === 'success' ? <Icons.Check className="w-5 h-5"/> : <Icons.Shield className="w-5 h-5"/>}
      <span>{message}</span>
    </div>
  );
};

// --- MAIN PAGE ---
export default function CollegaCaregiver({ isAuthenticated: initialAuth = false }) {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
  const [selectedRole, setSelectedRole] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [inputCode, setInputCode] = useState("");
  const [toast, setToast] = useState({ message: null, type: null });

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

  // Helpers
  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast({ message: null, type: null }), 3000);
  };

  const generateCode = async () => {
    try {
      const res = await fetch('/api/relazioni/codice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: 'ASSISTITO' })
      });
      const data = await res.json();
      
      if (res.ok) {
        setGeneratedCode(data.code);
        showToast("Codice generato con successo!");
      } else {
        showToast(data.message || "Errore generazione codice", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Errore di comunicazione col server", "error");
    }
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      showToast("Copiato negli appunti!");
    }
  };

  const submitCode = async () => {
    if (inputCode.length === 6) {
      try {
        const res = await fetch('/api/relazioni/collega', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: inputCode })
        });
        const data = await res.json();

        if (res.ok) {
          showToast("Collegamento avvenuto con successo!", "success");
          setInputCode("");
          setTimeout(() => {
             window.location.href = '/Pages/HomePage';
          }, 2000);
        } else {
          showToast(data.message || "Codice non valido", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Errore di comunicazione col server", "error");
      }
    } else {
      showToast("Codice non valido", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      <Navbar isAuthenticated={isUserAuthenticated} onLogout={handleLogout} />
      
      {/* Toast Container */}
      <Toast message={toast.message} type={toast.type} />

      <main className="container mx-auto px-4 pt-10 pb-16">
        
        {/* Header Page */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge><Icons.Users className="w-3 h-3 mr-2" /> Connessione Caregiver</Badge>
          <h1 className="text-4xl font-bold text-slate-800 mb-4 tracking-tight">Collega un Caregiver</h1>
          <p className="text-slate-500 text-lg">
            Scegli se vuoi assistere qualcuno come caregiver o se desideri essere monitorato da un familiare o assistente di fiducia.
          </p>
        </div>

        {/* --- SELEZIONE RUOLO (Main View) --- */}
        {!selectedRole && (
          <div>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              {/* Card Caregiver (Teal) */}
              <Card className="hover:shadow-xl hover:-translate-y-1 cursor-pointer group border-slate-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icons.Shield className="w-10 h-10 text-[#14b8a6]" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Voglio Assistere</h2>
                  <p className="text-slate-500 mb-8">Diventa caregiver per un familiare o paziente</p>
                  
                  <ul className="space-y-4 text-left w-full mb-8 text-sm text-slate-600">
                    <li className="flex items-center gap-3"><Icons.Eye className="w-5 h-5 text-[#14b8a6]"/> Monitora l'aderenza terapeutica</li>
                    <li className="flex items-center gap-3"><Icons.Bell className="w-5 h-5 text-[#14b8a6]"/> Ricevi alert per mancate assunzioni</li>
                    <li className="flex items-center gap-3"><Icons.Smartphone className="w-5 h-5 text-[#14b8a6]"/> Gestisci terapie da remoto</li>
                  </ul>

                  <Button variant="primary" onClick={() => setSelectedRole("caregiver")}>
                    Genera Codice Invito <Icons.ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>

              {/* Card Paziente (Orange) */}
              <Card className="hover:shadow-xl hover:-translate-y-1 cursor-pointer group border-slate-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icons.Heart className="w-10 h-10 text-[#f97316]" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Voglio Essere Assistito</h2>
                  <p className="text-slate-500 mb-8">Collega un caregiver per monitorare la tua salute</p>
                  
                  <ul className="space-y-4 text-left w-full mb-8 text-sm text-slate-600">
                    <li className="flex items-center gap-3"><Icons.Users className="w-5 h-5 text-[#f97316]"/> Un familiare ti terrà d'occhio</li>
                    <li className="flex items-center gap-3"><Icons.Bell className="w-5 h-5 text-[#f97316]"/> Mai più farmaci dimenticati</li>
                    <li className="flex items-center gap-3"><Icons.Shield className="w-5 h-5 text-[#f97316]"/> Maggiore sicurezza quotidiana</li>
                  </ul>

                  <Button variant="secondary" onClick={() => setSelectedRole("paziente")}>
                    Inserisci Codice Caregiver <Icons.ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* How it works */}
            <div className="mt-20 text-center max-w-4xl mx-auto">
               <h3 className="text-xl font-bold text-slate-800 mb-10">Come Funziona?</h3>
               <div className="grid md:grid-cols-3 gap-10">
                  <div>
                     <div className="w-10 h-10 bg-teal-50 text-[#14b8a6] font-bold rounded-full flex items-center justify-center mx-auto mb-4">1</div>
                     <h4 className="font-bold text-slate-700 mb-2">Genera o Ricevi Codice</h4>
                     <p className="text-sm text-slate-500">Il caregiver genera un codice univoco da condividere.</p>
                  </div>
                  <div>
                     <div className="w-10 h-10 bg-teal-50 text-[#14b8a6] font-bold rounded-full flex items-center justify-center mx-auto mb-4">2</div>
                     <h4 className="font-bold text-slate-700 mb-2">Collegamento Sicuro</h4>
                     <p className="text-sm text-slate-500">Il paziente inserisce il codice per stabilire la connessione.</p>
                  </div>
                  <div>
                     <div className="w-10 h-10 bg-teal-50 text-[#14b8a6] font-bold rounded-full flex items-center justify-center mx-auto mb-4">3</div>
                     <h4 className="font-bold text-slate-700 mb-2">Monitoraggio Attivo</h4>
                     <p className="text-sm text-slate-500">Il caregiver può monitorare e ricevere alert in tempo reale.</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* --- CAREGIVER FLOW (Genera Codice) --- */}
        {selectedRole === "caregiver" && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
            <Card>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#14b8a6]">
                  <Icons.Shield className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Genera Codice Invito</h2>
                <p className="text-sm text-slate-500 mt-1">Condividi questo codice con il paziente.</p>
              </div>

              {!generatedCode ? (
                <Button variant="primary" onClick={generateCode}>
                  <Icons.UserPlus className="w-5 h-5 mr-2" /> Genera Nuovo Codice
                </Button>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center relative group">
                    <p className="text-3xl font-mono font-bold text-[#14b8a6] tracking-widest">{generatedCode}</p>
                    <button onClick={copyCode} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-lg text-slate-400 hover:text-[#14b8a6] transition-colors">
                       <Icons.Copy className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-center text-slate-400">Il codice scade tra 24 ore.</p>
                  <Button variant="outline" onClick={() => setGeneratedCode(null)}>Rigenera</Button>
                </div>
              )}

              <button onClick={() => setSelectedRole(null)} className="w-full mt-6 text-sm text-slate-400 hover:text-slate-600">
                 ← Torna indietro
              </button>
            </Card>
          </div>
        )}

        {/* --- PATIENT FLOW (Inserisci Codice) --- */}
        {selectedRole === "paziente" && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
            <Card>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#f97316]">
                  <Icons.Heart className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Inserisci Codice</h2>
                <p className="text-sm text-slate-500 mt-1">Inserisci il codice ricevuto dal caregiver.</p>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="ES: ABC123"
                  className="w-full text-center text-2xl font-mono font-bold tracking-widest h-14 rounded-xl border-2 border-slate-200 focus:border-[#f97316] focus:outline-none transition-colors uppercase placeholder:text-slate-300"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                />
                
                <Button variant="secondary" onClick={submitCode} disabled={inputCode.length !== 6}>
                   Collega Caregiver <Icons.ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <button onClick={() => setSelectedRole(null)} className="w-full mt-6 text-sm text-slate-400 hover:text-slate-600">
                 ← Torna indietro
              </button>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
}