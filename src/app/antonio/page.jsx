"use client"; // Necessario in Next.js per rendere il form interattivo

import { useState } from "react";
import { isValidAIC } from '@/lib/ValidatoreAIC';
import { isValidNaturalNumber } from '@/lib/ValidatoreInteri';
import { isNotEmpty } from '@/lib/ValidatoreStringhe';

export default function PaginaAntonio() {
  // Variabili di stato per gestire i dati del form e il risultato
  const [valore, setValore] = useState("");
  const [tipo, setTipo] = useState("aic");
  const [risultato, setRisultato] = useState(null);

  // Funzione che viene chiamata quando premi il bottone
  async function gestisciInvio(e) {
  e.preventDefault(); // Fondamentale: blocca il refresh della pagina

  // NOTA: In React usiamo la variabile dello stato 'valore', 
  // non 'e.valore' (che di solito è undefined)
  if (isValidAIC(valore)) {
    
    // 1. Chiamata all'API (va sul database a cercare)
   // const risposta = await fetch("/antonio/api/valida", { // Assicurati che il percorso sia corretto
     //method: "POST",
//headers: { "Content-Type": "application/json" },
     // body: JSON.stringify({ valore, tipo }),
  //  });

    //const dati = await risposta.json();
    //setRisultato(dati); // Mostra l'esito del database

     setRisultato({
      successo: true,
      esito: "VALIDO",
      messaggio: "È un codice AIC valido (9 cifre)."
    });
    
  } else {
    // 2. CASO ELSE: Il codice non è valido localmente
    // Resetiamo il risultato e mettiamo un messaggio di errore personalizzato
    setRisultato({
      successo: false,
      esito: "NON VALIDO",
      messaggio: "Per favore, inserisci un codice AIC valido (9 cifre)."
    });
    
    // Opzionale: puoi anche pulire il campo input se vuoi
     setValore(""); 
  }
}


   
  

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Verifica Codici</h1>
      
      <form onSubmit={gestisciInvio}>
        <p>Inserisci il valore:</p>
        <input 
          type="text" 
          value={valore} 
          onChange={(e) => setValore(e.target.value)} 
          placeholder="Scrivi qui..."
        />
        
        <p>Seleziona il controllo:</p>
        <label>
          <input 
            type="radio" 
            name="tipo" 
            value="aic" 
            checked={tipo === "aic"} 
            onChange={() => setTipo("aic")} 
          /> AIC (9 cifre)
        </label>
        <br />
        <label>
          <input 
            type="radio" 
            name="tipo" 
            value="intero" 
            checked={tipo === "intero"} 
            onChange={() => setTipo("intero")} 
          /> Intero (0+)
        </label>
        
        <br /><br />
        <button type="submit">Controlla ora</button>
      </form>

      {/* Mostriamo il risultato solo se esiste */}
      {risultato && (
        <div style={{ marginTop: "20px", borderTop: "1px solid #ccc" }}>
          <h2>Risultato: {risultato.esito}</h2>
          {risultato.messaggio && <p style={{ color: "red" }}>{risultato.messaggio}</p>}
          <p>Valore testato: {risultato.valore_testato}</p>
        </div>
      )}
    </div>
  );
}