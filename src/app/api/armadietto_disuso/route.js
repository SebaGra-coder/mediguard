// src/app/api/armadietto_disuso/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Importa l'istanza configurata

export async function GET(request) {
  try {
    // Estrae i parametri dalla URL
    const { searchParams } = new URL(request.url);
    const idUtente = searchParams.get('id_utente');

    // Validazione ID utente
    if (!idUtente) {
      return NextResponse.json({ error: 'ID utente mancante' }, { status: 400 });
    }

    // Ricerca nel database basata sul modello Farmaco_armadietto_disuso
    const dati = await prisma.farmaco_armadietto_disuso.findMany({
      where: { 
        id_utente_proprietario: idUtente 
      }
    });

    // Risposta di successo
    return NextResponse.json({ data: dati }, { status: 200 });
    
  } catch (error) {
    console.error("Errore API:", error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}