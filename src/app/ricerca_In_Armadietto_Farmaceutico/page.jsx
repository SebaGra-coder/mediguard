'use client'; // Indica che il componente usa hook di React (lato client)

import { useState } from 'react';

export default function RicercaArmadietto() {
  // Stato per memorizzare l'input dell'utente (ID di test predefinito)
  const [idUtente, setIdUtente] = useState('d37bdfea-88c0-406b-9544-8028f1054337');
  // Stato per memorizzare l'array dei farmaci restituiti dal server 
  const [risultati, setRisultati] = useState([]);
  // Stato per i messaggi di feedback (successo o errore)
  const [messaggio, setMessaggio] = useState('');
  // Stato booleano per gestire la disabilitazione del tasto durante il caricamento
  const [caricamento, setCaricamento] = useState(false);

  // Funzione asincrona attivata dal click sul pulsante
  const cercaFarmaci = async () => {
    setCaricamento(true);        // Mostra lo stato di caricamento
    setMessaggio('Ricerca...');  // Feedback testuale
    setRisultati([]);            // Svuota i risultati precedenti

    try {
      // Esegue la chiamata GET passando l'ID utente come parametro 
      const response = await fetch(`/api/antonio?id_utente=${idUtente}`);
      const risultato = await response.json();

      // Se il server risponde con un errore (es. 400 o 500)
      if (!response.ok) {
        throw new Error(risultato.error || 'Errore durante la ricerca');
      }

      // Se la lista è vuota, informa l'utente
      if (risultato.data.length === 0) {
        setMessaggio('Nessun farmaco trovato per questo utente.');
      } else {
        // Salva i dati ricevuti nello stato risultati
        setRisultati(risultato.data);
        setMessaggio(`✅ Trovati ${risultato.data.length} farmaci.`);
      }
    } catch (error) {
      // Gestione degli errori di rete o dell'API
      setMessaggio(`❌ Errore: ${error.message}`);
    } finally {
      setCaricamento(false); // Ripristina il pulsante
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px' }}>
      <h1>Ricerca Armadietto Utente</h1>
      
      <div style={{ marginBottom: '20px' }}>
        {/* Input testuale collegato allo stato idUtente */}
        <input 
          type="text" 
          value={idUtente} 
          onChange={(e) => setIdUtente(e.target.value)}
          placeholder="Inserisci UUID Utente"
          style={{ padding: '10px', width: '300px', marginRight: '10px' }}
        />
        <button 
          onClick={cercaFarmaci} 
          disabled={caricamento}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {caricamento ? 'Ricerca...' : 'Cerca Farmaci'}
        </button>
      </div>

      {/* Visualizzazione dinamica del messaggio di stato */}
      {messaggio && <p>{messaggio}</p>}

      {/* Rendering della lista dei risultati tramite .map() */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {risultati.map((item) => (
          <div key={item.id_farmaco_armadietto} style={{ 
            border: '1px solid #ffffff', 
            padding: '15px', 
            borderRadius: '8px',
            backgroundColor: '#000000'
          }}>
            {/* 'item.farmaco' esiste grazie all'include di Prisma fatto nel server [cite: 7, 10] */}
            <h3 style={{ margin: '0 0 10px 0' }}>{item.farmaco.denominazione}</h3>
            {/* Visualizza campi tecnici dal DB [cite: 3, 4, 10] */}
            <p><strong>AIC:</strong> {item.codice_aic}</p>
            <p><strong>Produttore:</strong> {item.farmaco.ragione_sociale}</p>
            {/* Formattazione della data di scadenza  */}
            <p><strong>Scadenza:</strong> {new Date(item.data_scadenza).toLocaleDateString()}</p>
            <p><strong>Quantità Rimanente:</strong> {item.quantita_rimanente}</p>
            <small>Lotto: {item.lotto_produzione}</small>
          </div>
        ))}
      </div>
    </div>
  );
}