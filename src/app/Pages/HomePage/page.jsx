'use client';

import Link from "next/link"; // Assicurati che il percorso sia corretto
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar"; // Assicurati che il percorso sia corretto

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

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"><Icons.X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto">{children}</div>
                {footer && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">{footer}</div>}
            </div>
        </div>
    );
};

const Button = ({ children, onClick, variant = "primary", className = "" }) => {
    const base = "inline-flex items-center justify-center rounded-lg font-bold text-sm transition-all focus:outline-none h-10 px-5";
    const variants = {
        primary: "bg-[#14b8a6] text-white hover:bg-[#0d9488] shadow-md",
        secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    };
    return <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
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

export default function Dashboard({ isAuthenticated = true, onLogout }) {
    const [inventoryStats, setInventoryStats] = useState({ total: 0, low: 0, expiring: 0 });
    const [lowStockMedicines, setLowStockMedicines] = useState([]);
    const [expiringMedicines, setExpiringMedicines] = useState([]);
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [adherenceToday, setAdherenceToday] = useState(0);
    const [patients, setPatients] = useState([]);
    const [totalAlerts, setTotalAlerts] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch inventory data
                const inventoryResponse = await fetch("/api/antonio?id_utente=49a0cfd3-6fc3-4a40-9602-707cdc964e55");
                const inventoryJson = await inventoryResponse.json();
                const rawInventoryData = Array.isArray(inventoryJson.data) ? inventoryJson.data : (Array.isArray(inventoryJson) ? inventoryJson : []);

                const processedInventoryData = rawInventoryData.map(item => ({
                    ...item,
                    computedStatus: getMedicineStatus(item) // Re-use from Armadietto page
                }));

                const total = processedInventoryData.length;
                const low = processedInventoryData.filter(m => m.computedStatus === 'low').length;
                const expiring = processedInventoryData.filter(m => ['expiring', 'expired'].includes(m.computedStatus)).length;

                setInventoryStats({ total, low, expiring });

                setLowStockMedicines(
                    processedInventoryData
                        .filter(m => m.computedStatus === 'low')
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

                // Fetch therapy data (mocked for now as API is not available)
                // In a real scenario, you'd fetch from an endpoint like /api/terapie/today
                const mockTodaySchedule = [
                    { id: 1, time: "08:00", medicine: "Cardioaspirin 100mg", status: "taken" },
                    { id: 2, time: "12:00", medicine: "Augmentin 875mg", status: "taken" },
                    { id: 3, time: "14:00", medicine: "Enterogermina", status: "pending" },
                    { id: 4, time: "20:00", medicine: "Augmentin 875mg", status: "upcoming" },
                ];
                setTodaySchedule(mockTodaySchedule);

                const taken = mockTodaySchedule.filter(s => s.status === "taken").length;
                const totalScheduled = mockTodaySchedule.length;
                setAdherenceToday(totalScheduled > 0 ? Math.round((taken / totalScheduled) * 100) : 0);

                // Fetch patient data (mocked for now as API is not available)
                // In a real scenario, you'd fetch from an endpoint like /api/caregivers/patients
                const mockPatients = [
                    { id: 1, name: "Maria Rossi", initials: "MR", adherence: 100, status: "ok", alerts: 0 },
                    { id: 2, name: "Giuseppe Rossi", initials: "GR", adherence: 66, status: "warning", alerts: 1 },
                    { id: 3, name: "Anna Bianchi", initials: "AB", adherence: 50, status: "alert", alerts: 2 },
                ];
                setPatients(mockPatients);

                const totalPatientAlerts = mockPatients.reduce((sum, p) => sum + p.alerts, 0);
                setTotalAlerts(expiring + low + totalPatientAlerts); // Combine all alerts

            } catch (error) {
                console.error("Errore nel caricamento dei dati della dashboard:", error);
                // Optionally set error state to display a message to the user
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper functions from Armadietto page (re-defined here or imported if in a shared util)
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
        if (days <= 0) return "expired";
        if (days <= 30) return "expiring";
        if (med.quantita_rimanente <= 5 || qtyPercent < 20) return "low";
        return "ok";
    };

    const takenCount = todaySchedule.filter(s => s.status === "taken").length;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar isAuthenticated={isAuthenticated} onLogout={onLogout} />

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
                                                                {item.medicine}
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
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="text-[#14b8a6]"><Icons.Users /></div>
                                        <h2 className="font-bold text-lg text-slate-800">I Tuoi Assistiti</h2>
                                    </div>
                                    <Link href="/caregiver" className="text-sm font-medium text-slate-500 hover:text-[#14b8a6] flex items-center gap-1 transition-colors">
                                        Vedi tutto <Icons.ChevronRight />
                                    </Link>
                                </div>

                                {isLoading ? (
                                    <div className="p-6 text-center text-slate-500">Caricamento assistiti...</div>
                                ) : patients.length > 0 ? (
                                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {patients.map((patient) => (
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
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-slate-500">Nessun assistito configurato.</div>
                                )}
                            </div>
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
                                                    {med.quantity}/{med.total}
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

            {/* --- MODALE 1: AGGIUNGI FARMACO --- */}
            <Modal
                isOpen={activeModal === 'add-med'}
                onClose={() => setActiveModal(null)}
                title="Aggiungi al Magazzino"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setActiveModal(null)}>Annulla</Button>
                        <Button onClick={() => { alert("Salvato!"); setActiveModal(null); }}>Salva Farmaco</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Farmaco</label>
                        <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#14b8a6] outline-none" placeholder="Es. Tachipirina" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Quantità</label>
                            <input type="number" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#14b8a6] outline-none" placeholder="20" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Scadenza</label>
                            <input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#14b8a6] outline-none" />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* --- MODALE 2: NUOVA TERAPIA --- */}
            <Modal
                isOpen={activeModal === 'new-therapy'}
                onClose={() => setActiveModal(null)}
                title="Pianifica Terapia"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setActiveModal(null)}>Annulla</Button>
                        <Button onClick={() => { alert("Terapia Creata!"); setActiveModal(null); }}>Crea Terapia</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Quale farmaco?</label>
                        <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#14b8a6] outline-none" placeholder="Cerca nel magazzino..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Frequenza</label>
                            <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#14b8a6] outline-none bg-white">
                                <option>1 volta al dì</option>
                                <option>2 volte al dì</option>
                                <option>Al bisogno</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Orario</label>
                            <input type="time" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#14b8a6] outline-none" />
                        </div>
                    </div>
                </div>
            </Modal>

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