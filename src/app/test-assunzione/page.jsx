"use client";

import { useState } from "react";

export default function TestAssunzionePage() {
  const [idTerapia, setIdTerapia] = useState("");
  
  // Campi per creazione singola o batch
  const [dataProgrammata, setDataProgrammata] = useState(new Date().toISOString().slice(0, 16));
  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  
  // Campi per aggiornamento (PUT)
  const [orarioEffettivo, setOrarioEffettivo] = useState(new Date().toISOString().slice(0, 16));
  const [esito, setEsito] = useState("true"); // String "true"/"false" per select
  
  const [listaAssunzioni, setListaAssunzioni] = useState([]);
  const [messaggio, setMessaggio] = useState("");

  // GET
  const fetchAssunzioni = async () => {
    if (!idTerapia) return setMessaggio("Inserisci ID Terapia per cercare.");
    try {
      const res = await fetch(`/api/assunzione?id_terapia=${idTerapia}`);
      const json = await res.json();
      if (json.success) {
        setListaAssunzioni(json.data);
        setMessaggio(`Trovate ${json.count} assunzioni programmate.`);
      } else {
        setMessaggio("Errore: " + json.error);
      }
    } catch (err) {
      setMessaggio("Errore durante la GET.");
      console.error(err);
    }
  };

  // POST (Smart: Batch o Singola)
  const creaAssunzioni = async () => {
    try {
      const payload = { id_terapia: idTerapia };

      if (dataInizio && dataFine) {
        // Batch
        payload.data_inizio = new Date(dataInizio).toISOString();
        payload.data_fine = new Date(dataFine).toISOString();
      } else {
        // Singola
        payload.data_programmata = new Date(dataProgrammata).toISOString();
        // Creiamo come "programmata" (null)
        payload.orario_effettivo = null;
        payload.esito = null;
      }

      const res = await fetch("/api/assunzione", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      
      if (json.success) {
        setMessaggio(json.message);
        fetchAssunzioni();
      } else {
        setMessaggio("Errore: " + json.error);
      }
    } catch (err) {
      setMessaggio("Errore durante la POST.");
      console.error(err);
    }
  };

  // PUT: Conferma assunzione (Sposta in storico)
  const confermaAssunzione = async (id_evento) => {
    try {
      const res = await fetch("/api/assunzione", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_evento: id_evento,
          esito: esito === "true",
          orario_effettivo: new Date(orarioEffettivo).toISOString()
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessaggio("Assunzione confermata e archiviata!");
        fetchAssunzioni(); // Rimuoverà l'item dalla lista perché spostato
      } else {
        setMessaggio("Errore conferma: " + json.error);
      }
    } catch (err) {
      setMessaggio("Errore durante la PUT.");
      console.error(err);
    }
  };

  // DELETE
  const eliminaAssunzione = async (id_evento) => {
    try {
      const res = await fetch(`/api/assunzione?id_evento=${id_evento}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setMessaggio("Assunzione eliminata!");
        fetchAssunzioni();
      } else {
        setMessaggio("Errore eliminazione: " + json.error);
      }
    } catch (err) {
      setMessaggio("Errore durante la DELETE.");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Test Scheduler Assunzioni</h1>
      
      <div style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "20px", background: "#f9f9f9" }}>
        <h3>1. Configurazione</h3>
        <label>ID Terapia (UUID): </label>
        <input 
          value={idTerapia} 
          onChange={(e) => setIdTerapia(e.target.value)} 
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          placeholder="Incolla qui l'ID della terapia..."
        />
        <button onClick={fetchAssunzioni} style={{ padding: "8px 16px" }}>Carica Programmazione</button>
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        {/* COLONNA SX: GENERAZIONE */}
        <div style={{ flex: 1, border: "1px solid #ccc", padding: "15px" }}>
          <h3>2. Genera Assunzioni</h3>
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            Compila "Inizio" e "Fine" per generare un calendario, oppure solo "Programmata" per una singola.
          </p>
          
          <label style={{ display: "block", marginTop: "10px" }}>Batch Inizio:</label>
          <input type="date" value={dataInizio} onChange={(e) => setDataInizio(e.target.value)} />
          
          <label style={{ display: "block", marginTop: "10px" }}>Batch Fine:</label>
          <input type="date" value={dataFine} onChange={(e) => setDataFine(e.target.value)} />
          
          <hr style={{ margin: "15px 0" }} />
          
          <label style={{ display: "block" }}>Singola Data/Ora:</label>
          <input type="datetime-local" value={dataProgrammata} onChange={(e) => setDataProgrammata(e.target.value)} />

          <button onClick={creaAssunzioni} style={{ marginTop: "15px", width: "100%", padding: "10px", background: "#0070f3", color: "white", border: "none", cursor: "pointer" }}>
            Genera Assunzioni
          </button>
        </div>

        {/* COLONNA DX: AZIONE DI CONFERMA */}
        <div style={{ flex: 1, border: "1px solid #ccc", padding: "15px" }}>
          <h3>3. Parametri Conferma</h3>
          <p style={{ fontSize: "0.9em", color: "#666" }}>
            Usa questi valori quando clicchi "Conferma" sulla lista sotto.
          </p>
          
          <label style={{ display: "block", marginTop: "10px" }}>Orario Effettivo Assunzione:</label>
          <input 
            type="datetime-local"
            value={orarioEffettivo}
            onChange={(e) => setOrarioEffettivo(e.target.value)}
            style={{ width: "100%" }}
          />

          <label style={{ display: "block", marginTop: "10px" }}>Esito:</label>
          <select value={esito} onChange={(e) => setEsito(e.target.value)} style={{ width: "100%", padding: "5px" }}>
            <option value="true">✅ Preso</option>
            <option value="false">❌ Saltato</option>
          </select>
        </div>
      </div>

      {messaggio && <div style={{ padding: "10px", background: "#e0f7fa", color: "#006064", borderRadius: "4px", marginBottom: "20px" }}>{messaggio}</div>}

      <h3>Programmazione Attiva (DB: registro_assunzioni)</h3>
      {listaAssunzioni.length === 0 ? <p>Nessuna assunzione programmata trovata.</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#eee", textAlign: "left" }}>
              <th style={{ padding: "10px" }}>Data Programmata</th>
              <th style={{ padding: "10px" }}>Stato</th>
              <th style={{ padding: "10px" }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {listaAssunzioni.map((item) => (
              <tr key={item.id_evento} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "10px" }}>
                  {new Date(item.data_programmata).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td style={{ padding: "10px" }}>
                  <span style={{ background: "#fff3cd", padding: "4px 8px", borderRadius: "12px", fontSize: "0.85em" }}>⏳ In Attesa</span>
                </td>
                <td style={{ padding: "10px" }}>
                  <button 
                    onClick={() => confermaAssunzione(item.id_evento)}
                    style={{ marginRight: "10px", padding: "5px 10px", cursor: "pointer", background: "#d4edda", border: "1px solid #c3e6cb" }}
                    title="Sposta in storico con i parametri sopra"
                  >
                    Conferma
                  </button>
                  <button 
                    onClick={() => eliminaAssunzione(item.id_evento)}
                    style={{ padding: "5px 10px", cursor: "pointer", background: "#f8d7da", border: "1px solid #f5c6cb" }}
                  >
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}