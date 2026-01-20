'use client';

import { useState, useEffect } from 'react';

export default function AggiornaQuantitaPage() {

  // 🔒 PARAMETRI AUTOMATICI (simulazione armadietto/sessione)
  const AIC_AUTOMATICO = '000367045';
  const USER_UID_AUTOMATICO = 'a4605883-97e3-4542-94ed-96d4cd2fa123';
  const ARMADIETTO_FARMACO_ID_AUTOMATICO = '0d52243f-5d4d-4a72-b3ca-6c9fc8ad10e1';

  // Stati identificativi
  const [id_farmaco_armadietto] = useState(ARMADIETTO_FARMACO_ID_AUTOMATICO);
  const [userUid] = useState(USER_UID_AUTOMATICO);

  // Stati operativi
  const [quantitaAttuale, setQuantitaAttuale] = useState(null);
  const [dataScadenzaAttuale, setDataScadenzaAttuale] = useState('');
  const [operazione, setOperazione] = useState('add'); // add | sub
  const [valore, setValore] = useState('');
  const [nuovaScadenza, setNuovaScadenza] = useState('');
  const [nota, setNota] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Calcolo della data minima selezionabile (Oggi) per il validatore HTML
  const oggiISO = new Date().toISOString().split('T')[0];

  // 🔄 Carica dati attuali (Quantità e Scadenza)
  useEffect(() => {
    async function caricaDati() {
      try {
        const res = await fetch(
          `/api/aggiorna-quantita?id_farmaco_armadietto=${id_farmaco_armadietto}`,
          { cache: 'no-store' }
        );
        const data = await res.json();

        if (res.ok) {
          setQuantitaAttuale(data.data.quantita_rimanente);
          // Formattiamo la data ISO (2025-12-31T00:00:00Z) in YYYY-MM-DD per l'input date
          if (data.data.data_scadenza) {
            const dateStr = data.data.data_scadenza.split('T')[0];
            setDataScadenzaAttuale(dateStr);
            setNuovaScadenza(dateStr);
          }
        } else {
          setResponse(data.message);
        }
      } catch (error) {
        setResponse('Errore nel caricamento dei dati');
      }
    }
    caricaDati();
  }, [id_farmaco_armadietto]);

  async function eseguiAggiornamento() {
    setLoading(true);
    setResponse(null);

    // 1. Calcolo nuova quantità
    const numero = Number(valore);
    let qtyFinale = quantitaAttuale;
    
    if (valore !== '') {
        const delta = operazione === 'add' ? numero : -numero;
        qtyFinale = quantitaAttuale + delta;
        if (qtyFinale < 0) {
          setResponse('ERRORE: la quantità finale non può essere negativa');
          setLoading(false);
          return;
        }
    }

    // 2. Validazione Data (se cambiata)
    if (nuovaScadenza && nuovaScadenza < oggiISO) {
        setResponse('ERRORE: La data di scadenza non può essere passata');
        setLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/aggiorna-quantita', {
        method: 'PUT',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_farmaco_armadietto: id_farmaco_armadietto,
          quantity: qtyFinale,
          expiryDate: nuovaScadenza,
          note: nota || null,
          userUid
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setResponse(`ERRORE ${res.status}: ${data.message}`);
      } else {
        setResponse(JSON.stringify(data, null, 2));
        setQuantitaAttuale(data.data.quantita_attuale);
        setDataScadenzaAttuale(data.data.data_scadenza_attuale.split('T')[0]);
        setValore('');
        setNota('');
      }
    } catch (error) {
      setResponse('Errore di comunicazione con il server');
    } finally {
      setLoading(false);
    }
  }

  const anteprimaQty =
    valore && quantitaAttuale !== null
      ? operazione === 'add'
        ? quantitaAttuale + Number(valore)
        : quantitaAttuale - Number(valore)
      : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">

        <h1 className="text-2xl font-bold mb-6 text-blue-600 text-center">
          Gestione Farmaco Armadietto
        </h1>

        {/* --- SEZIONE QUANTITÀ --- */}
        <div className="mb-6 p-4 border border-gray-100 rounded-lg bg-gray-50">
          <label className="block text-sm font-semibold text-gray-600 mb-2">MODIFICA QUANTITÀ</label>
          <div className="mb-2 text-md">
            Attuale: <span className="font-bold text-blue-600">{quantitaAttuale}</span>
          </div>
          
          <div className="flex gap-2 mb-3">
            <button onClick={() => setOperazione('add')} className={`flex-1 py-1 rounded text-sm font-bold ${operazione === 'add' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
              ➕ Aggiungi
            </button>
            <button onClick={() => setOperazione('sub')} className={`flex-1 py-1 rounded text-sm font-bold ${operazione === 'sub' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
              ➖ Sottrai
            </button>
          </div>

          <input
            type="number"
            placeholder="Inserisci valore..."
            value={valore}
            onChange={(e) => setValore(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 mb-2"
          />
          
          {anteprimaQty !== null && (
            <div className="text-xs text-gray-500 italic">
              Nuova quantità calcolata: <b>{anteprimaQty}</b>
            </div>
          )}
        </div>

        {/* --- SEZIONE SCADENZA --- */}
        <div className="mb-6 p-4 border border-gray-100 rounded-lg bg-gray-50">
          <label className="block text-sm font-semibold text-gray-600 mb-2">DATA DI SCADENZA</label>
          <input
            type="date"
            min={oggiISO}
            value={nuovaScadenza}
            onChange={(e) => setNuovaScadenza(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
          />
          {dataScadenzaAttuale && (
             <div className="mt-1 text-xs text-gray-500">
               Scadenza registrata: {dataScadenzaAttuale}
             </div>
          )}
        </div>

        {/* --- NOTA --- */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-2">NOTE MOVIMENTO</label>
          <textarea
            placeholder="Esempio: Carico scorta mensile..."
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
            rows="2"
          />
        </div>

        <button
          onClick={eseguiAggiornamento}
          disabled={loading || quantitaAttuale === null}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg w-full transition-colors shadow-lg disabled:bg-gray-400"
        >
          {loading ? 'Elaborazione...' : '💾 Salva Modifiche'}
        </button>

        {response && (
          <div className="mt-6">
            <p className="text-xs font-mono text-gray-500 mb-1">Risposta Server:</p>
            <pre className="bg-slate-900 text-green-400 p-4 rounded text-xs overflow-auto max-h-40">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}