'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { GuestOverlay } from "@/components/GuestOverlay";

// --- ICONE SVG INTERNE (Uniformate al sistema MediGuard) ---
const Icons = {
  Plus: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
  Pill: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>,
  Clock: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  CheckCircle: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  AlertTriangle: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>,
  ArrowLeft: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>,
  Package: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-9" /></svg>,
};

// --- COMPONENTI UI LOCALI (Basati su page.jsx esistenti) ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "primary", className = "" }) => {
  const variants = {
    primary: "bg-[#14b8a6] text-white hover:bg-[#0d9488] shadow-md",
    secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
  };
  return (
    <button onClick={onClick} className={`inline-flex items-center justify-center rounded-lg font-bold text-sm transition-all h-11 px-6 ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    success: "bg-teal-50 text-[#14b8a6] border-teal-100",
    warning: "bg-amber-50 text-amber-600 border-amber-100",
    destructive: "bg-rose-50 text-rose-600 border-rose-100",
    default: "bg-slate-100 text-slate-600 border-slate-200"
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[variant]}`}>{children}</span>;
};

// --- LOGICA DELLA PAGINA ---
export default function AssistitoDetail() {
  const params = useParams(); // Recupera i parametri dall'URL
  const patientId = params.id; // Questo sarà l'ID passato (es. "1")
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("panoramica");

  // Mock data coerenti con Caregiver/page.jsx
  const assistito = {
    nome: "Maria Rossi",
    relazione: "Madre",
    eta: 78,
    lastActivity: "12:15",
    stats: { farmaci: 4, terapie: 3, oggi: "2/3", alert: 1 }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me'); // Verifica auth reale come nelle altre pagine
        const data = await res.json();
        setIsUserAuthenticated(data.isAuthenticated);
      } catch (err) {
        console.error("Errore verifica auth", err);
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }); // Gestione logout come da standard
      setIsUserAuthenticated(false);
      window.location.href = '/Pages/Autenticazione';
    } catch (err) { console.error(err); }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14b8a6]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar isAuthenticated={isUserAuthenticated} onLogout={handleLogout} />

      {!isUserAuthenticated && (
        <GuestOverlay
          title="Dettaglio Assistito"
          description="Monitora lo stato di salute e le terapie dei tuoi cari da remoto."
          features={["Storico assunzioni in tempo reale", "Gestione scorte farmaci", "Alert personalizzati"]}
        />
      )}

      <main className="pt-10 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">

          {/* Back Button */}
          <Link href="/Pages/Caregiver" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-[#14b8a6] mb-6 transition-colors">
            <Icons.ArrowLeft className="w-4 h-4 mr-2" /> Torna alla Dashboard Caregiver
          </Link>

          {/* Header Assistito */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{assistito.nome}</h1>
              <p className="text-slate-500">{assistito.relazione} • {assistito.eta} anni • Ultima attività: {assistito.lastActivity}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="primary"><Icons.CheckCircle className="w-5 h-5 mr-2" /> Registra Assunzione</Button>
            </div>
          </div>

          {/* Grid Statistiche (Stesso stile di Caregiver/page.jsx) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Icons.Pill className="text-[#14b8a6]" />} bg="bg-teal-50" value={assistito.stats.farmaci} label="Farmaci Attivi" />
            <StatCard icon={<Icons.Clock className="text-blue-500" />} bg="bg-blue-50" value={assistito.stats.terapie} label="Terapie In Corso" />
            <StatCard icon={<Icons.CheckCircle className="text-emerald-500" />} bg="bg-emerald-50" value={assistito.stats.oggi} label="Assunzioni Oggi" />
            <StatCard icon={<Icons.AlertTriangle className="text-rose-500" />} bg="bg-rose-50" value={assistito.stats.alert} label="Alert Attivi" />
          </div>

          {/* Tabs Navigation (Stile pulito MediGuard) */}
          <div className="flex gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-xl w-fit">
            {["panoramica", "armadietto", "terapie"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? "bg-white text-[#14b8a6] shadow-md" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="space-y-6">
            {activeTab === "panoramica" && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Icons.Clock className="w-5 h-5 text-slate-400" /> Programma di Oggi</h3>
                    <div className="space-y-4">
                      <DailyIntakeRow name="Cardioaspirina" dose="100mg" time="08:00" status="confermata" />
                      <DailyIntakeRow name="Metformina" dose="500mg" time="08:00" status="confermata" />
                      <DailyIntakeRow name="Enalapril" dose="10mg" time="20:00" status="in_attesa" />
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="p-6 border-l-4 border-l-rose-500">
                    <h3 className="font-bold text-rose-600 mb-2 flex items-center gap-2"><Icons.AlertTriangle className="w-5 h-5" /> Alert Critici</h3>
                    <p className="text-sm text-slate-600">Assunzione Enalapril mancata alle 08:00 di ieri.</p>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "armadietto" && (
              <Card className="p-12 text-center border-dashed border-2">
                <Icons.Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-slate-800 text-lg">Armadietto Remoto</h3>
                <p className="text-slate-500 mb-6 max-w-xs mx-auto">Visualizza e gestisci i farmaci disponibili nell'armadietto di {assistito.nome}.</p>
                <Button variant="secondary"><Icons.Plus className="w-4 h-4 mr-2" /> Aggiungi Farmaco</Button>
              </Card>
            )}

            {activeTab === "terapie" && (
              <Card className="p-12 text-center border-dashed border-2">
                <Icons.Pill className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-slate-800 text-lg">Piani Terapeutici</h3>
                <p className="text-slate-500 mb-6 max-w-xs mx-auto">Modifica orari, dosaggi e frequenze delle assunzioni.</p>
                <Button variant="secondary"><Icons.Plus className="w-4 h-4 mr-2" /> Nuova Terapia</Button>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-10 text-center text-sm text-slate-400 bg-white">
        <p>© 2024 MediGuard. La tua salute, organizzata.</p>
      </footer>
    </div>
  );
}

// --- COMPONENTI HELPER INTERNI ---
function StatCard({ icon, bg, value, label }) {
  return (
    <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        {/* Usiamo cloneElement per iniettare la classe nell'icona mockata */}
        {require('react').cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none mb-1">{value}</p>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
      </div>
    </Card>
  );
}

function DailyIntakeRow({ name, dose, time, status }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700">
          {time.split(':')[0]}
        </div>
        <div>
          <p className="font-bold text-slate-800 leading-tight">{name}</p>
          <p className="text-xs text-slate-500">{dose} • Orario previsto: {time}</p>
        </div>
      </div>
      <Badge variant={status === 'confermata' ? 'success' : 'warning'}>
        {status === 'confermata' ? 'Assunto' : 'In attesa'}
      </Badge>
    </div>
  );
}