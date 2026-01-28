'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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

export default function EditMedicationModal({ isOpen, onClose, medicine, onSuccess }) {
    const [formData, setFormData] = useState({
        quantita: "",
        scadenza: "",
        quantita_totale: 0
    });

    useEffect(() => {
        if (isOpen && medicine) {
            setFormData({
                quantita: medicine.quantita_rimanente,
                scadenza: medicine.data_scadenza ? new Date(medicine.data_scadenza).toISOString().split('T')[0] : "",
                quantita_totale: medicine.farmaco?.quantita_confezione || 0
            });
        }
    }, [isOpen, medicine]);

    const handleSubmit = async () => {
        if (!medicine) return;

        try {
            const payload = {
                id_farmaco_armadietto: medicine.id_farmaco_armadietto,
                quantita_rimanente: formData.quantita,
                data_scadenza: formData.scadenza
            };

            const res = await fetch('/api/aggiorna-quantita', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Si è verificato un errore");
            }
        } catch (err) {
            console.error("Errore operazione:", err);
            alert("Errore di connessione");
        }
    };

    if (!medicine) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Modifica Farmaco"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annulla</Button>
                    <Button onClick={handleSubmit}>Salva Modifiche</Button>
                </>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Commerciale</label>
                    <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-500"
                        value={medicine.farmaco?.denominazione || ""} readOnly disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Quantità Rimanente *</label>
                        <input
                            type="number"
                            max={formData.quantita_totale > 0 ? formData.quantita_totale : undefined} min={0}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                            value={formData.quantita}
                            onChange={e => {
                                const val = parseFloat(e.target.value);
                                if (formData.quantita_totale > 0 && val > formData.quantita_totale) {
                                    return;
                                }
                                setFormData({ ...formData, quantita: e.target.value })
                            }}
                        />
                        {formData.quantita_totale > 0 && <p className="text-xs text-slate-400 mt-1">Massimo: {formData.quantita_totale}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Scadenza *</label>
                        <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                            value={formData.scadenza}
                            onChange={e => setFormData({ ...formData, scadenza: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}