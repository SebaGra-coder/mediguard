'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// --- ICONE SVG ---
const Icons = {
    Shield: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    X: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>,
    Search: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
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
                        <div className="bg-rose-50 p-1.5 rounded-lg text-rose-500"><Icons.Shield className="w-5 h-5"/></div>
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

export default function AddAllergyModal({ isOpen, onClose, onSuccess, userId, availableAllergens = [] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAllergen, setSelectedAllergen] = useState(null);
    const [severity, setSeverity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
            setSelectedAllergen(null);
            setSeverity(1);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const filteredAllergens = availableAllergens.filter(a => 
        a.sostanza_allergene.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Limit to 10 results for performance

    const handleSubmit = async () => {
        if (!userId || !selectedAllergen) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/CRUD-allergia-utente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_utente: userId, 
                    id_allergene: selectedAllergen.id_allergene, 
                    gravita_reazione: severity 
                })
            });

            if (res.ok) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                const errorData = await res.json();
                alert(errorData.message || "Errore durante il salvataggio");
            }
        } catch (err) {
            console.error("Errore operazione:", err);
            alert("Errore di connessione");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Aggiungi Allergia"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annulla</Button>
                    <Button onClick={handleSubmit} disabled={!selectedAllergen || isSubmitting}>
                        {isSubmitting ? 'Salvataggio...' : 'Aggiungi Allergia'}
                    </Button>
                </>
            }
        >
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Cerca Allergene</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pl-9 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]" 
                            placeholder="Cerca sostanza (es. Latte, Polline...)" 
                            value={selectedAllergen ? selectedAllergen.sostanza_allergene : searchTerm} 
                            onChange={e => {
                                setSearchTerm(e.target.value);
                                setSelectedAllergen(null);
                            }}
                        />
                        <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        
                        {searchTerm && !selectedAllergen && filteredAllergens.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-100 max-h-48 overflow-y-auto">
                                {filteredAllergens.map(allergene => (
                                    <button 
                                        type="button"
                                        key={allergene.id_allergene} 
                                        onClick={() => {
                                            setSelectedAllergen(allergene);
                                            setSearchTerm("");
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors border-b border-slate-50 last:border-0"
                                    >
                                        {allergene.sostanza_allergene}
                                    </button>
                                ))}
                            </div>
                        )}
                        {searchTerm && !selectedAllergen && filteredAllergens.length === 0 && (
                             <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-100 p-3 text-sm text-slate-500 text-center">
                                Nessun risultato trovato.
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                         <label className="block text-sm font-semibold text-slate-700">Gravità della reazione</label>
                         <span className="text-sm font-bold text-rose-500">Livello {severity}</span>
                    </div>
                    
                    <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        step="1" 
                        value={severity} 
                        onChange={(e) => setSeverity(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Lieve</span>
                        <span>Moderata</span>
                        <span>Grave</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}