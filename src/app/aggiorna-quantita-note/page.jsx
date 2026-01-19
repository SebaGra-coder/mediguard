'use client';

import { useState, useEffect } from 'react';

export default function AggiornaQuantitaPage() {

  // 🔒 PARAMETRI AUTOMATICI (simulazione armadietto/sessione)
  const AIC_AUTOMATICO = '000367045';
  const USER_UID_AUTOMATICO = '670b213a-3410-4d2e-8847-f13d317eecc7';
  const ARMADIETTO_FARMACO_ID_AUTOMATICO =
    '6d6fc9b8-8ccb-4928-b271-f119ce6cfbb2';

  // Stati identificativi (non modificabili dall’utente)
  const [aicCode] = useState(AIC_AUTOMATICO);
  const [userUid] = useState(USER_UID_AUTOMATICO);
  const [id_farmaco_armadietto] = useState(
    ARMADIETTO_FARMACO_ID_AUTOMATICO
  );

  // Stati operativi
  const [quantitaAttuale, setQuantitaAttuale] = useState(null);
  const [operazione, setOperazione] = useState('add'); // add | sub
  const [valore, setValore] = useState('');
  const [nota, setNota] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔄 Carica quantità attuale dall’armadietto
  useEffect(() => {
    async function caricaQuantita() {
      try {
        const res = await fetch(
          `/api/aggiorna-quantita?id_farmaco_armadietto=${id_farmaco_armadietto}`,
          { cache: 'no-store' }
        );

        const data = await res.json();

        if (res.ok) {
          setQuantitaAttuale(data.data.quantita_rimanente);
        } else {
          setResponse(data.message);
          setQuantitaAttuale(null);
        }
      } catch (error) {
        setResponse('Errore nel caricamento della quantità attuale');
        setQuantitaAttuale(null);
      }
    }

    caricaQuantita();
  }, [id_farmaco_armadietto]);

  async function aggiornaQuantita() {
    setLoading(true);
    setResponse(null);

    const numero = Number(valore);

    if (!numero || numero <= 0) {
      setResponse('Inserisci una quantità valida');
      setLoading(false);
      return;
    }

    const delta = operazione === 'add' ? numero : -numero;
    const nuovaQuantita = quantitaAttuale + delta;

    if (nuovaQuantita < 0) {
      setResponse('ERRORE: la quantità finale non può essere negativa');
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
          quantity: nuovaQuantita,
          note: nota || null,
          userUid
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setResponse(`ERRORE ${res.status}: ${data.message}`);
      } else {
        setResponse(JSON.stringify(data, null, 2));
        setQuantitaAttuale(nuovaQuantita);
        setValore('');
        setNota('');
      }

    } catch (error) {
      setResponse('Errore di comunicazione con il server');
    } finally {
      setLoading(false);
    }
  }

  const anteprima =
    valore && quantitaAttuale !== null
      ? operazione === 'add'
        ? quantitaAttuale + Number(valore)
        : quantitaAttuale - Number(valore)
      : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">

        <h1 className="text-2xl font-bold mb-4 text-blue-600">
          Aggiorna Quantità Farmaco
        </h1>

        {quantitaAttuale !== null && (
          <div className="mb-4 text-lg font-bold">
            Quantità attuale:{' '}
            <span className="text-blue-600">
              {quantitaAttuale}
            </span>
          </div>
        )}

        {/* Pulsanti operazione */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setOperazione('add')}
            className={`flex-1 py-2 rounded font-bold transition
              ${operazione === 'add'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700'}
            `}
          >
            ➕ Aggiungi
          </button>

          <button
            onClick={() => setOperazione('sub')}
            className={`flex-1 py-2 rounded font-bold transition
              ${operazione === 'sub'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700'}
            `}
          >
            ➖ Sottrai
          </button>
        </div>

        {/* Quantità */}
        <input
          type="number"
          min="0"
          placeholder="Quantità"
          value={valore}
          onChange={(e) => setValore(e.target.value)}
          className="w-full mb-2 px-3 py-2 border border-gray-300 rounded text-gray-900"
        />

        {/* Anteprima */}
        {anteprima !== null && (
          <div className="mb-3 text-sm">
            Quantità finale:{' '}
            <span className="font-bold text-blue-600">
              {anteprima}
            </span>
          </div>
        )}

        {/* Nota */}
        <textarea
          placeholder="Nota (opzionale)"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded text-gray-900"
          rows="3"
        />

        <button
          onClick={aggiornaQuantita}
          disabled={loading || quantitaAttuale === null}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
        >
          {loading ? 'Aggiornamento...' : '🔄 Conferma Aggiornamento'}
        </button>

        {response && (
          <pre className="mt-6 bg-slate-900 text-green-400 p-4 rounded text-sm overflow-auto">
            {response}
          </pre>
        )}
      </div>
    </div>
  );
}
