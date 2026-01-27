'use client';

import { useEffect } from "react";
import { createPortal } from "react-dom";

// --- COMPONENTS ---
const Badge = ({ children, variant = "default", className = "" }) => {
    const styles = {
        default: "bg-slate-100 text-slate-700",
        success: "bg-teal-50 text-[#14b8a6]",
        warning: "bg-amber-50 text-amber-600",
        destructive: "bg-rose-50 text-rose-600",
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border border-transparent ${styles[variant]} ${className}`}>{children}</span>;
};

const Modal = ({ isOpen, onClose, title, children }) => {
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
            </div>
        </div>,
        document.body
    );
};

export default function MedicationDetailsModal({ isOpen, onClose, farmaco }) {
    if (!isOpen || !farmaco) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Dettagli: ${farmaco.medicine}`}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-slate-500">Dosaggio</p>
                        <p className="font-bold">{farmaco.dosaggio}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Stato</p>
                        <Badge variant={farmaco.stato === 'attiva' ? 'success' : 'default'}>{farmaco.stato}</Badge>
                    </div>
                    <div>
                        <p className="text-slate-500">Frequenza</p>
                        <p className="font-bold">{farmaco.frequency}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Orari</p>
                        <p className="font-bold">{farmaco.orari?.join(", ")}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Inizio</p>
                        <p className="font-bold">{new Date(farmaco.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Fine</p>
                        <p className="font-bold">{farmaco.endDate ? new Date(farmaco.endDate).toLocaleDateString() : "Continuativa"}</p>
                    </div>
                </div>
                {farmaco.note && (
                    <div className="bg-slate-50 p-3 rounded-lg text-sm">
                        <p className="text-slate-500 text-xs uppercase font-bold mb-1">Note</p>
                        {farmaco.note}
                    </div>
                )}
            </div>
        </Modal>
    );
}