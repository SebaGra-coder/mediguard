import { NextResponse } from 'next/server';
// Importa qui la tua connessione al DB (es. mysql2, prisma, pg, etc.)
// import { db } from '@/lib/db'; 

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const aic = searchParams.get('aic');

  if (!aic) {
    return NextResponse.json({ error: 'AIC mancante' }, { status: 400 });
  }

  try {
    // ESEMPIO DI QUERY SQL (adattala al tuo database/libreria)
    // const [rows] = await db.query('SELECT * FROM farmaci WHERE codice_aic = ?', [aic]);
    
    // MOCK (DATI FINTI) PER TESTARE SE NON HAI ANCORA IL DB COLLEGATO:
    // Sostituisci questo blocco con la tua vera query al DB
    const rows = [
        {
            codice_aic: aic,
            denominazione: "TACHIPIRINA*500MG 20CPR",
            principio_attivo: "PARACETAMOLO",
            ragione_sociale: "ANGELINI PHARMA SPA",
            descrizione_confezione: "Scatola da 20 compresse",
            classe: "C"
        }
    ];

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Farmaco non trovato' }, { status: 404 });
    }

    // Restituiamo il primo risultato (oggetto singolo, non array)
    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}