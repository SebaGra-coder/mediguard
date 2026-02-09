'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { GuestOverlay } from "@/components/GuestOverlay";
import MedicationDetailsModal from "@/components/modals/MedicationDetailsModal";
import AddMedicationModal from "@/components/modals/AddMedicationModal";
import EditMedicationModal from "@/components/modals/EditMedicationModal";
import DeleteMedicationModal from "@/components/modals/DeleteMedicationModal";
import AddTherapyModal from "@/components/modals/AddTherapyModal";
import TherapyDetailsModal from "@/components/modals/TherapyDetailsModal";
import DeleteTherapyModal from "@/components/modals/DeleteTherapyModal";
import AddAllergyModal from "@/components/modals/AddAllergyModal";

import { useTherapies } from "@/hooks/useTherapies";
import styles from './AssistitoDetails.module.css';

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
  User: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Shield: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

// --- COMPONENTI UI LOCALI ---
const Card = ({ children, className = "" }) => (
  <div className={`${styles.card} ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "primary", className = "" }) => {
  const variants = {
    primary: styles.btnPrimary,
    secondary: styles.btnSecondary,
    ghost: styles.btnGhost,
  };
  return (
    <button onClick={onClick} className={`${styles.button} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default" }) => {
  const badgeStyles = {
    success: styles.badgeSuccess,
    warning: styles.badgeWarning,
    destructive: styles.badgeDestructive,
    default: styles.badgeDefault
  };
  return <span className={`${styles.badge} ${badgeStyles[variant]}`}>{children}</span>;
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

  const [allergies, setAllergies] = useState([]);
  const [availableAllergens, setAvailableAllergens] = useState([]);

  const fetchAllergies = async () => {
    try {
      const res = await fetch(`/api/CRUD-allergia-utente?id_utente=${patientId}`);
      const json = await res.json();
      if (json.success) setAllergies(json.data);
    } catch (err) { console.error(err); }
  };

  const fetchAllergens = async () => {
    try {
      const res = await fetch(`/api/visualizza-allergeni`);
      const json = await res.json();
      if (json.success) setAvailableAllergens(json.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeTab === "Profilo e Allergie") {
      fetchAllergies();
      fetchAllergens();
    }
  }, [activeTab, patientId]);

  const handleDeleteAllergy = async (id) => {
    if(!confirm("Sei sicuro di voler rimuovere questa allergia?")) return;
    try {
      await fetch(`/api/CRUD-allergia-utente?id_allergia=${id}`, { method: 'DELETE' });
      fetchAllergies();
    } catch (err) { console.error(err); }
  };

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

        // Ordina le assunzioni per orario
        const sortedAssunzioni = (assunzioniData.data || []).sort((a, b) => 
          new Date(a.data_programmata) - new Date(b.data_programmata)
        );

        const resArmadietto = await fetch(`/api/armadietto?id_utente=${patientId}`);
        const armadiettoData = await resArmadietto.json();

        setData({
          info: infoPaziente,
          assunzioniOggi: sortedAssunzioni,
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
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
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
            icon: <Icons.AlertTriangle className={styles.textRose} />
          });
        } else if (differenzaMinuti > 15) { // Tra 15 min e 2 ore
          alerts.push({
            id: `ritardo-${ass.id_evento}`,
            type: 'warning',
            title: 'Ritardo Assunzione',
            message: `${info.nome} è in ritardo con ${ass.terapia?.farmaco?.farmaco?.denominazione} (prevista per le ${dataProgrammata.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}).`,
            icon: <Icons.Clock className={styles.textAmber} />
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
          title: item.quantita_rimanente === 0 ? 'Scorta Esaurita' : 'Scorta in Esaurimento',
          message: item.quantita_rimanente === 0 ? `Il farmaco ${item.farmaco.denominazione} ${item.farmaco.dosaggio} è terminato.` : `Rimangono solo ${item.quantita_rimanente} ${item.farmaco.unita_misura} di ${item.farmaco.denominazione} ${item.farmaco.dosaggio}`,
          icon: <Icons.Package className={styles.textRose} />
        });
      }

      // Controllo Scadenza
      if (item.data_scadenza) {
        const dataScadenza = new Date(item.data_scadenza);
        const diffMs = dataScadenza - oraAttuale;
        const diffGiorni = diffMs / (1000 * 60 * 60 * 24);

        if (diffMs < 0) {
          // Farmaco Scaduto
          alerts.push({
            id: `scadenza-${item.id_farmaco_armadietto}`,
            type: 'critical',
            title: 'Farmaco Scaduto',
            message: `Il farmaco ${item.farmaco.denominazione} ${item.farmaco.dosaggio} è scaduto il ${dataScadenza.toLocaleDateString()}.`,
            icon: <Icons.AlertTriangle className={styles.textRose} />
          });
        } else if (diffGiorni <= 7) {
          // In scadenza nei prossimi 7 giorni
          alerts.push({
            id: `scadenza-prossima-${item.id_farmaco_armadietto}`,
            type: 'warning',
            title: 'Farmaco in Scadenza',
            message: `Il farmaco ${item.farmaco.denominazione} scade tra ${Math.ceil(diffGiorni)} giorni.`,
            icon: <Icons.Clock className={styles.textAmber} />
          });
        }
      }
    });

    return alerts;
  };

  const activeAlerts = generateAlerts();

  return (
    <div className={styles.pageContainer}>
      

      {!isUserAuthenticated && (
        <GuestOverlay
          title="Dettaglio Assistito"
          description="Monitora lo stato di salute e le terapie dei tuoi cari da remoto."
          features={["Storico assunzioni in tempo reale", "Gestione scorte farmaci", "Alert personalizzati"]}
        />
      )}

      <main className={styles.main}>
        <div className={styles.container}>
          <Link href="/Pages/Caregiver" className={styles.backLink}>
            <Icons.ArrowLeft className={styles.backLinkIcon} /> Torna alla Dashboard Caregiver
          </Link>

          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>{info?.nome} {info?.cognome}</h1>
              <p className={styles.subtitle}>Assistito • Ultima attività: {stats.lastActivity || "N/A"}</p>
            </div>
            <div className={styles.headerActions}>
              <Button onClick={() => setModalState({ type: "add", data: null })} variant="primary"><Icons.Plus className={`${styles.iconSmall} ${styles.mr2}`} /> Aggiungi Farmaco</Button>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <StatCard icon={<Icons.Pill className={styles.textTeal} />} bg={styles.bgTeal50} value={therapyPlans.length} label="Terapie Totali" />
            <StatCard icon={<Icons.Clock className={styles.textBlue} />} bg={styles.bgBlue50} value={therapyPlans.filter(t => t.stato === 'attiva').length} label="Terapie Attive" />
            <StatCard icon={<Icons.CheckCircle className={styles.textEmerald} />} bg={styles.bgEmerald50} value={`${assunzioniOggi.filter(a => a.esito).length}/${assunzioniOggi.length}`} label="Assunzioni Oggi" />
            <StatCard icon={<Icons.AlertTriangle className={styles.textRose} />} bg={styles.bgRose50} value={activeAlerts.length} label="Alert Attivi" />
          </div>

          <div className={styles.tabsContainer}>
            {["panoramica", "armadietto", "terapie", "Profilo e Allergie"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tabButton} ${activeTab === tab ? styles.tabActive : styles.tabInactive}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className={styles.spaceY6}>
            {activeTab === "panoramica" && (
              <div className={styles.panoramicaGrid}>
                <div className={styles.mainColumn}>
                  <Card className="p-6">
                    <h3 className={styles.sectionTitle}><Icons.Clock className={styles.sectionTitleIcon} /> Programma di Oggi</h3>
                    <div className={styles.spaceY4}>
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
                        <p className={styles.emptyState}>Nessuna assunzione prevista per oggi.</p>
                      )}
                    </div>
                  </Card>
                </div>
                {/* Sezione Alert nella colonna di destra della Panoramica */}
                <div className={styles.sideColumn}>
                  <h3 className={styles.sectionTitle}>
                    <Icons.AlertTriangle className={styles.sectionTitleIcon} />
                    Alert Attivi ({activeAlerts.length})
                  </h3>

                  {activeAlerts.length > 0 ? (
                    activeAlerts.map((alert) => (
                      <Card
                        key={alert.id}
                        className={`p-4 ${alert.type === 'critical' ? styles.alertCritical : styles.alertWarning}`}
                      >
                        <div className={styles.alertCardContent}>
                          <div className={`${styles.shrink0} ${styles.mt05}`}>{alert.icon}</div>
                          <div>
                            <p className={`${styles.alertTitle} ${alert.type === 'critical' ? styles.textCritical : styles.textWarning}`}>
                              {alert.title}
                            </p>
                            <p className={styles.alertText}>{alert.message}</p>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card className={styles.noAlerts}>
                      <Icons.CheckCircle className={styles.noAlertsIcon} />
                      <p className={styles.noAlertsText}>Nessun alert critico rilevato</p>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === "armadietto" && (
              <div className={styles.armadiettoGrid}>
                {armadietto.map(item => (
                  <Card key={item.id_farmaco_armadietto} className="p-4">
                    <div className={styles.cardHeader}>
                      <h4 className={styles.cardTitle}>{item.farmaco.denominazione} {item.farmaco.dosaggio}</h4>
                      <Badge variant={((item.quantita_rimanente / (item.farmaco.quantita_confezione || 100)) * 100) < 50 ? "destructive" : "default"}>
                        {item.quantita_rimanente} rimasti
                      </Badge>
                    </div>
                    <p className={styles.cardNote}>{item.note || "Nessuna nota"}</p>
                    <div className={styles.cardActions}>
                      <Button variant="ghost" className={styles.btnIcon} onClick={() => setModalState({ type: 'view', data: item })} title="Dettagli"><Icons.Eye className={styles.iconSmall} /></Button>
                      <Button variant="ghost" className={styles.btnIcon} onClick={() => setModalState({ type: 'edit', data: item })} title="Modifica"><Icons.Edit className={styles.iconSmall} /></Button>
                      <Button variant="ghost" className={`${styles.btnIcon} ${styles.btnGhostDanger}`} onClick={() => setModalState({ type: 'delete', data: item })}><Icons.Trash2 className={styles.iconSmall} /></Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "terapie" && (
              <div className={styles.terapieContainer}>
                {/* Header Tab Terapie */}
                <div className={styles.terapieHeader}>
                  <h3 className={styles.cardTitle}>Piani Terapeutici Attivi</h3>
                  <Button
                    onClick={() => setModalState({ type: 'add_th', data: null })}
                    variant="secondary"
                    className="h-9 px-3"
                  >
                    <Icons.Plus className={`${styles.iconSmall} ${styles.mr2}`} /> Nuova Terapia
                  </Button>
                </div>

                {therapyPlans.length > 0 ? therapyPlans.map(terapia => (
                  <Card key={terapia.id} className={`${styles.statCard} p-5`}>
                     <div className={styles.terapieCardContent}>
                      <div className={styles.terapieInfo}>
                        <div className={`${styles.terapieIconBox} ${terapia.stato ? styles.terapieIconBoxActive : styles.terapieIconBoxInactive}`}>
                          <Icons.Pill className={terapia.stato ? styles.textTeal : styles.textSlate400} />
                        </div>
                        <div className={styles.terapieDetails}>
                          <div className={styles.terapieTitleRow}>
                            <h4 className={styles.cardTitle}>
                              {terapia.medicine}
                            </h4>
                            <Badge variant={terapia.stato ? "success" : "default"}>
                              {terapia.stato}
                            </Badge>
                          </div>
                          <p className={styles.terapieSubtext}>
                            {terapia.dosaggio} • Orari: {terapia.orari?.join(', ') || 'Al bisogno'}
                          </p>
                        </div>
                      </div>

                      {/* Azioni Terapia */}
                      <div className={styles.cardActions}>
                        <Button variant="ghost" className={styles.btnIcon} onClick={() => setModalState({ type: 'view_th', data: terapia })} title="Dettagli"><Icons.Eye className={styles.iconSmall} /></Button>
                        <Button variant="ghost" className={styles.btnIcon} onClick={() => setModalState({ type: 'edit_th', data: terapia })} title="Modifica"><Icons.Edit className={styles.iconSmall} /></Button>
                        <Button variant="ghost" className={`${styles.btnIcon} ${styles.btnGhostDanger}`} onClick={() => setModalState({ type: 'delete_th', data: terapia })}><Icons.Trash2 className={styles.iconSmall} /></Button>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <Card className={styles.emptyStateCard}>
                    <Icons.Pill className={`${styles.iconXLarge} ${styles.textSlate200} ${styles.mrAuto} ${styles.mlAuto} ${styles.mb4}`} style={{margin: '0 auto 1rem auto'}} />
                    <p className={styles.emptyState}>Nessuna terapia configurata per questo assistito.</p>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "Profilo e Allergie" && (
              <div className={styles.profiloGrid}>
                 <Card className={`${styles.profiloCard} p-6`}>
                    <h3 className={styles.sectionTitle}>
                       <Icons.User className={`${styles.iconMedium} ${styles.textTeal}`} /> Dati Personali
                    </h3>
                    <div className={styles.spaceY4}>
                       <div><p className={styles.label}>Nome Completo</p><p className={styles.value}>{info?.nome} {info?.cognome}</p></div>
                       <div><p className={styles.label}>Email</p><p className={styles.value}>{info?.email}</p></div>
                       <div><p className={styles.label}>Data di Nascita</p><p className={styles.value}>{info?.data_nascita ? new Date(info.data_nascita).toLocaleDateString() : 'N/D'}</p></div>
                    </div>
                 </Card>

                 <Card className="p-6">
                    <div className={styles.terapieHeader} style={{padding: 0}}>
                       <h3 className={styles.sectionTitle}>
                          <Icons.Shield className={`${styles.iconMedium} ${styles.textRose}`} /> Allergie e Intolleranze
                       </h3>
                       <Button onClick={() => setModalState({ type: 'add_allergy' })} variant="secondary" className="h-8 px-3 text-xs">
                          <Icons.Plus className="w-3 h-3 mr-1" /> Aggiungi
                       </Button>
                    </div>
                    
                    <div className={styles.allergyList}>
                       {allergies.length > 0 ? allergies.map(a => (
                          <div key={a.id_allergia} className={styles.allergyItem}>
                             <div>
                                <p className={styles.cardTitle}>{a.allergene?.sostanza_allergene}</p>
                                <div className={`${styles.flex} ${styles.gap3} ${styles.mt05}`}>
                                   <span className={styles.terapieSubtext} style={{fontSize: '0.75rem'}}>Gravità:</span>
                                   <div className={styles.severityDots}>
                                      {[...Array(5)].map((_, i) => (
                                         <div key={i} className={`${styles.severityDot} ${i < a.gravita_reazione ? styles.severityDotActive : styles.severityDotInactive}`} />
                                      ))}
                                   </div>
                                </div>
                             </div>
                             <button onClick={() => handleDeleteAllergy(a.id_allergia)} className={styles.btnGhostDanger}>
                                <Icons.Trash2 className={styles.iconSmall} />
                             </button>
                          </div>
                       )) : (
                          <p className={styles.emptyState}>Nessuna allergia segnalata.</p>
                       )}
                    </div>
                 </Card>
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
      
      <AddAllergyModal
        isOpen={modalState.type === 'add_allergy'}
        onClose={() => setModalState({ type: null, data: null })}
        onSuccess={() => { fetchAllergies(); setModalState({ type: null, data: null }); }}
        userId={patientId}
        availableAllergens={availableAllergens}
      />

      <footer className={styles.footer}>
        <p>© 2026 MediGuard. La tua salute, organizzata.</p>
      </footer>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function StatCard({ icon, bg, value, label }) {
  return (
    <Card className={styles.statCard}>
      <div className={`${styles.statIconBox} ${bg}`}>
        {require('react').cloneElement(icon, { className: styles.iconMedium })}
      </div>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </Card>
  );
}

function DailyIntakeRow({ name, dose, time, status }) {
  return (
    <div className={styles.dailyRow}>
      <div className={styles.dailyInfo}>
        <div className={styles.dailyTime}>
          {time}
        </div>
        <div className={styles.dailyDetails}>
          <p className={styles.dailyName}>{name}</p>
          <p className={styles.dailyDose}>{dose}</p>
        </div>
      </div>
      <Badge variant={status === 'confermata' ? 'success' : 'warning'}>
        {status === 'confermata' ? 'Assunto' : 'In attesa'}
      </Badge>
    </div>
  );
}