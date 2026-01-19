// route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * PUT → Aggiorna la quantità
 */
export async function PUT(request) {
  try {
    const body = await request.json();

    // Estraiamo i campi usando i nomi coerenti con il frontend e lo schema
    const {
      id_farmaco_armadietto, 
      quantity,
      note,
      userUid
    } = body;

    if (!id_farmaco_armadietto || quantity === undefined) {
      return NextResponse.json(
        { success: false, message: "Dati mancanti (id_farmaco_armadietto o quantity)" },
        { status: 400 }
      );
    }

    // 1. Cerchiamo il record usando il nome campo corretto dello schema 
    const record = await prisma.farmaco_armadietto.findUnique({
      where: { id_farmaco_armadietto: id_farmaco_armadietto },
      select: {
        id_farmaco_armadietto: true,
        quantita_rimanente: true
      }
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Farmaco non presente nell’armadietto" },
        { status: 404 }
      );
    }

    // 2. Aggiornamento
    const aggiornato = await prisma.farmaco_armadietto.update({
      where: { id_farmaco_armadietto: id_farmaco_armadietto },
      data: { quantita_rimanente: quantity }
    });

    console.log("Movimento registrato:", {
      id_farmaco_armadietto,
      precedente: record.quantita_rimanente,
      nuova: quantity,
      nota: note
    });

    return NextResponse.json({
      success: true,
      message: "Quantità aggiornata correttamente",
      data: {
        id_farmaco_armadietto: aggiornato.id_farmaco_armadietto,
        quantita_precedente: record.quantita_rimanente,
        quantita_attuale: aggiornato.quantita_rimanente
      }
    });

  } catch (error) {
    console.error("Errore PUT:", error);
    return NextResponse.json({ success: false, error: "Errore server" }, { status: 500 });
  }
}

/**
 * GET → Recupera quantità attuale
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Leggiamo il parametro che ora il frontend invierà correttamente
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
        farmaco: {
          select: {
            denominazione: true, // [cite: 3]
            codice_aic: true    // [cite: 2]
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
      data: {
        quantita_rimanente: record.quantita_rimanente,
        farmaco: record.farmaco
      }
    });

  } catch (error) {
    console.error("Errore GET:", error);
    return NextResponse.json({ success: false, error: "Errore server" }, { status: 500 });
  }
}