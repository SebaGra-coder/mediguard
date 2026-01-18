// Importa l'oggetto per gestire le risposte HTTP in Next.js (App Router) 
import { NextResponse } from 'next/server';

// Importa l'istanza di Prisma configurata per interagire con il database [cite: 1]
import { prisma } from '@/lib/prisma'; 

/**
 * Funzione per gestire le richieste HTTP POST alla rotta /api/antonio
 * @param {Request} request - L'oggetto della richiesta in arrivo dal client
 */
export async function POST(request) {
  try {
    // Legge il corpo della richiesta (il JSON inviato dal client) 
    const body = await request.json();
    
    // Estrae i dati inviati dal client (id_utente_proprietario, codice_aic, ecc.) 
    const { 
      id_utente_proprietario, 
      codice_aic, 
      data_scadenza, 
      lotto_produzione, 
      quantita_rimanente 
    } = body;

    // VALIDAZIONE: Verifica che i campi fondamentali siano presenti 
    if (!id_utente_proprietario) {
      return NextResponse.json(
        { success: false, error: "Mancanza dell'ID dell'utente proprietario." }, 
        { status: 400 }
      );
    }

        // VALIDAZIONE: Verifica che i campi fondamentali siano presenti 
    if (!codice_aic) {
      return NextResponse.json(
        { success: false, error: "Mancanza del codice AIC del farmaco." }, 
        { status: 400 }
      );
    }



    // VALIDAZIONE: Verifica che i campi fondamentali siano presenti 
    if (!data_scadenza) {
      return NextResponse.json(
        { success: false, error: "Mancanza della data di scadenza del farmaco." }, 
        { status: 400 }
      );
    }

    // VALIDAZIONE: Verifica che i campi fondamentali siano presenti 
    if (!quantita_rimanente) {
      return NextResponse.json(
        { success: false, error: "Mancanza della quantità rimanente del farmaco." }, 
        { status: 400 }
      );
    }

    // OPERAZIONE SUL DATABASE: Utilizza Prisma per creare il record 
    const nuovoFarmaco = await prisma.farmaco_armadietto.create({
      data: {
        // L'ID primario (UUID) viene generato automaticamente dal database 
        
        // Associa il farmaco all'utente (deve essere un UUID valido esistente) [cite: 2, 10]
        id_utente_proprietario: id_utente_proprietario, 
        
        // Associa il farmaco alla tabella 'farmaci' tramite l'AIC [cite: 7, 10]
        codice_aic: codice_aic, 
        
        // Converte la stringa ISO ricevuta in un oggetto Date per il database 
        data_scadenza: new Date(data_scadenza), 
        
        // Inserisce la stringa del lotto di produzione 
        lotto_produzione: lotto_produzione,
        
        // Assicura che la quantità sia trattata come numero decimale (Float) 
        quantita_rimanente: parseFloat(quantita_rimanente), 
      },
    });

    // RISPOSTA DI SUCCESSO: Restituisce l'esito positivo e il record creato 
    return NextResponse.json({
      success: true,
      message: "Farmaco caricato correttamente nel tuoarmadietto",
      data: nuovoFarmaco
    }, { status: 201 });

  } catch (error) {
    // Log dell'errore sul server per monitoraggio
    console.error("Errore durante il caricamento del farmaco:", error);
    
    // GESTIONE ERRORI SPECIFICI: Chiave esterna non trovata (P2003) 
    // Accade se l'utente o il codice AIC non esistono nel DB
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: "Errore: Utente o Codice AIC non presenti nel sistema." }, 
        { status: 400 }
      );
    }

    // Risposta generica per altri tipi di errore (connessione, ecc.) 
    return NextResponse.json(
      { success: false, error: "Errore interno durante il salvataggio dei dati." }, 
      { status: 500 }
    );
  }
}
/**
 * 
 * Funzione per gestire le richieste GET  
 * @param {Request} request - L'UUID utente
 * @returns {Promise<NextResponse>} - JSON con tutti i campi di Farmaco_armadietto e Farmaci
 * 
 */
// Esporta la funzione GET per gestire le richieste in lettura
export async function GET(request) {
  // Crea un oggetto URL dalla richiesta per estrarre i parametri
  const { searchParams } = new URL(request.url);
  // Recupera il valore del parametro 'id_utente' dalla query string
  const idUtente = searchParams.get('id_utente');

  // Controllo di sicurezza: se l'ID non è fornito, restituisce errore 400
  if (!idUtente) {
    return NextResponse.json({ error: 'ID utente mancante' }, { status: 400 });
  }

  try {
    // Utilizza il modello 'farmaco_armadietto' definito nello schema
    const armadietto = await prisma.farmaco_armadietto.findMany({
      where: {
        // Filtra i record per l'ID utente fornito
        id_utente_proprietario: idUtente,
      },
      include: {
        // Esegue una JOIN con la tabella 'farmaci' usando la relazione codice_aic
        // Questo permette di ottenere anche 'denominazione', 'ragione_sociale', ecc.
        farmaco: true, 
      },
    });

    // Restituisce i dati trovati con successo (status 200)
    return NextResponse.json({ data: armadietto }, { status: 200 });
  } catch (error) {
    // In caso di errore del database, logga l'errore e risponde con 500
    console.error("Errore ricerca armadietto:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}