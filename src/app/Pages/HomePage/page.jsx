'use client';

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import AddMedicationModal from "@/components/modals/AddMedicationModal";
import AddTherapyModal from "@/components/modals/AddTherapyModal";
import styles from "./HomePage.module.css";

// --- ICONE SVG INLINE ---
const Icons = {
    Package: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-9" /></svg>
    ),
    TrendingUp: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
    ),
    AlertTriangle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>
    ),
    Bell: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
    ),
    Pill: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>
    ),
    ChevronRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    ),
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    Users: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    Plus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    ),
    Heart: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
    ),
    X: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
    )
};

// --- UTILS PER STILI ---
const getStatusStyles = (status) => {
    switch (status) {
        case "taken": return { className: styles.statusTaken, icon: <Icons.Check />, label: "Assunto", rowClass: '' };
        case "pending": return { className: styles.statusPending, icon: <Icons.Clock />, label: "Ora", rowClass: styles.scheduleItemPending };
        default: return { className: styles.statusLater, icon: <Icons.Clock />, label: "Più tardi", rowClass: styles.scheduleItemDefault };
    }
};

const getPatientStatusClass = (status) => {
    switch (status) {
        case "ok": return styles.statusOk;
        case "warning": return styles.statusWarning;
        case "alert": return styles.statusAlert;
        default: return styles.statusDefault;
    }
};

const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 999;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getMedicineStatus = (med) => {
    const days = getDaysUntilExpiry(med.data_scadenza);
    const qtyPercent = (med.quantita_rimanente / (med.farmaco?.quantita_confezione || 100)) * 100;
    if (med.quantita_rimanente <= 0) return "terminated";
    if (days <= 0) return "expired";
    if (days <= 30) return "expiring";
    if (qtyPercent < 50) return "low";
    return "ok";
};

export default function Dashboard({ isAuthenticated: initialAuth = false }) {
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [inventoryStats, setInventoryStats] = useState({ total: 0, low: 0, expiring: 0 });
    const [lowStockMedicines, setLowStockMedicines] = useState([]);
    const [expiringMedicines, setExpiringMedicines] = useState([]);
    const [allMedicines, setAllMedicines] = useState([]);
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [adherenceToday, setAdherenceToday] = useState(0);
    const [patients, setPatients] = useState([]);
    const [totalAlerts, setTotalAlerts] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);

    const initDashboard = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. Check Authentication
            const authRes = await fetch('/api/auth/me');
            const authData = await authRes.json();

            setIsUserAuthenticated(authData.isAuthenticated);
            setIsAuthChecking(false);

            if (!authData.isAuthenticated || !authData.user) {
                setIsLoading(false);
                return;
            }
            setCurrentUser(authData.user);
            const userId = authData.user.id_utente;

            // 2. Fetch inventory data using dynamic userId
            const inventoryResponse = await fetch(`/api/armadietto?id_utente=${userId}`);
            const inventoryJson = await inventoryResponse.json();
            const rawInventoryData = Array.isArray(inventoryJson.data) ? inventoryJson.data : (Array.isArray(inventoryJson) ? inventoryJson : []);

            setAllMedicines(rawInventoryData);

            const processedInventoryData = rawInventoryData.map(item => ({
                ...item,
                computedStatus: getMedicineStatus(item) // Re-use from Armadietto page
            }));

            const total = processedInventoryData.length;
            const low = processedInventoryData.filter(m => ['low', 'terminated'].includes(m.computedStatus)).length;
            const expiring = processedInventoryData.filter(m => ['expiring', 'expired'].includes(m.computedStatus)).length;

            setInventoryStats({ total, low, expiring });

            setLowStockMedicines(
                processedInventoryData
                    .filter(m => ['low', 'terminated'].includes(m.computedStatus))
                    .map(m => ({
                        id: m.id_farmaco_armadietto,
                        name: m.farmaco?.denominazione || "Farmaco Sconosciuto",
                        quantity: m.quantita_rimanente,
                        total: m.farmaco?.quantita_confezione || 100,
                    }))
            );

            setExpiringMedicines(
                processedInventoryData
                    .filter(m => m.computedStatus === 'expiring' || m.computedStatus === 'expired')
                    .map(m => ({
                        id: m.id_farmaco_armadietto,
                        name: m.farmaco.denominazione || "Farmaco Sconosciuto",
                        expiryDate: m.data_scadenza,
                        daysLeft: getDaysUntilExpiry(m.data_scadenza), // Re-use from Armadietto page
                    }))
            );

            // 3. Fetch Therapies and Calculate Schedule
            const therapiesResponse = await fetch(`/api/terapia?id_paziente=${userId}&terapia_attiva=true`);
            const therapiesJson = await therapiesResponse.json();
            const therapies = therapiesJson.data || [];

            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

            let todaysIntakes = [];

            therapies.forEach(therapy => {
                if (therapy.assunzioni && Array.isArray(therapy.assunzioni)) {
                    therapy.assunzioni.forEach(assunzione => {
                        const scheduledDate = new Date(assunzione.data_programmata);

                        // Check if the scheduled date is today
                        if (scheduledDate >= startOfDay && scheduledDate < endOfDay) {
                            let status = "pending";
                            if (assunzione.esito === true) status = "taken";
                            // Future enhancement: handle skipped/missed based on time

                            todaysIntakes.push({
                                id: assunzione.id_evento,
                                time: scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                medicine: therapy.farmaco?.farmaco?.denominazione || therapy.nome_utilita || "Farmaco",
                                dose: therapy.dose_singola || "Dose",
                                unit: therapy.farmaco?.farmaco?.unita_misura || "Unità",
                                status: status,
                                originalDate: scheduledDate // For sorting
                            });
                        }
                    });
                }
            });

            // Sort by time
            todaysIntakes.sort((a, b) => a.originalDate - b.originalDate);

            setTodaySchedule(todaysIntakes);

            const taken = todaysIntakes.filter(s => s.status === "taken").length;
            const totalScheduled = todaysIntakes.length;
            setAdherenceToday(totalScheduled > 0 ? Math.round((taken / totalScheduled) * 100) : 0);

            // 4. Fetch Caregiver Data (Patients) via RUD-account
            let fetchedPatients = [];
            const profileRes = await fetch('/api/RUD-account?me');
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                if (profileData.caregiver && Array.isArray(profileData.caregiver)) {
                    fetchedPatients = profileData.caregiver.map(rel => {
                        const p = rel.assistito;
                        const s = p.dashboardStats || {};
                        return {
                            id: p.id_utente,
                            name: `${p.nome} ${p.cognome}`,
                            initials: `${p.nome?.[0] || '?'}${p.cognome?.[0] || '?'}`.toUpperCase(),
                            adherence: s.adherenceToday ?? 0, // Using adherenceToday for the UI bar
                            status: s.status || "ok",
                            alerts: s.alerts ?? 0
                        };
                    });
                    setPatients(fetchedPatients);
                }
            }

            const totalPatientAlerts = fetchedPatients.reduce((sum, p) => sum + p.alerts, 0);
            setTotalAlerts(expiring + low + totalPatientAlerts); // Combine all alerts

        } catch (error) {
            console.error("Errore nel caricamento dei dati della dashboard:", error);
            // Optionally set error state to display a message to the user
        } finally {
            setIsLoading(false);
            setIsAuthChecking(false);
        }
    }, []);

    useEffect(() => {
        initDashboard();
    }, [initDashboard]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setIsUserAuthenticated(false);
            window.location.href = '/Pages/Autenticazione'; // Reindirizza al login
        } catch (err) {
            console.error("Errore logout", err);
        }
    };

    const takenCount = todaySchedule.filter(s => s.status === "taken").length;

    if (isAuthChecking) {
        return (
            <div className={styles.loadingPage}>
                <div className={styles.spinnerWrapper}>
                    <div className={styles.spinner}></div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* Navbar rimossa da qui e spostata nel layout */}

            <main className={styles.mainContent}>
                <div className={styles.container}>

                    {/* Header */}
                    <div className={styles.headerSection}>
                        <h1 className={styles.pageTitle}>Dashboard</h1>
                        <p className={styles.pageSubtitle}>
                            Panoramica completa della tua gestione farmaceutica
                        </p>
                    </div>

                    {/* --- MAIN STATS (GRID) --- */}
                    <div className={styles.statsGrid}>
                        <StatCard
                            icon={<Icons.Package />}
                            iconBg={styles.bgTeal50}
                            iconColor="text-[#14b8a6]"
                            value={inventoryStats.total}
                            label="Farmaci Totali"
                        />
                        <StatCard
                            icon={<Icons.TrendingUp />}
                            iconBg={styles.bgEmerald50}
                            iconColor="text-emerald-600"
                            value={`${adherenceToday}%`}
                            label="Aderenza Oggi"
                        />
                        <StatCard
                            icon={<Icons.AlertTriangle />}
                            iconBg={styles.bgAmber50}
                            iconColor="text-amber-500"
                            value={inventoryStats.low}
                            label="Scorte Basse"
                        />
                        <StatCard
                            icon={<Icons.Bell />}
                            iconBg={styles.bgRose50}
                            iconColor="text-rose-500"
                            value={totalAlerts}
                            label="Alert Attivi"
                        />
                    </div>

                    <div className={styles.mainGrid}>

                        {/* --- TERAPIE DI OGGI (Colonna Grande) --- */}
                        <div className={styles.leftColumn}>
                            {isLoading ? (
                                <div className={styles.cardLoading}>
                                    <div className={styles.spinnerWrapper}>
                                        <div className={styles.spinner}></div>
                                    </div>
                                    <p className={styles.pageSubtitle}>Caricamento dati...</p>
                                </div>
                            ) : (
                                <div className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardHeaderTitleGroup}>
                                            <div className={styles.textTeal}><Icons.Pill /></div>
                                            <h2 className={styles.cardTitle}>Terapie di Oggi</h2>
                                        </div>
                                        <Link href="Terapie" className={styles.cardLink}>
                                            Vedi tutto <Icons.ChevronRight />
                                        </Link>
                                    </div>

                                    <div className={styles.cardBody}>
                                        {/* Progress Bar Header */}
                                        <div className={styles.progressSection}>
                                            <div>
                                                <p className={styles.progressLabel}>Progressi</p>
                                                <p className={styles.progressValue}>{takenCount}/{todaySchedule.length} assunzioni</p>
                                            </div>
                                            <div className={styles.progressBarWrapper}>
                                                <div className={styles.progressBarTrack}>
                                                    <div className={styles.progressBarFill} style={{ width: `${adherenceToday}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lista Farmaci */}
                                        <div className={styles.scheduleList}>
                                            {todaySchedule.map((item) => {
                                                const style = getStatusStyles(item.status);
                                                return (
                                                    <div key={item.id} className={`${styles.scheduleItem} ${style.rowClass}`}>
                                                        <span className={styles.scheduleTime}>{item.time}</span>
                                                        <div className={styles.scheduleInfo}>
                                                            <p className={`${styles.scheduleMedicine} ${item.status === 'taken' ? styles.scheduleTakenText : ''}`}>
                                                                {item.medicine.toUpperCase()} - <span className={styles.scheduleDose}>{item.dose} {item.unit}</span>
                                                            </p>
                                                        </div>
                                                        <div className={`${styles.statusBadge} ${style.className}`}>
                                                            <div style={{ width: 12, height: 12 }}>{style.icon}</div>
                                                            {style.label}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- CAREGIVER SECTION --- */}
                            {currentUser?.ruolo === 'Caregiver' && (
                                <div className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardHeaderTitleGroup}>
                                            <div className={styles.textTeal}><Icons.Users /></div>
                                            <h2 className={styles.cardTitle}>I Tuoi Assistiti</h2>
                                        </div>
                                        <Link href="/Pages/Caregiver" className={styles.cardLink}>
                                            Vedi tutto <Icons.ChevronRight />
                                        </Link>
                                    </div>

                                    {isLoading ? (
                                        <div className={styles.cardEmpty}>Caricamento assistiti...</div>
                                    ) : patients.length > 0 ? (
                                        <div className={styles.caregiverGrid}>
                                            {patients.map((patient) => (
                                                <Link key={patient.id} href={`/Pages/Assistito/${patient.id}`} className={styles.patientCard}>
                                                    <div className={styles.patientAvatarWrapper}>
                                                        <div className={styles.patientAvatar}>
                                                            {patient.initials}
                                                        </div>
                                                        <div className={`${styles.patientStatusIndicator} ${getPatientStatusClass(patient.status)}`} />
                                                    </div>

                                                    <div className={styles.patientInfo}>
                                                        <p className={styles.patientName}>{patient.name}</p>
                                                        <div className={styles.adherenceRow}>
                                                            <div className={styles.adherenceTrack}>
                                                                <div
                                                                    className={`${styles.adherenceBar} ${patient.adherence > 80 ? styles.adherenceGreen : patient.adherence > 50 ? styles.adherenceYellow : styles.adherenceRed}`}
                                                                    style={{ width: `${patient.adherence}%` }}
                                                                />
                                                            </div>
                                                            <span className={styles.adherenceText}>{patient.adherence}%</span>
                                                        </div>
                                                    </div>

                                                    {patient.alerts > 0 && (
                                                        <div className={styles.patientAlertBadge}>
                                                            {patient.alerts}
                                                        </div>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={styles.cardEmpty}>Nessun assistito configurato.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* --- COLONNA DESTRA (Alerts & Azioni) --- */}
                        <div className={styles.rightColumn}>

                            {/* Card Alert Scorte */}
                            {isLoading ? (
                                <div className={styles.cardEmpty}>Caricamento scorte...</div>
                            ) : lowStockMedicines.length > 0 ? (
                                <div className={styles.card}>
                                    <div className={`${styles.cardHeader} ${styles.alertHeaderLow}`}>
                                        <div className={styles.cardHeaderTitleGroup}>
                                            <Icons.AlertTriangle /> Scorte Basse
                                        </div>
                                        <Link href="Armadietto" className={styles.cardLink}><Icons.ChevronRight /></Link>
                                    </div>
                                    <div className={styles.alertList}>
                                        {lowStockMedicines.map((med) => (
                                            <div key={med.id} className={styles.alertItem}>
                                                <span className={styles.alertName}>{med.name}</span>
                                                <span className={`${styles.alertBadge} ${med.quantity === 0 ? styles.badgeTerminated : styles.badgeLow}`}>
                                                    {med.quantity === 0 ? 'Terminato' : med.quantity + "/" + med.total}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.cardEmpty}>Nessun farmaco con scorte basse.</div>
                            )}

                            {/* Card Scadenze */}
                            {isLoading ? (
                                <div className={styles.cardEmpty}>Caricamento scadenze...</div>
                            ) : expiringMedicines.length > 0 ? (
                                <div className={styles.card}>
                                    <div className={`${styles.cardHeader} ${styles.alertHeaderExpired}`}>
                                        <div className={styles.cardHeaderTitleGroup}>
                                            <Icons.Calendar /> In Scadenza
                                        </div>
                                        <Link href="Armadietto" className={styles.cardLink}><Icons.ChevronRight /></Link>
                                    </div>
                                    <div className={styles.alertList}>
                                        {expiringMedicines.map((med) => (
                                            <div key={med.id} className={styles.alertItem}>
                                                <span className={styles.alertName}>{med.name}</span>
                                                <span className={`${styles.alertBadge} ${styles.badgeExpired}`}>
                                                    {med.daysLeft <= 0 ? "Scaduto!" : `-${med.daysLeft} gg`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.cardEmpty}>Nessun farmaco in scadenza.</div>
                            )}

                            {/* Quick Actions */}
                            <div className={styles.quickActionGrid}>
                                <QuickAction
                                    onClick={() => setActiveModal('add-med')}
                                    icon={<Icons.Plus />}
                                    title="Aggiungi Farmaco"
                                    subtitle="Scansiona o inserisci"
                                    customClass={styles.qaTeal}
                                />
                                <QuickAction
                                    onClick={() => setActiveModal('new-therapy')}
                                    icon={<Icons.Pill />}
                                    title="Nuova Terapia"
                                    subtitle="Pianifica assunzioni"
                                    customClass={styles.qaIndigo}
                                />
                                <QuickAction
                                    href="Ricerca"
                                    icon={<Icons.Heart />}
                                    title="Cerca Farmaci"
                                    subtitle="Database AIFA"
                                    customClass={styles.qaRose}
                                />
                            </div>


                        </div>
                    </div>
                </div>
            </main>

            <AddMedicationModal
                isOpen={activeModal === 'add-med'}
                onClose={() => setActiveModal(null)}
                onSuccess={() => { initDashboard(); setActiveModal(null); }}
                userId={currentUser?.id_utente}
            />

            <AddTherapyModal
                isOpen={activeModal === 'new-therapy'}
                onClose={() => setActiveModal(null)}
                onSuccess={() => { initDashboard(); setActiveModal(null); }}
                userId={currentUser?.id_utente}
                cabinetMedicines={allMedicines}
            />

            {/* Footer Semplificato */}
            <footer className={styles.footer}>
                <p>© 2026 MediGuard. La tua salute, organizzata.</p>
            </footer>
        </div>
    );
}

// --- COMPONENTI HELPER ---

function StatCard({ icon, iconColor, iconBg, value, label }) {
    // Note: iconColor is passed as a Tailwind class string in props (e.g. "text-emerald-600").
    // Since we are moving to CSS modules, we should handle this.
    // However, SVG icons use `stroke="currentColor"`, so applying a color class to the parent wrapper works if defined in global CSS or if we pass a style object.
    // For simplicity, I'm assuming global utility classes for text colors might still exist or we should use inline styles if strict "no tailwind" is required.
    // But better yet, let's use the passed class if it's a valid global class, OR map it.
    // Given the constraints, I will leave the `className={iconColor}` if it's just text color, assuming standard CSS utilities might not be available.
    // To be safe and compliant, I will apply the color via style object if it looks like a tailwind class, or just render it.
    // Actually, simpler: I'll accept `iconColor` as a className but since we removed Tailwind, these won't work unless they are in globals.css.
    // I will convert specific color classes to inline styles for the prototype to ensure it works without Tailwind.
    
    const getColor = (cls) => {
        if (cls.includes('teal')) return '#14b8a6';
        if (cls.includes('emerald')) return '#059669';
        if (cls.includes('amber')) return '#d97706';
        if (cls.includes('rose')) return '#e11d48';
        if (cls.includes('indigo')) return '#4f46e5';
        return 'currentColor';
    };

    return (
        <div className={styles.statCard}>
            <div className={`${styles.statIconWrapper} ${iconBg}`} style={{ color: getColor(iconColor) }}>
                {icon}
            </div>
            <div>
                <p className={styles.statValue}>{value}</p>
                <p className={styles.statLabel}>{label}</p>
            </div>
        </div>
    );
}


function QuickAction({ href, onClick, icon, title, subtitle, customClass }) {
    
    const content = (
        <>
            <div className={`${styles.quickActionIcon} ${customClass}`}>
                {icon}
            </div>
            <div>
                <p className={styles.quickActionTitle}>{title}</p>
                <p className={styles.quickActionSubtitle}>{subtitle}</p>
            </div>
        </>
    );

    if (href) {
        return (
            <Link href={href} className={styles.quickAction}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={styles.quickAction}>
            {content}
        </button>
    );
}