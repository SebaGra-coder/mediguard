// app/api/farmaci/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Importiamo la connessione unica che abbiamo creato prima

// Questa funzione risponde alle chiamate di tipo GET
export async function GET(request: Request) {
  try {
    // 1. Chiediamo al database i farmaci
    // findMany() = "Select * from Farmaci"
    const listaFarmaci = await prisma.farmaci.findUnique({
      where: {
        codice_aic: "041045028"
      }
    });

    // 2. Restituiamo i dati in formato JSON
    return NextResponse.json({
      success: true,
      count: listaFarmaci.length,
      data: listaFarmaci.denominazione
    });

  } catch (error) {
    console.error("Errore nel recupero farmaci:", error);
    return NextResponse.json(
      { success: false, error: "Errore interno del server" },
      { status: 500 }
    );
  }
}