// app/api/farmaci/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Questa riga serve per evitare che Next.js salvi la risposta nella cache
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Chiediamo al database IL singolo farmaco
    // findUnique restituisce un oggetto singolo o null (se non lo trova)
    const farmaco = await prisma.farmaci.findUnique({
      where: {
        codice_aic: "041045028"
      }
    });

    // 2. Controllo di sicurezza: Il farmaco esiste?
    // Se 'farmaco' è null, fermiamo tutto per non far esplodere il codice
    if (!farmaco) {
        return NextResponse.json({
            success: false,
            message: "Nessun farmaco trovato con questo AIC"
        }, { status: 404 });
    }

    // 3. Restituiamo i dati
    return NextResponse.json({
      success: true,
      // count: farmaco.length, <--- RIMOSSO: Un oggetto singolo non ha lunghezza!
      data: farmaco.denominazione // Ora è sicuro, perché abbiamo controllato che 'farmaco' esiste
    });

  } catch (error) {
    console.error("Errore nel recupero farmaci:", error);
    return NextResponse.json(
      { success: false, error: "Errore interno del server" },
      { status: 500 }
    );
  }
}