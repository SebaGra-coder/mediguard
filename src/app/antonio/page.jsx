'use client';

import { useState } from 'react';

export default function InserisciFarmaco() {
  // Stati per gestire il feedback visivo nell'HTML
  const [messaggio, setMessaggio] = useState('');
  const [caricamento, setCaricamento] = useState(false);

  /**
   * Funzione per inserire il farmaco predefinito chiamando l'API interna
   */
  const inserisciFarmacoDefault = async () => {
    setCaricamento(true);
    setMessaggio('Inviando richiesta...');

    try {
      // Definizione del payload JSON con i dati richiesti dallo schema [cite: 10]
      const datoOperazione = {
        // ID dell'utente (deve essere un UUID esistente nella tabella utente) 
        id_utente_proprietario: "d37bdfea-88c0-406b-9544-8028f1054337", 
        
        // Codice AIC del farmaco (deve esistere nella tabella farmaci) [cite: 10]
        codice_aic: "033330022", 
        
        // Data di scadenza (verrà gestita come DateTime da Prisma) [cite: 10]
        data_scadenza: new Date("2017-08-01T00:00:00Z"), 
        
        // Identificativo del lotto [cite: 10]
        lotto_produzione: "5KTLDFT004", 
        
        // Quantità rimanente (Float) [cite: 10]
        quantita_rimanente: 30 
      };

      // Esegue la chiamata all'API locale configurata precedentemente
      const response = await fetch('/api/antonio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datoOperazione),
      });

      const risultato = await response.json();

      if (!response.ok) {
        throw new Error(risultato.error || 'Errore durante la chiamata API');
      }

      // Se tutto va bene, aggiorna il messaggio con l'esito positivo
      setMessaggio(`✅ Successo! Farmaco inserito con ID: ${risultato.data.id_farmaco_armadietto}`);
      console.log('Record creato:', risultato);

    } catch (error) {
      // Gestisce gli errori (es. AIC non trovato o errore server)
      setMessaggio(`❌ Errore: ${error.message}`);
      console.error("Errore durante la chiamata:", error.message);
    } finally {
      setCaricamento(false);
    }
  };

  // Interfaccia HTML per testare l'inserimento
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Test Inserimento Farmaco</h1>
      <p>Clicca il pulsante per inviare il JSON di test al database.</p>
      
      <button 
        onClick={inserisciFarmacoDefault} 
        disabled={caricamento}
        style={{
          padding: '10px 20px',
          backgroundColor: caricamento ? '#88ff00' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: caricamento ? 'not-allowed' : 'pointer'
        }}
      >
        {caricamento ? 'Salvataggio in corso...' : 'Invia Farmaco di Test'}
      </button>

      {messaggio && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          border: '1px solid #ddd', 
          borderRadius: '5px',
          backgroundColor: messaggio.includes('✅') ? '#00e2b5' : '#e60000'
        }}>
          {messaggio}
        </div>
      )}
    </div>
  );
}