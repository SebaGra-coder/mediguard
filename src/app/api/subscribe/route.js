import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // 1. Ottieni i dati dal body della richiesta
    // 'subscription' è l'oggetto standard generato dal browser
    const { subscription, userId } = await request.json();
    
    // Ottieni lo User Agent dagli header (opzionale ma utile per debug)
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // 2. Salva nel database usando la tua tabella
    const nuovaSottoscrizione = await prisma.sottoscrizione_web_push.create({
      data: {
        id_utente: userId, // L'ID dell'utente loggato
        endpoint_browser: subscription.endpoint,
        // Salviamo le chiavi (p256dh e auth) come JSON
        chiavi_cifratura_json: subscription.keys, 
        user_agent: userAgent,
        data_creazione: new Date(),
      },
    });

    return NextResponse.json({ success: true, id: nuovaSottoscrizione.id_sottoscrizione });

  } catch (error) {
    console.error("Errore salvataggio push:", error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}