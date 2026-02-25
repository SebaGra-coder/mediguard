'use client';

import { useState, useEffect, useCallback } from "react";
import styles from './Profilo.module.css';
import { GuestOverlay } from "@/components/GuestOverlay";
import AddAllergyModal from "@/components/modals/AddAllergyModal";
import { useToast } from "@/hooks/useToast";
import { Icons } from "@/components/ui/Icons";

// --- ICONE SVG INLINE (Coerenti con lo stile MediGuard) ---

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
                                        <div className={styles.iconTeal}><Icons.User width={20} height={20} /></div>
                                        Informazioni Personali
                                    </div>
                                    <button
                                        onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                                        className={`${styles.actionButton} ${isEditing ? styles.saveButton : styles.editButton}`}
                                    >
                                        {isEditing ? <><Icons.Save width={18} height={18} /> Salva</> : <><Icons.Edit width={18} height={18} /> Modifica</>}
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
                                        <Icons.AlertTriangle width={20} height={20} /> Allergie
                                    </div>
                                    <button
                                        onClick={() => setShowAllergyModal(true)}
                                        className={styles.addButton}
                                    >
                                        <Icons.Plus width={18} height={18} />
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
                                                    <Icons.X width={18} height={18} />
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