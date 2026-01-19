'use client';

import { useState } from 'react';

export default function InserisciPianoTerapeutico() {
  // Stato per gestire i dati del form (campi variabili richiesti in input)
  const [formData, setFormData] = useState({
    nome_utilita: '',
    dose_singola: '',
    solo_al_bisogno: false,
    terapia_attiva: true,
    for_life: false
  });

  // Stati per il feedback dell'interfaccia
  const [messaggio, setMessaggio] = useState('');
  const [caricamento, setCaricamento] = useState(false);

  // Gestore per l'aggiornamento dei campi di testo e checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /**
   * Funzione per inviare il Piano Terapeutico al server
   */
  const inviaPianoTerapeutico = async (e) => {
    e.preventDefault(); // Impedisce il refresh della pagina
    setCaricamento(true);
    setMessaggio('Invio in corso...');

    try {
      // Definizione del payload con ID fissi e dati del form
      const payload = {
        // ID fissi come richiesto
        id_paziente: "d37bdfea-88c0-406b-9544-8028f1054337",
        id_farmaco_armadietto: "d37bdfea-88c0-406b-9544-8028f1054337",
        
        // Dati presi dagli input HTML
        nome_utilita: formData.nome_utilita,
        dose_singola: parseFloat(formData.dose_singola),
        solo_al_bisogno: formData.solo_al_bisogno,
        terapia_attiva: formData.terapia_attiva,
        for_life: formData.for_life
      };

      // Esecuzione della chiamata POST
      const response = await fetch('/api/terapia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const risultato = await response.json();

      if (!response.ok) {
        throw new Error(risultato.error || 'Errore nel salvataggio');
      }

      setMessaggio(`✅ Piano salvato! ID: ${risultato.data.id_terapia}`);
      console.log('Successo:', risultato);

    } catch (error) {
      setMessaggio(`❌ Errore: ${error.message}`);
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px' }}>
      <h1>Nuovo Piano Terapeutico</h1>
      <p>Gli ID Paziente e Farmaco sono preimpostati. Inserisci i dettagli della somministrazione.</p>

      <form onSubmit={inviaPianoTerapeutico} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Input per il nome utilità */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Nome Utilità:</label>
          <input 
            type="text" 
            name="nome_utilita"
            value={formData.nome_utilita}
            onChange={handleChange}
            required
            placeholder="es. Dopo colazione"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {/* Input per la dose singola */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Dose Singola (Quantità):</label>
          <input 
            type="number" 
            name="dose_singola"
            value={formData.dose_singola}
            onChange={handleChange}
            required
            step="0.1"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {/* Checkbox per flag booleani */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label>
            <input 
              type="checkbox" 
              name="solo_al_bisogno"
              checked={formData.solo_al_bisogno}
              onChange={handleChange}
            /> Solo al bisogno
          </label>
          
          <label>
            <input 
              type="checkbox" 
              name="terapia_attiva"
              checked={formData.terapia_attiva}
              onChange={handleChange}
            /> Terapia Attiva
          </label>

          <label>
            <input 
              type="checkbox" 
              name="for_life"
              checked={formData.for_life}
              onChange={handleChange}
            /> Terapia a vita (For Life)
          </label>
        </div>

        <button 
          type="submit"
          disabled={caricamento}
          style={{
            padding: '10px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: caricamento ? 'not-allowed' : 'pointer'
          }}
        >
          {caricamento ? 'Salvataggio...' : 'Crea Piano Terapeutico'}
        </button>
      </form>

      {/* Messaggio di Feedback */}
      {messaggio && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          borderRadius: '5px',
          backgroundColor: messaggio.includes('✅') ? '#d4edda' : '#f8d7da',
          color: messaggio.includes('✅') ? '#155724' : '#721c24',
          border: '1px solid'
        }}>
          {messaggio}
        </div>
      )}
    </div>
  );
}