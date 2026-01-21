// Indica a Next.js di trattare questo file come un Client Component
"use client";

import { useState } from 'react';

/**
 * Pagina per la visualizzazione dei farmaci in disuso tramite chiamata GET
 */
export default function VisualizzaDisusoPage() {
  // Stato per memorizzare l'ID utente inserito nel campo di ricerca
  const [idUtente, setIdUtente] = useState('');
  
  // Stato per memorizzare l'array dei farmaci recuperati dal database
  const [listaDisuso, setListaDisuso] = useState([]);
  
  // Stato per gestire messaggi di caricamento o errore
  const [messaggio, setMessaggio] = useState('');

  /**
   * Funzione che esegue la chiamata GET all'API
   */
  const recuperaDatiDisuso = async () => {
    // Reset dello stato precedente
    setMessaggio('Caricamento in corso...');
    setListaDisuso([]);

    if (!idUtente) {
      setMessaggio('Errore: Inserire un ID utente valido.');
      return;
    }
    

    try {
      // Effettua la richiesta GET passando l'id_utente come parametro query
      const risposta = await fetch(`/api/armadietto_disuso?id_utente=${idUtente}`);
      const risultato = await risposta.json();

      if (risposta.ok) {
        // Se la chiamata ha successo, aggiorna la lista dei farmaci
        setListaDisuso(risultato.data);
        if (risultato.data.length === 0) {
          setMessaggio('Nessun farmaco in disuso trovato per questo utente.');
        } else {
          setMessaggio('');
        }
      } else {
        setMessaggio(`Errore: ${risultato.error}`);
      }
    } catch (error) {
      console.error("Errore durante il fetch:", error);
      setMessaggio('Errore di connessione al server.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Visualizza Farmaci in Disuso</h1>
      <p>Inserisci l'ID utente per visualizzare lo storico dei farmaci rimossi dall'armadietto.</p>

      {/* SEZIONE RICERCA */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Inserisci UUID Utente (es. id_utente_proprietario)"
          value={idUtente}
          onChange={(e) => setIdUtente(e.target.value)}
          style={{ padding: '10px', flex: 1, border: '1px solid #000000', borderRadius: '4px' }}
        />
        <button 
          onClick={recuperaDatiDisuso}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cerca nell'Archivio
        </button>
      </div>

      {/* MESSAGGI DI STATO */}
      {messaggio && <p style={{ fontWeight: 'bold', color: messaggio.includes('Errore') ? 'red' : 'blue' }}>{messaggio}</p>}

      {/* TABELLA RISULTATI */}
      {listaDisuso.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ backgroundColor: '#000000', textAlign: 'left', borderBottom: '2px solid #000000' }}>
              <th style={{ padding: '12px' }}>Codice AIC</th>
              <th style={{ padding: '12px' }}>Scadenza</th>
              <th style={{ padding: '12px' }}>Lotto</th>
              <th style={{ padding: '12px' }}>Quantità Rimanente</th>
            </tr>
          </thead>
          <tbody>
            {listaDisuso.map((item) => (
              <tr key={item.id_storico} style={{ borderBottom: '1px solid #000000' }}>
                <td style={{ padding: '12px' }}>{item.codice_aic}</td>
                {/* Converte la data del database in formato leggibile */}
                <td style={{ padding: '12px' }}>{new Date(item.data_scadenza).toLocaleDateString('it-IT')}</td>
                <td style={{ padding: '12px' }}>{item.lotto_produzione || 'N/D'}</td>
                <td style={{ padding: '12px' }}>{item.quantita_rimanente}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}