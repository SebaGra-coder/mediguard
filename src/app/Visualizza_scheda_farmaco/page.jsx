'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DettaglioFarmacoPage() {
  const searchParams = useSearchParams()
  // Recuperiamo il valore passato nel link: ?farmaco=123456
  const aic = searchParams.get('farmaco')

  const [farmaco, setFarmaco] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errore, setErrore] = useState(null)

  useEffect(() => {
    // Se non c'è l'AIC nell'URL, ci fermiamo
    if (!aic) {
        setLoading(false)
        return
    }

    const fetchDettagli = async () => {
      try {
        setLoading(true)
        // Chiamiamo un'API specifica che cerca per AIC (vedi punto 2)
        const res = await fetch(`/api/farmaci/dettaglio?aic=${aic}`)
        console.log(res)
        
        if (!res.ok) throw new Error("Errore nel recupero dati")
        
        const data = await res.json()
        setFarmaco(data)
      } catch (err) {
        console.error(err)
        setErrore("Impossibile caricare i dettagli del farmaco.")
      } finally {
        setLoading(false)
      }
    }

    fetchDettagli()
  }, [aic])

  // --- GESTIONE STATI DI CARICAMENTO ---
  if (loading) return (
    <div className="flex justify-center items-center h-screen">
       <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  )

  if (errore || !farmaco) return (
    <div className="p-10 text-center">
        <h2 className="text-red-500 text-xl font-bold">Errore</h2>
        <p className="text-gray-600 mb-4">{errore || "Farmaco non trovato."}</p>
    </div>
  )

  // --- VISUALIZZAZIONE DATI ---
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Intestazione */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">{farmaco.denominazione}</h1>
        <p className="text-gray-500 mt-1">{farmaco.ragione_sociale}</p>
      </div>

      {/* Scheda Dettagli */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Codice AIC</h3>
                <p className="text-lg font-medium text-gray-900">{farmaco.codice_aic}</p>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Principio Attivo</h3>
                <p className="text-lg font-medium text-gray-900">{farmaco.principio_attivo}</p>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Confezione</h3>
                <p className="text-gray-700">{farmaco.descrizione_confezione || "N/D"}</p>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase">Classe</h3>
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold">
                    {farmaco.classe || "C"}
                </span>
            </div>

            {/* Aggiungi qui altri campi se li hai nel database (prezzo, giacenza, ecc.) */}
        </div>
      </div>

      <div className="mt-6">
          <Link href="/" className="text-gray-500 hover:text-gray-800 transition-colors">
              ← Torna alla ricerca
          </Link>
      </div>
    </div>
  )
}