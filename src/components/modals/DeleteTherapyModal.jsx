'use client';

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/hooks/useToast";
import styles from "./ModalStyles.module.css";

// --- COMPONENTS ---
const Button = ({ children, onClick, variant = "primary", className = "", disabled }) => {
    let variantClass = styles.btnPrimary;
    if (variant === "secondary") variantClass = styles.btnSecondary;
    if (variant === "destructive") variantClass = styles.btnDestructive;

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

export default function DeleteTherapyModal({ isOpen, onClose, therapy, onSuccess }) {
    const { showToast, ToastComponent } = useToast();

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
                if (onSuccess) onSuccess("Terapia eliminata con successo");
                onClose();
            } else {
                showToast("Impossibile eliminare la terapia", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Errore durante l'eliminazione", "error");
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
            <ToastComponent />
            <p className={styles.textSlate500}>
                Sei sicuro di voler eliminare la terapia <strong>{therapy.medicine}</strong>? 
                Questa azione non può essere annullata e perderai lo storico dell&apos;aderenza.
            </p>
        </Modal>
    );
}