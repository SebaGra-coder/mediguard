'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalStyles.module.css";

// --- ICONE SVG ---
const Icons = {
    Search: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
    Pill: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>,
    X: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>,
    AlertTriangle: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
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
                        <div className={`${styles.iconWrapper} ${styles.iconWrapperTeal}`}><Icons.Pill className="w-5 h-5" /></div>
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

export default function AddMedicationModal({ isOpen, onClose, onSuccess, userId, preSelectedMedication = null, userAllergies = [] }) {
    const [modalSearchTerm, setModalSearchTerm] = useState("");
    const [modalSearchResults, setModalSearchResults] = useState([]);
    const [isSearchingDrug, setIsSearchingDrug] = useState(false);

    const [formData, setFormData] = useState({
        nome: "", principio: "", forma: "compresse", dosaggio: "", quantita: "", scadenza: "", aic: "", lotto: "", quantita_totale: 0
    });

    // Date parts state
    const [expiryDay, setExpiryDay] = useState("");
    const [expiryMonth, setExpiryMonth] = useState("");
    const [expiryYear, setExpiryYear] = useState("");

    // Reset form when opening or preSelectedMedication changes
    useEffect(() => {
        if (isOpen) {
            if (preSelectedMedication) {
                // Pre-fill with selected medication
                handleSelectDrug(preSelectedMedication);
            } else {
                // Reset form
                setFormData({ nome: "", principio: "", forma: "compresse", dosaggio: "", quantita: "", scadenza: "", aic: "", lotto: "", quantita_totale: 0 });
                setExpiryDay("");
                setExpiryMonth("");
                setExpiryYear("");
                setModalSearchTerm("");
                setModalSearchResults([]);
            }
        }
    }, [isOpen, preSelectedMedication]);

    // Update scadenza when parts change
    useEffect(() => {
        if (expiryYear && expiryMonth) {
            // Default to day 01 if not provided
            const day = expiryDay ? expiryDay.padStart(2, '0') : "01";
            const month = expiryMonth.padStart(2, '0');
            setFormData(prev => ({ ...prev, scadenza: `${expiryYear}-${month}-${day}` }));
        } else {
            setFormData(prev => ({ ...prev, scadenza: "" }));
        }
    }, [expiryDay, expiryMonth, expiryYear]);

    // Debounce Search
    useEffect(() => {
        if (preSelectedMedication) return; // Disable search if pre-selected

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
    }, [modalSearchTerm, preSelectedMedication]);

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
            quantita_totale: drug.quantita_confezione || 0,
            scadenza: "", // Reset scadenza on new selection
            lotto: ""
        }));
        setExpiryDay("");
        setExpiryMonth("");
        setExpiryYear("");
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

            const res = await fetch('/api/armadietto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if (onSuccess) onSuccess("Farmaco aggiunto con successo");
                onClose();
            } else {
                const errorData = await res.json();
                // Handle error locally or pass via callback if needed
                console.error("Errore salvataggio", errorData);
            }
        } catch (err) {
            console.error("Errore operazione:", err);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={preSelectedMedication ? "Aggiungi all'Armadietto" : "Nuovo Farmaco"}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annulla</Button>
                    <Button onClick={handleSubmit} disabled={!formData.aic || !formData.quantita || !formData.scadenza}>Salva Farmaco</Button>
                </>
            }
        >
            <div className={styles.spaceY4}>
                {!preSelectedMedication && (
                    <div className={styles.relative}>
                        <label className={styles.label}>Cerca Farmaco da aggiungere</label>
                        <div className={styles.relative}>
                            <input
                                type="text"
                                className={`${styles.input} ${styles.inputWithIcon}`}
                                placeholder="Digita nome o AIC..."
                                value={modalSearchTerm}
                                onChange={e => setModalSearchTerm(e.target.value)}
                            />
                            <Icons.Search className={styles.searchIcon} />
                            {isSearchingDrug && <div className={`${styles.spinner}`} style={{
                                position: 'absolute', right: '0.75rem', top: '0.625rem', width: '1rem', height: '1rem',
                                border: '2px solid #14b8a6', borderTopColor: 'transparent', borderRadius: '50%'
                            }}></div>}
                        </div>

                        {modalSearchResults.length > 0 && (
                            <div className={styles.searchResults}>
                                {modalSearchResults.map(farmaco => (
                                    <button
                                        type="button"
                                        key={farmaco.codice_aic}
                                        onClick={(e) => { e.preventDefault(); handleSelectDrug(farmaco); }}
                                        className={styles.searchResultItem}
                                    >
                                        <div className={styles.fontBold}>{farmaco.denominazione} {farmaco.dosaggio}</div>
                                        <div className={styles.flexBetween} style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            <span>{farmaco.principio_attivo} - {farmaco.confezione}</span>
                                            <span>AIC: {farmaco.codice_aic}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                         <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.5rem 0' }}></div>
                    </div>
                )}
               

                 {/* Warning Allergie nel Modale */}
                 {(() => {
                    if (!formData.principio || userAllergies.length === 0) return null;
                    const pa = formData.principio.toLowerCase();
                    const conflict = userAllergies.find(allergy => pa.includes(allergy.toLowerCase()));
                    
                    if (conflict) {
                      return (
                        <div className={styles.warningBox}>
                            <div className={styles.warningBoxIcon}><Icons.AlertTriangle className="w-5 h-5"/></div>
                            <div>
                              <p className={styles.warningBoxTitle}>Attenzione: Possibile allergia</p>
                              <p className={styles.warningBoxText}>
                                Questo farmaco contiene <span className={styles.fontBold} style={{ textTransform: 'capitalize' }}>{conflict}</span>, a cui risulti allergico.
                              </p>
                            </div>
                        </div>
                      );
                    }
                    return null;
               })()}

                <div>
                    <label className={styles.label}>Nome Commerciale</label>
                    <input type="text" className={`${styles.input} ${styles.inputReadOnly}`}
                        value={formData.nome} readOnly disabled />
                </div>

                <div className={styles.grid2}>
                    <div>
                        <label className={styles.label}>Principio Attivo</label>
                        <input type="text" className={`${styles.input} ${styles.inputReadOnly}`}
                            value={formData.principio} readOnly disabled />
                    </div>
                    <div>
                        <label className={styles.label}>Dosaggio</label>
                        <input type="text" className={`${styles.input} ${styles.inputReadOnly}`}
                            value={formData.dosaggio} readOnly disabled />
                    </div>
                </div>

                <div>
                    <label className={styles.label}>Lotto di Produzione</label>
                    <input type="text" className={styles.input}
                        value={formData.lotto}
                        onChange={e => setFormData({ ...formData, lotto: e.target.value })}
                        placeholder="Opzionale" />
                </div>

                <div className={styles.grid2}>
                    <div>
                        <label className={styles.label}>Quantità Rimanente *</label>
                        <input
                            type="number"
                            max={formData.quantita_totale > 0 ? formData.quantita_totale : undefined} min={0}
                            className={styles.input}
                            value={formData.quantita}
                            onChange={e => setFormData({ ...formData, quantita: e.target.value })}
                        />
                        {formData.quantita_totale > 0 && <p className={styles.textXs} style={{ marginTop: '0.25rem', color: '#94a3b8' }}>Massimo: {formData.quantita_totale}</p>}
                    </div>
                    <div>
                        <label className={styles.label}>Scadenza *</label>
                        <div className={styles.dateInputsContainer}>
                            <input
                                type="number"
                                min="1" max="31"
                                placeholder="GG"
                                className={`${styles.input} ${styles.dateInputDay}`}
                                value={expiryDay}
                                onChange={e => setExpiryDay(e.target.value)}
                            />
                            <input
                                type="number"
                                min="1" max="12"
                                placeholder="MM"
                                className={`${styles.input} ${styles.dateInputMonth}`}
                                value={expiryMonth}
                                onChange={e => setExpiryMonth(e.target.value)}
                            />
                            <input
                                type="number"
                                min={new Date().getFullYear()}
                                placeholder="AAAA"
                                className={`${styles.input} ${styles.dateInputYear}`}
                                value={expiryYear}
                                onChange={e => setExpiryYear(e.target.value)}
                            />
                        </div>
                        <label className={styles.textXs} style={{ marginTop: '0.25rem', color: '#94a3b8', display: 'block' }}>
                            {formData.scadenza ? `Data: ${new Date(formData.scadenza).toLocaleDateString('it-IT')}` : "Inserisci Anno e Mese"}
                        </label>
                    </div>
                </div>
            </div>
        </Modal>
    );
}