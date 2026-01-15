'use client'; // Questo dice a Next.js che è un componente Interattivo (Frontend)

import { useState } from 'react';

export default function TestConnectionPage() {
  // Stato per salvare la risposta del server
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Funzione che chiama l'API
  async function chiamaServer() {
    setLoading(true);
    setResponse(null);

    try {
      // 1. Chiamata all'API che abbiamo creato prima
      const res = await fetch('../api/farmaci', {
        method: 'GET',
        cache: 'no-store' // Assicura che non legga dalla cache
      });

      // 2. Conversione della risposta in JSON
      const data = await res.json();

      // 3. Aggiornamento della grafica
      setResponse(JSON.stringify(data, null, 2)); // Formatta il JSON per renderlo leggibile
    } catch (error) {
      setResponse("Errore: Impossibile contattare il server.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <html>
        <body>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">Test Connessione</h1>
        
        <p className="mb-6 text-gray-600">
          Clicca il pulsante per inviare un segnale al Server e attendere risposta.
        </p>

        <button 
          onClick={chiamaServer}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-400"
        >
          {loading ? "Chiamata in corso..." : "📡 Chiama Server API"}
        </button>

        {/* Area Risultati */}
        {response && (
          <div className="mt-6 text-left">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Risposta dal Server:</p>
            <pre className="bg-slate-900 text-green-400 p-4 rounded text-sm overflow-auto border border-gray-700">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
    </body>
    </html>
  );
}