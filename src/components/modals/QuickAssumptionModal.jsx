'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">{children}</div>
                {footer && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">{footer}</div>}
            </div>
        </div>,
        document.body
    );
};

export default function QuickAssumptionModal({ isOpen, onClose, userId, cabinetMedicines = [], onSuccess, therapyPlans = [] }) {
    const [quickAddData, setQuickAddData] = useState({ medicine: "", id_farmaco_armadietto: "", time: "", note: "" });

    useEffect(() => {
        if (isOpen) {
             const now = new Date();
             const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
             setQuickAddData({ medicine: "", id_farmaco_armadietto: "", time: timeStr, note: "" });
        }
    }, [isOpen]);

    const handleQuickAddSubmit = async () => {
        if (!quickAddData.id_farmaco_armadietto || !userId) return;

        try {
            // 1. Cerca una terapia "al bisogno" esistente per questo farmaco
            let therapyId = null;
            // Note: therapyPlans need to be passed down or fetched here. Passing them down is better.
            const existingTherapy = therapyPlans.find(t => 
                t.originalData?.id_farmaco_armadietto === quickAddData.id_farmaco_armadietto && 
                t.originalData?.solo_al_bisogno === true
            );

            if (existingTherapy) {
                therapyId = existingTherapy.id;
            } else {
                // 2. Se non esiste, creane una nuova implicita
                const today = new Date().toISOString().split('T')[0];
                const selectedMed = cabinetMedicines.find(m => m.id_farmaco_armadietto === quickAddData.id_farmaco_armadietto);
                
                const newTherapyBody = {
                    id_paziente: userId,
                    id_farmaco_armadietto: quickAddData.id_farmaco_armadietto,
                    nome_utilita: selectedMed ? selectedMed.farmaco.denominazione : "Farmaco al bisogno",
                    dose_singola: 1, // Default dosage for quick add
                    solo_al_bisogno: true,
                    data_inizio: today,
                    data_fine: today, // Or leave empty/far future
                    terapia_attiva: true
                };

                const tRes = await fetch('/api/terapia', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTherapyBody)
                });
                
                const tJson = await tRes.json();
                if (tRes.ok && tJson.success) {
                    therapyId = tJson.data.id_terapia;
                } else {
                    alert("Errore creazione terapia al bisogno: " + (tJson.error || "Sconosciuto"));
                    return;
                }
            }

            // 3. Registra l'assunzione
            if (therapyId) {
                // Costruisci data programmata combinando data odierna e ora selezionata
                const todayStr = new Date().toISOString().split('T')[0];
                const dateTimeStr = `${todayStr}T${quickAddData.time}:00`; 
                const intakeDate = new Date(dateTimeStr);

                const intakeBody = {
                    id_terapia: therapyId,
                    data_programmata: intakeDate.toISOString(),
                    orario_effettivo: intakeDate.toISOString(),
                    esito: true
                };

                const iRes = await fetch('/api/assunzione', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(intakeBody)
                });

                if (iRes.ok) {
                    if (onSuccess) onSuccess();
                    onClose();
                } else {
                    alert("Errore registrazione assunzione");
                }
            }

        } catch (error) {
            console.error("Errore quick add", error);
            alert("Si è verificato un errore");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Registra Assunzione"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annulla</Button>
                    <Button onClick={handleQuickAddSubmit} disabled={!quickAddData.id_farmaco_armadietto}>Conferma Assunzione</Button>
                </>
            }
        >
            <div className="space-y-5">
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 flex gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm text-[#14b8a6]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                    </div>
                    <div>
                        <p className="text-sm text-teal-800 font-bold">Farmaco al bisogno</p>
                        <p className="text-xs text-teal-600">Registra un&apos;assunzione fuori dal piano terapeutico ordinario.</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Quale farmaco hai preso?</label>
                    <select
                        className="w-full rounded-lg border border-slate-200 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6] bg-white"
                        value={quickAddData.id_farmaco_armadietto}
                        onChange={e => {
                            const selectedId = e.target.value;
                            const med = cabinetMedicines.find(m => m.id_farmaco_armadietto === selectedId);
                            setQuickAddData({ 
                                ...quickAddData, 
                                id_farmaco_armadietto: selectedId,
                                medicine: med ? med.farmaco.denominazione : ""
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
                    <p className="text-xs text-slate-400 mt-1">Vengono mostrati solo i farmaci presenti nel tuo armadietto.</p>
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
                         <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
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
    );
}