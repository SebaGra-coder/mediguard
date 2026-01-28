'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// --- ICONE SVG ---
const Icons = {
    Pill: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>,
    X: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>,
};

// --- COMPONENTS ---
const Button = ({ children, onClick, variant = "primary", className = "", disabled }) => {
    const base = "inline-flex items-center justify-center rounded-lg font-bold text-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed h-11 px-5";
    const variants = {
        primary: "bg-[#14b8a6] text-white hover:bg-[#0d9488] shadow-md hover:shadow-lg",
        secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    };
    return <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white text-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <div className="bg-teal-50 p-1.5 rounded-lg text-[#14b8a6]"><Icons.Pill className="w-5 h-5" /></div>
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"><Icons.X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 overflow-y-auto">{children}</div>
                {footer && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">{footer}</div>}
            </div>
        </div>,
        document.body
    );
};

export default function AddTherapyModal({ isOpen, onClose, onSuccess, userId, cabinetMedicines = [], initialMedicineId = "", initialData = null }) {
    const [formData, setFormData] = useState({
        medicine: "",
        id_farmaco_armadietto: "",
        dosaggio: "",
        alBisogno: false,
        orari: ["08:00"],
        startDate: "",
        endDate: "",
        note: "",
        stato: "attiva"
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Edit Mode
                setFormData({
                    medicine: initialData.medicine || "",
                    id_farmaco_armadietto: initialData.originalData?.id_farmaco_armadietto || "",
                    dosaggio: parseFloat(initialData.dosaggio) || "",
                    alBisogno: initialData.originalData?.solo_al_bisogno || false,
                    orari: initialData.orari || ["08:00"],
                    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
                    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
                    note: initialData.note || "",
                    stato: initialData.stato || "attiva"
                });
            } else {
                // Create Mode
                setFormData({
                    medicine: "",
                    id_farmaco_armadietto: initialMedicineId || "",
                    dosaggio: "",
                    alBisogno: false,
                    orari: ["08:00"],
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: "",
                    note: "",
                    stato: "attiva"
                });
            }
        }
    }, [isOpen, initialMedicineId, initialData]);

    const updateOrario = (idx, val) => {
        const newOrari = [...formData.orari]; newOrari[idx] = val;
        setFormData({ ...formData, orari: newOrari });
    };

    const handleSave = async () => {
        if (!userId) return;

        try {
            // EDIT MODE
            if (initialData) {
                const body = {
                    id_terapia: initialData.id,
                    id_farmaco_armadietto: formData.id_farmaco_armadietto,
                    nome_utilita: formData.medicine,
                    dose_singola: parseFloat(formData.dosaggio),
                    solo_al_bisogno: formData.alBisogno,
                    terapia_attiva: formData.stato === "attiva",
                    // Assicurati che le date siano stringhe YYYY-MM-DD
                    data_inizio: formData.startDate,
                    data_fine: formData.endDate || null,
                    // Invia SEMPRE gli orari se non è "al bisogno"
                    orari: formData.alBisogno ? [] : formData.orari
                };

                const res = await fetch('/api/terapia', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                const json = await res.json();

                if (res.ok && json.success) {
                    if (onSuccess) onSuccess();
                    onClose();
                } else {
                    alert("Errore aggiornamento: " + (json.error || "Sconosciuto"));
                }
                return;
            }

            // CREATE MODE
            const selectedMed = cabinetMedicines.find(m => m.id_farmaco_armadietto === formData.id_farmaco_armadietto);
            const nomeUtilita = formData.medicine || (selectedMed ? selectedMed.farmaco.denominazione : "Nuova Terapia");

            const body = {
                id_paziente: userId,
                id_farmaco_armadietto: formData.id_farmaco_armadietto,
                nome_utilita: nomeUtilita,
                dose_singola: parseFloat(formData.dosaggio),
                solo_al_bisogno: formData.alBisogno,
                data_inizio: formData.startDate,
                data_fine: formData.endDate,
                terapia_attiva: true,
                orari: formData.alBisogno ? [] : formData.orari
            };

            // Effettua SOLO questa chiamata. 
            // Il backend genererà automaticamente le assunzioni.
            const res = await fetch('/api/terapia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();

            if (res.ok && json.success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                alert("Errore salvataggio: " + (json.error || "Sconosciuto"));
            }

        } catch (e) {
            console.error("Errore chiamata API", e);
            alert("Errore di connessione");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Modifica Terapia" : "Nuova Terapia"}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annulla</Button>
                    <Button onClick={handleSave} disabled={(!formData.id_farmaco_armadietto && !formData.medicine) || !formData.startDate || !formData.dosaggio || (!formData.alBisogno && formData.orari.length === 0)}>
                        {initialData ? "Salva Modifiche" : "Salva Terapia"}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Seleziona Farmaco</label>
                    <select
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6] bg-white"
                        value={formData.id_farmaco_armadietto}
                        onChange={e => {
                            const selectedId = e.target.value;
                            setFormData({
                                ...formData,
                                id_farmaco_armadietto: selectedId
                            });
                        }}
                    >
                        <option value="">-- Seleziona dal tuo armadietto --</option>
                        {cabinetMedicines.map(m => (
                            <option key={m.id_farmaco_armadietto} value={m.id_farmaco_armadietto}>
                                {m.farmaco?.denominazione} ({m.quantita_rimanente} rimanenti)
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Terapia</label>
                    <input
                        type="text"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                        placeholder="Es. Pillola pressione mattina"
                        value={formData.medicine}
                        onChange={e => setFormData({ ...formData, medicine: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Dosaggio</label>
                        <input type="number" step="0.5" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                            placeholder="Es. 1" value={formData.dosaggio} onChange={e => setFormData({ ...formData, dosaggio: e.target.value })} />
                    </div>
                    <div className="flex items-center">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-[#14b8a6] border-slate-300 rounded focus:ring-[#14b8a6]"
                                checked={formData.alBisogno}
                                onChange={e => setFormData({ ...formData, alBisogno: e.target.checked })}
                            />
                            Assunzione "Al Bisogno"
                        </label>
                    </div>
                </div>

                {!formData.alBisogno && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-between mb-1">
                            <label className="block text-sm font-semibold text-slate-700">Orari Assunzione</label>
                            <button type="button" onClick={() => setFormData({ ...formData, orari: [...formData.orari, "12:00"] })} className="text-xs font-bold text-[#14b8a6] hover:underline">+ Aggiungi Orario</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.orari.map((orario, idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                    <input type="time" className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none" value={orario} onChange={(e) => updateOrario(idx, e.target.value)} />
                                    <button type="button" onClick={() => {
                                        const newOrari = formData.orari.filter((_, i) => i !== idx);
                                        setFormData({ ...formData, orari: newOrari });
                                    }} className="text-rose-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-full transition-colors">
                                        <Icons.X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {formData.orari.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">Aggiungi almeno un orario o seleziona "Al Bisogno".</p>
                        )}
                    </div>
                )}

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
    );
}