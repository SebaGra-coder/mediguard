'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/hooks/useToast";
import styles from "./ModalStyles.module.css";

// --- ICONE SVG ---
const Icons = {
    Shield: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    X: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>,
    Search: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
};

// --- COMPONENTS ---
const Button = ({ children, onClick, variant = "primary", className = "", disabled }) => {
    const variantClass = variant === "primary" ? styles.btnPrimary : styles.btnSecondary;
    return <button onClick={onClick} disabled={disabled} className={`${styles.btn} ${variantClass} ${className}`}>{children}</button>;
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
        <div className={styles.overlay}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.title}>
                        <div className={`${styles.iconWrapper} ${styles.iconWrapperRose}`}><Icons.Shield className="w-5 h-5"/></div>
                        {title}
                    </h3>
                    <button onClick={onClose} className={styles.closeBtn}><Icons.X className="w-5 h-5" /></button>
                </div>
                <div className={styles.content}>{children}</div>
                {footer && <div className={styles.footer}>{footer}</div>}
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

    const { showToast, ToastComponent } = useToast();

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
                if (onSuccess) onSuccess("Allergia aggiunta con successo");
                onClose();
            } else {
                const errorData = await res.json();
                showToast("Errore durante il salvataggio", "error");
            }
        } catch (err) {
            console.error("Errore operazione:", err);
            showToast("Errore di rete", "error");
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
            <ToastComponent />
            <div className={styles.spaceY6}>
                <div>
                    <label className={styles.label}>Cerca Allergene</label>
                    <div className={styles.relative}>
                        <input 
                            type="text" 
                            className={`${styles.input} ${styles.inputWithIcon}`} 
                            placeholder="Cerca sostanza (es. Latte, Polline...)" 
                            value={selectedAllergen ? selectedAllergen.sostanza_allergene : searchTerm} 
                            onChange={e => {
                                setSearchTerm(e.target.value);
                                setSelectedAllergen(null);
                            }}
                        />
                        <Icons.Search className={styles.searchIcon} />
                        
                        {searchTerm && !selectedAllergen && filteredAllergens.length > 0 && (
                            <div className={styles.searchResults}>
                                {filteredAllergens.map(allergene => (
                                    <button 
                                        type="button"
                                        key={allergene.id_allergene} 
                                        onClick={() => {
                                            setSelectedAllergen(allergene);
                                            setSearchTerm("");
                                        }}
                                        className={styles.searchResultItem}
                                    >
                                        {allergene.sostanza_allergene}
                                    </button>
                                ))}
                            </div>
                        )}
                        {searchTerm && !selectedAllergen && filteredAllergens.length === 0 && (
                             <div className={styles.searchResults} style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b' }}>
                                Nessun risultato trovato.
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className={styles.flexBetween} style={{ marginBottom: '0.5rem' }}>
                         <label className={styles.label} style={{ marginBottom: 0 }}>Gravità della reazione</label>
                         <span className={styles.fontBold} style={{ color: '#f43f5e' }}>Livello {severity}</span>
                    </div>
                    
                    <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        step="1" 
                        value={severity} 
                        onChange={(e) => setSeverity(parseInt(e.target.value))}
                        className={styles.wFull}
                        style={{ height: '0.5rem', backgroundColor: '#e2e8f0', borderRadius: '0.5rem', appearance: 'none', cursor: 'pointer', accentColor: '#f43f5e' }}
                    />
                    <div className={styles.flexBetween} style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        <span>Lieve</span>
                        <span>Moderata</span>
                        <span>Grave</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}