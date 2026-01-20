"use client"; // Indica che questo è un Client Component per gestire stati ed eventi

import { useState, useEffect } from "react";

export default function TestAllergiePage() {
  // --- STATI PER IL TEST ---
  const [idUtente, setIdUtente] = useState(""); // Stato per l'ID dell'utente da testare 
  const [idAllergene, setIdAllergene] = useState(""); // Stato per l'ID dell'allergene (UUID) 
  const [gravita, setGravita] = useState(1); // Stato per la gravità (Int) 
  const [listaAllergie, setListaAllergie] = useState([]); // Stato per visualizzare i risultati della GET
  const [messaggio, setMessaggio] = useState(""); // Stato per feedback all'utente

  // --- 1. TEST GET (Recupera Allergie) ---
  const fetchAllergie = async () => {
    if (!idUtente) return setMessaggio("Inserisci un ID Utente per cercare"); // Validazione client
    try {
      // Chiamata alla rotta GET con parametro id_utente
      const res = await fetch(`/api/allergie-utente?id_utente=${idUtente}`);
      const json = await res.json();
      if (json.success) {
        setListaAllergie(json.data); // Salva i dati ricevuti nello stato
        setMessaggio(`Trovate ${json.data.length} allergie`);
      }
    } catch (err) {
      setMessaggio("Errore durante la GET");
    }
  };

  // --- 2. TEST POST (Crea Allergia) ---
  const creaAllergia = async () => {
    try {
      const res = await fetch("/api/allergie-utente", {
        method: "POST", // Metodo per la creazione
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_utente: idUtente,
          id_allergene: idAllergene,
          gravita_reazione: gravita, // Inviato come numero 
        }),
      });
      const json = await res.json();
      setMessaggio(json.success ? "Creazione riuscita!" : "Errore: " + json.message);
      if (json.success) fetchAllergie(); // Aggiorna la lista dopo la creazione
    } catch (err) {
      setMessaggio("Errore durante la POST");
    }
  };

  // --- 3. TEST PATCH (Aggiorna Gravità) ---
  const aggiornaGravita = async (id_allergia, nuovaGravita) => {
    try {
      const res = await fetch("/api/allergie-utente", {
        method: "PATCH", // Metodo per l'aggiornamento parziale
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_allergia: id_allergia,
          gravita_reazione: nuovaGravita,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessaggio("Gravità aggiornata!");
        fetchAllergie(); // Ricarica la lista
      }
    } catch (err) {
      setMessaggio("Errore durante la PATCH");
    }
  };

  // --- 4. TEST DELETE (Cancella Allergia) ---
  const eliminaAllergia = async (id_allergia) => {
    try {
      // Chiamata alla rotta DELETE con id_allergia come query param
      const res = await fetch(`/api/allergie-utente?id_allergia=${id_allergia}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setMessaggio("Allergia eliminata!");
        fetchAllergie(); // Ricarica la lista
      }
    } catch (err) {
      setMessaggio("Errore durante la DELETE");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Test API Allergia Utente</h1>
      
      {/* SEZIONE INPUT PRINCIPALI */}
      <div style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "20px" }}>
        <h3>Parametri Utente e Allergene</h3>
        <input 
          placeholder="ID Utente (UUID)" 
          value={idUtente} 
          onChange={(e) => setIdUtente(e.target.value)} 
          style={{ width: "300px", marginRight: "10px" }}
        />
        <input 
          placeholder="ID Allergene (UUID)" 
          value={idAllergene} 
          onChange={(e) => setIdAllergene(e.target.value)} 
          style={{ width: "300px" }}
        />
        <br /><br />
        <label>Gravità (1-10): </label>
        <input 
          type="number" 
          value={gravita} 
          onChange={(e) => setGravita(e.target.value)} 
        />
        <br /><br />
        <button onClick={creaAllergia} style={{ marginRight: "10px" }}>Test POST (Crea)</button>
        <button onClick={fetchAllergie}>Test GET (Visualizza)</button>
      </div>

      {/* FEEDBACK */}
      {messaggio && <p style={{ color: "blue", fontWeight: "bold" }}>{messaggio}</p>}

      {/* LISTA RISULTATI */}
      <h3>Allergie nel Database:</h3>
      <ul>
        {listaAllergie.map((item) => (
          <li key={item.id_allergia} style={{ marginBottom: "10px" }}>
            <strong>Allergene:</strong> {item.allergene?.sostanza_allergene || "ID: " + item.id_allergene} <br />
            <strong>Gravità attuale:</strong> {item.gravita_reazione}  <br />
            
            {/* Pulsanti per testare Update e Delete su riga singola */}
            <button onClick={() => aggiornaGravita(item.id_allergia, 10)}>Imposta Gravità 10</button>
            <button 
              onClick={() => eliminaAllergia(item.id_allergia)} 
              style={{ marginLeft: "10px", color: "red" }}
            >
              Elimina
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}