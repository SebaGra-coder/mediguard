// app/api/farmaci/cerca/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  // 1. Prendi il termine di ricerca dalla URL (es: ?q=tachipirina)
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // 2. Se la ricerca è vuota o troppo corta, non disturbare il DB
  if (!query || query.length < 3) {
    return NextResponse.json({ farmaci: [] });
  }

  try {
    // 3. Esegui la query "globale"
        // 3. Esegui la query "globale"
    // Separa la stringa di ricerca in parole singole (token)
    const terms = query.trim().split(/\s+/);

    // Costruisci una condizione AND: ogni token deve matchare ALMENO un campo
    // Questo permette di cercare "Tachipirina 500" oppure "500 Tachipirina" indifferentemente
    const whereCondition = {
      AND: terms.map(term => ({
        OR: [
          { denominazione: { contains: term, mode: 'insensitive' } },
          { principio_attivo: { contains: term, mode: 'insensitive' } },
          { codice_aic: { contains: term, mode: 'insensitive' } },
          { ragione_sociale: { contains: term, mode: 'insensitive' } },
          { dosaggio: { contains: term, mode: 'insensitive' } },
          { descrizione: { contains: term, mode: 'insensitive' } },
          { unita_misura: { contains: term, mode: 'insensitive' } }
        ]
      }))
    };

    const farmaci = await prisma.farmaci.findMany({
      where: whereCondition,
      take: 20, // ⚠️ IMPORTANTE: Limita i risultati a 20 per non bloccare l'app
      orderBy: {
        denominazione: 'asc', // Ordina alfabeticamente
      },
    });

    return NextResponse.json({ farmaci });

  } catch (error) {
    console.error("Errore ricerca:", error);
    return NextResponse.json({ error: "Errore interno server" }, { status: 500 });
  }
}