import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

const prisma = new PrismaClient();

// Configurazione Web Push
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export async function GET(request) {
    // 1. Sicurezza: controlla che la chiamata sia autorizzata
    /*
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    */

    try {
        // 2. Ottieni orario attuale formato HH:mm
        const now = new Date();
        // Opzionale: Se vuoi forzare il fuso orario italiano usa Intl.DateTimeFormat
        // Per ora manteniamo la tua logica base
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;

        console.log(`Cronjob running: checking for meds at ${currentTime}`);

        // 3. Trova le terapie attive
        const terapieAttive = await prisma.piano_terapeutico.findMany({
            where: { terapia_attiva: true },
            include: {
                paziente: {
                    include: {
                        notifiche: true // Include le sottoscrizioni push dell'utente
                    }
                }
            }
        });

        const notificheDaInviare = [];

        // 4. Filtra le terapie che corrispondono all'orario attuale
        for (const terapia of terapieAttive) {
            
            // Verifica se l'orario attuale è presente negli orari della terapia
            // Gestisce sia array ["08:00"] che stringa singola "08:00" se salvata male
            const orariDB = terapia.orari;
            const orariArray = Array.isArray(orariDB) ? orariDB : [orariDB];

            if (orariArray.includes(currentTime)) {
                
                console.log(`   -> Trovata terapia da notificare: ${terapia.nome_utilita}`);

                // --- NUOVA LOGICA: Cerca il record specifico nel registro assunzioni ---
                const oggiInizio = new Date();
                oggiInizio.setHours(0, 0, 0, 0);
                const oggiFine = new Date();
                oggiFine.setHours(23, 59, 59, 999);

                // Cerchiamo se esiste già una riga generata per oggi (non ancora presa)
                const assunzioneRecord = await prisma.registro_assunzioni.findFirst({
                    where: {
                        id_terapia: terapia.id_terapia,
                        data_programmata: {
                            gte: oggiInizio,
                            lte: oggiFine
                        },
                        esito: null // Cerchiamo solo quelle "pending"
                    }
                });

                const idEvento = assunzioneRecord?.id_evento;

                const payload = JSON.stringify({
                    title: `È ora di prendere: ${terapia.nome_utilita}`,
                    body: `Dose: ${terapia.dose_singola}. Clicca per confermare.`,
                    data: {
                        // CORREZIONE QUI: Aggiungi /Pages prima di /Terapie
                        url: `/Pages/Terapie`, 
                        id_evento: idEvento 
                    },
                    // Se abbiamo l'ID evento, mostriamo il bottone "Conferma"
                    actions: idEvento ? [
                        { action: 'confirm', title: '✅ Conferma Assunzione' }
                    ] : []
                });

                // Aggiungi invio per ogni device registrato dell'utente
                if (terapia.paziente.notifiche.length > 0) {
                    terapia.paziente.notifiche.forEach(sub => {
                        notificheDaInviare.push(
                            sendNotificationSafely(sub, payload, prisma)
                        );
                    });
                }
            }
        }

        await Promise.all(notificheDaInviare);

        return NextResponse.json({ success: true, sent: notificheDaInviare.length });

    } catch (error) {
        console.error("Errore cronjob:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Funzione Helper per gestire invio ed errori
async function sendNotificationSafely(sub, payload, prismaClient) {
    try {
        const pushConfig = {
            endpoint: sub.endpoint_browser,
            keys: sub.chiavi_cifratura_json
        };
        await webpush.sendNotification(pushConfig, payload);
    } catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`Sottoscrizione scaduta ${sub.id_sottoscrizione}, pulizia DB...`);
            await prismaClient.sottoscrizione_web_push.delete({
                where: { id_sottoscrizione: sub.id_sottoscrizione }
            });
        } else {
            console.error("Errore invio singola notifica:", error);
        }
    }
}