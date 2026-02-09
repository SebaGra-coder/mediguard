'use client';

import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalStyles.module.css";

// --- COMPONENTS ---
const Badge = ({ children, variant = "default", className = "" }) => {
    let variantClass = styles.badgeDefault;
    if (variant === "success") variantClass = styles.badgeSuccess;
    if (variant === "warning") variantClass = styles.badgeWarning;
    if (variant === "destructive") variantClass = styles.badgeDestructive;
    
    return <span className={`${styles.badge} ${variantClass} ${className}`}>{children}</span>;
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
        <div className={styles.overlay}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
                    </button>
                </div>
                <div className={styles.content}>{children}</div>
            </div>
        </div>,
        document.body
    );
};

export default function TherapyDetailsModal({ isOpen, onClose, therapy }) {
    if (!isOpen || !therapy) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Dettagli: ${therapy.medicine}`}>
            <div className={styles.spaceY4}>
                <div className={styles.grid2} style={{ fontSize: '0.875rem' }}>
                    <div>
                        <p className={styles.textSlate500}>Dosaggio</p>
                        <p className={styles.fontBold}>{therapy.dosaggio}</p>
                    </div>
                    <div>
                        <p className={styles.textSlate500}>Stato</p>
                        <Badge variant={therapy.stato === 'attiva' ? 'success' : 'default'}>{therapy.stato}</Badge>
                    </div>
                    <div>
                        <p className={styles.textSlate500}>Frequenza</p>
                        <p className={styles.fontBold}>{therapy.frequency}</p>
                    </div>
                    <div>
                        <p className={styles.textSlate500}>Orari</p>
                        <p className={styles.fontBold}>{therapy.orari?.join(", ")}</p>
                    </div>
                    <div>
                        <p className={styles.textSlate500}>Inizio</p>
                        <p className={styles.fontBold}>{new Date(therapy.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className={styles.textSlate500}>Fine</p>
                        <p className={styles.fontBold}>{therapy.endDate ? new Date(therapy.endDate).toLocaleDateString() : "Continuativa"}</p>
                    </div>
                </div>
                {therapy.note && (
                    <div className={styles.infoBox} style={{ marginTop: '0.75rem', backgroundColor: '#f8fafc', borderColor: 'transparent' }}>
                        <p className={styles.textSlate500} style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '0.25rem' }}>Note</p>
                        {therapy.note}
                    </div>
                )}
            </div>
        </Modal>
    );
}