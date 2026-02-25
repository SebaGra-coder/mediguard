// 'use client' definisce questo file come Client Component: viene inviato al browser e permette l'uso di hook (useState, useEffect) e interazioni utente,
// a differenza dei Server Components (default) che vengono eseguiti solo sul server.
'use client';

// --- IMPORTAZIONI ---

// Hook di React per la gestione dello stato e degli effetti collaterali
import { useState, useEffect } from "react"; 
// Componenti e hook di navigazione di Next.js

// Link: Componente per navigazione dichiarativa. Scorrimento fluido e prefetching automatico.
import Link from "next/link";
// useParams: Hook per leggere i parametri dinamici dell'URL. Permette di ottenere l'id dell'assistito dalla URL.
// useRouter: Hook per navigazione imperativa via codice. Permette di reindirizzare.
import { useParams, useRouter } from "next/navigation";
// Componenti UI generali
import { GuestOverlay } from "@/components/GuestOverlay";
// Modali per la gestione dei farmaci (CRUD)
import MedicationDetailsModal from "@/components/modals/MedicationDetailsModal";
import AddMedicationModal from "@/components/modals/AddMedicationModal";
import EditMedicationModal from "@/components/modals/EditMedicationModal";
import DeleteMedicationModal from "@/components/modals/DeleteMedicationModal";
// Modali per la gestione delle terapie (CRUD)
import AddTherapyModal from "@/components/modals/AddTherapyModal";
import TherapyDetailsModal from "@/components/modals/TherapyDetailsModal";
import DeleteTherapyModal from "@/components/modals/DeleteTherapyModal";
// Modali per la gestione delle allergie
import AddAllergyModal from "@/components/modals/AddAllergyModal";

// Funzionee per la gestione delle terapie
import { useTherapies } from "@/hooks/useTherapies";
// Stili CSS modulari e icone
import styles from './AssistitoDetails.module.css';
import { Icons } from "@/components/ui/Icons";

// --- COMPONENTI UI LOCALI ---
// Componente Card: Contenitore generico con stile base (bordo, ombra, sfondo bianco).
// Accetta 'children' per il contenuto e 'className' per stili aggiuntivi.
const Card = ({ children, className = "" }) => (
  <div className={`${styles.card} ${className}`}>{children}</div>
);

// Componente Button: Bottone riutilizzabile con diverse varianti di stile.
// Props:
// - variant: 'primary' (azione principale), 'secondary' (azione secondaria), 'ghost' (senza sfondo/bordo).
// - onClick: funzione da eseguire al click.
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

// Componente Badge: Etichetta colorata per indicare stati (es. "Assunto", "In scadenza").
// Props:
// - variant: 'success' (verde), 'warning' (giallo), 'destructive' (rosso), 'default' (grigio).
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
  // --- HOOKS DI NAVIGAZIONE ---
  const params = useParams();
  const router = useRouter();
  const patientId = params.id;

  // --- STATO AUTENTICAZIONE ---
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  // Gestisce lo stato di caricamento della verifica auth: true = controllo in corso (mostra spinner), false = controllo finito.
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // --- STATO INTERFACCIA UTENTE ---
  const [activeTab, setActiveTab] = useState("panoramica");
  const [modalState, setModalState] = useState({ type: null, data: null });

  // --- DATI TERAPIE (Custom Hook) ---
  const { therapyPlans, fetchTherapies, isLoading: isTherapyLoading } = useTherapies();

  // --- STATO ALLERGIE ---
  const [allergies, setAllergies] = useState([]);
  const [availableAllergens, setAvailableAllergens] = useState([]);

  // Recupera le allergie specifiche dell'assistito dal database
  const fetchAllergies = async () => {
    try {
      const res = await fetch(`/api/CRUD-allergia-utente?id_utente=${patientId}`);
      const json = await res.json();
      if (json.success) setAllergies(json.data);
    } catch (err) { console.error(err); }
  };

  // Recupera la lista completa degli allergeni disponibili per la selezione
  const fetchAllergens = async () => {
    try {
      const res = await fetch(`/api/visualizza-allergeni`);
      const json = await res.json();
      if (json.success) setAvailableAllergens(json.data);
    } catch (err) { console.error(err); }
  };

  // Effetto collaterale: Carica i dati delle allergie quando l'utente seleziona la tab "Profilo e Allergie"
  useEffect(() => {
    if (activeTab === "Profilo e Allergie") {
      fetchAllergies();
      fetchAllergens();
    }
  }, [activeTab, patientId]);

  // Gestisce l'eliminazione di un'allergia: chiede conferma e chiama l'API DELETE
  const handleDeleteAllergy = async (id) => {
    if(!confirm("Sei sicuro di voler rimuovere questa allergia?")) return;
    try {
      await fetch(`/api/CRUD-allergia-utente?id_allergia=${id}`, { method: 'DELETE' });
      fetchAllergies();
    } catch (err) { console.error(err); }
  };

  // Stato principale per i dati dell'assistito, assunzioni odierne e contenuto armadietto
  const [data, setData] = useState({
    info: null,
    assunzioniOggi: [],
    armadietto: [],
    loading: true
  });

  // Gestisce il cambio di stato (Attiva/In pausa) di una terapia tramite chiamata PUT
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

  // Funzione principale di inizializzazione: verifica autenticazione e carica i dati iniziali in 5 step:
  const initPage = async () => {
    try {
      // 1. Verifica se l'utente (Caregiver) è autenticato
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setIsUserAuthenticated(authData.isAuthenticated);

      if (authData.isAuthenticated) {
        // 2. Recupera i dati dell'account del Caregiver
        const resAccount = await fetch('/api/RUD-account?me');
        const userData = await resAccount.json();

        // 3. Cerca la relazione specifica con l'assistito richiesto (tramite ID URL)
        const relazione = userData.caregiver?.find(r => r.id_assistito === patientId);
        const infoPaziente = relazione?.assistito;

        if (!infoPaziente) {
          console.error("Assistito non trovato o non collegato");
          // Interrompe il caricamento se l'assistito non è associato a questo caregiver
          setData(prev => ({ ...prev, loading: false }));
          return;
        }

        fetchTherapies(patientId);

        // 4. Recupera le assunzioni programmate per la data odierna
        const oggi = new Date().toISOString().split('T')[0];
        const resAssunzioni = await fetch(`/api/assunzione?id_utente=${patientId}&data_programmata=${oggi}`);
        const assunzioniData = await resAssunzioni.json();

        // Ordina le assunzioni per orario
        const sortedAssunzioni = (assunzioniData.data || []).sort((a, b) => 
          new Date(a.data_programmata) - new Date(b.data_programmata)
        );

        // 5. Recupera il contenuto dell'armadietto farmaci
        const resArmadietto = await fetch(`/api/armadietto?id_utente=${patientId}`);
        const armadiettoData = await resArmadietto.json();

        // Aggiorna lo stato con tutti i dati recuperati
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

  // Callback eseguita dopo il successo di un'operazione modale (es. aggiunta farmaco) per ricaricare i dati
  const handleSuccess = () => {
    initPage();
    setModalState({ type: null, data: null });
  };

  // Effetto iniziale: avvia initPage quando il componente viene montato o cambia l'ID paziente
  useEffect(() => {
    if (patientId) {
      initPage();
    }
  }, [patientId]);

  // Mostra uno spinner di caricamento mentre si verificano i dati
  if (isAuthChecking || data.loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // Destructuring dei dati per facilitarne l'uso nel JSX
  const { info, assunzioniOggi, armadietto } = data;
  const stats = info?.dashboardStats || {};

  // Logica per generare avvisi (Alerts) basati su assunzioni mancate e scorte in esaurimento
  const generateAlerts = () => {
    const alerts = [];
    const oraAttuale = new Date();

    // 1. Alert Ritardo e Mancata Assunzione
    assunzioniOggi.forEach(ass => {
      const dataProgrammata = new Date(ass.data_programmata);
      // Calcola la differenza in minuti tra l'ora attuale e l'ora programmata (conversione da millisecondi)
      const differenzaMinuti = (oraAttuale - dataProgrammata) / (1000 * 60);

      if (!ass.esito) { // Se non è ancora stata assunta
        if (differenzaMinuti > 120) { // Più di 2 ore di ritardo
          // Aggiunge un nuovo elemento alla fine della lista (array)
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
      // Controllo Scorte Basse (50%)
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
        // Calcola i giorni rimanenti convertendo la differenza da millisecondi a giorni
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
      {/* Overlay mostrato se l'utente non è autenticato (protezione client-side) */}
      {!isUserAuthenticated && (
        <GuestOverlay
          title="Dettaglio Assistito"
          description="Monitora lo stato di salute e le terapie dei tuoi cari da remoto."
          features={["Storico assunzioni in tempo reale", "Gestione scorte farmaci", "Alert personalizzati"]}
        />
      )}

      <main className={styles.main}>
        <div className={styles.container}>
          {/* Link per tornare alla dashboard principale */}
          <Link href="/Pages/Caregiver" className={styles.backLink}>
            <Icons.ArrowLeft className={styles.backLinkIcon} /> Torna alla Dashboard Caregiver
          </Link>

          {/* Intestazione con nome assistito e azione rapida */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>{info?.nome} {info?.cognome}</h1>
              <p className={styles.subtitle}>Assistito • Ultima attività: {stats.lastActivity || "N/A"}</p>
            </div>
            <div className={styles.headerActions}>
              <Button onClick={() => setModalState({ type: "add", data: null })} variant="primary"><Icons.Plus className={`${styles.iconSmall} ${styles.mr2}`} /> Aggiungi Farmaco</Button>
            </div>
          </div>

          {/* Griglia delle statistiche riassuntive */}
          <div className={styles.statsGrid}>
            <StatCard icon={<Icons.Pill className={styles.textTeal} />} bg={styles.bgTeal50} value={therapyPlans.length} label="Terapie Totali" />
            <StatCard icon={<Icons.Clock className={styles.textBlue} />} bg={styles.bgBlue50} value={therapyPlans.filter(t => t.stato === 'attiva').length} label="Terapie Attive" />
            <StatCard icon={<Icons.CheckCircle className={styles.textEmerald} />} bg={styles.bgEmerald50} value={`${assunzioniOggi.filter(a => a.esito).length}/${assunzioniOggi.length}`} label="Assunzioni Oggi" />
            <StatCard icon={<Icons.AlertTriangle className={styles.textRose} />} bg={styles.bgRose50} value={activeAlerts.length} label="Alert Attivi" />
          </div>

          {/* Navigazione a schede (Tabs) */}
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

          {/* Contenuto dinamico in base alla tab selezionata */}
          <div className={styles.spaceY6}>
            {/* TAB: PANORAMICA - Mostra assunzioni odierne e avvisi */}
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
                {/* Colonna laterale: Lista degli Alert attivi */}
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

            {/* TAB: ARMADIETTO - Lista farmaci disponibili */}
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

            {/* TAB: TERAPIE - Lista piani terapeutici */}
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
                        <Button 
                          variant="ghost" 
                          className={styles.btnIcon} 
                          onClick={() => handleToggleStatus(terapia)} 
                          title={terapia.terapia_attiva ? "Sospendi Terapia" : "Riattiva Terapia"}
                        >
                          <Icons.CheckCircle className={`${styles.iconSmall} ${terapia.terapia_attiva ? styles.textTeal : styles.textSlate400}`} />
                        </Button>
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

            {/* TAB: PROFILO E ALLERGIE - Dati anagrafici e lista allergie */}
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

      {/* --- MODALI --- */}
      {/* Modali per la gestione CRUD dei Farmaci nell'armadietto */}
      <MedicationDetailsModal isOpen={modalState.type === 'view'} onClose={() => setModalState({ type: null, data: null })} farmaco={modalState.data} />
      <AddMedicationModal isOpen={modalState.type === 'add'} onClose={() => setModalState({ type: null, data: null })} onSuccess={handleSuccess} userId={patientId} />
      <EditMedicationModal isOpen={modalState.type === 'edit'} onClose={() => setModalState({ type: null, data: null })} medicine={modalState.data} onSuccess={handleSuccess} />
      <DeleteMedicationModal isOpen={modalState.type === 'delete'} onClose={() => setModalState({ type: null, data: null })} medicine={modalState.data} onSuccess={handleSuccess} />
      
      {/* Modali per la gestione CRUD delle Terapie */}
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
      
      {/* Modale per l'aggiunta di Allergie */}
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
// Componente per visualizzare una singola statistica (es. Terapie Totali)
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

// Componente per visualizzare una riga nella lista delle assunzioni giornaliere
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