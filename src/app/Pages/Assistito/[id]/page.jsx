'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { GuestOverlay } from "@/components/GuestOverlay";
import MedicationDetailsModal from "@/components/modals/MedicationDetailsModal";
import AddMedicationModal from "@/components/modals/AddMedicationModal";
import EditMedicationModal from "@/components/modals/EditMedicationModal";
import DeleteMedicationModal from "@/components/modals/DeleteMedicationModal";
import AddTherapyModal from "@/components/modals/AddTherapyModal";
import TherapyDetailsModal from "@/components/modals/TherapyDetailsModal";
import DeleteTherapyModal from "@/components/modals/DeleteTherapyModal";

import { useTherapies } from "@/hooks/useTherapies";

// --- ICONE SVG INTERNE ---
const Icons = {
  Plus: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
  Pill: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>,
  Clock: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  Eye: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
  CheckCircle: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  Edit: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>,
  Pause: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
  Play: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
  Trash2: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>,
  AlertTriangle: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>,
  ArrowLeft: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>,
  Package: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-9" /></svg>,
};

// --- COMPONENTI UI LOCALI ---
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

export default function AssistitoDetail() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id;

  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("panoramica");
  const [modalState, setModalState] = useState({ type: null, data: null });

  const { therapyPlans, fetchTherapies, isLoading: isTherapyLoading } = useTherapies();

  const [data, setData] = useState({
    info: null,
    assunzioniOggi: [],
    armadietto: [],
    loading: true
  });

  const handleToggleStatus = async (terapia) => {
    try {
      const res = await fetch(`/api/terapia`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_terapia: terapia.id_terapia,
          terapia_attiva: !terapia.terapia_attiva // Inverte lo stato attuale
        })
      });
      if (res.ok) fetchTherapies(patientId);
    } catch (err) {
      console.error("Errore nel cambio stato terapia:", err);
    }
  };

  const initPage = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setIsUserAuthenticated(authData.isAuthenticated);

      if (authData.isAuthenticated) {
        const resAccount = await fetch('/api/RUD-account?me');
        const userData = await resAccount.json();

        const relazione = userData.caregiver?.find(r => r.id_assistito === patientId);
        const infoPaziente = relazione?.assistito;

        if (!infoPaziente) {
          console.error("Assistito non trovato o non collegato");
          setData(prev => ({ ...prev, loading: false }));
          return;
        }

        fetchTherapies(patientId);

        const oggi = new Date().toISOString().split('T')[0];
        const resAssunzioni = await fetch(`/api/assunzione?id_utente=${patientId}&data_programmata=${oggi}`);
        const assunzioniData = await resAssunzioni.json();

        const resArmadietto = await fetch(`/api/antonio?id_utente=${patientId}`);
        const armadiettoData = await resArmadietto.json();

        setData({
          info: infoPaziente,
          assunzioniOggi: assunzioniData.data || [],
          armadietto: armadiettoData.data || [],
          loading: false
        });
      }
    } catch (err) {
      console.error("Errore fetch dati:", err);
      setData(prev => ({ ...prev, loading: false }));
    } finally {
      setIsAuthChecking(false);
    }
  };

  const handleSuccess = () => {
    initPage();
    setModalState({ type: null, data: null });
  };

  useEffect(() => {
    if (patientId) {
      initPage();
    }
  }, [patientId]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsUserAuthenticated(false);
      window.location.href = '/Pages/Autenticazione';
    } catch (err) { console.error(err); }
  };

  if (isAuthChecking || data.loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14b8a6]"></div>
      </div>
    );
  }

  const { info, assunzioniOggi, armadietto } = data;
  const stats = info?.dashboardStats || {};

  // Da inserire dentro AssistitoDetail, prima del return
  const generateAlerts = () => {
    const alerts = [];
    const oraAttuale = new Date();

    // 1. Alert Ritardo e Mancata Assunzione
    assunzioniOggi.forEach(ass => {
      const dataProgrammata = new Date(ass.data_programmata);
      const differenzaMinuti = (oraAttuale - dataProgrammata) / (1000 * 60);

      if (!ass.esito) { // Se non è ancora stata assunta
        if (differenzaMinuti > 120) { // Più di 2 ore di ritardo
          alerts.push({
            id: `mancata-${ass.id_evento}`,
            type: 'critical',
            title: 'Assunzione Mancata',
            message: `L'assunzione di ${ass.terapia?.farmaco?.farmaco?.denominazione} delle ${dataProgrammata.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})} è saltata.`,
            icon: <Icons.AlertTriangle className="text-rose-500" />
          });
        } else if (differenzaMinuti > 15) { // Tra 15 min e 2 ore
          alerts.push({
            id: `ritardo-${ass.id_evento}`,
            type: 'warning',
            title: 'Ritardo Assunzione',
            message: `${info.nome} è in ritardo con ${ass.terapia?.farmaco?.farmaco?.denominazione} (prevista per le ${dataProgrammata.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}).`,
            icon: <Icons.Clock className="text-amber-500" />
          });
        }
      }
    });

    // 2. Alert Scorte Basse e Scadute
    armadietto.forEach(item => {
      // Controllo Scorte Basse
      if (((item.quantita_rimanente / (item.farmaco.quantita_confezione || 100)) * 100) < 50) {
        alerts.push({
          id: `scorte-${item.id_farmaco_armadietto}`,
          type: 'critical',
          title: 'Scorta Esaurita',
          message: `Rimangono solo ${item.quantita_rimanente} ${item.farmaco.unita_misura} di ${item.farmaco.denominazione} ${item.farmaco.dosaggio}`,
          icon: <Icons.Package className="text-rose-500" />
        });
      }

      // Controllo Scadenza
      if (item.data_scadenza && new Date(item.data_scadenza) < oraAttuale) {
        alerts.push({
          id: `scadenza-${item.id_farmaco_armadietto}`,
          type: 'critical',
          title: 'Farmaco Scaduto',
          message: `Il farmaco ${item.farmaco.denominazione} ${item.farmaco.dosaggio} nell'armadietto è scaduto.`,
          icon: <Icons.AlertTriangle className="text-rose-600" />
        });
      }
    });

    return alerts;
  };

  const activeAlerts = generateAlerts();

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
          <Link href="/Pages/Caregiver" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-[#14b8a6] mb-6 transition-colors">
            <Icons.ArrowLeft className="w-4 h-4 mr-2" /> Torna alla Dashboard Caregiver
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{info?.nome} {info?.cognome}</h1>
              <p className="text-slate-500">Assistito • Ultima attività: {stats.lastActivity || "N/A"}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setModalState({ type: "add", data: null })} variant="primary"><Icons.Plus className="w-5 h-5 mr-2" /> Aggiungi Farmaco</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Icons.Pill className="text-[#14b8a6]" />} bg="bg-teal-50" value={therapyPlans.length} label="Terapie Attive" />
            <StatCard icon={<Icons.Clock className="text-blue-500" />} bg="bg-blue-50" value={therapyPlans.filter(t => t.terapia_attiva).length} label="In Corso" />
            <StatCard icon={<Icons.CheckCircle className="text-emerald-500" />} bg="bg-emerald-50" value={`${assunzioniOggi.filter(a => a.esito).length}/${assunzioniOggi.length}`} label="Assunzioni Oggi" />
            <StatCard icon={<Icons.AlertTriangle className="text-rose-500" />} bg="bg-rose-50" value={stats.alerts || 0} label="Alert Attivi" />
          </div>

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

          <div className="space-y-6">
            {activeTab === "panoramica" && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Icons.Clock className="w-5 h-5 text-slate-400" /> Programma di Oggi</h3>
                    <div className="space-y-4">
                      {assunzioniOggi.length > 0 ? (
                        assunzioniOggi.map(assunzione => (
                          <DailyIntakeRow
                            key={assunzione.id_evento}
                            name={`${assunzione.terapia?.farmaco?.farmaco?.denominazione} ${assunzione.terapia?.farmaco?.farmaco?.dosaggio}` || "Farmaco"}
                            dose={`${assunzione.terapia?.dose_singola} ${assunzione.terapia?.farmaco?.farmaco?.unita_misura}`}
                            time={new Date(assunzione.data_programmata).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            status={assunzione.esito ? 'confermata' : 'in_attesa'}
                          />
                        ))
                      ) : (
                        <p className="text-slate-500 text-center py-4">Nessuna assunzione prevista per oggi.</p>
                      )}
                    </div>
                  </Card>
                </div>
                {/* Sezione Alert nella colonna di destra della Panoramica */}
                <div className="space-y-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 px-2">
                    <Icons.AlertTriangle className="w-5 h-5 text-slate-400" />
                    Alert Attivi ({activeAlerts.length})
                  </h3>

                  {activeAlerts.length > 0 ? (
                    activeAlerts.map((alert) => (
                      <Card
                        key={alert.id}
                        className={`p-4 border-l-4 ${alert.type === 'critical' ? 'border-l-rose-500 bg-rose-50/30' : 'border-l-amber-500 bg-amber-50/30'}`}
                      >
                        <div className="flex gap-3">
                          <div className="shrink-0 mt-0.5">{alert.icon}</div>
                          <div>
                            <p className={`font-bold text-sm ${alert.type === 'critical' ? 'text-rose-700' : 'text-amber-700'}`}>
                              {alert.title}
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed mt-1">{alert.message}</p>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-6 text-center border-dashed">
                      <Icons.CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">Nessun alert critico rilevato</p>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === "armadietto" && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {armadietto.map(item => (
                  <Card key={item.id_farmaco_armadietto} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{item.farmaco.denominazione} {item.farmaco.dosaggio}</h4>
                      <Badge variant={((item.quantita_rimanente / (item.farmaco.quantita_confezione || 100)) * 100) < 50 ? "destructive" : "default"}>
                        {item.quantita_rimanente} rimasti
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">{item.note || "Nessuna nota"}</p>
                    <div className="flex justify-end gap-1 mt-5 border-t border-slate-50">
                      <Button variant="ghost" className="p-2" onClick={() => setModalState({ type: 'view', data: item })} title="Dettagli"><Icons.Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" className="p-2" onClick={() => setModalState({ type: 'edit', data: item })} title="Modifica"><Icons.Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => setModalState({ type: 'delete', data: item })}><Icons.Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "terapie" && (
              <div className="space-y-4">
                {/* Header Tab Terapie */}
                <div className="flex justify-between items-center mb-2 px-1">
                  <h3 className="font-bold text-slate-800">Piani Terapeutici Attivi</h3>
                  <Button
                    onClick={() => setModalState({ type: 'add_th', data: null })}
                    variant="secondary"
                    className="h-9 px-3"
                  >
                    <Icons.Plus className="w-4 h-4 mr-2" /> Nuova Terapia
                  </Button>
                </div>

                {therapyPlans.length > 0 ? therapyPlans.map(terapia => (
                  <Card key={terapia.id} className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full">
                      <div className={`p-3 rounded-lg ${terapia.stato ? 'bg-teal-50' : 'bg-slate-100'}`}>
                        <Icons.Pill className={terapia.stato ? 'text-[#14b8a6]' : 'text-slate-400'} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-800">
                            {terapia.medicine}
                          </h4>
                          <Badge variant={terapia.stato ? "success" : "default"}>
                            {terapia.stato}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          {terapia.dosaggio} • Orari: {terapia.orari?.join(', ') || 'Al bisogno'}
                        </p>
                      </div>
                    </div>

                    {/* Azioni Terapia */}
                    <div className="flex justify-end gap-1 mt-5 border-t border-slate-50">
                      <Button variant="ghost" className="p-2" onClick={() => setModalState({ type: 'view_th', data: terapia })} title="Dettagli"><Icons.Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" className="p-2" onClick={() => setModalState({ type: 'edit_th', data: terapia })} title="Modifica"><Icons.Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => setModalState({ type: 'delete_th', data: terapia })}><Icons.Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </Card>
                )) : (
                  <Card className="p-12 text-center border-dashed">
                    <Icons.Pill className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500">Nessuna terapia configurata per questo assistito.</p>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modali */}
      <MedicationDetailsModal isOpen={modalState.type === 'view'} onClose={() => setModalState({ type: null, data: null })} farmaco={modalState.data} />
      <AddMedicationModal isOpen={modalState.type === 'add'} onClose={() => setModalState({ type: null, data: null })} onSuccess={handleSuccess} userId={patientId} />
      <EditMedicationModal isOpen={modalState.type === 'edit'} onClose={() => setModalState({ type: null, data: null })} medicine={modalState.data} onSuccess={handleSuccess} />
      <DeleteMedicationModal isOpen={modalState.type === 'delete'} onClose={() => setModalState({ type: null, data: null })} medicine={modalState.data} onSuccess={handleSuccess} />
      <AddTherapyModal
        isOpen={modalState.type === 'add_th' || modalState.type === 'edit_th'}
        onClose={() => setModalState({ type: null, data: null })}
        onSuccess={handleSuccess}
        userId={patientId}
        cabinetMedicines={armadietto}
        initialData={modalState.type === 'edit_th' ? modalState.data : null}
      />

      <TherapyDetailsModal
        isOpen={modalState.type === 'view_th'}
        onClose={() => setModalState({ type: null, data: null })}
        therapy={modalState.data}
      />

      <DeleteTherapyModal
        isOpen={modalState.type === 'delete_th'}
        onClose={() => setModalState({ type: null, data: null })}
        therapy={modalState.data}
        onSuccess={handleSuccess}
      />

      <footer className="border-t border-slate-200 py-8 mt-auto text-center text-sm text-slate-400 bg-white">
        <p>© 2024 MediGuard. La tua salute, organizzata.</p>
      </footer>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function StatCard({ icon, bg, value, label }) {
  return (
    <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
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
        <div className="w-12 h-10 flex items-center justify-center font-bold text-slate-700">
          {time}
        </div>
        <div>
          <p className="font-bold text-slate-800 leading-tight">{name}</p>
          <p className="text-xs text-slate-500">{dose}</p>
        </div>
      </div>
      <Badge variant={status === 'confermata' ? 'success' : 'warning'}>
        {status === 'confermata' ? 'Assunto' : 'In attesa'}
      </Badge>
    </div>
  );
}