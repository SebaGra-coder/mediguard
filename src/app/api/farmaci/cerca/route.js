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
    const farmaci = await prisma.farmaci.findMany({
      where: {
        OR: [
          // Cerca nel nome del farmaco
          { 
            // Combina denominazione, dosaggio e unità di misura per ricerche più specifiche
            AND: [
              { denominazione: { contains: query.split(' ')[0], mode: 'insensitive' } },
              { OR: [{ dosaggio: { contains: query.split(' ')[1], mode: 'insensitive' } }, { unita_misura: { contains: query.split(' ')[1], mode: 'insensitive' } }] }
            ]
          },
          // Cerca nel principio attivo
          { 
            principio_attivo: { 
              contains: query, 
              mode: 'insensitive' 
            } 
          },
          // Cerca nel codice AIC (se è salvato come Stringa)
          { 
            codice_aic: { 
              contains: query 
            } 
          },
          // Cerca per azienda produttrice
          {
            ragione_sociale: {
                contains: query,
                mode: 'insensitive'
            }
          }
        ],
      }, // ⚠️ IMPORTANTE: Limita i risultati a 20 per non bloccare l'app
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