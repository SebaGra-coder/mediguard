'use client';

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

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

// --- MOCK DATA ---
const initialTodaySchedule = [
    { id: 1, time: "08:00", medicine: "Cardioaspirin 100mg", dosage: "1 compressa", status: "taken", takenAt: "08:05" },
    { id: 2, time: "12:00", medicine: "Augmentin 875mg", dosage: "1 compressa", status: "taken", takenAt: "12:15" },
    { id: 3, time: "14:00", medicine: "Enterogermina", dosage: "1 flaconcino", status: "pending", takenAt: null },
    { id: 4, time: "20:00", medicine: "Augmentin 875mg", dosage: "1 compressa", status: "upcoming", takenAt: null },
    { id: 5, time: "22:00", medicine: "Cardioaspirin 100mg", dosage: "1 compressa", status: "upcoming", takenAt: null },
];

const initialTherapyPlans = [
    { id: "1", medicine: "Cardioaspirin 100mg", dosaggio: "100mg", frequency: "2 volte al giorno", duration: "Continuativa", startDate: "2024-01-15", endDate: "", adherence: 95, orari: ["08:00", "22:00"], note: "Terapia anticoagulante", stato: "attiva" },
    { id: "2", medicine: "Augmentin 875mg", dosaggio: "875mg", frequency: "2 volte al giorno", duration: "7 giorni", startDate: "2024-01-20", endDate: "2024-01-27", adherence: 100, daysLeft: 5, orari: ["12:00", "20:00"], note: "Antibiotico", stato: "attiva" },
    { id: "3", medicine: "Enterogermina", dosaggio: "1 flaconcino", frequency: "1 volta al giorno", duration: "14 giorni", startDate: "2024-01-18", endDate: "2024-02-01", adherence: 85, daysLeft: 10, orari: ["14:00"], note: "Probiotico", stato: "attiva" },
];

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

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><Icons.X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto">{children}</div>
                {footer && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">{footer}</div>}
            </div>
        </div>
    );
};

// --- LOGICA PRINCIPALE ---
export default function Terapie({ isAuthenticated = true, onLogout }) {
    const [selectedDate] = useState(new Date());
    const [todaySchedule, setTodaySchedule] = useState(initialTodaySchedule);
    const [therapyPlans, setTherapyPlans] = useState(initialTherapyPlans);

    // Modals state
    const [modalState, setModalState] = useState({ type: null, data: null }); // type: 'view' | 'edit' | 'add' | 'delete'
    const [formData, setFormData] = useState({
        medicine: "", dosaggio: "", frequency: "1 volta al giorno", orari: ["08:00"], startDate: "", endDate: "", note: "", stato: "attiva"
    });
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [quickAddData, setQuickAddData] = useState({ medicine: "", time: "", note: "" });

    const takenCount = todaySchedule.filter(s => s.status === "taken").length;
    const adherencePercentage = Math.round((takenCount / todaySchedule.length) * 100) || 0;

    // Helpers per chiudere/aprire modali
    const closeModal = () => { setModalState({ type: null, data: null }); resetForm(); };
    const openModal = (type, data = null) => {
        setModalState({ type, data });
        if (data && (type === 'edit' || type === 'view')) {
            setFormData({ ...data, orari: data.orari || ["08:00"], endDate: data.endDate || "", note: data.note || "" });
        } else {
            resetForm();
        }
    };

    const resetForm = () => setFormData({ medicine: "", dosaggio: "", frequency: "1 volta al giorno", orari: ["08:00"], startDate: "", endDate: "", note: "", stato: "attiva" });

    // Gestione CRUD
    const handleSave = () => {
        if (modalState.type === 'add') {
            const newTherapy = { ...formData, id: Date.now().toString(), adherence: 0, duration: formData.endDate ? "Definita" : "Continuativa" };
            setTherapyPlans([...therapyPlans, newTherapy]);
        } else if (modalState.type === 'edit') {
            setTherapyPlans(plans => plans.map(p => p.id === modalState.data.id ? { ...p, ...formData, duration: formData.endDate ? "Definita" : "Continuativa" } : p));
        }
        closeModal();
    };

    const handleDelete = () => {
        setTherapyPlans(plans => plans.filter(p => p.id !== modalState.data.id));
        closeModal();
    };

    const handleToggleStatus = (id) => {
        setTherapyPlans(plans => plans.map(p => p.id === id ? { ...p, stato: p.stato === "attiva" ? "sospesa" : "attiva" } : p));
    };

    const handleConfirmIntake = (id) => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setTodaySchedule(sched => sched.map(s => s.id === id ? { ...s, status: "taken", takenAt: timeStr } : s));
    };

    // Form helpers
    const updateOrario = (idx, val) => {
        const newOrari = [...formData.orari]; newOrari[idx] = val;
        setFormData({ ...formData, orari: newOrari });
    };

    const handleQuickAddSubmit = () => {
        if (!quickAddData.medicine) return;

        // Crea un nuovo oggetto "schedule" fittizio ma segnato come "taken"
        const newLog = {
            id: Date.now(),
            time: quickAddData.time, // Orario inserito
            medicine: quickAddData.medicine,
            dosage: "Al bisogno", // O chiedilo nel form se vuoi
            status: "taken", // Già preso
            takenAt: quickAddData.time // L'ora effettiva
        };

        // Aggiungilo alla lista di oggi e riordina per orario
        const newSchedule = [...todaySchedule, newLog].sort((a, b) => a.time.localeCompare(b.time));
        setTodaySchedule(newSchedule);

        setIsQuickAddOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar isAuthenticated={isAuthenticated} onLogout={onLogout} />

            <main className="pt-10 pb-16">
                <div className="container mx-auto px-4 max-w-7xl">

                    {/* HEADER PAGINA */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-slate-800 tracking-tight">Le Mie Terapie</h1>
                            <p className="text-slate-500">Gestisci i tuoi piani terapeutici e monitora le assunzioni.</p>
                        </div>
                        <Button onClick={() => openModal('add')} className="h-11 px-6 shadow-md hover:shadow-lg">
                            <Icons.Plus className="w-5 h-5 mr-2" /> Nuova Terapia
                        </Button>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* --- COLONNA SINISTRA: PROGRAMMA GIORNALIERO --- */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Navigazione Data */}
                            <Card className="p-4 flex items-center justify-between">
                                <Button variant="ghost" size="icon"><Icons.ChevronLeft className="w-5 h-5" /></Button>
                                <div className="text-center">
                                    <p className="text-sm text-slate-500 font-medium tracking-wide">{selectedDate.toLocaleDateString("it-IT", { weekday: "long" })}</p>
                                    <p className="text-xl font-bold text-slate-800">{selectedDate.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</p>
                                </div>
                                <Button variant="ghost" size="icon"><Icons.ChevronRight className="w-5 h-5" /></Button>
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
                                        <Button variant="ghost" size="icon" onClick={() => openModal('view', plan)} title="Dettagli"><Icons.Eye className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(plan.id)} title={plan.stato === 'attiva' ? "Sospendi" : "Attiva"}>
                                            {plan.stato === 'attiva' ? <Icons.Pause className="w-4 h-4 text-amber-500" /> : <Icons.Play className="w-4 h-4 text-emerald-500" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openModal('edit', plan)} title="Modifica"><Icons.Edit className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => openModal('delete', plan)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50"><Icons.Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </Card>
                            ))}
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-white hover:bg-slate-50/50 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                                    <Icons.Plus className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1">Registra assunzione</h3>
                                <p className="text-sm text-slate-500 mb-4">Per farmaci "al bisogno"</p>

                                {/* Nota: Puoi collegare questo bottone a una funzione specifica o riaprire il modale 'add' */}
                                <Button
                                    variant="outline"
                                    className="border-[#14b8a6] text-[#14b8a6] hover:bg-teal-50 hover:text-[#0d9488]"
                                    onClick={() => {
                                        // Imposta l'orario attuale come default
                                        const now = new Date();
                                        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                                        setQuickAddData({ medicine: "", time: timeStr, note: "" });
                                        setIsQuickAddOpen(true);
                                    }}
                                >
                                    Registra ora
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- MODALE AGGIUNGI / MODIFICA --- */}
            <Modal
                isOpen={modalState.type === 'add' || modalState.type === 'edit'}
                onClose={closeModal}
                title={modalState.type === 'edit' ? "Modifica Terapia" : "Nuova Terapia"}
                footer={
                    <>
                        <Button variant="secondary" onClick={closeModal}>Annulla</Button>
                        <Button onClick={handleSave} disabled={!formData.medicine || !formData.startDate}>Salva Terapia</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Farmaco</label>
                        <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                            placeholder="Es. Cardioaspirina" value={formData.medicine} onChange={e => setFormData({ ...formData, medicine: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Dosaggio</label>
                            <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                                placeholder="Es. 100mg" value={formData.dosaggio} onChange={e => setFormData({ ...formData, dosaggio: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Frequenza</label>
                            <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                                value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })}>
                                <option>1 volta al giorno</option>
                                <option>2 volte al giorno</option>
                                <option>3 volte al giorno</option>
                                <option>Al bisogno</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-semibold text-slate-700">Orari Assunzione</label>
                            <button type="button" onClick={() => setFormData({ ...formData, orari: [...formData.orari, "12:00"] })} className="text-xs font-bold text-[#14b8a6] hover:underline">+ Aggiungi</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.orari.map((orario, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                    <input type="time" className="rounded-lg border border-slate-200 px-2 py-1 text-sm" value={orario} onChange={(e) => updateOrario(idx, e.target.value)} />
                                    {idx > 0 && <button onClick={() => setFormData({ ...formData, orari: formData.orari.filter((_, i) => i !== idx) })} className="text-rose-500 hover:bg-rose-50 rounded p-1"><Icons.X className="w-3 h-3" /></button>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Data Inizio</label>
                            <input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                                value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Data Fine (Opzionale)</label>
                            <input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                                value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Note Aggiuntive</label>
                        <textarea rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                            placeholder="Es. Prendere a stomaco pieno..." value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} />
                    </div>
                </div>
            </Modal>

            {/* --- MODALE ELIMINA --- */}
            <Modal
                isOpen={modalState.type === 'delete'}
                onClose={closeModal}
                title="Elimina Terapia"
                footer={
                    <>
                        <Button variant="secondary" onClick={closeModal}>Annulla</Button>
                        <Button variant="destructive" onClick={handleDelete}>Elimina Definitivamente</Button>
                    </>
                }
            >
                <p className="text-slate-600">Sei sicuro di voler eliminare la terapia <strong>{modalState.data?.medicine}</strong>? Questa azione non può essere annullata e perderai lo storico dell'aderenza.</p>
            </Modal>

            {/* --- MODALE VISTA DETTAGLI --- */}
            <Modal isOpen={modalState.type === 'view'} onClose={closeModal} title={`Dettagli: ${modalState.data?.medicine}`}>
                {modalState.data && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-slate-500">Dosaggio</p><p className="font-bold">{modalState.data.dosaggio}</p></div>
                            <div><p className="text-slate-500">Stato</p><Badge variant={modalState.data.stato === 'attiva' ? 'success' : 'default'}>{modalState.data.stato}</Badge></div>
                            <div><p className="text-slate-500">Frequenza</p><p className="font-bold">{modalState.data.frequency}</p></div>
                            <div><p className="text-slate-500">Orari</p><p className="font-bold">{modalState.data.orari?.join(", ")}</p></div>
                            <div><p className="text-slate-500">Inizio</p><p className="font-bold">{new Date(modalState.data.startDate).toLocaleDateString()}</p></div>
                            <div><p className="text-slate-500">Fine</p><p className="font-bold">{modalState.data.endDate ? new Date(modalState.data.endDate).toLocaleDateString() : "Continuativa"}</p></div>
                        </div>
                        {modalState.data.note && (
                            <div className="bg-slate-50 p-3 rounded-lg text-sm"><p className="text-slate-500 text-xs uppercase font-bold mb-1">Note</p>{modalState.data.note}</div>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isQuickAddOpen}
                onClose={() => setIsQuickAddOpen(false)}
                title="Registra Assunzione"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsQuickAddOpen(false)}>Annulla</Button>
                        <Button onClick={handleQuickAddSubmit} disabled={!quickAddData.medicine}>Conferma Assunzione</Button>
                    </>
                }
            >
                <div className="space-y-5">
                    <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 flex gap-3">
                        <div className="bg-white p-2 rounded-full shadow-sm text-[#14b8a6]">
                            <Icons.Pill className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-teal-800 font-bold">Farmaco al bisogno</p>
                            <p className="text-xs text-teal-600">Registra un'assunzione fuori dal piano terapeutico ordinario.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Quale farmaco hai preso?</label>
                        {/* Qui potresti usare una Select se hai la lista farmaci, per ora usiamo Input */}
                        <input
                            type="text"
                            className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                            placeholder="Cerca farmaco (es. Oki, Tachipirina...)"
                            value={quickAddData.medicine}
                            onChange={e => setQuickAddData({ ...quickAddData, medicine: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">A che ora?</label>
                        <div className="relative">
                            <input
                                type="time"
                                className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                                value={quickAddData.time}
                                onChange={e => setQuickAddData({ ...quickAddData, time: e.target.value })}
                            />
                            <Icons.Clock className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Note (Opzionale)</label>
                        <textarea
                            rows={2}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                            placeholder="Motivo (es. mal di testa, febbre...)"
                            value={quickAddData.note}
                            onChange={e => setQuickAddData({ ...quickAddData, note: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>

            <footer className="border-t border-slate-200 py-8 mt-auto text-center text-sm text-slate-400 bg-white">
                <p>© 2024 MediGuard. La tua salute, organizzata.</p>
            </footer>
        </div>
    );
}