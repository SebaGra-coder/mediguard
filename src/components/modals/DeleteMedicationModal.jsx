'use client';

import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalStyles.module.css";

// --- COMPONENTS ---
const Button = ({ children, onClick, variant = "primary", className = "", disabled }) => {
    let variantClass = styles.btnPrimary;
    if (variant === "secondary") variantClass = styles.btnSecondary;
    if (variant === "danger") variantClass = styles.btnDanger;
    
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

export default function DeleteMedicationModal({ isOpen, onClose, medicine, onSuccess, allMedicines = [] }) {
    const handleDelete = async () => {
        if (!medicine) return;
        try {
            const res = await fetch(`/api/armadietto?id_farmaco=${medicine.id_farmaco_armadietto}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                if (onSuccess) onSuccess("Farmaco eliminato con successo");
                onClose();
            } else {
                alert("Impossibile eliminare il farmaco");
            }
        } catch (e) {
            console.error(e);
            alert("Errore durante l'eliminazione");
        }
    };

    if (!medicine) return null;

    // Check if there are other boxes of the same medication
    const otherBoxes = allMedicines.filter(m => 
        m.codice_aic === medicine.codice_aic && 
        m.id_farmaco_armadietto !== medicine.id_farmaco_armadietto
    );
    const hasOtherBoxes = otherBoxes.length > 0;
    const hasActiveTherapy = medicine.terapia && medicine.terapia.length > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Elimina Farmaco"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annulla</Button>
                    <Button variant="danger" onClick={handleDelete}>Elimina definitivamente</Button>
                </>
            }
        >
            <div className={styles.textCenter} style={{ padding: '1rem 0' }}>
                <h4 className={styles.fontBold} style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: '#1e293b' }}>Sei sicuro?</h4>
                <p className={styles.textSm} style={{ color: '#64748b', marginBottom: '1rem' }}>
                    Stai eliminando <strong>{medicine.farmaco?.denominazione}</strong> dal tuo armadietto.
                    Questa azione non potrà essere annullata.
                </p>
                
                {hasActiveTherapy && (
                    <div className={hasOtherBoxes ? styles.infoBox : styles.alertBox}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            {hasOtherBoxes ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className={styles.infoBoxIcon} style={{ width: '1.25rem', height: '1.25rem', marginTop: '0.125rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className={styles.alertBoxIcon} style={{ width: '1.25rem', height: '1.25rem', marginTop: '0.125rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                            )}
                            <div>
                                <p className={hasOtherBoxes ? styles.infoBoxTitle : styles.alertBoxTitle}>
                                    {hasOtherBoxes ? "Continuità Terapeutica Garantita" : "Attenzione: Terapia Attiva"}
                                </p>
                                <p className={hasOtherBoxes ? styles.infoBoxText : styles.alertBoxText}>
                                    {hasOtherBoxes 
                                        ? "La terapia collegata a questo farmaco NON verrà interrotta. Verrà automaticamente associata a un'altra confezione presente nel tuo armadietto."
                                        : "Questo farmaco è collegato a una o più terapie attive. Eliminandolo, le terapie verranno messe in pausa."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}