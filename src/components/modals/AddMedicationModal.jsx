'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

// --- ICONE SVG ---
const Icons = {
    Search: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
    Pill: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>,
    X: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>,
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <div className="bg-teal-50 p-1.5 rounded-lg text-[#14b8a6]"><Icons.Pill className="w-5 h-5"/></div>
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

export default function AddMedicationModal({ isOpen, onClose, onSuccess, userId }) {
    const [modalSearchTerm, setModalSearchTerm] = useState("");
    const [modalSearchResults, setModalSearchResults] = useState([]);
    const [isSearchingDrug, setIsSearchingDrug] = useState(false);
    
    const [formData, setFormData] = useState({
        nome: "", principio: "", forma: "compresse", dosaggio: "", quantita: "", scadenza: "", aic: "", lotto: "", quantita_totale: 0
    });

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setFormData({ nome: "", principio: "", forma: "compresse", dosaggio: "", quantita: "", scadenza: "", aic: "", lotto: "", quantita_totale: 0 });
            setModalSearchTerm("");
            setModalSearchResults([]);
        }
    }, [isOpen]);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (modalSearchTerm.length > 2) {
                setIsSearchingDrug(true);
                try {
                    const res = await fetch(`/api/farmaci/cerca?q=${encodeURIComponent(modalSearchTerm)}`);
                    const data = await res.json();
                    setModalSearchResults(data.farmaci || []);
                } catch (error) {
                    console.error("Errore ricerca farmaco", error);
                } finally {
                    setIsSearchingDrug(false);
                }
            } else {
                setModalSearchResults([]);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [modalSearchTerm]);

    const handleSelectDrug = (drug) => {
        setFormData(prev => ({
            ...prev,
            ...drug,
            nome: drug.denominazione || "",
            principio: drug.principio_attivo || "",
            forma: drug.forma ? drug.forma.toLowerCase() : "compresse",
            dosaggio: drug.dosaggio || "",
            aic: drug.codice_aic || "",
            quantita: drug.quantita_confezione ? String(drug.quantita_confezione) : "",
            quantita_totale: drug.quantita_confezione || 0
        }));
        setModalSearchTerm("");
        setModalSearchResults([]);
    };

    const handleSubmit = async () => {
        if (!userId) return;

        try {
            const payload = {
                id_utente_proprietario: userId,
                codice_aic: formData.aic,
                data_scadenza: formData.scadenza,
                quantita_rimanente: formData.quantita,
                lotto_produzione: formData.lotto
            };

            const res = await fetch('/api/antonio', {
                method: 'POST',
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nuovo Farmaco"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annulla</Button>
                    <Button onClick={handleSubmit} disabled={!formData.aic || !formData.quantita || !formData.scadenza}>Salva Farmaco</Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Cerca Farmaco da aggiungere</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]" 
                            placeholder="Digita nome o AIC..." 
                            value={modalSearchTerm} 
                            onChange={e => setModalSearchTerm(e.target.value)} 
                        />
                        <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        {isSearchingDrug && <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>}
                    </div>
                    
                    {modalSearchResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-100 max-h-48 overflow-y-auto">
                            {modalSearchResults.map(farmaco => (
                                <button 
                                    type="button"
                                    key={farmaco.codice_aic} 
                                    onClick={(e) => { e.preventDefault(); handleSelectDrug(farmaco); }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 hover:text-teal-800 transition-colors border-b border-slate-50 last:border-0"
                                >
                                    <div className="font-bold">{farmaco.denominazione} {farmaco.dosaggio}</div>
                                    <div className="text-xs text-slate-500 flex justify-between">
                                        <span>{farmaco.principio_attivo} - {farmaco.confezione}</span>
                                        <span>AIC: {farmaco.codice_aic}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-px bg-slate-100 my-2"></div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Commerciale</label>
                    <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-500" 
                            value={formData.nome} readOnly disabled />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Principio Attivo</label>
                        <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-500" 
                            value={formData.principio} readOnly disabled />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Dosaggio</label>
                        <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-500" 
                            value={formData.dosaggio} readOnly disabled />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Lotto di Produzione</label>
                    <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]" 
                            value={formData.lotto} 
                            onChange={e => setFormData({...formData, lotto: e.target.value})} 
                            placeholder="Opzionale" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Quantità Rimanente *</label>
                        <input 
                            type="number" 
                            max={formData.quantita_totale > 0 ? formData.quantita_totale : undefined}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]" 
                            value={formData.quantita} 
                            onChange={e => setFormData({...formData, quantita: e.target.value})} 
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
                            onChange={e => setFormData({...formData, scadenza: e.target.value})} 
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}