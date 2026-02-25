// 'use client' indica che questo componente viene eseguito nel browser (Client Component)
// Necessario per gestire stato, effetti e interazioni utente
'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GuestOverlay } from "@/components/GuestOverlay";
import styles from './Caregiver.module.css';
import { Icons } from "@/components/ui/Icons";

// --- COMPONENTI UI RIUTILIZZABILI ---
// Componenti stilizzati localmente per garantire coerenza visiva nella dashboard
const Card = ({ children, className = "", variant = "default", onClick, style }) => {
    const classList = [styles.card];
    if (variant === "elevated") classList.push(styles.cardElevated);
    if (variant === "interactive") classList.push(styles.cardInteractive);
    if (className) classList.push(className);

    return (
        <div className={classList.join(' ')} onClick={onClick} style={style}>
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = "" }) => <div className={`${styles.cardHeader} ${className}`}>{children}</div>;
const CardContent = ({ children, className = "" }) => <div className={`${styles.cardContent} ${className}`}>{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`${styles.cardTitle} ${className}`}>{children}</h3>;

const Button = ({ children, onClick, variant = "primary", size = "md", className = "", asChild }) => {
    const classList = [styles.button];

    if (variant === "primary") classList.push(styles.btnPrimary);
    else if (variant === "ghost") classList.push(styles.btnGhost);
    else if (variant === "default") classList.push(styles.btnDefault);
    else if (variant === "outline") classList.push(styles.btnOutline);

    if (size === "sm") classList.push(styles.btnSm);
    else if (size === "md") classList.push(styles.btnMd);

    if (className) classList.push(className);

    const finalClassName = classList.join(' ');

    if (asChild) {
        return <span className={finalClassName}>{children}</span>;
    }

    return <button onClick={onClick} className={finalClassName}>{children}</button>;
};

const Badge = ({ children, variant = "default" }) => {
    const classList = [styles.badge];
    if (variant === 'destructive') classList.push(styles.badgeDestructive);
    else classList.push(styles.badgeDefault);

    return <span className={classList.join(' ')}>{children}</span>;
};

const Avatar = ({ children, className = "" }) => <div className={`${styles.avatar} ${className}`}>{children}</div>;
const AvatarFallback = ({ children, className = "" }) => <div className={`${styles.avatarFallback} ${className}`}>{children}</div>;

// --- VISTA ASSISTITO (My Caregivers) ---
// Componente visualizzato quando l'utente agisce come "Assistito".
// Mostra la lista delle persone (Caregiver) che hanno accesso ai suoi dati.
function AssistedView({ caregivers }) {
    const handleEmailCaregiver = (email, e) => {
        e.preventDefault(); // Previene il comportamento predefinito del browser
        e.stopPropagation(); // Impedisce al click di propagarsi alla card genitore (evitando aperture indesiderate)
        window.location.assign(`mailto:${email}`); // Apre il client di posta predefinito con l'indirizzo destinatario
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>I Miei Caregiver</h1>
                    <p className={styles.subtitle}>
                        Le persone che ti assistono e monitorano le tue terapie
                    </p>
                </div>
                {/* Pulsante di navigazione per collegare un nuovo caregiver */}
                <Link href="/Pages/CollegaCaregiver" passHref>
                    <Button variant="default" asChild>
                        <span style={{ cursor: 'pointer' }}>
                            <Icons.Plus className={`${styles.iconSm} ${styles.mr2}`} />
                            Collega caregiver
                        </span>
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className={styles.statsGrid}>
                <Card variant="elevated">
                    <CardContent className={styles.statCardContent}>
                        <div className={`${styles.statIconBox} ${styles.avatarFallbackTeal}`}>
                            <Icons.Users className={styles.iconMd} />
                        </div>
                        <div>
                            <p className={`${styles.title} ${styles.textSlate800}`} style={{ fontSize: '1.5rem', marginBottom: '0' }}>{caregivers.length}</p>
                            <p className={`${styles.textSm} ${styles.textSlate500}`}>Caregiver</p>
                        </div>
                    </CardContent>
                </Card>
                <Card variant="elevated">
                    <CardContent className={styles.statCardContent}>
                        <div className={`${styles.statIconBox} ${styles.avatarFallbackTeal}`}>
                            <Icons.Calendar className={styles.iconMd} />
                        </div>
                        <div>
                            <p className={`${styles.title} ${styles.textSlate800}`} style={{ fontSize: '1.5rem', marginBottom: '0' }}>
                                {new Date().toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                            </p>
                            <p className={`${styles.textSm} ${styles.textSlate500}`}>Oggi</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className={styles.mainGrid}>
                {/* Caregivers List */}
                <div className={styles.leftColumn}>
                    <h2 className={styles.sectionTitle}>I tuoi caregiver</h2>

                    {caregivers.map((caregiver, index) => (
                        <Card
                            key={caregiver.id}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <CardContent>
                                <div className={styles.patientCardContent} style={{ paddingLeft: 0 }}>
                                    <div style={{ position: 'relative' }}>
                                        <Avatar className={styles.avatarLg}>
                                            <AvatarFallback className={styles.avatarFallbackTeal}>
                                                {caregiver.avatar}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className={styles.patientInfo}>
                                        <div className={styles.patientHeader}>
                                            <h3 className={`${styles.sectionTitle} ${styles.textSlate800}`}>{caregiver.name}</h3>
                                        </div>
                                        <p className={`${styles.textSm} ${styles.textSlate500}`} style={{ marginBottom: '1rem' }}>
                                            {caregiver.relationship} • {caregiver.email}
                                        </p>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => handleEmailCaregiver(caregiver.email, e)}
                                            >
                                                <Icons.Mail className={`${styles.iconSm} ${styles.mr2}`} />
                                                Contatta
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Card variant="default" style={{  textAlign: 'center', borderStyle: 'dashed', backgroundColor: '#f8fafc' }}>
                        <CardContent style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className={`${styles.avatarLg} ${styles.flexCenter}`} style={{ backgroundColor: '#f1f5f9', margin: '0 auto 1rem auto' }}>
                                <Icons.Plus className={styles.iconMd} style={{ color: '#94a3b8' }} />
                            </div>
                            <h3 className={`${styles.fontBold} ${styles.textSlate800}`} style={{ marginBottom: '0.5rem' }}>Collega un nuovo caregiver</h3>
                            <p className={`${styles.textSm} ${styles.textSlate500}`} style={{ marginBottom: '1rem', maxWidth: '24rem', margin: '0 auto 1rem auto' }}>
                                Inserisci il codice ricevuto dal tuo caregiver per collegarlo al tuo profilo
                            </p>
                            <Link href="/Pages/CollegaCaregiver" passHref>
                                <Button variant="outline" asChild>
                                    <span style={{ cursor: 'pointer' }}>Inserisci codice</span>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className={styles.rightColumn}>
                    <Card variant="elevated">
                        <CardHeader>
                            <CardTitle>
                                <Icons.Shield className={styles.iconMd} style={{ color: '#14b8a6' }} />
                                Informazioni
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={`${styles.textSm} ${styles.textSlate500}`} style={{ marginBottom: '1rem' }}>
                                I tuoi caregiver possono visualizzare le tue terapie, l&apos;inventario farmaci e ricevere notifiche quando non confermi un&apos;assunzione.
                            </p>
                            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                                <p className={`${styles.textSm} ${styles.fontMedium} ${styles.textSlate700}`} style={{ marginBottom: '0.5rem' }}>Cosa possono vedere:</p>
                                <ul className={`${styles.textSm} ${styles.textSlate500}`} style={{ listStyle: 'none' }}>
                                    <li>• Le tue terapie attive</li>
                                    <li>• L&apos;inventario dei farmaci</li>
                                    <li>• Le assunzioni confermate</li>
                                    <li>• Le scorte in esaurimento</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// --- VISTA CAREGIVER (Dashboard) ---
// Componente visualizzato quando l'utente agisce come "Caregiver".
// Mostra la lista dei pazienti seguiti, statistiche aggregate e alert recenti.
function CaregiverView({ patients, recentAlerts }) {
    // .reduce() riduce l'array a un singolo valore: parte da 0 (valore iniziale) e accumula gli alert di ogni paziente (p) nella somma (sum)
    const totalAlerts = patients.reduce((sum, p) => sum + p.alerts + p.lowStock, 0);
    // Calcola la media dell'aderenza: somma tutte le percentuali con .reduce() e divide per il numero di pazienti
    const avgAdherence = patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.adherenceWeek, 0) / patients.length) : 0;
    // Aggrega il conteggio delle scorte basse usando la stessa logica di accumulo
    const lowStockCount = patients.reduce((sum, p) => sum + p.lowStock, 0);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>Dashboard Caregiver</h1>
                    <p className={styles.subtitle}>Monitora e gestisci le terapie dei tuoi assistiti</p>
                </div>
                <Link href="CollegaCaregiver" className={`${styles.button} ${styles.btnPrimary} ${styles.btnMd}`}>
                    <Icons.Plus className={`${styles.iconMd} ${styles.mr2}`} /> Collega paziente
                </Link>
            </div>

            {/* Stats Overview */}
            <div className={styles.statsGrid}>
                <StatCard icon={<Icons.Users className={styles.iconMd} style={{ color: '#14b8a6' }} />} bgClass={styles.avatarFallbackTeal} value={patients.length} label="Pazienti" />
                <StatCard icon={<Icons.Heart className={styles.iconMd} style={{ color: '#10b981' }} />} bgStyle={{ backgroundColor: '#ecfdf5' }} value={`${avgAdherence}%`} label="Aderenza media" />
                <StatCard icon={<Icons.AlertTriangle className={styles.iconMd} style={{ color: '#f43f5e' }} />} bgStyle={{ backgroundColor: '#fff1f2' }} value={totalAlerts} label="Alert attivi" />
                <StatCard icon={<Icons.Bell className={styles.iconMd} style={{ color: '#f59e0b' }} />} bgStyle={{ backgroundColor: '#fffbeb' }} value={lowStockCount} label="Scorte basse" />
            </div>

            <div className={styles.mainGrid}>

                {/* --- LISTA PAZIENTI (Colonna Sinistra) --- */}
                <div className={styles.leftColumn}>
                    <h2 className={styles.sectionTitle}>I tuoi assistiti</h2>

                    {patients.map((patient) => (
                        <Link key={patient.id} href={`/Pages/Assistito/${patient.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                            <Card className={styles.cardInteractive} style={{ padding: 0 }}>
                                {/* Status Bar Left */}
                                <div className={`${styles.patientStatusBar} ${patient.status === 'ok' ? styles.bgEmerald500 : patient.status === 'warning' ? styles.bgAmber500 : styles.bgRose500}`} />

                                <CardContent className={styles.patientCardContent}>
                                    {/* Avatar */}
                                    <div style={{ position: 'relative' }}>
                                        <div className={`${styles.avatarLg} ${styles.flexCenter} ${styles.avatarFallbackTeal}`} style={{ border: '2px solid white', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', fontSize: '1.25rem' }}>
                                            {patient.initials}
                                        </div>
                                        <div className={`${styles.statusDot} ${patient.status === 'ok' ? styles.bgEmerald500 : patient.status === 'warning' ? styles.bgAmber500 : styles.bgRose500}`} />
                                    </div>

                                    <div className={styles.patientInfo}>
                                        <div className={styles.patientHeader}>
                                            <h3 className={`${styles.sectionTitle} ${styles.textSlate800}`}>{patient.name}</h3>
                                            {(patient.alerts + patient.lowStock) > 0 && <Badge variant="destructive">{patient.alerts + patient.lowStock} alert</Badge>}
                                        </div>
                                        <p className={`${styles.textSm} ${styles.textSlate500}`} style={{ marginBottom: '1rem' }}>{patient.relationship} • Ultima attività: {patient.lastActivity}</p>

                                        <div className={styles.progressGrid}>
                                            {/* Progress Oggi */}
                                            <div>
                                                <div className={`${styles.textXs} ${styles.fontMedium}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', color: '#64748b' }}>
                                                    <span>Oggi</span>
                                                    <span className={patient.status === 'ok' ? styles.bgEmerald500 : patient.status === 'warning' ? styles.bgAmber500 : styles.bgRose500} style={{ backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', backgroundColor: patient.status === 'ok' ? '#059669' : patient.status === 'warning' ? '#d97706' : '#e11d48' }}>{patient.adherenceToday}%</span>
                                                </div>
                                                <div className={styles.progressBarContainer}>
                                                    <div className={`${styles.progressBarFill} ${patient.status === 'ok' ? styles.bgEmerald500 : patient.status === 'warning' ? styles.bgAmber500 : styles.bgRose500}`} style={{ width: `${patient.adherenceToday}%` }} />
                                                </div>
                                            </div>

                                            {/* Progress Settimana */}
                                            <div>
                                                <div className={`${styles.textXs} ${styles.fontMedium}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', color: '#64748b' }}>
                                                    <span>Settimana</span>
                                                    <span className={styles.textSlate700}>{patient.adherenceWeek}%</span>
                                                </div>
                                                <div className={styles.progressBarContainer}>
                                                    <div className={styles.progressBarFill} style={{ width: `${patient.adherenceWeek}%`, backgroundColor: '#14b8a6' }} />
                                                </div>
                                            </div>

                                            {/* Next Dose Info */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                                                <Icons.Clock className={styles.iconSm} style={{ color: patient.nextDose === "In ritardo" ? '#f43f5e' : '#94a3b8' }} />
                                                <span style={{ color: patient.nextDose === "In ritardo" ? '#e11d48' : '#475569' }}>
                                                    {patient.nextDose}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ alignSelf: 'center' }}>
                                        <Icons.ChevronRight className={`${styles.iconMd} ${styles.textSlate500}`} />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* --- SIDEBAR (Colonna Destra) --- */}
                <div className={styles.rightColumn}>

                    {/* Alert Recenti */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h2 className={styles.sectionTitle}>Alert Recenti</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {recentAlerts.map((alert) => (
                                <Card key={alert.id} className={`${styles.alertCard} ${alert.type === 'critical' ? styles.borderLCritical : alert.type === 'warning' ? styles.borderLWarning : styles.borderLInfo}`}>
                                    <p className={`${styles.fontBold} ${styles.textSm} ${styles.textSlate800}`} style={{ marginBottom: '0.25rem' }}>{alert.patient}</p>
                                    <p className={`${styles.textSm} ${styles.textSlate600}`} style={{ marginBottom: '0.5rem' }}>{alert.message}</p>
                                    <p className={`${styles.textXs} ${styles.textSlate500}`}>{alert.time}</p>
                                </Card>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- LOGICA PRINCIPALE ---
// Componente Container che gestisce il recupero dati e lo switch tra le viste
export default function CaregiverDashboard({ isAuthenticated: initialAuth = false }) {
    const router = useRouter();
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    // Stati per i dati
    const [patients, setPatients] = useState([]); // Pazienti di cui sono caregiver
    const [caregivers, setCaregivers] = useState([]); // Caregiver che mi assistono
    const [recentAlerts, setRecentAlerts] = useState([]);

    // Stato UI
    const [viewMode, setViewMode] = useState(null); // 'caregiver' | 'assisted'
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Verifica Auth
                const authRes = await fetch('/api/auth/me');
                const authData = await authRes.json();
                setIsUserAuthenticated(authData.isAuthenticated);

                // 2. Se autenticato, carica i dati via RUD-account
                if (authData.isAuthenticated) {
                    setLoadingData(true);
                    const res = await fetch('/api/RUD-account?me');
                    if (res.ok) {
                        const userData = await res.json();

                        // --- Elaborazione dati CAREGIVER (Io assisto altri) ---
                        let mappedPatients = [];
                        let generatedAlerts = [];
                        if (userData.caregiver && Array.isArray(userData.caregiver)) {
                            // Mappa i dati grezzi del DB in un formato ottimizzato per la UI
                            mappedPatients = userData.caregiver.map(rel => {
                                const p = rel.assistito;
                                if (!p) return null;
                                const s = p.dashboardStats || {};
                                return {
                                    id: p.id_utente,
                                    name: `${p.nome} ${p.cognome}`,
                                    relationship: "Assistito",
                                    initials: `${p.nome?.[0] || '?'}${p.cognome?.[0] || '?'}`.toUpperCase(),
                                    adherenceToday: s.adherenceToday ?? 0,
                                    adherenceWeek: s.adherenceWeek ?? 0,
                                    lastActivity: s.lastActivity || "N/A",
                                    status: s.status || "ok",
                                    nextDose: s.nextDose || "Nessuna",
                                    alerts: s.alerts ?? 0,
                                    lowStock: s.lowStock ?? 0
                                };
                            }).filter(Boolean);

                            // Generazione Alert locali: Analizza terapie e armadietto per creare notifiche
                            const now = new Date();
                            userData.caregiver.forEach(rel => {
                                const p = rel.assistito;
                                if (!p) return;
                                // Alert Terapie
                                if (p.terapie) {
                                    p.terapie.forEach(t => {
                                        if (t.assunzioni) {
                                            t.assunzioni.forEach(a => {
                                                const d = new Date(a.data_programmata);
                                                // Verifica assunzioni recenti (ultime 24h) mancate o in ritardo
                                                const isRecent = d > new Date(now.getTime() - 24 * 60 * 60 * 1000) && d <= now;
                                                const isMissed = a.esito === false;
                                                const isLate = a.esito === null && d < new Date(now.getTime() - 60 * 60 * 1000);
                                                if (isRecent && (isMissed || isLate)) {
                                                    generatedAlerts.push({
                                                        id: `alert_${a.id_evento}`,
                                                        patient: `${p.nome} ${p.cognome}`,
                                                        message: isMissed ? `Mancata assunzione: ${t.nome_utilita}` : `In ritardo: ${t.nome_utilita}`,
                                                        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                        type: isMissed ? 'critical' : 'warning'
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                                // Alert Scorte
                                if (p.armadietto) {
                                    p.armadietto.forEach(f => {
                                        if (f.quantita_rimanente < 5) {
                                            const drugName = f.farmaco?.denominazione || 'Farmaco';
                                            generatedAlerts.push({
                                                id: `stock_${f.id_farmaco_armadietto}`,
                                                patient: `${p.nome} ${p.cognome}`,
                                                message: `Scorta in esaurimento: ${drugName} (${f.quantita_rimanente})`,
                                                time: "Oggi",
                                                type: "info"
                                            });
                                        }
                                    });
                                }
                            });
                        }

                        setPatients(mappedPatients);
                        setRecentAlerts(generatedAlerts);

                        // --- Elaborazione dati ASSISTITO (Altri assistono me) ---
                        let mappedCaregivers = [];
                        if (userData.assistito && Array.isArray(userData.assistito)) {
                            mappedCaregivers = userData.assistito.map(rel => {
                                const c = rel.caregiver;
                                if (!c) return null;
                                return {
                                    id: c.id_utente,
                                    name: `${c.nome} ${c.cognome}`,
                                    email: c.email,
                                    relationship: "Caregiver",
                                    avatar: `${c.nome?.[0] || '?'}${c.cognome?.[0] || '?'}`.toUpperCase(),
                                    connectedSince: "Attivo", // Non abbiamo data creazione
                                    lastOnline: "N/A",
                                    status: "offline"
                                };
                            }).filter(Boolean);
                        }
                        setCaregivers(mappedCaregivers);

                        // --- DECISIONE VISTA INIZIALE ---
                        // Determina quale vista mostrare in base ai dati disponibili
                        if (mappedPatients.length > 0) {
                            setViewMode('caregiver');
                        } else if (mappedCaregivers.length > 0) {
                            setViewMode('assisted');
                        } else {
                            // Default: se non ha nessuno, magari mostra la vista caregiver per aggiungere pazienti (o viceversa)
                            setViewMode('caregiver');
                        }
                    }
                }
            } catch (err) {
                console.error("Errore inizializzazione dashboard", err);
            } finally {
                setIsAuthChecking(false);
                setLoadingData(false);
            }
        };
        init();
    }, []);

    if (isAuthChecking) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
            </div>
        );
    }

    // Toggle Switch se l'utente ha entrambi i ruoli
    const showToggle = patients.length > 0 && caregivers.length > 0;

    return (
        <div className={styles.pageContainer}>
            {/* Overlay per utenti non autenticati */}
            {!isUserAuthenticated && (
                <GuestOverlay
                    title="MediGuard Connect"
                    description="Gestisci le relazioni di cura in modo semplice e sicuro"
                    features={[
                        "Monitoraggio terapie da remoto",
                        "Gestione caregiver e permessi",
                        "Notifiche in tempo reale",
                        "Sicurezza e privacy garantite"
                    ]}
                />
            )}
            {/* Switcher dei ruoli (solo se necessario) */}
            {showToggle && (
                <div className={styles.container}>
                    <div className={styles.switchContainer}>
                        <div className={styles.switch}>
                            <button
                                onClick={() => setViewMode('caregiver')}
                                className={`${styles.switchBtn} ${viewMode === 'caregiver' ? styles.switchBtnActive : ''}`}
                            >
                                Sono un Caregiver
                            </button>
                            <button
                                onClick={() => setViewMode('assisted')}
                                className={`${styles.switchBtn} ${viewMode === 'assisted' ? styles.switchBtnActive : ''}`}
                            >
                                Sono Assistito
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rendering condizionale della vista in base alla modalità selezionata */}
            {viewMode === 'assisted' ? (
                <AssistedView caregivers={caregivers} />
            ) : (
                <CaregiverView patients={patients} recentAlerts={recentAlerts} />
            )}

            <footer className={styles.footer}>
                <p>© 2026 MediGuard. La tua salute, organizzata.</p>
            </footer>
        </div>
    );
}

// --- HELPER COMPONENTS ---
// Componente per visualizzare una singola statistica nella dashboard
function StatCard({ icon, bgClass, bgStyle, value, label }) {
    // combine bgClass and bgStyle logic 
    const iconContainerClass = `${styles.statIconBox} ${bgClass || ''}`;
    return (
        <div className={`${styles.card} ${styles.cardElevated}`}>
            <CardContent className={styles.statCardContent}>
                <div className={iconContainerClass} style={bgStyle}>
                    {icon}
                </div>
                <div>
                    <p className={`${styles.title} ${styles.textSlate800}`} style={{ fontSize: '1.5rem', marginBottom: '0' }}>{value}</p>
                    <p className={`${styles.textSm} ${styles.textSlate500} ${styles.fontMedium}`}>{label}</p>
                </div>
            </CardContent>
        </div>
    );
}