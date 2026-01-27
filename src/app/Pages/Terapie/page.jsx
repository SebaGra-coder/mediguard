'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { GuestOverlay } from "@/components/GuestOverlay";
import AddTherapyModal from "@/components/modals/AddTherapyModal";
import TherapyDetailsModal from "@/components/modals/TherapyDetailsModal";
import DeleteTherapyModal from "@/components/modals/DeleteTherapyModal";
import QuickAssumptionModal from "@/components/modals/QuickAssumptionModal";
import { useTherapies } from "@/hooks/useTherapies";

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
    Trash2: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>,
    Play: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
    Pause: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
};

// --- COMPONENTI UI RIUTILIZZABILI (Style MediGuard) ---
const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "primary", size = "md", className = "", type = "button", disabled }) => {
    const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[#14b8a6] text-white hover:bg-[#0d9488] shadow-sm hover:shadow-md",
        secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
        ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
        destructive: "bg-rose-50 text-rose-600 hover:bg-rose-100",
        outline: "border border-slate-200 text-slate-600 hover:bg-slate-50"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        icon: "h-9 w-9 p-0",
    };

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </button>
    );
};

const Badge = ({ children, variant = "default", className = "" }) => {
    const styles = {
        default: "bg-slate-100 text-slate-700",
        success: "bg-teal-50 text-[#14b8a6]",
        warning: "bg-amber-50 text-amber-600",
        destructive: "bg-rose-50 text-rose-600",
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border border-transparent ${styles[variant]} ${className}`}>{children}</span>;
};

// --- LOGICA PRINCIPALE ---
export default function Terapie({ isAuthenticated: initialAuth = false }) {
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
    const [userData, setUserData] = useState(null);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [cabinetMedicines, setCabinetMedicines] = useState([]);

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

    const fetchCabinet = async (userId) => {
        try {
            const res = await fetch(`/api/antonio?id_utente=${userId}`);
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
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
    
                const dailyIntakes = [];
                
                json.data.forEach(terapia => {
                    if (terapia.assunzioni) {
                        terapia.assunzioni.forEach(assunzione => {
                            const assunzioneDate = new Date(assunzione.data_programmata);
                            
                            if (assunzioneDate >= startOfDay && assunzioneDate <= endOfDay) {
                                // CORREZIONE LOGICA STATO:
                                // 1. Se assunzione.esito è true -> "taken"
                                // 2. Se non è preso ed è oggi -> "pending" (così appare il tasto Conferma)
                                let currentStatus = "pending";
                                if (assunzione.esito) {
                                    currentStatus = "taken";
                                } else if (assunzioneDate.getTime() > new Date().getTime() + (1000 * 60 * 60)) {
                                    // Opzionale: se mancano più di 60 minuti, lo segna come "upcoming"
                                    // Se vuoi poter confermare SEMPRE quelli di oggi, lascia solo "pending"
                                    currentStatus = "upcoming";
                                }
    
                                dailyIntakes.push({
                                    id: assunzione.id_evento,
                                    // Uso toLocaleTimeString senza UTC per riflettere l'ora locale dell'utente
                                    time: assunzioneDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}),
                                    medicine: terapia.nome_utilita || terapia.farmaco?.farmaco?.denominazione || "Farmaco",
                                    dosage: terapia.dose_singola + " " + (terapia.farmaco?.farmaco?.unita_misura || ""),
                                    status: currentStatus,
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

    const handleSuccess = () => {
        if (userData) {
            fetchTherapies(userData.id_utente);
            fetchDailySchedule(userData.id_utente, selectedDate);
        }
        setModalState({ type: null, data: null });
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
            } else {
                alert("Errore aggiornamento stato");
            }
        } catch (e) {
            console.error("Errore toggle status:", e);
        }
    };

    const handleConfirmIntake = async (id) => {
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
                fetchTherapies(userData.id_utente);
            } else {
                alert("Errore durante la conferma dell'assunzione");
            }
        } catch (error) {
            console.error("Errore conferma assunzione", error);
        }
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

            <main className="pt-10 pb-16">
                <div className="container mx-auto px-4 max-w-7xl">

                    {/* HEADER PAGINA */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-slate-800 tracking-tight">Le Mie Terapie</h1>
                            <p className="text-slate-500">Gestisci i tuoi piani terapeutici e monitora le assunzioni.</p>
                        </div>
                        <Button onClick={() => setModalState({ type: 'add', data: null })} className="h-11 px-6 shadow-md hover:shadow-lg">
                            <Icons.Plus className="w-5 h-5 mr-2" /> Nuova Terapia
                        </Button>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* --- COLONNA SINISTRA: PROGRAMMA GIORNALIERO --- */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Navigazione Data */}
                            <Card className="p-4 flex items-center justify-between">
                                <Button variant="ghost" size="icon" onClick={handlePrevDay}><Icons.ChevronLeft className="w-5 h-5" /></Button>
                                <div className="text-center">
                                    <p className="text-sm text-slate-500 font-medium tracking-wide">{selectedDate.toLocaleDateString("it-IT", { weekday: "long" })}</p>
                                    <p className="text-xl font-bold text-slate-800">{selectedDate.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleNextDay}><Icons.ChevronRight className="w-5 h-5" /></Button>
                            </Card>

                            {/* Progress Bar Aderenza */}
                            <Card className="p-6 bg-white from-[#14b8a6] to-teal-600 text-white border-none shadow-lg">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-slate-500 font-medium mb-1">Aderenza giornaliera</p>
                                        <p className="text-slate-800 text-3xl font-bold">{adherencePercentage}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#006629] text-sm">Assunzioni completate</p>
                                        <p className="text-l text-slate-800 font-normal">{takenCount} <span className="text-slate-800 text-l font-bold">/ {todaySchedule.length}</span></p>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#14b8a6] rounded-full transition-all duration-700" style={{ width: `${adherencePercentage}%` }} />
                                </div>
                            </Card>

                            {/* Lista Oraria */}
                            <div className="space-y-4">
                                <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Icons.Clock className="w-5 h-5 text-slate-400" /> Programma di oggi</h2>
                                {todaySchedule.map((item) => {
                                    const isCurrent = item.status === "pending";
                                    const isTaken = item.status === "taken";

                                    return (
                                        <Card key={item.id} className={`p-0 overflow-hidden transition-all ${isCurrent ? "ring-2 ring-[#14b8a6] ring-offset-2" : "opacity-70 hover:opacity-100"}`}>
                                            <div className="flex">
                                                {/* Fascia Oraria Laterale */}
                                                <div className={`w-20 flex flex-col items-center justify-center border-r border-slate-100 ${isTaken ? "bg-teal-50" : "bg-slate-50"}`}>
                                                    <span className="font-bold text-lg text-slate-700">{item.time}</span>
                                                </div>

                                                {/* Contenuto Card */}
                                                <div className="flex-1 p-4 flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className={`font-bold text-lg ${isTaken ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800"}`}>{item.medicine}</p>
                                                        <p className="text-sm text-slate-500">{item.dosage}</p>
                                                    </div>

                                                    {/* Azioni / Status */}
                                                    <div>
                                                        {item.status === 'pending' ? (
                                                            <div className="flex gap-2">
                                                                <Button size="sm" onClick={() => handleConfirmIntake(item.id)} className="bg-[#14b8a6] hover:bg-[#0d9488] text-white">
                                                                    <Icons.Check className="w-4 h-4 mr-1" /> Conferma
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Badge variant={isTaken ? "success" : "default"} className="flex items-center gap-1 px-3 py-1">
                                                                {isTaken ? <Icons.Check className="w-3 h-3" /> : <Icons.Clock className="w-3 h-3" />}
                                                                {isTaken ? `Assunto alle ${item.takenAt}` : "Programmato"}
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
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-lg text-slate-800">Terapie Attive</h2>
                                <Badge variant="default">{therapyPlans.filter(t => t.stato === 'attiva').length} in corso</Badge>
                            </div>

                            {therapyPlans.map((plan) => (
                                <Card key={plan.id} className="p-5 hover:shadow-md transition-shadow group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#14b8a6] flex items-center justify-center">
                                                <Icons.Pill className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 leading-tight">{plan.medicine}</h3>
                                                <p className="text-xs text-slate-500 mt-1">{plan.frequency}</p>
                                            </div>
                                        </div>
                                        <Badge variant={plan.stato === 'attiva' ? 'success' : 'default'}>{plan.stato}</Badge>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Aderenza</span>
                                            <span className="font-bold text-slate-700">{plan.adherence}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${plan.adherence > 80 ? 'bg-[#14b8a6]' : 'bg-amber-400'}`} style={{ width: `${plan.adherence}%` }} />
                                        </div>
                                        <div className="flex justify-between text-xs pt-1">
                                            <span className="text-slate-400">Durata: <span className="text-slate-600 font-medium">{plan.duration}</span></span>
                                            {plan.daysLeft && <span className="text-amber-600 font-bold">{plan.daysLeft} gg rimasti</span>}
                                        </div>
                                    </div>

                                    {/* Pulsanti Azione (Visibili on Hover su Desktop) */}
                                    <div className="flex justify-end gap-1 mt-5 border-t border-slate-50">
                                        <Button variant="ghost" size="icon" onClick={() => setModalState({ type: 'view', data: plan })} title="Dettagli"><Icons.Eye className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(plan.id)} title={plan.stato === 'attiva' ? "Sospendi" : "Attiva"}>
                                            {plan.stato === 'attiva' ? <Icons.Pause className="w-4 h-4 text-amber-500" /> : <Icons.Play className="w-4 h-4 text-emerald-500" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setModalState({ type: 'edit', data: plan })} title="Modifica"><Icons.Edit className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => setModalState({ type: 'delete', data: plan })} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50"><Icons.Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </Card>
                            ))}
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-white hover:bg-slate-50/50 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                                    <Icons.Plus className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1">Registra assunzione</h3>
                                <p className="text-sm text-slate-500 mb-4">Per farmaci &quot;al bisogno&quot;</p>

                                <Button
                                    variant="outline"
                                    className="border-[#14b8a6] text-[#14b8a6] hover:bg-teal-50 hover:text-[#0d9488]"
                                    onClick={() => setModalState({ type: 'quick-add', data: null })}
                                >
                                    Registra ora
                                </Button>
                            </div>
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

            <DeleteTherapyModal
                isOpen={modalState.type === 'delete'}
                onClose={() => setModalState({ type: null, data: null })}
                therapy={modalState.data}
                onSuccess={handleSuccess}
            />

            <QuickAssumptionModal
                isOpen={modalState.type === 'quick-add'}
                onClose={() => setModalState({ type: null, data: null })}
                userId={userData?.id_utente}
                cabinetMedicines={cabinetMedicines}
                onSuccess={handleSuccess}
                therapyPlans={therapyPlans}
            />

            <footer className="border-t border-slate-200 py-8 mt-auto text-center text-sm text-slate-400 bg-white">
                <p>© 2024 MediGuard. La tua salute, organizzata.</p>
            </footer>
        </div>
    );
}