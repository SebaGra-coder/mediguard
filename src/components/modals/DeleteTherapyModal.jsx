'use client';

import { useEffect } from "react";
import { createPortal } from "react-dom";

// --- COMPONENTS ---
const Button = ({ children, onClick, variant = "primary", className = "", disabled }) => {
    const base = "inline-flex items-center justify-center rounded-lg font-bold text-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed h-11 px-5";
    const variants = {
        primary: "bg-[#14b8a6] text-white hover:bg-[#0d9488] shadow-md hover:shadow-lg",
        secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
        destructive: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200",
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

export default function DeleteTherapyModal({ isOpen, onClose, therapy, onSuccess }) {
    const handleDelete = async () => {
        if (!therapy) return;
        try {
            // Elimina prima le assunzioni associate (incluse quelle passate/archiviate)
            await fetch(`/api/assunzione?id_terapia=${therapy.id}`, {
                method: 'DELETE'
            });

            const res = await fetch(`/api/terapia?id_terapia=${therapy.id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                alert("Impossibile eliminare la terapia");
            }
        } catch (e) {
            console.error(e);
            alert("Errore durante l'eliminazione");
        }
    };

    if (!therapy) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Elimina Terapia"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annulla</Button>
                    <Button variant="destructive" onClick={handleDelete}>Elimina Definitivamente</Button>
                </>
            }
        >
            <p className="text-slate-600">
                Sei sicuro di voler eliminare la terapia <strong>{therapy.medicine}</strong>? 
                Questa azione non può essere annullata e perderai lo storico dell'aderenza.
            </p>
        </Modal>
    );
}