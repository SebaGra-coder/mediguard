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

        // Controlla se è una richiesta forzata (es. dal pulsante di test)
        const { searchParams } = new URL(request.url);
        const forceCheck = searchParams.get('force') === 'true';

        console.log(`Check-now globale: controllo farmaci per le ore ${oraItaliana} (Force: ${forceCheck})`);

        // Sets per evitare notifiche doppie (Terapia vs Armadietto)
        const medicinesWithStockWarning = new Set();
        const medicinesWithExpiryWarning = new Set();
        const notificheInviate = [];

        // ---------------------------------------------------------
        // 1. CONTROLLO TERAPIE (Logica Predittiva e Contestuale)
        // ---------------------------------------------------------
        const terapieAttive = await prisma.piano_terapeutico.findMany({
            where: { 
                terapia_attiva: true 
            },
            include: {
                paziente: {
                    include: {
                        notifiche: true // Include le sottoscrizioni push dell'utente
                    }
                },
                farmaco: {
                    include: {
                        farmaco: true
                    }
                }
            }
        });

        for (const terapia of terapieAttive) {
            const orariArray = Array.isArray(terapia.orari) ? terapia.orari : [];
            const messagesToSend = [];

            // --- A. PROMEMORIA ASSUNZIONE (Legato all'orario) ---
            // Se forceCheck è true, inviamo il promemoria per testare (se ci sono orari definiti)
            if (orariArray.includes(oraItaliana) || (forceCheck && orariArray.length > 0)) {
                
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

                messagesToSend.push({
                    title: `Promemoria: ${terapia.farmaco?.farmaco?.denominazione || 'Farmaco'}`,
                    body: `È il momento di assumere la tua dose di ${terapia.dose_singola}.`,
                    data: {
                        url: '/Pages/Terapie',
                        id_evento: assunzioneRecord?.id_evento
                    },
                    actions: assunzioneRecord ? [
                        { action: 'confirm', title: '✅ Conferma Assunzione' }
                    ] : []
                });
            }

            // --- B. AVVISI DI STATO (Slegati dall'orario) ---
            // Eseguiti una volta al giorno (es. 09:00) o se forzati manualmente
            if (oraItaliana === '09:00' || forceCheck) {

                // 1. Controllo Scadenza (Intermittente: 5, 3, 2 giorni)
                if (terapia.farmaco && terapia.farmaco.data_scadenza) {
                    const scadenza = new Date(terapia.farmaco.data_scadenza);
                    const oggi = new Date();
                    const diffTime = scadenza - oggi;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays < 0) {
                        messagesToSend.push({
                            title: `⛔ FARMACO SCADUTO: ${terapia.farmaco?.farmaco.denominazione}`,
                            body: `Attenzione! Il farmaco per la tua terapia è scaduto. Non assumerlo.`,
                            data: { url: '/Pages/Terapie' }
                        });
                        medicinesWithExpiryWarning.add(terapia.id_farmaco_armadietto);
                    } else if ([5, 3, 2].includes(diffDays)) {
                        // Notifica intermittente come richiesto
                        messagesToSend.push({
                            title: `⚠️ Scadenza Imminente: ${terapia.farmaco?.farmaco.denominazione}`,
                            body: `Il farmaco per la tua terapia scade tra ${diffDays} giorni.`,
                            data: { url: '/Pages/Terapie' }
                        });
                        medicinesWithExpiryWarning.add(terapia.id_farmaco_armadietto);
                    }
                }

                // 2. Controllo Scorte (Notifica Separata e Predittiva)
                if (terapia.farmaco && terapia.farmaco.quantita_rimanente !== null) {
                    const stock = terapia.farmaco.quantita_rimanente;
                    const dose = Number(terapia.dose_singola) || 0;
                    const numAssunzioni = Array.isArray(terapia.orari) ? terapia.orari.length : 0;
                    const consumoGiornaliero = dose * numAssunzioni;
                    
                    let scortaBassa = false;

                    if (terapia.data_fine) {
                        const oggi = new Date();
                        const fine = new Date(terapia.data_fine);
                        fine.setHours(23, 59, 59, 999); // Include tutta la giornata di fine
                        
                        if (fine >= oggi) {
                            const diffMs = fine.getTime() - oggi.getTime();
                            const giorniRimanenti = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                            const fabbisognoTotale = consumoGiornaliero * giorniRimanenti;
                            if (stock < fabbisognoTotale) scortaBassa = true;
                        }
                    } else {
                        // Terapia continuativa: avvisa se scorta < 3 giorni (o <= 3 unità fallback)
                        const soglia = consumoGiornaliero > 0 ? (consumoGiornaliero * 3) : 3;
                        if (stock <= soglia) scortaBassa = true;
                    }

                    if (scortaBassa) {
                        messagesToSend.push(stock === 0 ? {
                            title: `⚠️ Scorta finita: ${terapia.farmaco?.farmaco?.denominazione}`,
                            body: `Rimangono 0 unità. Impossibile proseguire la terapia.`,
                            data: { url: '/Pages/Terapie' }
                        } : {
                            title: `⚠️ Scorta insufficiente: ${terapia.farmaco?.farmaco?.denominazione}`,
                            body: `Scorta non sufficiente per coprire il piano terapeutico (${stock} rimasti).`,
                            data: { url: '/Pages/Terapie' }
                        });
                        medicinesWithStockWarning.add(terapia.id_farmaco_armadietto);
                    }
                }
            }

            // --- C. INVIO NOTIFICHE ---
            if (messagesToSend.length > 0 && terapia.paziente.notifiche && terapia.paziente.notifiche.length > 0) {
                for (const msg of messagesToSend) {
                    const payload = JSON.stringify(msg);
                    console.log(`🔔 [TEST] Notifica TERAPIA per ${terapia.farmaco?.farmaco?.denominazione}:`, payload);
                    terapia.paziente.notifiche.forEach(sub => {
                        notificheInviate.push(
                            sendNotificationSafely(sub, payload)
                        );
                    });
                }
            }
        }

        // ---------------------------------------------------------
        // 2. CONTROLLO ARMADIETTO (Logica Assoluta e Generale)
        // ---------------------------------------------------------
        if (oraItaliana === '09:00' || forceCheck) {
            // Trova farmaci con scorta bassa (<=5) o in scadenza (<=15gg)
            const farmaciArmadietto = await prisma.farmaco_armadietto.findMany({
                where: {
                    OR: [
                        { quantita_rimanente: { lte: 5 } },
                        { data_scadenza: { lte: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) } }
                    ]
                },
                include: {
                    utente: {
                        include: { notifiche: true }
                    },
                    farmaco: true
                }
            });

            for (const farmaco of farmaciArmadietto) {
                // Skip se l'utente non ha notifiche attive
                if (!farmaco.utente || !farmaco.utente.notifiche || farmaco.utente.notifiche.length === 0) continue;

                const messagesToSend = [];

                // A. Controllo Scadenza (Generale)
                if (farmaco.data_scadenza) {
                    // Se già notificato dalla terapia, salta per evitare doppi avvisi
                    if (!medicinesWithExpiryWarning.has(farmaco.id_farmaco_armadietto)) {
                        const scadenza = new Date(farmaco.data_scadenza);
                        const oggi = new Date();
                        const diffTime = scadenza - oggi;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays < 0) {
                             messagesToSend.push({
                                title: `⛔ Armadietto: ${farmaco.farmaco.denominazione} SCADUTO`,
                                body: `Un farmaco nel tuo armadietto è scaduto.`,
                                data: { url: '/Pages/Armadietto' }
                            });
                        } else if ([15, 7, 1].includes(diffDays)) {
                             messagesToSend.push({
                                title: `⚠️ Armadietto: ${farmaco.farmaco.denominazione}`,
                                body: `Scade tra ${diffDays} giorni.`,
                                data: { url: '/Pages/Armadietto' }
                            });
                        }
                    }
                }

                // B. Controllo Scorte (Generale - Soglia fissa 5)
                if (farmaco.quantita_rimanente !== null && farmaco.quantita_rimanente <= 5) {
                    // Se già notificato dalla terapia, salta
                    if (!medicinesWithStockWarning.has(farmaco.id_farmaco_armadietto)) {
                        messagesToSend.push({
                            title: `⚠️ Armadietto: Scorta bassa per ${farmaco.farmaco.denominazione}`,
                            body: `Rimangono solo ${farmaco.quantita_rimanente} unità.`,
                            data: { url: '/Pages/Armadietto' }
                        });
                    }
                }

                // Invio notifiche Armadietto
                if (messagesToSend.length > 0) {
                    for (const msg of messagesToSend) {
                        const payload = JSON.stringify(msg);
                        console.log(`🔔 [TEST] Notifica ARMADIETTO per ${farmaco.farmaco.denominazione}:`, payload);
                        farmaco.utente.notifiche.forEach(sub => {
                            notificheInviate.push(sendNotificationSafely(sub, payload));
                        });
                    }
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