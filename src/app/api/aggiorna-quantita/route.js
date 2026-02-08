// route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * PUT → Aggiorna quantità, data di scadenza e registra note
 * IMPLEMENTAZIONE ROBUSTA PER DEBUGGING APPROFONDITO
 */
export async function PUT(request) {
  try {
    let body;
    
    // 1. Controllo Parsing JSON
    try {
      body = await request.json();
    } catch (e) {
      console.error("Errore Parsing JSON:", e);
      return NextResponse.json(
        { success: false, error: "JSON non valido o malformato", details: e.message },
        { status: 400 }
      );
    }

    const {
      id_farmaco_armadietto, 
      quantita_rimanente,
      data_scadenza,
    } = body;

    // 2. Controllo ID mancante
    if (!id_farmaco_armadietto) {
      return NextResponse.json(
        { success: false, error: "ID farmaco armadietto mancante nel body" },
        { status: 400 }
      );
    }

    // 3. Controllo Payload Vuoto (Nessun dato da aggiornare)
    if (quantita_rimanente === undefined && data_scadenza === undefined) {
      return NextResponse.json(
        { success: false, error: "Nessun campo da aggiornare fornito (quantita_rimanente o data_scadenza mancanti)" },
        { status: 400 }
      );
    }

    // 4. Recupero record e check esistenza (404)
    const record = await prisma.farmaco_armadietto.findUnique({
      where: { id_farmaco_armadietto: id_farmaco_armadietto },
      select: {
        id_farmaco_armadietto: true,
        quantita_rimanente: true,
        data_scadenza: true
      }
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: `Farmaco con ID ${id_farmaco_armadietto} non trovato nell'armadietto` },
        { status: 404 }
      );
    }

    const dataToUpdate = {};
    
    // 5. Validazione Approfondita Quantità
    if (quantita_rimanente !== undefined) {
      const qty = parseFloat(quantita_rimanente);
      
      if (isNaN(qty)) {
        return NextResponse.json(
          { success: false, error: "Il valore di 'quantita_rimanente' non è un numero valido" },
          { status: 400 }
        );
      }
      
      if (qty < 0) {
        return NextResponse.json(
          { success: false, error: "La quantità non può essere negativa" },
          { status: 400 }
        );
      }

      dataToUpdate.quantita_rimanente = qty;
    }

    // 6. Validazione Approfondita Data
    if (data_scadenza) {
      const parsedDate = new Date(data_scadenza);
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);

      // Check validità formato data
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { success: false, error: `Formato data non valido: ${data_scadenza}` },
          { status: 400 }
        );
      }

      // Check logico: date passate
      const isSameDate = record.data_scadenza && record.data_scadenza.getTime() === parsedDate.getTime();
      
      if (!isSameDate && parsedDate < oggi) {
        return NextResponse.json(
          { 
            success: false, 
            error: "La data di scadenza non può essere precedente a oggi", 
            debug_info: { fornita: parsedDate.toISOString(), oggi: oggi.toISOString() }
          },
          { status: 400 }
        );
      }

      dataToUpdate.data_scadenza = parsedDate;
    }

    // 7. Esecuzione Aggiornamento
    const aggiornato = await prisma.farmaco_armadietto.update({
      where: { id_farmaco_armadietto: id_farmaco_armadietto },
      data: dataToUpdate
    });

    console.log("Modifica registrata:", {
      id: id_farmaco_armadietto,
      modifiche: dataToUpdate
    });

    return NextResponse.json({
      success: true,
      message: "Aggiornamento completato con successo",
      data: {
        id_farmaco_armadietto: aggiornato.id_farmaco_armadietto,
        quantita_attuale: aggiornato.quantita_rimanente,
        data_scadenza_attuale: aggiornato.data_scadenza
      }
    });

  } catch (error) {
    console.error("Errore critico durante PUT:", error);

    // 8. Gestione Errori Prisma Specifici per Debug
    let errorMessage = "Errore interno del server";
    let errorDetails = error.message;

    if (error.code) {
        switch (error.code) {
            case 'P2025':
                errorMessage = "Record da aggiornare non trovato (concorrenza o ID errato)";
                break;
            case 'P2002':
                errorMessage = "Violazione vincolo di unicità";
                break;
            case 'P2003':
                errorMessage = "Violazione vincolo chiave esterna (ID non valido)";
                break;
            default:
                errorMessage = `Errore Database: ${error.code}`;
        }
    }

    return NextResponse.json({ 
      success: false, 
      error: errorMessage, 
      raw_error: errorDetails,
      code: error.code 
    }, { status: 500 });
  }
}

/**
 * GET → Recupera lo stato attuale del farmaco (Quantità + Scadenza)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_farmaco_armadietto = searchParams.get("id_farmaco_armadietto");

    if (!id_farmaco_armadietto) {
      return NextResponse.json(
        { success: false, message: "ID farmaco armadietto mancante" },
        { status: 400 }
      );
    }

    const record = await prisma.farmaco_armadietto.findUnique({
      where: { id_farmaco_armadietto: id_farmaco_armadietto },
      select: {
        quantita_rimanente: true,
        data_scadenza: true,
        farmaco: {
          select: {
            denominazione: true, // [cite: 3]
            codice_aic: true     // [cite: 2]
          }
        }
      }
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Farmaco non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record
    });

  } catch (error) {
    console.error("Errore GET:", error);
    return NextResponse.json({ success: false, error: "Errore server" }, { status: 500 });
  }
}