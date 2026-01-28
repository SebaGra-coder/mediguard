'use client';

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { GuestOverlay } from "@/components/GuestOverlay";
import AddAllergyModal from "@/components/modals/AddAllergyModal";

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
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteAllergy = async (id) => {
        if (!confirm("Rimuovere questa allergia?")) return;
        try {
            const res = await fetch(`/api/CRUD-allergia-utente?id_allergia=${id}`, { method: 'DELETE' });
            if (res.ok) loadData();
        } catch (err) { console.error(err); }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#14b8a6]"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar isAuthenticated={isAuthenticated} />

            <main className="pt-10 pb-16 relative">
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

                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Il Mio Profilo</h1>
                        <p className="text-slate-500">Gestisci le tue informazioni e la sicurezza medica</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* SEZIONE INFO PERSONALI */}
                        <div className="lg:col-span-2 space-y-6">
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                                    <div className="flex items-center gap-2 font-bold text-slate-800">
                                        <div className="text-[#14b8a6]"><Icons.User /></div>
                                        Informazioni Personali
                                    </div>
                                    <button
                                        onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isEditing ? 'bg-[#14b8a6] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        {isEditing ? <><Icons.Save /> Salva</> : <><Icons.Edit /> Modifica</>}
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome</label>
                                            <input
                                                disabled={!isEditing}
                                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#14b8a6]/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                                                value={formUser.nome}
                                                onChange={(e) => setFormUser({ ...formUser, nome: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cognome</label>
                                            <input
                                                disabled={!isEditing}
                                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#14b8a6]/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                                                value={formUser.cognome}
                                                onChange={(e) => setFormUser({ ...formUser, cognome: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                                        <input
                                            disabled={!isEditing}
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#14b8a6]/20 outline-none disabled:bg-slate-50"
                                            value={formUser.email}
                                            onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data di Nascita</label>
                                        <input
                                            type="date"
                                            disabled={!isEditing}
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#14b8a6]/20 outline-none disabled:bg-slate-50"
                                            value={formUser.data_nascita}
                                            onChange={(e) => setFormUser({ ...formUser, data_nascita: e.target.value })}
                                        />
                                    </div>
                                    {isEditing && (
                                        <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nuova Password</label>
                                            <input
                                                type="password"
                                                placeholder="Lascia vuoto per mantenere la password attuale"
                                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#14b8a6]/20 outline-none"
                                                value={formUser.password || ''}
                                                onChange={(e) => setFormUser({ ...formUser, password: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* SEZIONE ALLERGIE */}
                        <div className="space-y-6">
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/30">
                                    <div className="flex items-center gap-2 font-bold text-rose-600">
                                        <Icons.AlertTriangle /> Allergie
                                    </div>
                                    <button
                                        onClick={() => setShowAllergyModal(true)}
                                        className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors"
                                    >
                                        <Icons.Plus />
                                    </button>
                                </div>
                                <div className="p-4 space-y-3">
                                    {allergie.length > 0 ? (
                                        allergie.map((al) => (
                                            <div key={al.id_allergia} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                                                <div>
                                                    <p className="font-bold text-slate-700 text-sm">{al.allergene.sostanza_allergene}</p>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${al.gravita_reazione > 2 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                                        Livello {al.gravita_reazione}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteAllergy(al.id_allergia)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 transition-all"
                                                >
                                                    <Icons.X />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center py-6 text-slate-400 text-sm">Nessuna allergia registrata</p>
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
                onSuccess={loadData}
                userId={user?.id_utente}
                availableAllergens={availableAllergens}
            />

            <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400 bg-white">
                <p>© 2024 MediGuard.</p>
            </footer>
        </div>
    );
}