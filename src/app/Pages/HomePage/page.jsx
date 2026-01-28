'use client';

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import AddMedicationModal from "@/components/modals/AddMedicationModal";
import AddTherapyModal from "@/components/modals/AddTherapyModal";

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
        case "taken": return { bg: "bg-emerald-100", text: "text-emerald-700", icon: <Icons.Check />, label: "Assunto" };
        case "pending": return { bg: "bg-amber-100", text: "text-amber-700", icon: <Icons.Clock />, label: "Ora" };
        default: return { bg: "bg-slate-100", text: "text-slate-500", icon: <Icons.Clock />, label: "Più tardi" };
    }
};

const getPatientStatusColor = (status) => {
    switch (status) {
        case "ok": return "bg-emerald-500";
        case "warning": return "bg-amber-500";
        case "alert": return "bg-rose-500";
        default: return "bg-slate-300";
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
            const inventoryResponse = await fetch(`/api/antonio?id_utente=${userId}`);
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14b8a6]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar isAuthenticated={isUserAuthenticated} onLogout={handleLogout} />

            <main className="pt-10 pb-16">
                <div className="container mx-auto px-4 max-w-7xl">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2 text-slate-800 tracking-tight">Dashboard</h1>
                        <p className="text-slate-500">
                            Panoramica completa della tua gestione farmaceutica
                        </p>
                    </div>

                    {/* --- MAIN STATS (GRID) --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            icon={<Icons.Package />}
                            iconColor="text-[#14b8a6]"
                            iconBg="bg-teal-50" // Corretto da bg-teal-50 a bg-teal-50
                            value={inventoryStats.total}
                            label="Farmaci Totali"
                        />
                        <StatCard
                            icon={<Icons.TrendingUp />}
                            iconColor="text-emerald-600"
                            iconBg="bg-emerald-50"
                            value={`${adherenceToday}%`}
                            label="Aderenza Oggi"
                        />
                        <StatCard
                            icon={<Icons.AlertTriangle />}
                            iconColor="text-amber-500"
                            iconBg="bg-amber-50"
                            value={inventoryStats.low}
                            label="Scorte Basse"
                        />
                        <StatCard
                            icon={<Icons.Bell />}
                            iconColor="text-rose-500"
                            iconBg="bg-rose-50"
                            value={totalAlerts}
                            label="Alert Attivi"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* --- TERAPIE DI OGGI (Colonna Grande) --- */}
                        <div className="lg:col-span-2 space-y-6"> {/* Aggiunto lg:col-span-2 per occupare 2/3 della larghezza su schermi grandi */}
                            {isLoading ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#14b8a6] mx-auto"></div>
                                    <p className="mt-4 text-slate-500">Caricamento dati...</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="text-[#14b8a6]"><Icons.Pill /></div>
                                            <h2 className="font-bold text-lg text-slate-800">Terapie di Oggi</h2>
                                        </div>
                                        <Link href="Terapie" className="text-sm font-medium text-slate-500 hover:text-[#14b8a6] flex items-center gap-1 transition-colors">
                                            Vedi tutto <Icons.ChevronRight />
                                        </Link>
                                    </div>

                                    <div className="p-6">
                                        {/* Progress Bar Header */}
                                        <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div>
                                                <p className="text-s text-slate-500 font-semibold tracking-wide">Progressi</p>
                                                <p className="text-l font-bold text-slate-800 mt-1">{takenCount}/{todaySchedule.length} assunzioni</p>
                                            </div>
                                            <div className="w-32">
                                                <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#14b8a6] rounded-full transition-all duration-500" style={{ width: `${adherenceToday}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lista Farmaci */}
                                        <div className="space-y-3">
                                            {todaySchedule.map((item) => {
                                                const style = getStatusStyles(item.status);
                                                return (
                                                    <div key={item.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${item.status === 'pending' ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                                                        <span className="text-sm font-mono font-bold text-slate-500 w-12">{item.time}</span>
                                                        <div className="flex-1">
                                                            <p className={`font-semibold text-slate-800 ${item.status === 'taken' ? 'line-through opacity-50' : ''}`}>
                                                                {item.medicine.toUpperCase()} - <span className="lowercase">{item.dose} {item.unit}</span>
                                                            </p>
                                                        </div>
                                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                                                            <div className="w-3 h-3">{style.icon}</div>
                                                            {style.label}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Aggiunto un controllo isLoading anche per questa sezione */}
                            {/* --- CAREGIVER SECTION --- */}
                            {currentUser?.ruolo === 'Caregiver' && (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="text-[#14b8a6]"><Icons.Users /></div>
                                            <h2 className="font-bold text-lg text-slate-800">I Tuoi Assistiti</h2>
                                        </div>
                                        <Link href="/Pages/Caregiver" className="text-sm font-medium text-slate-500 hover:text-[#14b8a6] flex items-center gap-1 transition-colors">
                                            Vedi tutto <Icons.ChevronRight />
                                        </Link>
                                    </div>

                                    {isLoading ? (
                                        <div className="p-6 text-center text-slate-500">Caricamento assistiti...</div>
                                    ) : patients.length > 0 ? (
                                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {patients.map((patient) => (
                                                <Link key={patient.id} href={`/Pages/Assistito/${patient.id}`} className="block group cursor-pointer">
                                                    <div key={patient.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#14b8a6]/30 hover:shadow-md transition-all cursor-pointer group bg-white">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 rounded-full bg-teal-50 text-[#14b8a6] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                                                                {patient.initials}
                                                            </div>
                                                            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${getPatientStatusColor(patient.status)}`} />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-slate-800 truncate group-hover:text-[#14b8a6] transition-colors">{patient.name}</p>
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className={`h-full rounded-full ${patient.adherence > 80 ? 'bg-emerald-500' : patient.adherence > 50 ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${patient.adherence}%` }} />
                                                                </div>
                                                                <span className="text-xs text-slate-400 font-medium">{patient.adherence}%</span>
                                                            </div>
                                                        </div>

                                                        {patient.alerts > 0 && (
                                                            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                                {patient.alerts}
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-slate-500">Nessun assistito configurato.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* --- COLONNA DESTRA (Alerts & Azioni) --- */}
                        <div className="space-y-6">

                            {/* Card Alert Scorte */}
                            {isLoading ? (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center text-slate-500">Caricamento scorte...</div>
                            ) : lowStockMedicines.length > 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-amber-50/30">
                                        <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                                            <Icons.AlertTriangle /> Scorte Basse
                                        </div>
                                        <Link href="Armadietto" className="p-1 hover:bg-slate-100 rounded-md text-slate-400"><Icons.ChevronRight /></Link>
                                    </div>
                                    <div className="p-2">
                                        {lowStockMedicines.map((med) => (
                                            <div key={med.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                                <span className="text-sm font-medium text-slate-700">{med.name}</span>
                                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                                                    {med.quantity === 0 ? 'Terminato' : med.quantity + "/" + med.total}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center text-slate-500">Nessun farmaco con scorte basse.</div>
                            )}

                            {/* Card Scadenze */}
                            {isLoading ? (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center text-slate-500">Caricamento scadenze...</div>
                            ) : expiringMedicines.length > 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-rose-50/30">
                                        <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                                            <Icons.Calendar /> In Scadenza
                                        </div>
                                        <Link href="Armadietto" className="p-1 hover:bg-slate-100 rounded-md text-slate-400"><Icons.ChevronRight /></Link>
                                    </div>
                                    <div className="p-2">
                                        {expiringMedicines.map((med) => (
                                            <div key={med.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                                <span className="text-sm font-medium text-slate-700">{med.name}</span>
                                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                                                    {med.daysLeft <= 0 ? "Scaduto!" : `-${med.daysLeft} gg`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center text-slate-500">Nessun farmaco in scadenza.</div>
                            )}

                            {/* Quick Actions MODIFICATE */}
                            <div className="grid grid-cols-1 gap-3 pt-2">
                                <QuickAction
                                    onClick={() => setActiveModal('add-med')}
                                    icon={<Icons.Plus />}
                                    title="Aggiungi Farmaco"
                                    subtitle="Scansiona o inserisci"
                                    color="text-[#14b8a6]"
                                    bg="bg-teal-50"
                                />
                                <QuickAction
                                    onClick={() => setActiveModal('new-therapy')}
                                    icon={<Icons.Pill />}
                                    title="Nuova Terapia"
                                    subtitle="Pianifica assunzioni"
                                    color="text-indigo-600"
                                    bg="bg-indigo-50"
                                />
                                <QuickAction
                                    href="Ricerca"
                                    icon={<Icons.Heart />}
                                    title="Cerca Farmaci"
                                    subtitle="Database AIFA"
                                    color="text-rose-500"
                                    bg="bg-rose-50"
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
            <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400 bg-white">
                <p>© 2024 MediGuard.</p>
            </footer>
        </div>
    );
}

// --- COMPONENTI HELPER ---

function StatCard({ icon, iconColor, iconBg, value, label }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800 leading-none mb-1">{value}</p>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
            </div>
        </div>
    );
}


function QuickAction({ href, onClick, icon, title, subtitle, color, bg }) {
    // Definiamo lo stile comune per entrambi i casi
    const baseClass = "w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all group text-left";

    // Contenuto interno (Icona + Testi)
    const content = (
        <>
            <div className={`w-10 h-10 rounded-lg ${bg} ${color} flex items-center justify-center transition-transform group-hover:scale-110 shrink-0`}>
                {icon}
            </div>
            <div>
                <p className="font-bold text-slate-800 text-sm group-hover:text-[#14b8a6] transition-colors">{title}</p>
                <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
        </>
    );

    // CASO 1: Se c'è un href, usa il componente Link
    if (href) {
        return (
            <Link href={href} className={baseClass}>
                {content}
            </Link>
        );
    }

    // CASO 2: Altrimenti usa il tag button (per i modali)
    return (
        <button onClick={onClick} className={baseClass}>
            {content}
        </button>
    );
}