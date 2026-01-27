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
      data_inizio,
      data_fine,
      orari
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
    if (dose_singola === undefined || isNaN(parseFloat(dose_singola))) {
      return NextResponse.json(
        { success: false, error: "Dose singola non valida." },
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

        data_inizio: data_inizio ? new Date(data_inizio) : null,
        data_fine: data_fine ? new Date(data_fine) : null,

        orari: orari || []
      },
    });

    // GENERAZIONE INIZIALE ASSUNZIONI (Se ci sono orari e non è al bisogno)
    if (Array.isArray(orari) && !nuovoPiano.solo_al_bisogno && nuovoPiano.terapia_attiva) {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      let generationStart = nuovoPiano.data_inizio ? new Date(nuovoPiano.data_inizio) : startOfToday;
      if (generationStart < startOfToday) generationStart = startOfToday;

      let generationEnd = nuovoPiano.data_fine
        ? new Date(nuovoPiano.data_fine)
        : new Date(generationStart.getTime() + 30 * 24 * 60 * 60 * 1000);

      const intakesToCreate = [];
      let iterDate = new Date(generationStart);

      while (iterDate <= generationEnd) {
        const dateStr = iterDate.toISOString().split('T')[0];
        for (const ora of orari) {
          const scheduledTime = new Date(`${dateStr}T${ora}:00`);

          // Crea solo se l'orario è valido per oggi o per il futuro
          if (scheduledTime >= startOfToday) {
            intakesToCreate.push({
              id_terapia: nuovoPiano.id_terapia,
              data_programmata: scheduledTime,
              esito: null,
              orario_effettivo: null
            });
          }
        }
        iterDate.setDate(iterDate.getDate() + 1);
      }

      if (intakesToCreate.length > 0) {
        await prisma.registro_assunzioni.createMany({
          data: intakesToCreate
        });
      }
    }

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
    const data_inizio = searchParams.get('data_inizio');
    const data_fine = searchParams.get('data_fine');

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

    // Filtro per data di inizio [cite: 13]
    if (data_inizio) {
      filtri.data_inizio = {
        gte: new Date(data_inizio),
      };
    }

    // Filtro per data di fine [cite: 13]
    if (data_fine) {
      filtri.data_fine = {
        lte: new Date(data_fine),
      };
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
 * GESTIONE PUT: Aggiorna un piano terapeutico esistente
 * @param {Request} request
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id_terapia,
      id_farmaco_armadietto,
      nome_utilita,
      dose_singola,
      solo_al_bisogno,
      terapia_attiva,
      data_inizio,
      data_fine,
      orari // New field expected for schedule regeneration
    } = body;

    if (!id_terapia) {
      return NextResponse.json({ success: false, error: "ID terapia mancante" }, { status: 400 });
    }

    // Costruisci l'oggetto dei dati da aggiornare
    const dataToUpdate = {};

    // Aggiorna solo i campi presenti nel body
    if (id_farmaco_armadietto !== undefined) dataToUpdate.id_farmaco_armadietto = id_farmaco_armadietto;
    if (nome_utilita !== undefined) dataToUpdate.nome_utilita = nome_utilita;
    if (dose_singola !== undefined) {
      const dose = parseFloat(dose_singola);
      if (isNaN(dose)) {
        return NextResponse.json({ success: false, error: "Dose singola non valida" }, { status: 400 });
      }
      dataToUpdate.dose_singola = dose;
    }
    if (solo_al_bisogno !== undefined) dataToUpdate.solo_al_bisogno = Boolean(solo_al_bisogno);
    if (terapia_attiva !== undefined) dataToUpdate.terapia_attiva = Boolean(terapia_attiva);

    // Gestione date: accetta stringhe ISO o null
    if (data_inizio !== undefined) dataToUpdate.data_inizio = data_inizio ? new Date(data_inizio) : null;
    if (data_fine !== undefined) dataToUpdate.data_fine = data_fine ? new Date(data_fine) : null;

    // Aggiorna gli orari se forniti
    if (orari !== undefined) dataToUpdate.orari = orari;

    // 1. Update the Therapy Plan
    const updatedTerapia = await prisma.piano_terapeutico.update({
      where: { id_terapia: id_terapia },
      data: dataToUpdate,
    });

    // 2. Logica di Rigenerazione/Aggiornamento del Calendario
    if (Array.isArray(orari) && !updatedTerapia.solo_al_bisogno && updatedTerapia.terapia_attiva) {
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      // 1. Recupero assunzioni PENDING esistenti
      const existingPending = await prisma.registro_assunzioni.findMany({
        where: {
          id_terapia: id_terapia,
          data_programmata: { gte: startOfToday }
        },
        orderBy: { data_programmata: 'asc' }
      });

      // 2. Calcolo dei nuovi orari desiderati
      let generationStart = updatedTerapia.data_inizio && new Date(updatedTerapia.data_inizio) > startOfToday
        ? new Date(updatedTerapia.data_inizio)
        : startOfToday;

      let generationEnd = updatedTerapia.data_fine
        ? new Date(updatedTerapia.data_fine)
        : new Date(generationStart.getTime() + 30 * 24 * 60 * 60 * 1000);

      const desiredIntakes = [];
      let iterDate = new Date(generationStart);

      while (iterDate <= generationEnd) {
        // CORREZIONE: Costruiamo la stringa data usando i componenti locali 
        // per evitare lo slittamento di un giorno dovuto a toISOString()
        const year = iterDate.getFullYear();
        const month = String(iterDate.getMonth() + 1).padStart(2, '0');
        const day = String(iterDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        for (const ora of orari) {
          // Usiamo l'ora locale. Se vuoi mantenere lo standard UTC nel DB:
          const scheduledTime = new Date(`${dateStr}T${ora}:00`);
          desiredIntakes.push(scheduledTime);
        }
        iterDate.setDate(iterDate.getDate() + 1);
      }

      // 3. Sincronizzazione tramite Transazione
      await prisma.$transaction(async (tx) => {
        const maxIndex = Math.max(existingPending.length, desiredIntakes.length);

        for (let i = 0; i < maxIndex; i++) {
          if (i < existingPending.length && i < desiredIntakes.length) {
            // AGGIORNA senza eliminare
            await tx.registro_assunzioni.update({
              where: { id_evento: existingPending[i].id_evento },
              data: { data_programmata: desiredIntakes[i] }
            });
          } else if (i < desiredIntakes.length) {
            // CREA se mancano record
            await tx.registro_assunzioni.create({
              data: {
                id_terapia: id_terapia,
                data_programmata: desiredIntakes[i],
                esito: null
              }
            });
          } else if (i < existingPending.length) {
            // ELIMINA solo se in eccesso
            await tx.registro_assunzioni.delete({
              where: { id_evento: existingPending[i].id_evento }
            });
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Terapia aggiornata con successo (e piano ricalcolato)",
      data: updatedTerapia
    }, { status: 200 });

  } catch (error) {
    console.error("Errore aggiornamento terapia:", error);
    return NextResponse.json({ success: false, error: "Errore durante l'aggiornamento" }, { status: 500 });
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