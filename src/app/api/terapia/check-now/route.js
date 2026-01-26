import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

const prisma = new PrismaClient();

// Configurazione Web Push (assicurati che le variabili .env siano caricate)
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:example@yourdomain.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export async function GET(request) {
    try {
        // 1. Forza l'orario italiano (Rome) per il confronto con il DB
        const oraItaliana = new Intl.DateTimeFormat('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Europe/Rome'
        }).format(new Date());

        console.log(`Check-now globale: controllo farmaci per le ore ${oraItaliana}`);

        // 2. Trova TUTTE le terapie attive nel sistema per ogni utente
        const terapieAttive = await prisma.piano_terapeutico.findMany({
            where: { 
                terapia_attiva: true 
            },
            include: {
                paziente: {
                    include: {
                        notifiche: true // Include le sottoscrizioni push dell'utente
                    }
                }
            }
        });

        const notificheInviate = [];

        // 3. Itera su tutte le terapie trovate
        for (const terapia of terapieAttive) {
            const orariArray = Array.isArray(terapia.orari) ? terapia.orari : [];

            // Verifica se l'ora attuale è presente nel piano terapeutico
            if (orariArray.includes(oraItaliana)) {
                
                // Cerca l'evento specifico di oggi nel registro assunzioni per l'ID
                const oggiInizio = new Date();
                oggiInizio.setHours(0, 0, 0, 0);
                const oggiFine = new Date();
                oggiFine.setHours(23, 59, 59, 999);

                const assunzioneRecord = await prisma.registro_assunzioni.findFirst({
                    where: {
                        id_terapia: terapia.id_terapia,
                        data_programmata: { gte: oggiInizio, lte: oggiFine },
                        esito: null // Solo quelle non ancora confermate
                    }
                });

                // 4. Prepara il payload della notifica
                const payload = JSON.stringify({
                    title: `Promemoria: ${terapia.nome_utilita}`,
                    body: `È il momento di assumere la tua dose di ${terapia.dose_singola}.`,
                    data: {
                        url: '/Pages/Terapie',
                        id_evento: assunzioneRecord?.id_evento
                    },
                    actions: assunzioneRecord ? [
                        { action: 'confirm', title: '✅ Conferma Assunzione' }
                    ] : []
                });

                // 5. Invia la notifica a tutti i dispositivi dell'utente
                if (terapia.paziente.notifiche && terapia.paziente.notifiche.length > 0) {
                    terapia.paziente.notifiche.forEach(sub => {
                        notificheInviate.push(
                            sendNotificationSafely(sub, payload)
                        );
                    });
                }
            }
        }

        // Attendi il completamento di tutti gli invii
        await Promise.all(notificheInviate);

        return NextResponse.json({ 
            success: true, 
            orario_controllato: oraItaliana,
            notifiche_processate: notificheInviate.length 
        });

    } catch (error) {
        console.error("Errore check-now globale:", error);
        return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
    }
}

// Funzione Helper per l'invio sicuro
async function sendNotificationSafely(sub, payload) {
    try {
        const pushConfig = {
            endpoint: sub.endpoint_browser,
            keys: sub.chiavi_cifratura_json
        };
        return await webpush.sendNotification(pushConfig, payload);
    } catch (error) {
        // Se la sottoscrizione è scaduta o non valida, la eliminiamo
        if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.sottoscrizione_web_push.delete({
                where: { id_sottoscrizione: sub.id_sottoscrizione }
            });
        }
        return null;
    }
}