'use client';

import { useState, useEffect, useCallback } from "react";
import styles from './Profilo.module.css';
import { GuestOverlay } from "@/components/GuestOverlay";
import AddAllergyModal from "@/components/modals/AddAllergyModal";
import { useToast } from "@/hooks/useToast";

// --- ICONE SVG INLINE (Coerenti con lo stile MediGuard) ---
const Icons = {
    User: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    ),
    AlertTriangle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>
    ),
    Save: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
    ),
    Edit: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
    ),
    Plus: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    ),
    X: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    )
};

export default function ProfiloPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [allergie, setAllergie] = useState([]);
    const [formUser, setFormUser] = useState({});

    // Stato per gestione modale allergie
    const [showAllergyModal, setShowAllergyModal] = useState(false);
    const [availableAllergens, setAvailableAllergens] = useState([]);

    const { showToast, ToastComponent } = useToast();

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. Verifica sessione e dati utente
            const res = await fetch('/api/RUD-account?me');
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setFormUser({
                    nome: data.nome,
                    cognome: data.cognome,
                    email: data.email,
                    data_nascita: data.data_nascita ? data.data_nascita.split('T')[0] : ''
                });
                setIsAuthenticated(true);

                // 2. Carica allergie utente
                const allRes = await fetch(`/api/CRUD-allergia-utente?id_utente=${data.id_utente}`);
                const allData = await allRes.json();
                if (allData.success) setAllergie(allData.data);

                // 3. Carica lista allergeni globale per il form
                const allergensRes = await fetch('/api/visualizza-allergeni');
                const allergensData = await allergensRes.json();
                if (allergensData.success) setAvailableAllergens(allergensData.data);
            }
        } catch (error) {
            console.error("Errore caricamento profilo:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleUpdateProfile = async () => {
        try {
            const body = { ...formUser };
            // Rimuovi la password se è vuota per non sovrascriverla
            if (!body.password) delete body.password;

            const res = await fetch('/api/RUD-account', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setIsEditing(false);
                // Resetta la password nel form per sicurezza
                setFormUser(prev => ({ ...prev, password: '' }));
                loadData();
                showToast("Profilo aggiornato con successo", "success");
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteAllergy = async (id) => {
        if (!confirm("Rimuovere questa allergia?")) return;
        try {
            const res = await fetch(`/api/CRUD-allergia-utente?id_allergia=${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadData();
                showToast("Allergia rimossa", "success");
            }
        } catch (err) { console.error(err); }
    };

    const handleAllergySuccess = (message) => {
        loadData();
        if (message) showToast(message, "success");
    };

    if (isLoading) return <div className={styles.loaderContainer}><div className={styles.spinner}></div></div>;

    return (
        <div className={styles.pageContainer}>
            <ToastComponent />

            <main className={styles.main}>
                {!isAuthenticated && (
                    <GuestOverlay
                        title="Gestisci il Tuo Profilo"
                        description="Accedi per gestire i tuoi dati e le tue allergie."
                        features={[
                            "Aggiornare le tue informazioni personali",
                            "Registrare e monitorare le tue allergie",
                            "Verificare la sicurezza delle tue terapie"
                        ]}
                    />
                )}

                <div className={styles.contentWrapper}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Il Mio Profilo</h1>
                        <p className={styles.subtitle}>Gestisci le tue informazioni e la sicurezza medica</p>
                    </div>

                    <div className={styles.gridContainer}>

                        {/* SEZIONE INFO PERSONALI */}
                        <div className={styles.personalInfoColumn}>
                            <section className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardTitle}>
                                        <div className={styles.iconTeal}><Icons.User /></div>
                                        Informazioni Personali
                                    </div>
                                    <button
                                        onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                                        className={`${styles.actionButton} ${isEditing ? styles.saveButton : styles.editButton}`}
                                    >
                                        {isEditing ? <><Icons.Save /> Salva</> : <><Icons.Edit /> Modifica</>}
                                    </button>
                                </div>

                                <div className={styles.cardBody}>
                                    <div className={styles.inputGroup}>
                                        <div className={styles.inputField}>
                                            <label className={styles.label}>Nome</label>
                                            <input
                                                disabled={!isEditing}
                                                className={styles.input}
                                                value={formUser.nome}
                                                onChange={(e) => setFormUser({ ...formUser, nome: e.target.value })}
                                            />
                                        </div>
                                        <div className={styles.inputField}>
                                            <label className={styles.label}>Cognome</label>
                                            <input
                                                disabled={!isEditing}
                                                className={styles.input}
                                                value={formUser.cognome}
                                                onChange={(e) => setFormUser({ ...formUser, cognome: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.inputField}>
                                        <label className={styles.label}>Email</label>
                                        <input
                                            disabled={!isEditing}
                                            className={styles.input}
                                            value={formUser.email}
                                            onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.inputField}>
                                        <label className={styles.label}>Data di Nascita</label>
                                        <input
                                            type="date"
                                            disabled={!isEditing}
                                            className={styles.input}
                                            value={formUser.data_nascita}
                                            onChange={(e) => setFormUser({ ...formUser, data_nascita: e.target.value })}
                                        />
                                    </div>
                                    {isEditing && (
                                        <div className={`${styles.inputField} ${styles.animationFadeIn}`}>
                                            <label className={styles.label}>Nuova Password</label>
                                            <input
                                                type="password"
                                                placeholder="Lascia vuoto per mantenere la password attuale"
                                                className={styles.input}
                                                value={formUser.password || ''}
                                                onChange={(e) => setFormUser({ ...formUser, password: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* SEZIONE ALLERGIE */}
                        <div className={styles.allergiesColumn}>
                            <section className={styles.card}>
                                <div className={styles.allergyHeader}>
                                    <div className={styles.allergyTitle}>
                                        <Icons.AlertTriangle /> Allergie
                                    </div>
                                    <button
                                        onClick={() => setShowAllergyModal(true)}
                                        className={styles.addButton}
                                    >
                                        <Icons.Plus />
                                    </button>
                                </div>
                                <div className={styles.allergyList}>
                                    {allergie.length > 0 ? (
                                        allergie.map((al) => (
                                            <div key={al.id_allergia} className={styles.allergyItem}>
                                                <div>
                                                    <p className={styles.allergyName}>{al.allergene.sostanza_allergene}</p>
                                                    <span className={`${styles.badge} ${al.gravita_reazione > 2 ? styles.badgeHigh : styles.badgeMedium}`}>
                                                        Livello {al.gravita_reazione}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteAllergy(al.id_allergia)}
                                                    className={styles.deleteButton}
                                                >
                                                    <Icons.X />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className={styles.emptyState}>Nessuna allergia registrata</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODALE AGGIUNTA ALLERGIA */}
            <AddAllergyModal
                isOpen={showAllergyModal}
                onClose={() => setShowAllergyModal(false)}
                onSuccess={handleAllergySuccess}
                userId={user?.id_utente}
                availableAllergens={availableAllergens}
            />

            <footer className={styles.footer}>
                <p>© 2026 MediGuard. La tua salute, organizzata.</p>
            </footer>
        </div>
    );
}