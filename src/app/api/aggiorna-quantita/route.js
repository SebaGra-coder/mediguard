// route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * PUT → Aggiorna quantità, data di scadenza e registra note
 */
export async function PUT(request) {
  try {
    const body = await request.json();

    // Estraiamo i campi dal body della richiesta
    const {
      id_farmaco_armadietto, 
      quantity,
      expiryDate, // Nuova data di scadenza inviata dal frontend
      note,
      userUid
    } = body;

    // Controllo integrità dati minimi 
    if (!id_farmaco_armadietto) {
      return NextResponse.json(
        { success: false, message: "ID farmaco armadietto mancante" },
        { status: 400 }
      );
    }

    // 1. Recupero il record attuale per confronto e validazione 
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
        { success: false, message: "Farmaco non presente nell’armadietto" },
        { status: 404 }
      );
    }

    // 2. Costruzione dell'oggetto di aggiornamento
    const dataToUpdate = {};
    
    // Validazione e aggiunta Quantità 
    if (quantity !== undefined) {
      dataToUpdate.quantita_rimanente = parseFloat(quantity);
    }

    // Validazione e aggiunta Data di Scadenza 
    if (expiryDate) {
      const parsedDate = new Date(expiryDate);
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0); // Reset orario per confronto solo sulla data

      // Controllo se la data è valida
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { success: false, message: "Formato data non valido" },
          { status: 400 }
        );
      }

      // Sicurezza: controllo che la data non sia passata
      if (parsedDate < oggi) {
        return NextResponse.json(
          { success: false, message: "La data di scadenza non può essere precedente a oggi" },
          { status: 400 }
        );
      }

      dataToUpdate.data_scadenza = parsedDate;
    }

    // 3. Esecuzione dell'aggiornamento su Database 
    const aggiornato = await prisma.farmaco_armadietto.update({
      where: { id_farmaco_armadietto: id_farmaco_armadietto },
      data: dataToUpdate
    });

    // Log dell'operazione per tracciabilità (utilizzando le note se fornite)
    console.log("Modifica registrata:", {
      id_farmaco_armadietto,
      variazioni: dataToUpdate,
      nota_utente: note,
      eseguito_da: userUid
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
    return NextResponse.json({ success: false, error: "Errore interno del server" }, { status: 500 });
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