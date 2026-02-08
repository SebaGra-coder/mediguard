import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

const prisma = new PrismaClient();

// Configura Web Push con le tue chiavi
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:test@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId'); // Passiamo l'ID via URL

  if (!userId) {
    return NextResponse.json({ error: 'Specifica un userId (?userId=...)' }, { status: 400 });
  }

  try {
    // 1. Cerca le sottoscrizioni dell'utente
    const subscriptions = await prisma.sottoscrizione_web_push.findMany({
      where: { id_utente: userId }
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: 'Nessuna sottoscrizione attiva trovata per questo utente.' });
    }

    // 2. Prepara il messaggio
    const payload = JSON.stringify({
      title: '🧪 Test Notifica',
      body: 'Se leggi questo messaggio, il sistema funziona perfettamente!',
      url: '/'
    });

    // 3. Invia a tutti i dispositivi registrati dell'utente
    const results = await Promise.all(subscriptions.map(async (sub) => {
      try {
        const pushConfig = {
          endpoint: sub.endpoint_browser,
          keys: sub.chiavi_cifratura_json // Prisma converte il JSON automaticamente
        };
        
        await webpush.sendNotification(pushConfig, payload);
        return { device: sub.user_agent, status: 'Inviata' };
      } catch (err) {
        console.error("Errore invio:", err);
        return { device: sub.user_agent, status: 'Fallita', error: err.message };
      }
    }));

    return NextResponse.json({ success: true, risultati: results });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}