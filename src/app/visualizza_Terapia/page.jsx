'use client';

import { useState } from 'react';

export default function RicercaPianiTerapeutici() {
  // Stati per i parametri di ricerca (input dell'utente)
  const [nomeUtilita, setNomeUtilita] = useState('');
  const [soloAlBisogno, setSoloAlBisogno] = useState('tutti');
  const [terapiaAttiva, setTerapiaAttiva] = useState('tutti');
  const [forLife, setForLife] = useState('tutti');

  // Stati per la gestione dei dati e della UI
  const [risultati, setRisultati] = useState([]);
  const [caricamento, setCaricamento] = useState(false);
  const [messaggio, setMessaggio] = useState('');

  // Funzione per eseguire la ricerca dinamica
  const eseguiRicerca = async (e) => {
    e.preventDefault();
    setCaricamento(true);
    setMessaggio('Ricerca in corso...');

    // Parametri fissi richiesti dal tuo scenario
    const id_paziente = "d37bdfea-88c0-406b-9544-8028f1054337";
    const id_farmaco_armadietto = "d37bdfea-88c0-406b-9544-8028f1054337";

    try {
      // Costruzione dinamica della Query String [cite: 12, 13]
      const params = new URLSearchParams();
      
      // Aggiunta parametri fissi
      params.append('id_paziente', id_paziente);
      params.append('id_farmaco_armadietto', id_farmaco_armadietto);

      // Aggiunta parametri dinamici (se compilati o diversi da 'tutti')
      if (nomeUtilita) params.append('nome_utilita', nomeUtilita);
      if (soloAlBisogno !== 'tutti') params.append('solo_al_bisogno', soloAlBisogno);
      if (terapiaAttiva !== 'tutti') params.append('terapia_attiva', terapiaAttiva);
      if (forLife !== 'tutti') params.append('for_life', forLife);

      // Chiamata GET all'API [cite: 1]
      const response = await fetch(`/api/terapia?${params.toString()}`);
      const risultato = await response.json();

      if (risultato.success) {
        setRisultati(risultato.data); // [cite: 12]
        setMessaggio(`Trovati ${risultato.count} record.`);
      } else {
        setMessaggio(`❌ Errore: ${risultato.error}`);
      }
    } catch (error) {
      setMessaggio(`❌ Errore di connessione: ${error.message}`);
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: 'auto' }}>
      <h1>Gestione Piani Terapeutici</h1>
      
      {/* FORM DI RICERCA */}
      <section style={{ backgroundColor: '#000000', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Filtri di Ricerca</h3>
        <form onSubmit={eseguiRicerca} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          
          <div>
            <label>Nome Utilità:</label>
            <input 
              type="text" 
              value={nomeUtilita} 
              onChange={(e) => setNomeUtilita(e.target.value)}
              placeholder="Es: Mal di testa..."
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div>
            <label>Solo al bisogno:</label>
            <select value={soloAlBisogno} onChange={(e) => setSoloAlBisogno(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
              <option value="tutti">Tutti</option>
              <option value="true">Sì</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <label>Terapia Attiva:</label>
            <select value={terapiaAttiva} onChange={(e) => setTerapiaAttiva(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
              <option value="tutti">Tutti</option>
              <option value="true">Attiva</option>
              <option value="false">Non attiva</option>
            </select>
          </div>

          <div>
            <label>For Life (Cronica):</label>
            <select value={forLife} onChange={(e) => setForLife(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
              <option value="tutti">Tutti</option>
              <option value="true">Sì</option>
              <option value="false">No</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={caricamento}
            style={{ gridColumn: 'span 2', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            {caricamento ? 'Ricerca in corso...' : 'Cerca Piani'}
          </button>
        </form>
      </section>

      {/* FEEDBACK E TABELLA RISULTATI */}
      <p><strong>Stato:</strong> {messaggio}</p>

      {risultati.length > 0 && (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#000000' }}>
              <th>Utilità</th>
              <th>Dose</th>
              <th>Al bisogno</th>
              <th>Attiva</th>
              <th>For Life</th>
              <th>Farmaco (AIC)</th>
            </tr>
          </thead>
          <tbody>
            {risultati.map((piano) => (
              <tr key={piano.id_terapia}>
                <td>{piano.nome_utilita}</td>
                <td>{piano.dose_singola}</td>
                <td>{piano.solo_al_bisogno ? '✅' : '❌'}</td>
                <td>{piano.terapia_attiva ? '✅' : '❌'}</td>
                <td>{piano.for_life ? '✅' : '❌'}</td>
                <td>{piano.farmaco?.farmaco?.denominazione} ({piano.id_farmaco_armadietto})</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}