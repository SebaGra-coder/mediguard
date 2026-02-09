'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GuestOverlay } from "@/components/GuestOverlay";
import styles from './Caregiver.module.css';

// --- ICONE SVG INTERNE ---
const Icons = {
    Plus: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
    Users: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    AlertTriangle: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>,
    Clock: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Bell: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>,
    Phone: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
    Mail: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
    Settings: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>,
    ChevronRight: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>,
    Shield: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>,
    Heart: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>,
    Calendar: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
};

// --- COMPONENTI UI RIUTILIZZABILI ---
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
function AssistedView({ caregivers }) {
    const handleEmailCaregiver = (email, e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.assign(`mailto:${email}`);
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

                    <Card variant="default" style={{ borderStyle: 'dashed', backgroundColor: '#f8fafc' }}>
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
function CaregiverView({ patients, recentAlerts }) {
    const totalAlerts = patients.reduce((sum, p) => sum + p.alerts + p.lowStock, 0);
    const avgAdherence = patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.adherenceWeek, 0) / patients.length) : 0;
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
export default function CaregiverDashboard({ isAuthenticated: initialAuth = false }) {
    const router = useRouter();
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    // Dati
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
                            // ... logica esistente ...
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