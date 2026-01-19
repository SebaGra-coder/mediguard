'use client'; // Indica che il componente viene eseguito nel browser per gestire stati e interazioni

import { useState } from 'react';

/**
 * Componente per la gestione e l'eliminazione dei farmaci dall'armadietto
 */
export default function CancellaFarmaco() {
  // --- STATI (STATE) ---
  
  // Memorizza l'ID dell'utente di cui vogliamo gestire l'armadietto 
  const [idUtente, setIdUtente] = useState('d37bdfea-88c0-406b-9544-8028f1054337');
  
  // Memorizza l'elenco dei farmaci recuperati dal database 
  const [farmaci, setFarmaci] = useState([]);
  
  // Gestisce il feedback testuale per l'utente (errori o successi)
  const [notifica, setNotifica] = useState('');
  
  // Stato booleano per disabilitare i pulsanti durante le operazioni asincrone
  const [staCaricando, setStaCaricando] = useState(false);

  // --- FUNZIONI (LOGICA) ---

  /**
   * Recupera i farmaci associati all'utente per poterli visualizzare e poi eliminare
   */
  const caricaArmadietto = async () => {
    setStaCaricando(true);
    try {
      // Esegue una ricerca filtrata per id_utente_proprietario 
      const response = await fetch(`/api/antonio?id_utente=${idUtente}`);
      const risultato = await response.json();

      if (!response.ok) throw new Error(risultato.error);

      setFarmaci(risultato.data);
      setNotifica(risultato.data.length === 0 ? 'L\'armadietto è vuoto.' : '');
    } catch (err) {
      setNotifica(`❌ Errore caricamento: ${err.message}`);
    } finally {
      setStaCaricando(false);
    }
  };

  /**
   * Invia la richiesta di eliminazione al server per un record specifico
   * @param {string} idRecord - L'UUID del record nella tabella farmaco_armadietto 
   */
  const eseguiCancellazione = async (idRecord) => {
    // Chiede conferma all'utente (buona pratica per le eliminazioni)
    if (!confirm("Vuoi davvero eliminare questo farmaco?")) return;
    

    setStaCaricando(true);
    try {
      // Chiama l'endpoint DELETE passando l'id_farmaco_armadietto 
      const response = await fetch(`/api/antonio?id_farmaco=${idRecord}`, {
        method: 'DELETE',
      });

      const risultato = await response.json();

      if (!response.ok) throw new Error(risultato.error);

      // Aggiornamento ottimistico: rimuove il farmaco dalla lista visibile senza ricaricare la pagina
      setFarmaci(farmaci.filter(f => f.id_farmaco_armadietto !== idRecord));
      setNotifica('✅ Farmaco rimosso con successo!');

    } catch (err) {
      setNotifica(`❌ Errore eliminazione: ${err.message}`);
    } finally {
      setStaCaricando(false);
    }
  };

  // --- INTERFACCIA (UI) ---
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Gestione Eliminazione Farmaci</h2>
      
      {/* Input per inserire l'ID utente da monitorare */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={idUtente} 
          onChange={(e) => setIdUtente(e.target.value)}
          placeholder="Inserisci UUID Utente"
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={caricaArmadietto} disabled={staCaricando} style={{ padding: '8px 16px' }}>
          Carica Lista
        </button>
      </div>

      {/* Area messaggi */}
      {notifica && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: '#f0f0f0' }}>
          {notifica}
        </div>
      )}

      {/* Lista dei farmaci con pulsante cancella */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {farmaci.map((f) => (
          <div key={f.id_farmaco_armadietto} style={{ 
            border: '1px solid #ddd', 
            padding: '12px', 
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              {/* Mostra la denominazione dal record relazionato 'farmaco' [cite: 3] */}
              <strong style={{ display: 'block' }}>{f.farmaco.denominazione}</strong>
              <small>Lotto: {f.lotto_produzione} - Scadenza: {new Date(f.data_scadenza).toLocaleDateString()}</small>
            </div>
            
            <button 
              onClick={() => eseguiCancellazione(f.id_farmaco_armadietto)}
              disabled={staCaricando}
              style={{ 
                backgroundColor: '#ff4444', 
                color: 'white', 
                border: 'none', 
                padding: '6px 12px', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancella
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}