"use client";

import { useState } from "react";

export default function TestAllergiePage() {
    const [idUtente, setIdUtente] = useState("");
    const [idAllergene, setIdAllergene] = useState("");
    const [gravitaForm, setGravitaForm] = useState(1);
    const [listaAllergie, setListaAllergie] = useState([]);
    const [messaggio, setMessaggio] = useState("");

    // STATI MODALE
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allergiaSelezionata, setAllergiaSelezionata] = useState(null);
    const [gravitaModale, setGravitaModale] = useState(0);

    const fetchAllergie = async () => {
        if (!idUtente) return setMessaggio("Inserisci un ID Utente");
        try {
            const res = await fetch(`/api/CRUD-allergia-utente?id_utente=${idUtente}`);
            const json = await res.json();
            if (json.success) {
                setListaAllergie(json.data);
                setMessaggio(`Trovate ${json.data.length} allergie`);
            }
        } catch (err) { setMessaggio("Errore caricamento lista"); }
    };

    const creaAllergia = async () => {
        try {
            const res = await fetch("/api/CRUD-allergia-utente", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_utente: idUtente,
                    id_allergene: idAllergene,
                    gravita_reazione: parseInt(gravitaForm),
                }),
            });
            const json = await res.json();
            if (json.success) {
                setMessaggio("Registrata!");
                fetchAllergie();
            } else { setMessaggio("Errore: " + json.message); }
        } catch (err) { setMessaggio("Errore creazione"); }
    };

    const apriModifica = (item) => {
        setAllergiaSelezionata(item);
        setGravitaModale(item.gravita_reazione);
        setIsModalOpen(true);
    };

    const salvaModifica = async () => {
        try {
            const res = await fetch("/api/CRUD-allergia-utente", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_allergia: allergiaSelezionata.id_allergia,
                    gravita_reazione: parseInt(gravitaModale),
                }),
            });
            const json = await res.json();
            if (json.success) {
                setMessaggio("Aggiornato!");
                setIsModalOpen(false);
                fetchAllergie(); // Fondamentale per vedere il nuovo valore
            }
        } catch (err) { setMessaggio("Errore salvataggio"); }
    };

    const eliminaAllergia = async (id) => {
        try {
            const res = await fetch(`/api/CRUD-allergia-utente?id_allergia=${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) { setMessaggio("Eliminata!"); fetchAllergie(); }
        } catch (err) { setMessaggio("Errore eliminazione"); }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "800px", margin: "20px auto", backgroundColor: "#f0f0f0", color: "#000", borderRadius: "10px", minHeight: "90vh" }}>
            <h1 style={{ textAlign: "center" }}>Gestione Allergie</h1>

            <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "20px" }}>
                <input placeholder="ID Utente" value={idUtente} onChange={(e) => setIdUtente(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #000" }} />
                <input placeholder="ID Allergene" value={idAllergene} onChange={(e) => setIdAllergene(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #000" }} />
                <label style={{ fontWeight: "bold" }}>Gravità: {gravitaForm}</label>
                <input type="range" min="0" max="10" value={gravitaForm} onChange={(e) => setGravitaForm(e.target.value)} style={{ width: "100%", marginBottom: "10px" }} />
                <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={creaAllergia} style={{ flex: 1, padding: "10px", backgroundColor: "#000", color: "#fff", cursor: "pointer" }}>REGISTRA</button>
                    <button onClick={fetchAllergie} style={{ flex: 1, padding: "10px", backgroundColor: "#ddd", cursor: "pointer" }}>CERCA</button>
                </div>
            </div>

            {messaggio && <div style={{ padding: "10px", border: "1px solid #000", textAlign: "center", marginBottom: "10px", fontWeight: "bold" }}>{messaggio}</div>}

            <div style={{ display: "grid", gap: "10px" }}>
                {listaAllergie.map((item) => (
                    <div key={item.id_allergia} style={{ backgroundColor: "#fff", padding: "15px", borderRadius: "6px", border: "1px solid #000", display: "flex", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontWeight: "bold" }}>{item.allergene?.sostanza_allergene || "Ignoto"}</div>
                            <div>Gravità: {item.gravita_reazione}</div>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => apriModifica(item)} style={{ cursor: "pointer", fontWeight: "bold" }}>MODIFICA</button>
                            <button onClick={() => eliminaAllergia(item.id_allergia)} style={{ color: "red", cursor: "pointer" }}>ELIMINA</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODALE */}
            {isModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "10px", width: "350px", textAlign: "center", border: "2px solid #000", color: "#000" }}>
                        <h2>Modifica</h2>
                        <p>Sostanza: <b>{allergiaSelezionata?.allergene?.sostanza_allergene}</b></p>
                        <div style={{ margin: "20px 0" }}>
                            <label style={{ fontWeight: "bold", display: "block" }}>Nuova Gravità: {gravitaModale}</label>
                            <input type="range" min="0" max="10" value={gravitaModale} onChange={(e) => setGravitaModale(e.target.value)} style={{ width: "100%" }} />
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "10px", cursor: "pointer" }}>ANNULLA</button>
                            <button onClick={salvaModifica} style={{ flex: 1, padding: "10px", backgroundColor: "#2ecc71", color: "#fff", cursor: "pointer", border: "none" }}>SALVA</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}