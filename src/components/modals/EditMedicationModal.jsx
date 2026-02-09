'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalStyles.module.css";

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
                    <h3 className={styles.title}>{title}</h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
                    </button>
                </div>
                <div className={styles.content}>{children}</div>
                {footer && <div className={styles.footer}>{footer}</div>}
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
                if (onSuccess) onSuccess("Farmaco modificato con successo");
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
            <div className={styles.spaceY4}>
                <div>
                    <label className={styles.label}>Nome Commerciale</label>
                    <input type="text" className={`${styles.input} ${styles.inputReadOnly}`}
                        value={medicine.farmaco?.denominazione || ""} readOnly disabled />
                </div>

                <div className={styles.grid2}>
                    <div>
                        <label className={styles.label}>Quantità Rimanente *</label>
                        <input
                            type="number"
                            max={formData.quantita_totale > 0 ? formData.quantita_totale : undefined} min={0}
                            className={styles.input}
                            value={formData.quantita}
                            onChange={e => {
                                const val = parseFloat(e.target.value);
                                if (formData.quantita_totale > 0 && val > formData.quantita_totale) {
                                    return;
                                }
                                setFormData({ ...formData, quantita: e.target.value })
                            }}
                        />
                        {formData.quantita_totale > 0 && <p className={styles.textXs} style={{ marginTop: '0.25rem', color: '#94a3b8' }}>Massimo: {formData.quantita_totale}</p>}
                    </div>
                    <div>
                        <label className={styles.label}>Scadenza *</label>
                        <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className={styles.input}
                            value={formData.scadenza}
                            onChange={e => setFormData({ ...formData, scadenza: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}