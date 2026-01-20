// Importa l'oggetto per gestire le risposte HTTP in Next.js (App Router)
import { NextResponse } from 'next/server';

// Importa l'istanza di Prisma configurata per interagire con il database [cite: 1]
import { prisma } from '@/lib/prisma';

/**
 * GESTIONE POST: Crea un nuovo piano terapeutico
 * @param {Request} request - Contiene il corpo della terapia (id_paziente, id_farmaco_armadietto, ecc.)
 */
export async function POST(request) {
  try {
    // Legge il corpo della richiesta in formato JSON
    const body = await request.json();
    
    // Estrae i dati necessari dal corpo della richiesta [cite: 12, 13]
    const { 
      id_paziente, 
      id_farmaco_armadietto, 
      nome_utilita, 
      dose_singola, 
      solo_al_bisogno, 
      terapia_attiva, 
      for_life 
    } = body;

    // VALIDAZIONE: Verifica che l'ID del paziente sia presente [cite: 12]
    if (!id_paziente) {
      return NextResponse.json(
        { success: false, error: "Mancanza dell'ID del paziente." }, 
        { status: 400 }
      );
    }

    // VALIDAZIONE: Verifica che il farmaco dell'armadietto sia specificato [cite: 12]
    if (!id_farmaco_armadietto) {
      return NextResponse.json(
        { success: false, error: "Mancanza dell'ID del farmaco nell'armadietto." }, 
        { status: 400 }
      );
    }

    // VALIDAZIONE: Verifica che sia presente una dose [cite: 12]
    if (dose_singola === undefined) {
      return NextResponse.json(
        { success: false, error: "Mancanza della dose singola." }, 
        { status: 400 }
      );
    }

    // OPERAZIONE SUL DATABASE: Creazione del record Piano_terapeutico [cite: 12]
    const nuovoPiano = await prisma.piano_terapeutico.create({
      data: {
        // L'ID della terapia (UUID) viene generato automaticamente [cite: 12]
        
        // Collega il piano al paziente (Utente) [cite: 12]
        id_paziente: id_paziente, 
        
        // Collega il piano al farmaco specifico nell'armadietto [cite: 12]
        id_farmaco_armadietto: id_farmaco_armadietto, 
        
        // Etichetta personalizzata per la terapia (es. "Per il mal di testa") [cite: 12]
        nome_utilita: nome_utilita,
        
        // Quantità di farmaco da assumere [cite: 12]
        dose_singola: parseFloat(dose_singola),
        
        // Flag booleano: indica se va preso solo al bisogno [cite: 12]
        solo_al_bisogno: Boolean(solo_al_bisogno),
        
        // Flag booleano: indica se la terapia è attualmente in corso [cite: 13]
        terapia_attiva: Boolean(terapia_attiva),
        
        // Flag booleano: indica se è una terapia a tempo indeterminato [cite: 13]
        for_life: Boolean(for_life),
      },
    });

    // Ritorna il record creato con successo (Status 201 Created)
    return NextResponse.json({
      success: true,
      message: "Piano terapeutico creato correttamente",
      data: nuovoPiano
    }, { status: 201 });

  } catch (error) {
    // Logga l'errore per il debug sul server
    console.error("Errore creazione piano terapeutico:", error);
    
    // Gestione errore vincoli di integrità (es. paziente o farmaco non esistenti)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: "Errore: Paziente o Farmaco Armadietto non validi." }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Errore interno durante il salvataggio del piano." }, 
      { status: 500 }
    );
  }
}

/**
 * GESTIONE GET: Recupera tutti i piani terapeutici di un paziente
 * @param {Request} request - URL con parametro ?id_paziente=...
 *
export async function GET(request) {
  // Estrae i parametri dalla query string dell'URL
  const { searchParams } = new URL(request.url);
  const idPaziente = searchParams.get('id_paziente');

  // Verifica che sia stato fornito l'ID del paziente
  if (!idPaziente) {
    return NextResponse.json({ error: 'ID paziente mancante' }, { status: 400 });
  }

  try {
    // Cerca i piani terapeutici associati a quel paziente
    const piani = await prisma.piano_terapeutico.findMany({
      where: {
        id_paziente: idPaziente,
      },
      include: {
        // Include i dettagli del farmaco presente nell'armadietto [cite: 12]
        farmaco: {
          include: {
            // Include anche le info generali del farmaco (nome, principio attivo, ecc.) [cite: 7]
            farmaco: true 
          }
        },
        // Include anche le assunzioni programmate registrate 
        assunzioni: true 
      },
    });

    // Risponde con la lista dei piani (Status 200 OK)
    return NextResponse.json({ success: true, data: piani }, { status: 200 });
  } catch (error) {
    console.error("Errore recupero piani terapeutici:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
*/
// Esporta la funzione GET per gestire le richieste di lettura in modo dinamico
export async function GET(request) {
  try {
    // Estrae i parametri di ricerca dall'URL della richiesta
    const { searchParams } = new URL(request.url);

    // Recupera i singoli parametri dalla query string
    const id_terapia = searchParams.get('id_terapia');
    const id_paziente = searchParams.get('id_paziente');
    const id_farmaco_armadietto = searchParams.get('id_farmaco_armadietto');
    const nome_utilita = searchParams.get('nome_utilita');
    const solo_al_bisogno = searchParams.get('solo_al_bisogno');
    const terapia_attiva = searchParams.get('terapia_attiva');
    const for_life = searchParams.get('for_life');

    // Inizializza l'oggetto dei filtri per Prisma
    const filtri = {};//RIVEDERE IL PERCHé UN OGGETTO é INIZZIALIZZATO CON UNA PARANTESI GRAFFA

    // Aggiunge il filtro per ID Terapia se fornito [cite: 12]
    if (id_terapia) {
      filtri.id_terapia = id_terapia;
    }

    // Aggiunge il filtro per ID Paziente se fornito [cite: 12]
    if (id_paziente) {
      filtri.id_paziente = id_paziente;
    }

    // Aggiunge il filtro per ID Farmaco nell'armadietto se fornito [cite: 12]
    if (id_farmaco_armadietto) {
      filtri.id_farmaco_armadietto = id_farmaco_armadietto;
    }

    // Aggiunge il filtro per Nome Utilità (ricerca parziale case-insensitive) [cite: 12]
    if (nome_utilita) {
      filtri.nome_utilita = {
        contains: nome_utilita,
        mode: 'insensitive',
      };
    }

    // Gestione dei parametri booleani: converte la stringa "true"/"false" in Boolean
    // Filtro per terapie al bisogno [cite: 12]
    if (solo_al_bisogno !== null) {
      filtri.solo_al_bisogno = solo_al_bisogno === 'true';
    }

    // Filtro per stato attività della terapia [cite: 13]
    if (terapia_attiva !== null) {
      filtri.terapia_attiva = terapia_attiva === 'true';
    }

    // Filtro per terapie croniche (for life) [cite: 13]
    if (for_life !== null) {
      filtri.for_life = for_life === 'true';
    }

    // Esegue la ricerca sul database con i filtri accumulati
    const pianiTerapeutici = await prisma.piano_terapeutico.findMany({
      where: filtri,
      include: {
        // Include i dati del farmaco nell'armadietto [cite: 10, 12]
        farmaco: {
          include: {
            // Include i dettagli tecnici del farmaco originale (nome, AIC, ditta) [cite: 3, 4, 10]
            farmaco: true
          }
        },
        // Include l'elenco delle assunzioni programmate [cite: 14]
        assunzioni: true
      }
    });

    // Restituisce i risultati trovati (array vuoto se nessun match)
    return NextResponse.json({ 
      success: true, 
      count: pianiTerapeutici.length,
      data: pianiTerapeutici 
    }, { status: 200 });

  } catch (error) {
    // Logga l'errore per il debug lato server
    console.error("Errore durante la ricerca dinamica dei piani:", error);
    
    // Restituisce un errore generico in caso di problemi tecnici
    return NextResponse.json({ 
      success: false, 
      error: 'Errore interno durante il recupero dei dati' 
    }, { status: 500 });
  }
}
/**
 * GESTIONE DELETE: Rimuove un piano terapeutico
 * @param {Request} request - URL con parametro ?id_terapia=...
 */
export async function DELETE(request) {
  try {
    // Estrae l'ID della terapia dall'URL
    const { searchParams } = new URL(request.url);
    const idTerapia = searchParams.get('id_terapia');

    // Validazione dell'ID terapia [cite: 12]
    if (!idTerapia) {
      return NextResponse.json({ error: 'ID terapia mancante' }, { status: 400 });
    }

    // Elimina il record dalla tabella piano_terapeutico [cite: 12]
    await prisma.piano_terapeutico.delete({
      where: {
        id_terapia: idTerapia,
      },
    });

    // Conferma l'avvenuta eliminazione
    return NextResponse.json({ message: 'Piano terapeutico eliminato con successo' }, { status: 200 });

  } catch (error) {
    console.error("Errore eliminazione piano:", error);
    // Errore 500 se ad esempio ci sono assunzioni collegate che impediscono la cancellazione
    return NextResponse.json({ error: 'Impossibile eliminare il piano terapeutico' }, { status: 500 });
  }
}