"use client";

import { useState, useEffect } from "react";

export default function TestVisualizzaAllergeni() {
    // --- STATI ---
    const [allergeni, setAllergeni] = useState([]); // Lista completa degli allergeni
    const [ricerca, setRicerca] = useState(""); // Testo inserito nella barra di ricerca
    const [loading, setLoading] = useState(false); // Stato di caricamento
    const [errore, setErrore] = useState(""); // Eventuali messaggi di errore

    // --- FUNZIONE RECUPERO DATI ---
    const caricaAllergeni = async (query = "") => {
        setLoading(true);
        setErrore("");
        try {
            // Chiamata alla rotta API (aggiungendo il parametro di ricerca se presente)
            const url = query 
                ? `/api/visualizza-allergeni?search=${encodeURIComponent(query)}` 
                : `/api/visualizza-allergeni`;
            
            const res = await fetch(url);
            const json = await res.json();

            if (json.success) {
                setAllergeni(json.data);
            } else {
                setErrore(json.error || "Errore nel caricamento");
            }
        } catch (err) {
            setErrore("Impossibile connettersi al server");
        } finally {
            setLoading(false);
        }
    };

    // Carica la lista completa all'apertura della pagina
    useEffect(() => {
        caricaAllergeni();
    }, []);

    // Gestore per la ricerca (avvia la funzione quando l'utente digita)
    const handleSearch = (e) => {
        const valore = e.target.value;
        setRicerca(valore);
        caricaAllergeni(valore);
    };

    return (
        <div style={{ 
            padding: "20px", 
            fontFamily: "Arial, sans-serif", 
            maxWidth: "900px", 
            margin: "20px auto", 
            backgroundColor: "#f0f0f0", 
            color: "#000", 
            borderRadius: "10px",
            minHeight: "80vh"
        }}>
            <h1 style={{ textAlign: "center", marginBottom: "20px", borderBottom: "2px solid #ccc", paddingBottom: "10px" }}>
                Database Allergeni Disponibili
            </h1>

            {/* BARRA DI RICERCA */}
            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Cerca sostanza (es. Aspirina, Latte...)"
                    value={ricerca}
                    onChange={handleSearch}
                    style={{ 
                        width: "100%", 
                        padding: "12px", 
                        borderRadius: "5px", 
                        border: "1px solid #bbb", 
                        fontSize: "16px",
                        boxSizing: "border-box",
                        backgroundColor: "#fff",
                        color: "#000"
                    }}
                />
            </div>

            {/* MESSAGGI DI STATO */}
            {loading && <p style={{ textAlign: "center", fontWeight: "bold" }}>Caricamento in corso...</p>}
            {errore && <p style={{ color: "red", textAlign: "center", fontWeight: "bold" }}>{errore}</p>}

            {/* TABELLA CON BARRA DI SCORRIMENTO (Scrollbar) */}
            <div style={{ 
                backgroundColor: "#fff", 
                borderRadius: "8px", 
                border: "1px solid #ccc", 
                overflow: "hidden", // Arrotonda gli angoli della tabella
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}>
                {/* Contenitore con altezza fissa e scrollbar verticale */}
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead style={{ position: "sticky", top: 0, backgroundColor: "#333", color: "#fff" }}>
                            <tr>
                                <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>ID Allergene (UUID)</th>
                                <th style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>Sostanza</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allergeni.length > 0 ? (
                                allergeni.map((a) => (
                                    <tr key={a.id_allergene} style={{ borderBottom: "1px solid #eee" }}>
                                        <td style={{ 
                                            padding: "12px", 
                                            fontSize: "13px", 
                                            fontFamily: "monospace", 
                                            color: "#555" 
                                        }}>
                                            {a.id_allergene}
                                        </td>
                                        <td style={{ 
                                            padding: "12px", 
                                            fontWeight: "bold", 
                                            color: "#000" 
                                        }}>
                                            {a.sostanza_allergene}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                !loading && (
                                    <tr>
                                        <td colSpan="2" style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                                            Nessun allergene trovato con questo nome.
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FOOTER INFORMATIVO */}
            <p style={{ marginTop: "15px", fontSize: "14px", color: "#666", textAlign: "right" }}>
                Totale sostanze caricate: <strong>{allergeni.length}</strong>
            </p>
        </div>
    );
}