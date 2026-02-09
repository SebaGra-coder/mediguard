'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { GuestOverlay } from "@/components/GuestOverlay";
import AddTherapyModal from "@/components/modals/AddTherapyModal";
import TherapyDetailsModal from "@/components/modals/TherapyDetailsModal";

import QuickAssumptionModal from "@/components/modals/QuickAssumptionModal";
import { useTherapies } from "@/hooks/useTherapies";
import { useToast } from "@/hooks/useToast";
import styles from './Terapie.module.css';

// --- ICONE SVG INTERNE ---
const Icons = {
    Plus: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
    Calendar: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
    Clock: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Check: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    X: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>,
    ChevronLeft: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>,
    ChevronRight: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>,
    Pill: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>,
    Eye: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
    Edit: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>,

    Play: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
    Pause: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
    AlertTriangle: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
    Bell: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>,
};

// --- COMPONENTI UI RIUTILIZZABILI (Style MediGuard) ---
const Card = ({ children, className = "" }) => (
    <div className={`${styles.card} ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "primary", size = "md", className = "", type = "button", disabled }) => {
    const variants = {
        primary: styles.btnPrimary,
        secondary: styles.btnSecondary,
        ghost: styles.btnGhost,
        destructive: styles.btnDestructive,
        outline: styles.btnOutline
    };

    const sizes = {
        sm: styles.btnSm,
        md: styles.btnMd,
        icon: styles.btnIcon,
    };

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${styles.btn} ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </button>
    );
};

const Badge = ({ children, variant = "default", className = "" }) => {
    const variants = {
        default: styles.badgeDefault,
        success: styles.badgeSuccess,
        warning: styles.badgeWarning,
        destructive: styles.badgeDestructive,
    };
    return <span className={`${styles.badge} ${variants[variant]} ${className}`}>{children}</span>;
};

// --- LOGICA PRINCIPALE ---
export default function Terapie({ isAuthenticated: initialAuth = false }) {
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
    const [userData, setUserData] = useState(null);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [cabinetMedicines, setCabinetMedicines] = useState([]);
    const [rawTherapies, setRawTherapies] = useState([]);

    const { showToast, ToastComponent } = useToast();

    const { therapyPlans, fetchTherapies, isLoading: isTherapyLoading } = useTherapies();

    // Modals state
    const [modalState, setModalState] = useState({ type: null, data: null }); // type: 'view' | 'edit' | 'add' | 'delete' | 'quick-add'

    const handlePrevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                setIsUserAuthenticated(data.isAuthenticated);
                if (data.isAuthenticated) {
                    setUserData(data.user);
                    fetchCabinet(data.user.id_utente);
                    fetchTherapies(data.user.id_utente);
                    fetchDailySchedule(data.user.id_utente, selectedDate);
                }
            } catch (err) {
                console.error("Errore verifica auth", err);
            } finally {
                setIsAuthChecking(false);
            }
        };
        checkAuth();
    }, [selectedDate, fetchTherapies]);

    // Registrazione Service Worker e Listener per aggiornamenti da notifica
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registrato'))
                .catch(err => console.error('Errore registrazione SW:', err));

            const handleMessage = (event) => {
                if (event.data && event.data.type === 'REFRESH_DATA') {
                    if (userData?.id_utente) {
                        fetchTherapies(userData.id_utente);
                        fetchDailySchedule(userData.id_utente, selectedDate);
                        showToast("Assunzione confermata da notifica!", "success");
                    }
                }
            };

            navigator.serviceWorker.addEventListener('message', handleMessage);
            return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
        }
    }, [userData, selectedDate, fetchTherapies, showToast]);

    const fetchCabinet = async (userId) => {
        try {
            const res = await fetch(`/api/armadietto?id_utente=${userId}`);
            const data = await res.json();
            if (data.data) {
                setCabinetMedicines(data.data);
            }
        } catch (err) {
            console.error("Errore caricamento armadietto", err);
        }
    };

    const fetchDailySchedule = async (userId, date) => {
        try {
            const res = await fetch(`/api/terapia?id_paziente=${userId}`);
            const json = await res.json();
            
            if (json.success && Array.isArray(json.data)) {
                setRawTherapies(json.data);
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
    
                const dailyIntakes = [];
                
                json.data.forEach(terapia => {
                    const allAssunzioni = [
                        ...(terapia.assunzioni || []),
                        ...(terapia.assunzioni_passate || [])
                    ];

                    if (allAssunzioni.length > 0) {
                        allAssunzioni.forEach(assunzione => {
                            const assunzioneDate = new Date(assunzione.data_programmata);
                            
                            if (assunzioneDate >= startOfDay && assunzioneDate <= endOfDay) {
                                // CORREZIONE LOGICA STATO:
                                const nowTime = new Date().getTime();
                                const scheduledTime = assunzioneDate.getTime();
                                const LATE_THRESHOLD_MS = 60 * 60 * 1000; // 1 ora di tolleranza

                                let currentStatus = "pending";
                                let isTakenLate = false;

                                if (assunzione.esito) {
                                    currentStatus = "taken";
                                    // Se assunto dopo 1 ora dall'orario programmato
                                    if (assunzione.orario_effettivo) {
                                        const takenTime = new Date(assunzione.orario_effettivo).getTime();
                                        if (takenTime > scheduledTime + LATE_THRESHOLD_MS) {
                                            isTakenLate = true;
                                        }
                                    }
                                } else {
                                    if (nowTime > scheduledTime + LATE_THRESHOLD_MS) {
                                        currentStatus = "late"; // In ritardo
                                    } else if (scheduledTime > nowTime + LATE_THRESHOLD_MS) {
                                        currentStatus = "upcoming";
                                    }
                                }
    
                                dailyIntakes.push({
                                    id: assunzione.id_evento || assunzione.id,
                                    // Uso toLocaleTimeString senza UTC per riflettere l'ora locale dell'utente
                                    time: assunzioneDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
                                    medicine: terapia.farmaco?.farmaco?.denominazione || "Farmaco",
                                    dosage: terapia.dose_singola + " " + (terapia.farmaco?.farmaco?.unita_misura || ""),
                                    status: currentStatus,
                                    isTakenLate: isTakenLate,
                                    takenAt: assunzione.orario_effettivo ? new Date(assunzione.orario_effettivo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}) : null
                                });
                            }
                        });
                    }
                });
                
                dailyIntakes.sort((a, b) => a.time.localeCompare(b.time));
                setTodaySchedule(dailyIntakes);
            }
        } catch (err) {
            console.error("Errore caricamento programma giornaliero", err);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setIsUserAuthenticated(false);
            window.location.href = '/Pages/Autenticazione';
        } catch (err) {
            console.error("Errore logout", err);
        }
    };

    const takenCount = todaySchedule.filter(s => s.status === "taken").length;
    const adherencePercentage = todaySchedule.length > 0 ? Math.round((takenCount / todaySchedule.length) * 100) : 100;

    const handleSuccess = (message) => {
        if (userData) {
            fetchTherapies(userData.id_utente);
            fetchDailySchedule(userData.id_utente, selectedDate);
        }
        setModalState({ type: null, data: null });
        if (message) showToast(message, 'success');
    };

    const handleToggleStatus = async (id) => {
        const therapy = therapyPlans.find(p => p.id === id);
        if (!therapy) return;

        const newStatus = therapy.stato === "attiva" ? false : true;

        try {
            const res = await fetch('/api/terapia', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_terapia: id,
                    terapia_attiva: newStatus
                })
            });

            if (res.ok) {
                fetchTherapies(userData.id_utente);
                fetchDailySchedule(userData.id_utente, selectedDate);
                showToast(`Terapia ${newStatus ? 'attivata' : 'sospesa'}`, 'success');
            } else {
                showToast("Errore aggiornamento stato", "error");
            }
        } catch (e) {
            console.error("Errore toggle status:", e);
            showToast("Errore di connessione", "error");
        }
    };

    const handleConfirmIntake = async (id) => {
        if (!id) {
            showToast("ID evento non valido", "error");
            return;
        }

        try {
            const now = new Date();
            const res = await fetch('/api/assunzione', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_evento: id,
                    esito: true,
                    orario_effettivo: now.toISOString()
                })
            });
            
            if (res.ok) {
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
                setTodaySchedule(sched => sched.map(s => s.id === id ? { ...s, status: "taken", takenAt: timeStr } : s));
                if (userData?.id_utente) {
                    fetchTherapies(userData.id_utente);
                }
                showToast("Assunzione confermata", "success");
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Errore API assunzione:", errorData);
                showToast(errorData.error || "Errore durante la conferma", "error");
            }
        } catch (error) {
            console.error("Errore conferma assunzione", error);
            showToast("Errore di connessione", "error");
        }
    };

    const getTherapyWarnings = (therapyId) => {
        const therapy = rawTherapies.find(t => t.id_terapia === therapyId);
        if (!therapy || !therapy.farmaco) return [];

        const warnings = [];
        const farmaco = therapy.farmaco;
        const now = new Date();

        // 1. Scadenza (Controlla la scadenza della scatola attualmente in uso)
        if (farmaco.data_scadenza) {
            const expiry = new Date(farmaco.data_scadenza);
            const daysToExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
            
            if (daysToExpiry < 0) {
                warnings.push({ type: 'destructive', icon: Icons.AlertTriangle, text: "Farmaco in uso scaduto!" });
            } else if (daysToExpiry <= 30) {
                warnings.push({ type: 'warning', icon: Icons.Clock, text: `Scatola in uso scade tra ${daysToExpiry} giorni` });
            }
        }

        // 2. Scorte e Predizione (Basato sul TOTALE delle scorte con stesso AIC)
        if (!therapy.solo_al_bisogno && therapy.terapia_attiva && therapy.orari && therapy.orari.length > 0) {
            
            // Calcola lo stock totale sommando tutte le scatole con lo stesso AIC
            const targetAIC = farmaco.codice_aic;
            const totalStock = cabinetMedicines
                .filter(med => med.codice_aic === targetAIC)
                .reduce((sum, med) => sum + med.quantita_rimanente, 0);

            const dailyDose = parseFloat(therapy.dose_singola) * therapy.orari.length;
            
            let totalNeeded = 0;
            let isFinite = false;
            let isEnded = false;

            if (therapy.data_fine) {
                const end = new Date(therapy.data_fine);
                end.setHours(23, 59, 59, 999);
                
                if (end >= now) {
                    const diffMs = end.getTime() - now.getTime();
                    const daysNeeded = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                    totalNeeded = dailyDose * daysNeeded;
                    isFinite = true;
                } else {
                    isEnded = true;
                }
            }

            const daysCovered = dailyDose > 0 ? Math.floor(totalStock / dailyDose) : 0;

            if (isFinite) {
                if (totalStock < totalNeeded) {
                    warnings.push({ 
                        type: 'warning', 
                        icon: Icons.AlertTriangle, 
                        text: totalStock === 0 ? 'Scorta terminata (tutte le scatole)' :`Scorta totale insufficiente. Hai ${totalStock}, servono ${totalNeeded}. Copri solo ${daysCovered} giorni.` 
                    });
                }
            } else if (!isEnded) {
                if (daysCovered < 7) {
                     warnings.push({ 
                        type: 'warning', 
                        icon: Icons.AlertTriangle, 
                        text: `Scorta totale bassa: copre solo ${daysCovered} giorni.` 
                    });
                }
            }
        } else if (therapy.solo_al_bisogno) {
             // Anche per "al bisogno", controlliamo il totale
             const targetAIC = farmaco.codice_aic;
             const totalStock = cabinetMedicines
                .filter(med => med.codice_aic === targetAIC)
                .reduce((sum, med) => sum + med.quantita_rimanente, 0);

             if (totalStock < 5) {
                 warnings.push({ type: 'warning', icon: Icons.AlertTriangle, text: `Scorta totale bassa (${totalStock} rimasti)` });
             }
        }

        return warnings;
    };

    if (isAuthChecking) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <ToastComponent />

            {!isUserAuthenticated && (
                <GuestOverlay
                    title="Gestione Terapie"
                    description="Organizza e monitora tutte le tue assunzioni quotidiane"
                    features={[
                        "Creare piani terapeutici personalizzati",
                        "Ricevere notifiche per ogni assunzione",
                        "Confermare le assunzioni con un tap",
                        "Monitorare l'aderenza nel tempo"
                    ]}
                />
            )}

            <main className={styles.main}>
                <div className={styles.contentWrapper}>

                    {/* HEADER PAGINA */}
                    <div className={styles.pageHeader}>
                        <div>
                            <h1 className={styles.headerTitle}>Le Mie Terapie</h1>
                            <p className={styles.headerSubtitle}>Gestisci i tuoi piani terapeutici e monitora le assunzioni.</p>
                        </div>
                        <div className={styles.headerButtons}>
                            <Button onClick={() => setModalState({ type: 'add', data: null })} className="shadow-md">
                                <Icons.Plus className={`${styles.iconSmall} ${styles.marginRightSmall}`} /> Nuova Terapia
                            </Button>
                        </div>
                    </div>

                    <div className={styles.gridLayout}>

                        {/* --- COLONNA SINISTRA: PROGRAMMA GIORNALIERO --- */}
                        <div className={styles.leftColumn}>

                            {/* Navigazione Data */}
                            <Card className={styles.dateNavCard}>
                                <Button variant="ghost" size="icon" onClick={handlePrevDay}><Icons.ChevronLeft className={styles.iconMedium} /></Button>
                                <div className={styles.dateDisplay}>
                                    <p className={styles.dateWeekday}>{selectedDate.toLocaleDateString("it-IT", { weekday: "long" })}</p>
                                    <p className={styles.dateFull}>{selectedDate.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleNextDay}><Icons.ChevronRight className={styles.iconMedium} /></Button>
                            </Card>

                            {/* Progress Bar Aderenza */}
                            <Card className={styles.adherenceCard}>
                                <div className={styles.adherenceHeader}>
                                    <div>
                                        <p className={styles.adherenceLabel}>Aderenza giornaliera</p>
                                        <p className={styles.adherenceValue}>{adherencePercentage}%</p>
                                    </div>
                                    <div className={styles.adherenceStats}>
                                        <p className={styles.adherenceStatsLabel}>Assunzioni completate</p>
                                        <p className={styles.adherenceStatsValue}>{takenCount} <span className={styles.adherenceStatsValueTotal}>/ {todaySchedule.length}</span></p>
                                    </div>
                                </div>
                                <div className={styles.progressBarBg}>
                                    <div className={styles.progressBarFill} style={{ width: `${adherencePercentage}%` }} />
                                </div>
                            </Card>

                            {/* Lista Oraria */}
                            <div className={styles.scheduleList}>
                                <h2 className={styles.scheduleTitle}><Icons.Clock className={`${styles.iconMedium} ${styles.textSlate400}`} /> Programma di oggi</h2>
                                {todaySchedule.map((item) => {
                                    const isCurrent = item.status === "pending" || item.status === "late";
                                    const isTaken = item.status === "taken";

                                    return (
                                        <Card key={item.id} className={`${styles.scheduleCard} ${isCurrent ? styles.scheduleCardCurrent : ""} ${isTaken ? styles.scheduleCardPast : ""}`}>
                                            <div className={styles.scheduleCardInner}>
                                                {/* Fascia Oraria Laterale */}
                                                <div className={`${styles.timeColumn} ${isTaken ? styles.timeColumnTaken : styles.timeColumnDefault}`}>
                                                    <span className={styles.timeText}>{item.time}</span>
                                                </div>

                                                {/* Contenuto Card */}
                                                <div className={styles.cardContent}>
                                                    <div>
                                                        <p className={`${styles.medicineName} ${isTaken ? styles.medicineNameTaken : ""}`}>{item.medicine}</p>
                                                        <p className={styles.medicineDosage}>{item.dosage}</p>
                                                    </div>

                                                    {/* Azioni / Status */}
                                                    <div>
                                                        {isCurrent ? (
                                                            <div className={styles.statusAction}>
                                                                {item.status === 'late' && (
                                                                    <span className={styles.lateLabel}>
                                                                        <Icons.AlertTriangle className={styles.warningIcon} /> In ritardo
                                                                    </span>
                                                                )}
                                                                <Button size="sm" onClick={() => handleConfirmIntake(item.id)} className={item.status === 'late' ? styles.btnConfirmLate : styles.btnConfirm}>
                                                                    <Icons.Check className={`${styles.iconSmall} ${styles.marginRightSmall}`} /> Conferma
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Badge variant={isTaken ? (item.isTakenLate ? "warning" : "success") : "default"} className="flex items-center gap-1">
                                                                {isTaken ? <Icons.Check className={styles.warningIcon} /> : <Icons.Clock className={styles.warningIcon} />}
                                                                {isTaken 
                                                                    ? (item.isTakenLate ? `Assunto in ritardo alle ${item.takenAt}` : `Assunto alle ${item.takenAt}`)
                                                                    : "Programmato"}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>

                        {/* --- COLONNA DESTRA: TERAPIE ATTIVE --- */}
                        <div className={styles.rightColumn}>
                            <div className={styles.quickAddBox}>
                                <div className={styles.quickAddIconWrapper}>
                                    <Icons.Plus className={styles.iconLarge} />
                                </div>
                                <h3 className={styles.quickAddTitle}>Registra assunzione</h3>
                                <p className={styles.quickAddSubtitle}>Per farmaci &quot;al bisogno&quot;</p>

                                <Button
                                    variant="outline"
                                    className={styles.btnQuickAdd}
                                    onClick={() => setModalState({ type: 'quick-add', data: null })}
                                >
                                    Registra ora
                                </Button>
                            </div>

                            <div className={styles.activeTherapiesHeader}>
                                <h2 className={styles.activeTherapiesTitle}>Terapie Attive</h2>
                                <Badge variant="default">{therapyPlans.filter(t => t.stato === 'attiva').length} in corso</Badge>
                            </div>

                            {therapyPlans.map((plan) => (
                                <Card key={plan.id} className={styles.activeTherapyCard}>
                                    <div className={styles.therapyHeader}>
                                        <div className={styles.therapyHeaderContent}>
                                            <div className={styles.therapyIcon}>
                                                <Icons.Pill className={styles.iconMedium} />
                                            </div>
                                            <div className={styles.therapyInfo}>
                                                <h3 className={styles.therapyName}>{plan.medicine}</h3>
                                                <p className={styles.therapyFrequency}>{plan.frequency}</p>
                                            </div>
                                        </div>
                                        <Badge variant={plan.stato === 'attiva' ? 'success' : 'default'}>{plan.stato}</Badge>
                                    </div>

                                    <div className={styles.adherenceSection}>
                                        <div className={styles.adherenceInfo}>
                                            <span className={styles.textSlate400}>Aderenza</span>
                                            <span className={styles.textSlate700Bold}>{plan.adherence}%</span>
                                        </div>
                                        <div className={styles.adherenceBarContainer}>
                                            <div className={`${styles.adherenceBar} ${plan.adherence > 80 ? styles.adherenceHigh : styles.adherenceMedium}`} style={{ width: `${plan.adherence}%` }} />
                                        </div>
                                        <div className={styles.durationInfo}>
                                            <span className={styles.textSlate400}>Durata: <span className={styles.textSlate600Medium}>{plan.duration}</span></span>
                                            {plan.daysLeft && <span className={styles.daysLeft}>{plan.daysLeft} gg rimasti</span>}
                                        </div>
                                    </div>

                                    {/* Warnings Section */}
                                    <div className={styles.warningsContainer}>
                                        {getTherapyWarnings(plan.id).map((warn, idx) => (
                                            <div key={idx} className={`${styles.warningItem} ${warn.type === 'destructive' ? styles.warningDestructive : styles.warningWarning}`}>
                                                <warn.icon className={styles.warningIcon} />
                                                <span>{warn.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pulsanti Azione */}
                                    <div className={styles.cardFooter}>
                                        <Button variant="ghost" size="icon" onClick={() => setModalState({ type: 'view', data: plan })} title="Dettagli"><Icons.Eye className={styles.iconSmall} /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(plan.id)} title={plan.stato === 'attiva' ? "Sospendi" : "Attiva"}>
                                            {plan.stato === 'attiva' ? <Icons.Pause className={`${styles.iconSmall} ${styles.iconAmber}`} /> : <Icons.Play className={`${styles.iconSmall} ${styles.iconEmerald}`} />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setModalState({ type: 'edit', data: plan })} title="Modifica"><Icons.Edit className={styles.iconSmall} /></Button>

                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* --- MODALS --- */}
            <AddTherapyModal
                isOpen={modalState.type === 'add' || modalState.type === 'edit'}
                onClose={() => setModalState({ type: null, data: null })}
                onSuccess={handleSuccess}
                userId={userData?.id_utente}
                cabinetMedicines={cabinetMedicines}
                initialData={modalState.type === 'edit' ? modalState.data : null}
            />

            <TherapyDetailsModal
                isOpen={modalState.type === 'view'}
                onClose={() => setModalState({ type: null, data: null })}
                therapy={modalState.data}
            />



            <QuickAssumptionModal
                isOpen={modalState.type === 'quick-add'}
                onClose={() => setModalState({ type: null, data: null })}
                userId={userData?.id_utente}
                cabinetMedicines={cabinetMedicines}
                onSuccess={handleSuccess}
                therapyPlans={therapyPlans}
            />

            <footer className={styles.footer}>
                <p>© 2026 MediGuard. La tua salute, organizzata.</p>
            </footer>
        </div>
    );
}