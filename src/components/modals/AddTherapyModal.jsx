'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/hooks/useToast";
import styles from "./ModalStyles.module.css";

// --- ICONE SVG ---
const Icons = {
    Pill: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>,
    X: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>,
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

export default function AddTherapyModal({ isOpen, onClose, onSuccess, userId, cabinetMedicines = [], initialMedicineId = "", initialData = null }) {
    const [formData, setFormData] = useState({
        medicine: "",
        id_farmaco_armadietto: "",
        dosaggio: "",
        alBisogno: false,
        orari: ["08:00"],
        startDate: "",
        endDate: "",
        note: "",
        stato: "attiva"
    });

    const { showToast, ToastComponent } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Edit Mode
                setFormData({
                    medicine: initialData.medicine || "",
                    id_farmaco_armadietto: initialData.originalData?.id_farmaco_armadietto || "",
                    dosaggio: parseFloat(initialData.dosaggio) || "",
                    alBisogno: initialData.originalData?.solo_al_bisogno || false,
                    orari: initialData.orari || ["08:00"],
                    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
                    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
                    note: initialData.note || "",
                    stato: initialData.stato || "attiva"
                });
            } else {
                // Create Mode
                setFormData({
                    medicine: "",
                    id_farmaco_armadietto: initialMedicineId || "",
                    dosaggio: "",
                    alBisogno: false,
                    orari: ["08:00"],
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: "",
                    note: "",
                    stato: "attiva"
                });
            }
        }
    }, [isOpen, initialMedicineId, initialData]);

    const updateOrario = (idx, val) => {
        const newOrari = [...formData.orari]; newOrari[idx] = val;
        setFormData({ ...formData, orari: newOrari });
    };

    const handleSave = async () => {
        if (!userId) return;

        try {
            // EDIT MODE
            if (initialData) {
                const body = {
                    id_terapia: initialData.id,
                    id_farmaco_armadietto: formData.id_farmaco_armadietto,
                    nome_utilita: formData.medicine,
                    dose_singola: parseFloat(formData.dosaggio),
                    solo_al_bisogno: formData.alBisogno,
                    terapia_attiva: formData.stato === "attiva",
                    // Assicurati che le date siano stringhe YYYY-MM-DD
                    data_inizio: formData.startDate,
                    data_fine: formData.endDate || null,
                    note: formData.note,
                    // Invia SEMPRE gli orari se non è "al bisogno"
                    orari: formData.alBisogno ? [] : formData.orari
                };

                const res = await fetch('/api/terapia', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                const json = await res.json();

                if (res.ok && json.success) {
                    if (onSuccess) onSuccess("Terapia aggiornata con successo");
                    onClose();
                } else {
                    console.error("Errore aggiornamento: " + (json.error || "Sconosciuto"));
                    showToast("Errore aggiornamento terapia", "error");
                    // Potresti voler passare l'errore al parent se necessario
                }
                return;
            }

            // CREATE MODE
            const selectedMed = cabinetMedicines.find(m => m.id_farmaco_armadietto === formData.id_farmaco_armadietto);
            const nomeUtilita = formData.medicine || (selectedMed ? selectedMed.farmaco.denominazione : "Nuova Terapia");

            const body = {
                id_paziente: userId,
                id_farmaco_armadietto: formData.id_farmaco_armadietto,
                nome_utilita: nomeUtilita,
                dose_singola: parseFloat(formData.dosaggio),
                solo_al_bisogno: formData.alBisogno,
                data_inizio: formData.startDate,
                data_fine: formData.endDate,
                terapia_attiva: true,
                note: formData.note,
                orari: formData.alBisogno ? [] : formData.orari
            };

            // Effettua SOLO questa chiamata. 
            // Il backend genererà automaticamente le assunzioni.
            const res = await fetch('/api/terapia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();

            if (res.ok && json.success) {
                if (onSuccess) onSuccess("Terapia creata con successo");
                onClose();
            } else {
                console.error("Errore salvataggio: " + (json.error || "Sconosciuto"));
                showToast("Errore creazione terapia", "error");
            }

        } catch (e) {
            console.error("Errore chiamata API", e);
            showToast("Errore di connessione", "error");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Modifica Terapia" : "Nuova Terapia"}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Annulla</Button>
                    <Button onClick={handleSave} disabled={(!formData.id_farmaco_armadietto && !formData.medicine) || !formData.startDate || !formData.dosaggio || (!formData.alBisogno && formData.orari.length === 0)}>
                        {initialData ? "Salva Modifiche" : "Salva Terapia"}
                    </Button>
                </>
            }
        >
            <ToastComponent />
            <div className={styles.spaceY4}>
                <div>
                    <label className={styles.label}>Seleziona Farmaco</label>
                    <select
                        className={styles.select}
                        value={formData.id_farmaco_armadietto}
                        onChange={e => {
                            const selectedId = e.target.value;
                            setFormData({
                                ...formData,
                                id_farmaco_armadietto: selectedId
                            });
                        }}
                    >
                        <option value="">-- Seleziona dal tuo armadietto --</option>
                        {cabinetMedicines.map(m => (
                            <option key={m.id_farmaco_armadietto} value={m.id_farmaco_armadietto}>
                                {m.farmaco?.denominazione} ({m.quantita_rimanente} rimanenti)
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={styles.label}>Nome Terapia</label>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Es. Pillola pressione mattina"
                        value={formData.medicine}
                        onChange={e => setFormData({ ...formData, medicine: e.target.value })}
                    />
                </div>

                <div className={styles.grid2}>
                    <div>
                        <label className={styles.label}>Dosaggio</label>
                        <input type="number" step="0.5" className={styles.input}
                            placeholder="Es. 1" value={formData.dosaggio} onChange={e => setFormData({ ...formData, dosaggio: e.target.value })} />
                    </div>
                </div>

                {!formData.alBisogno && (
                    <div className={styles.fadeInSlideDown}>
                        <div className={styles.flexBetween} style={{ marginBottom: '0.25rem' }}>
                            <label className={styles.label}>Orari Assunzione</label>
                            <button type="button" onClick={() => setFormData({ ...formData, orari: [...formData.orari, "12:00"] })} 
                                className={styles.textSm} style={{ fontWeight: 'bold', color: '#14b8a6', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
                                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                            >+ Aggiungi Orario</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {formData.orari.map((orario, idx) => (
                                <div key={idx} className={styles.timeInputWrapper}>
                                    <input type="time" className={styles.timeInput} value={orario} onChange={(e) => updateOrario(idx, e.target.value)} />
                                    <button type="button" onClick={() => {
                                        const newOrari = formData.orari.filter((_, i) => i !== idx);
                                        setFormData({ ...formData, orari: newOrari });
                                    }} className={styles.iconBtnDestructive}>
                                        <Icons.X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {formData.orari.length === 0 && (
                            <p className={styles.textXs} style={{ color: '#d97706', marginTop: '0.25rem' }}>Aggiungi almeno un orario.</p>
                        )}
                    </div>
                )}

                <div className={styles.grid2}>
                    <div>
                        <label className={styles.label}>Data Inizio</label>
                        <input type="date" className={styles.input}
                            value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                    </div>
                    <div>
                        <label className={styles.label}>Data Fine (Opzionale)</label>
                        <input type="date" className={styles.input}
                            value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                    </div>
                </div>

                <div>
                    <label className={styles.label}>Note Aggiuntive</label>
                    <textarea rows={3} className={styles.input}
                        placeholder="Es. Prendere a stomaco pieno..." value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} />
                </div>
            </div>
        </Modal>
    );
}