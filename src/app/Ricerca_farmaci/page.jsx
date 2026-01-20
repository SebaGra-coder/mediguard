'use client' // Obbligatorio perché usiamo useState e useEffect

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function GlobalSearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [risultati, setRisultati] = useState([])
  const [loading, setLoading] = useState(false)
  const [aperto, setAperto] = useState(false)

  useEffect(() => {
    // 1. Se la query è troppo corta, pulisci e fermati
    if (query.length < 3) {
      setRisultati([])
      setAperto(false)
      return
    }

    // 2. Imposta un timer: aspetta 500ms prima di cercare
    const timer = setTimeout(async () => {
      setLoading(true)
      setAperto(true)

      try {
        const res = await fetch(`/api/farmaci/cerca?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setRisultati(data.farmaci || [])
      } catch (error) {
        console.error("Errore ricerca:", error)
        setRisultati([])
      } finally {
        setLoading(false)
      }
    }, 500)

    // 3. Cleanup: se l'utente digita ancora prima dei 500ms, cancella il timer precedente
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* --- INPUT DI RICERCA --- */}
      <div className="relative">
        <input
          type="text"
          className="w-full p-4 pl-12 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="Cerca farmaco, principio attivo o AIC..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {/* Icona Lente */}
        <div className="absolute left-4 top-4 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Spinner Caricamento */}
        {loading && (
          <div className="absolute right-4 top-4">
             <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* --- MENU A TENDINA RISULTATI --- */}
      {aperto && query.length >= 3 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-80 overflow-y-auto">
          {risultati.length > 0 ? (
            <ul>
              {risultati.map((farmaco) => (
                <li key={farmaco.codice_aic} className="p-3 border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors flex flex-col items-start text-left">
                  <Link href={`/Visualizza_scheda_farmaco?farmaco=${farmaco.codice_aic}`}>
                    <span className="font-bold text-gray-800">{farmaco.denominazione}</span>
                    <div className="text-sm text-gray-500 flex gap-2">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">AIC: {farmaco.codice_aic}</span>
                      <span className="truncate max-w-[200px]">{farmaco.principio_attivo}</span>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">{farmaco.ragione_sociale}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            !loading && (
              <div className="p-4 text-center text-gray-500">
                Nessun farmaco trovato
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
