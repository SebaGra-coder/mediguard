import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { time } from 'console';

/**
 * GESTIONE POST: Registra una nuova assunzione (o mancata assunzione)
 * Supporta due modalità operative:
 * 1. Pianificazione Massiva: Genera automaticamente le assunzioni future basandosi su data inizio/fine e orari.
 * 2. Inserimento Singolo: Registra un evento specifico (utile per terapie "al bisogno" o aggiustamenti manuali).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id_terapia,
      data_inizio,
      data_fine,
      orari,
      // Se vuoi supportare l'inserimento singolo manuale, mantieni questi:
      data_programmata,
      orario_effettivo,
      esito
    } = body;

    // Validazione campi obbligatori
    if (!id_terapia) {
      return NextResponse.json(
        { success: false, error: "Dati mancanti: id_terapia." },
        { status: 400 }
      );
    }

    // Array per raccogliere tutte le assunzioni create
    const assunzioniCreate = [];

    // --- CASO 1: Generazione massiva (Pianificazione Terapeutica) ---
    if (data_inizio && Array.isArray(orari) && orari.length > 0) {

      // Cloniamo la data per non modificare l'originale durante il ciclo se servisse
      let currDate = new Date(data_inizio);
      let endDate;

      if (data_fine) {
        endDate = new Date(data_fine);
      } else {
        // Se è una terapia a vita (data_fine null), generiamo i primi 30 giorni
        endDate = new Date(data_inizio);
        endDate.setDate(endDate.getDate() + 30);
      }

      // Ciclo sui giorni: itera dalla data di inizio alla data di fine
      while (currDate <= endDate) {
        // Formattiamo la data corrente in stringa YYYY-MM-DD per concatenarla correttamente
        const dataStr = currDate.toISOString().split('T')[0];

        // Ciclo sugli orari del giorno: per ogni orario previsto, crea un record
        for (const orario of orari) {
          // Creazione corretta della data combinata (Data + Ora)
          // Nota: Assicurati che l'orario sia nel formato "HH:mm"
          const dataProgrammataFinale = new Date(`${dataStr}T${orario}:00Z`);

          const nuovaAssunzione = await prisma.registro_assunzioni.create({
            data: {
              terapia: {
                connect: {
                  // IMPORTANTE: Qui devi usare il nome della CHIAVE PRIMARIA della tabella 'Piano_terapeutico'
                  // Se nel tuo DB la chiave primaria si chiama 'id_terapia', lascia così.
                  // Se si chiama solo 'id', scrivi: id: id_terapia
                  id_terapia: id_terapia
                }
              },
              data_programmata: dataProgrammataFinale,
              orario_effettivo: null, // Default null
              esito: null, // Default pending
            },
          });

          assunzioniCreate.push(nuovaAssunzione);
        }

        // Passa al giorno successivo
        currDate.setDate(currDate.getDate() + 1);
      }
    }
    // --- CASO 2: Inserimento singolo (Opzionale, se serve inserire manualmente un record) ---
    else if (data_programmata) {
      
      // 1. Recupera la terapia per ottenere l'ID del farmaco e la dose singola
      const terapia = await prisma.piano_terapeutico.findUnique({
        where: { id_terapia: id_terapia }
      });

      if (!terapia) {
        return NextResponse.json({ success: false, error: "Terapia non trovata" }, { status: 404 });
      }

      // 2. Verifica la disponibilità nell'armadietto SOLO se la terapia è collegata a un farmaco
      // (Ricorda che id_farmaco_armadietto è opzionale nello schema)
      if (esito === true && terapia.id_farmaco_armadietto) {
        const farmacoInfo = await prisma.farmaco_armadietto.findUnique({
          where: { id_farmaco_armadietto: terapia.id_farmaco_armadietto }
        });

        if (farmacoInfo && farmacoInfo.quantita_rimanente < terapia.dose_singola) {
          return NextResponse.json({ success: false, error: "Farmaco esaurito" }, { status: 400 });
        }
      }
      
      // 3. Crea l'assunzione nel registro
      const singolaAssunzione = await prisma.registro_assunzioni.create({
        data: {
          id_terapia: id_terapia, // Puoi passare l'id direttamente
          data_programmata: new Date(data_programmata),
          orario_effettivo: orario_effettivo ? new Date(orario_effettivo) : null,
          esito: esito !== undefined ? Boolean(esito) : null
        },
        include: {
          terapia: true
        }
      });
      assunzioniCreate.push(singolaAssunzione);

      // 4. Se l'assunzione è confermata e c'è un farmaco collegato, scala la quantità
      if (singolaAssunzione.esito === true && terapia.id_farmaco_armadietto) {
        await prisma.farmaco_armadietto.update({
          where: { id_farmaco_armadietto: terapia.id_farmaco_armadietto },
          data: {
            quantita_rimanente: {
              decrement: terapia.dose_singola
            }
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Create ${assunzioniCreate.length} assunzioni correttamente.`,
      data: assunzioniCreate // Restituisce l'array
    }, { status: 201 });

  } catch (error) {
    console.error("Errore registrazione assunzione:", error);
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: "Errore: Terapia non valida." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Errore interno durante il salvataggio: " + error.message, details: error.stack, code: error.code },
      { status: 500 }
    );
  }
}

/**
 * GESTIONE GET: Recupera lo storico delle assunzioni
 * Include una logica di "pulizia automatica": verifica le assunzioni scadute da oltre 3 ore,
 * le segna come non assunte (esito: false) e tenta di riprogrammarle in coda.
 */
export async function GET(request) {
  try {
    // Calcola il timestamp di 3 ore fa per identificare le assunzioni "dimenticate"
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    // 1. Trova le assunzioni scadute che sono ancora 'null'
    const assunzioniScadute = await prisma.registro_assunzioni.findMany({
      where: {
        esito: null,
        data_programmata: {
          lt: threeHoursAgo
        }
      },
      include: {
        terapia: true
      }
    });

    // 2. Aggiorna a false (Mancata) e riprogramma in coda al piano terapeutico
    for (const assunzione of assunzioniScadute) {
      // Imposta esito a false
      await prisma.registro_assunzioni.update({
        where: { id_evento: assunzione.id_evento },
        data: { esito: false }
      });

      // Chiama la funzione helper per aggiungere una nuova assunzione alla fine del piano
      await riprogrammaInCoda(assunzione.id_terapia, assunzione.terapia.orari);
    }

    const { searchParams } = new URL(request.url);

    const id_utente = searchParams.get('id_utente');
    const id_terapia = searchParams.get('id_terapia');
    const id_evento = searchParams.get('id_evento');
    const data_inizio = searchParams.get('data_inizio'); // Filtro data programmata dal...
    const data_fine = searchParams.get('data_fine');     // ...al
    const data_programmata = searchParams.get('data_programmata');

    const filtri = {};

    // Costruzione dinamica dei filtri di ricerca
    if (id_terapia) filtri.id_terapia = id_terapia;
    if (id_evento) filtri.id_evento = id_evento;
    if (id_utente) {
      filtri.terapia = {
        id_paziente: id_utente
      };
    } else {
      // Opzionale: se non c'è id_utente e l'API non è protetta, 
      // potresti voler restituire errore invece di tutte le assunzioni del DB
      return NextResponse.json({ success: false, error: "ID utente obbligatorio" }, { status: 400 });
    }

    if (data_programmata) {
      const dataTarget = new Date(data_programmata);

      // Creiamo un intervallo che copre l'intera giornata (dalle 00:00 alle 23:59)
      const inizioGiorno = new Date(dataTarget.setHours(0, 0, 0, 0));
      const fineGiorno = new Date(dataTarget.setHours(23, 59, 59, 999));

      filtri.data_programmata = {
        gte: inizioGiorno,
        lte: fineGiorno
      };
    }
    // 3. Filtro per intervallo di date generico
    else if (data_inizio || data_fine) {
      filtri.data_programmata = {};
      if (data_inizio) filtri.data_programmata.gte = new Date(data_inizio);
      if (data_fine) filtri.data_programmata.lte = new Date(data_fine);
    }

    const assunzioni = await prisma.registro_assunzioni.findMany({
      where: filtri,
      orderBy: {
        data_programmata: 'desc',
      },
      include: {
        terapia: {
          include: {
            farmaco: {
              include: {
                farmaco: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      count: assunzioni.length,
      data: assunzioni
    }, { status: 200 });

  } catch (error) {
    console.error("Errore recupero assunzioni:", error);
    return NextResponse.json({
      success: false,
      error: 'Errore interno durante il recupero dei dati: ' + error.message,
      details: error.stack,
      code: error.code
    }, { status: 500 });
  }
}

/**
 * GESTIONE PUT: Aggiorna un'assunzione esistente
 * Gestisce la logica critica delle scorte: quando un'assunzione viene confermata,
 * scala la quantità dal farmaco corretto, cercando alternative se la scatola principale è vuota.
*/
export async function PUT(request) {
  try {
    const body = await request.json();
    console.log(body);
    const { id_evento, esito, orario_effettivo } = body;
    
    if (!id_evento) {
      return NextResponse.json(
        { success: false, error: "ID evento mancante." },
        { status: 400 }
      );
    }
    
    // Recupera lo stato attuale per verificare se stiamo confermando un'assunzione non ancora presa
    const currentAssunzione = await prisma.registro_assunzioni.findUnique({
      where: { id_evento: id_evento },
      include: {
        terapia: {
          include: { farmaco: true } // Includiamo i dettagli del farmaco nell'armadietto
        }
      }
    });

    if (!currentAssunzione) {
      return NextResponse.json({ error: 'Assunzione non trovata' }, { status: 404 });
    }


    // LOGICA GESTIONE SCORTE: Se stiamo confermando l'assunzione (esito -> true)
    if (Boolean(esito) === true && currentAssunzione.esito !== true) {
      const farmaco = currentAssunzione.terapia.farmaco;
      const dose = currentAssunzione.terapia.dose_singola;
      let boxToDecrementId = farmaco.id_farmaco_armadietto;

      // 1. Controlliamo se la scatola collegata ha abbastanza dose
      if (farmaco.quantita_rimanente < dose) {
        // 2. Se non basta, cerchiamo ALTRE scatole dello stesso farmaco (stesso AIC, stesso utente)
        // che abbiano quantità sufficiente e non siano scadute (opzionale, ma meglio)
        const otherBoxes = await prisma.farmaco_armadietto.findMany({
          where: {
            id_utente_proprietario: farmaco.id_utente_proprietario,
            codice_aic: farmaco.codice_aic,
            quantita_rimanente: { gte: dose }, // Cerchiamo scatole con abbastanza farmaco
            // Escludiamo la scatola corrente che sappiamo essere vuota/insufficiente
            id_farmaco_armadietto: { not: farmaco.id_farmaco_armadietto } 
          },
          orderBy: {
            data_scadenza: 'asc' // Prendiamo quella che scade prima (FEFO logic)
          }
        });

        if (otherBoxes.length > 0) {
          // Trovata una scatola alternativa! Usiamo questa.
          boxToDecrementId = otherBoxes[0].id_farmaco_armadietto;
        } else {
          // Nessuna scatola alternativa trovata -> ERRORE BLOCCANTE
          return NextResponse.json({
            success: false,
            error: "Quantità insufficiente nell'armadietto (tutte le scatole). Il farmaco è terminato."
          }, { status: 400 });
        }
      }
      
      // Memorizziamo l'ID della scatola da scalare per usarlo dopo l'update del registro
      request.boxToDecrementId = boxToDecrementId; 
    }


    // Preparazione dati aggiornamento
    const dataToUpdate = {};
    if (esito !== undefined) dataToUpdate.esito = Boolean(esito);
    if (orario_effettivo) dataToUpdate.orario_effettivo = new Date(orario_effettivo);

    const assunzioneAggiornata = await prisma.registro_assunzioni.update({
      where: { id_evento: id_evento },
      data: dataToUpdate,
    });

    // ESECUZIONE DECREMENTO SCORTE: Se l'aggiornamento è andato a buon fine, scala la quantità
    if (currentAssunzione.esito !== true && Boolean(esito) === true) {
       // Usiamo l'ID identificato prima (o quello originale o quello alternativo)
       const targetBoxId = request.boxToDecrementId || currentAssunzione.terapia.id_farmaco_armadietto;
       
      await prisma.farmaco_armadietto.update({
        where: { id_farmaco_armadietto: targetBoxId },
        data: {
          quantita_rimanente: {
            decrement: currentAssunzione.terapia.dose_singola
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Assunzione aggiornata correttamente",
      data: assunzioneAggiornata
    }, { status: 200 });

  } catch (error) {
    console.error("Errore aggiornamento assunzione:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Assunzione non trovata' }, { status: 404 });
    }
    return NextResponse.json({
      success: false,
      error: 'Errore interno durante l\'aggiornamento: ' + error.message,
      details: error.stack,
      code: error.code
    }, { status: 500 });
  }
}

/**
 * Funzione helper per riprogrammare un'assunzione in coda al piano terapeutico
 * Cerca l'ultimo slot occupato e ne crea uno nuovo successivo basandosi sugli orari della terapia.
 */
async function riprogrammaInCoda(id_terapia, orari) {
  // 1. Troviamo l'ultima assunzione pianificata per questa terapia
  const lastAssunzione = await prisma.registro_assunzioni.findFirst({
    where: { id_terapia: id_terapia },
    orderBy: { data_programmata: 'desc' }
  });

  // Procediamo solo se abbiamo una schedulazione valida e degli orari definiti
  if (lastAssunzione && Array.isArray(orari) && orari.length > 0) {
    // Ordiniamo gli orari per sicurezza (es. ["08:00", "20:00"])
    const sortedOrari = [...orari].sort();

    const lastDate = new Date(lastAssunzione.data_programmata);
    const lastH = lastDate.getUTCHours();
    const lastM = lastDate.getUTCMinutes();
    const lastTimeMins = lastH * 60 + lastM;

    let nextTimeStr = null;
    let addDay = false;

    // Cerchiamo il prossimo orario disponibile nello stesso giorno dell'ultima assunzione
    for (const o of sortedOrari) {
      const [h, m] = o.split(':').map(Number);
      const timeMins = h * 60 + m;
      if (timeMins > lastTimeMins) {
        nextTimeStr = o;
        break;
      }
    }

    // Se non troviamo un orario successivo nello stesso giorno, prendiamo il primo del giorno dopo
    if (!nextTimeStr) {
      nextTimeStr = sortedOrari[0];
      addDay = true;
    }

    // Calcoliamo la data della nuova assunzione
    const nextDate = new Date(lastDate);
    if (addDay) {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    // Costruiamo la data ISO stringa (YYYY-MM-DD)
    const datePart = nextDate.toISOString().split('T')[0];
    // Costruiamo il timestamp completo UTC
    const newDataProgrammata = new Date(`${datePart}T${nextTimeStr}:00Z`);

    // Creiamo la nuova assunzione in coda
    await prisma.registro_assunzioni.create({
      data: {
        id_terapia: id_terapia,
        data_programmata: newDataProgrammata,
        esito: null, // Pending
        orario_effettivo: null
      }
    });
  }
}

/**
 * GESTIONE DELETE: Rimuove un'assunzione
 * - Se invocata con id_terapia: Archivia le assunzioni passate nello storico e pulisce quelle future.
 * - Se invocata con id_evento: Elimina la singola assunzione.
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_evento = searchParams.get('id_evento');
    const id_terapia = searchParams.get('id_terapia');

    // CASO 1: Archiviazione massiva per terapia (Sposta in tabella storico per alleggerire quella principale)
    if (id_terapia) {

      // Trova le assunzioni completate (esito e orario presenti)
      const assunzioniDaSpostare = await prisma.registro_assunzioni.findMany({
        where: {
          id_terapia: id_terapia,
          esito: { not: null },
          orario_effettivo: { not: null }
        }
      });

      if (assunzioniDaSpostare.length > 0) {
        await prisma.$transaction(async (tx) => {
          // 1. Copia in registro_assunzioni_passate
          await tx.registro_assunzioni_passate.createMany({
            data: assunzioniDaSpostare.map(a => ({
              id_terapia: a.id_terapia,
              data_programmata: a.data_programmata,
              orario_effettivo: a.orario_effettivo,
              esito: a.esito
            }))
          });

          // 2. Elimina da registro_assunzioni
          await tx.registro_assunzioni.deleteMany({
            where: {
              id_evento: { in: assunzioniDaSpostare.map(a => a.id_evento) }
            }
          });
        });
      } else {
        await prisma.registro_assunzioni.deleteMany({
          where: {
            id_terapia: id_terapia
          }
        }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Archiviate ${assunzioniDaSpostare.length} assunzioni.`,
        count: assunzioniDaSpostare.length
      }, { status: 200 });
    }

    // CASO 2: Eliminazione singola per ID evento (Legacy/Fallback)
    if (!id_evento) {
      return NextResponse.json({ error: 'ID evento o ID terapia mancante' }, { status: 400 });
    }

    await prisma.registro_assunzioni.delete({
      where: { id_evento: id_evento },
    });

    return NextResponse.json({
      success: true,
      message: 'Assunzione eliminata con successo'
    }, { status: 200 });

  } catch (error) {
    console.error("Errore eliminazione/archiviazione assunzione:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Assunzione non trovata' }, { status: 404 });
    }
    return NextResponse.json({
      success: false,
      error: 'Operazione fallita: ' + error.message,
      details: error.stack,
      code: error.code
    }, { status: 500 });
  }
}
