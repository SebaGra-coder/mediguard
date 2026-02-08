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
                        notifiche: true, // Include le sottoscrizioni push dell'utente
                        assistito: { // Relazioni dove l'utente è l'assistito
                            include: {
                                caregiver: { // L'utente che fa da caregiver
                                    include: {
                                        notifiche: true
                                    }
                                }
                            }
                        }
                    }
                },
                farmaco: {
                    include: {
                        farmaco: true
                    }
                }
            }
        });

        // Calcolo orario per ritardo (30 minuti fa)
        const now = new Date();
        const thirtyMinsAgo = new Date(now.getTime() - 30 * 60000);
        const oraMeno30 = new Intl.DateTimeFormat('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Europe/Rome'
        }).format(thirtyMinsAgo);

        for (const terapia of terapieAttive) {
            const orariArray = Array.isArray(terapia.orari) ? terapia.orari : [];
            const messagesToSend = [];
            const caregiverMessagesToSend = []; // Messaggi specifici per i caregiver

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

            // --- A.1 CONTROLLO RITARDO ASSUNZIONE (30 min dopo orario previsto) ---
            if (orariArray.includes(oraMeno30)) {
                const oggiInizio = new Date();
                oggiInizio.setHours(0, 0, 0, 0);
                const oggiFine = new Date();
                oggiFine.setHours(23, 59, 59, 999);

                // Cerchiamo un'assunzione per oggi, a quell'ora (oraMeno30), che sia ancora pending
                // Nota: data_programmata nel DB è DateTime completo. Dobbiamo controllare se matcha l'orario specifico o ci affidiamo all'ordine?
                // Per semplicità, cerchiamo se esiste un record pending per oggi.
                // Se c'è più di un'assunzione al giorno, potremmo dover raffinare la query sull'orario, 
                // ma assumiamo che check-now giri spesso. 
                // Migliore: Cerchiamo l'assunzione programmata circa 30 min fa.
                
                // Ricostruiamo la data programmata target (oggi + oraMeno30)
                const [h, m] = oraMeno30.split(':').map(Number);
                const targetTimeStart = new Date();
                targetTimeStart.setHours(h, m, 0, 0);
                const targetTimeEnd = new Date();
                targetTimeEnd.setHours(h, m, 59, 999);

                const assunzioneInRitardo = await prisma.registro_assunzioni.findFirst({
                    where: {
                        id_terapia: terapia.id_terapia,
                        // data_programmata deve essere compresa nel minuto target (o range accettabile)
                        // Ma data_programmata è salvata in UTC o Locale? Prisma gestisce UTC.
                        // La logica di creazione usa `new Date(stringa)` che potrebbe variare.
                        // Facciamo un check più ampio sull'intera giornata per 'pending' se l'orario schedulato matcha oraMeno30.
                        data_programmata: { gte: oggiInizio, lte: oggiFine },
                        esito: null
                    }
                });

                // Se troviamo un record pending E siamo a 30 minuti dall'orario previsto -> NOTIFICA CAREGIVER
                if (assunzioneInRitardo) {
                    // Verifichiamo che l'assunzione trovata sia effettivamente quella delle 'oraMeno30'
                    // Estraiamo l'ora dall'assunzione trovata (convertendo in orario locale per confronto stringa)
                    const dataProg = new Date(assunzioneInRitardo.data_programmata);
                    const oraProg = new Intl.DateTimeFormat('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Europe/Rome'
                    }).format(dataProg);

                    if (oraProg === oraMeno30) {
                         caregiverMessagesToSend.push({
                            title: `⚠️ Ritardo Assunzione: ${terapia.paziente.nome} ${terapia.paziente.cognome}`,
                            body: `L'assistito non ha confermato l'assunzione di ${terapia.farmaco?.farmaco?.denominazione} prevista per le ${oraMeno30}.`,
                            data: { url: `/Pages/Assistito/${terapia.paziente.id_utente}` }
                        });
                    }
                }
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
                        const msg = {
                            title: `⛔ FARMACO SCADUTO: ${terapia.farmaco?.farmaco.denominazione}`,
                            body: `Attenzione! Il farmaco per la tua terapia è scaduto. Non assumerlo.`,
                            data: { url: '/Pages/Terapie' }
                        };
                        messagesToSend.push(msg);
                        
                        // Avviso anche Caregiver
                        caregiverMessagesToSend.push({
                            title: `⛔ Scadenza Farmaco: ${terapia.paziente.nome}`,
                            body: `Il farmaco ${terapia.farmaco?.farmaco.denominazione} dell'assistito è scaduto.`,
                            data: { url: `/Pages/Assistito/${terapia.paziente.id_utente}` }
                        });

                        medicinesWithExpiryWarning.add(terapia.id_farmaco_armadietto);
                    } else if ([5, 3, 2].includes(diffDays)) {
                        // Notifica intermittente come richiesto
                        const msg = {
                            title: `⚠️ Scadenza Imminente: ${terapia.farmaco?.farmaco.denominazione}`,
                            body: `Il farmaco per la tua terapia scade tra ${diffDays} giorni.`,
                            data: { url: '/Pages/Terapie' }
                        };
                        messagesToSend.push(msg);

                        // Avviso anche Caregiver
                        caregiverMessagesToSend.push({
                            title: `⚠️ Scadenza Imminente: ${terapia.paziente.nome}`,
                            body: `Il farmaco ${terapia.farmaco?.farmaco.denominazione} scade tra ${diffDays} giorni.`,
                            data: { url: `/Pages/Assistito/${terapia.paziente.id_utente}` }
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
                        const msgTitle = stock === 0 ? `⚠️ Scorta finita: ${terapia.farmaco?.farmaco?.denominazione}` : `⚠️ Scorta insufficiente: ${terapia.farmaco?.farmaco?.denominazione}`;
                        const msgBody = stock === 0 ? `Rimangono 0 unità. Impossibile proseguire la terapia.` : `Scorta non sufficiente per coprire il piano terapeutico (${stock} rimasti).`;

                        messagesToSend.push({
                            title: msgTitle,
                            body: msgBody,
                            data: { url: '/Pages/Terapie' }
                        });

                        // Avviso Caregiver
                        caregiverMessagesToSend.push({
                            title: `⚠️ Problema Scorte: ${terapia.paziente.nome}`,
                            body: `L'assistito ha scorte insufficienti di ${terapia.farmaco?.farmaco?.denominazione} (${stock} rimasti).`,
                            data: { url: `/Pages/Assistito/${terapia.paziente.id_utente}` }
                        });

                        medicinesWithStockWarning.add(terapia.id_farmaco_armadietto);
                    }
                }
            }

            // --- C. INVIO NOTIFICHE PAZIENTE ---
            if (messagesToSend.length > 0 && terapia.paziente.notifiche && terapia.paziente.notifiche.length > 0) {
                for (const msg of messagesToSend) {
                    const payload = JSON.stringify(msg);
                    console.log(`🔔 [TEST] Notifica PAZIENTE per ${terapia.farmaco?.farmaco?.denominazione}:`, payload);
                    terapia.paziente.notifiche.forEach(sub => {
                        notificheInviate.push(
                            sendNotificationSafely(sub, payload)
                        );
                    });
                }
            }

            // --- D. INVIO NOTIFICHE CAREGIVER ---
            if (caregiverMessagesToSend.length > 0 && terapia.paziente.assistito && terapia.paziente.assistito.length > 0) {
                // Iteriamo su tutte le relazioni di assistenza per trovare i caregiver
                for (const relazione of terapia.paziente.assistito) {
                    const caregiver = relazione.caregiver;
                    if (caregiver && caregiver.notifiche && caregiver.notifiche.length > 0) {
                        for (const msg of caregiverMessagesToSend) {
                            const payload = JSON.stringify(msg);
                            console.log(`🔔 [TEST] Notifica CAREGIVER (${caregiver.email}) per ${terapia.paziente.nome}:`, payload);
                            caregiver.notifiche.forEach(sub => {
                                notificheInviate.push(
                                    sendNotificationSafely(sub, payload)
                                );
                            });
                        }
                    }
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
                        include: { 
                            notifiche: true,
                            assistito: { // Include i caregiver dell'utente proprietario dell'armadietto
                                include: {
                                    caregiver: {
                                        include: { notifiche: true }
                                    }
                                }
                            }
                        }
                    },
                    farmaco: true
                }
            });

            for (const farmaco of farmaciArmadietto) {
                if (!farmaco.utente) continue;

                const messagesToSend = [];
                const caregiverMessagesToSend = [];

                // A. Controllo Scadenza (Generale)
                if (farmaco.data_scadenza) {
                    // Se già notificato dalla terapia, salta per evitare doppi avvisi
                    if (!medicinesWithExpiryWarning.has(farmaco.id_farmaco_armadietto)) {
                        const scadenza = new Date(farmaco.data_scadenza);
                        const oggi = new Date();
                        const diffTime = scadenza - oggi;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays < 0) {
                             const msg = {
                                title: `⛔ Armadietto: ${farmaco.farmaco.denominazione} SCADUTO`,
                                body: `Un farmaco nel tuo armadietto è scaduto.`,
                                data: { url: '/Pages/Armadietto' }
                            };
                            messagesToSend.push(msg);

                            caregiverMessagesToSend.push({
                                title: `⛔ Armadietto: ${farmaco.utente.nome}`,
                                body: `Il farmaco ${farmaco.farmaco.denominazione} nell'armadietto dell'assistito è scaduto.`,
                                data: { url: `/Pages/Assistito/${farmaco.utente.id_utente}` }
                            });

                        } else if ([15, 7, 1].includes(diffDays)) {
                             const msg = {
                                title: `⚠️ Armadietto: ${farmaco.farmaco.denominazione}`,
                                body: `Scade tra ${diffDays} giorni.`,
                                data: { url: '/Pages/Armadietto' }
                            };
                            messagesToSend.push(msg);

                            caregiverMessagesToSend.push({
                                title: `⚠️ Armadietto: ${farmaco.utente.nome}`,
                                body: `Il farmaco ${farmaco.farmaco.denominazione} dell'assistito scade tra ${diffDays} giorni.`,
                                data: { url: `/Pages/Assistito/${farmaco.utente.id_utente}` }
                            });
                        }
                    }
                }

                // B. Controllo Scorte (Generale - Soglia fissa 5)
                if (farmaco.quantita_rimanente !== null && farmaco.quantita_rimanente <= 5) {
                    // Se già notificato dalla terapia, salta
                    if (!medicinesWithStockWarning.has(farmaco.id_farmaco_armadietto)) {
                        const msg = {
                            title: `⚠️ Armadietto: Scorta bassa per ${farmaco.farmaco.denominazione}`,
                            body: `Rimangono solo ${farmaco.quantita_rimanente} unità.`,
                            data: { url: '/Pages/Armadietto' }
                        };
                        messagesToSend.push(msg);

                        caregiverMessagesToSend.push({
                            title: `⚠️ Armadietto: ${farmaco.utente.nome}`,
                            body: `Scorta bassa di ${farmaco.farmaco.denominazione} per l'assistito (${farmaco.quantita_rimanente} rimasti).`,
                            data: { url: `/Pages/Assistito/${farmaco.utente.id_utente}` }
                        });
                    }
                }

                // Invio notifiche Utente
                if (messagesToSend.length > 0 && farmaco.utente.notifiche && farmaco.utente.notifiche.length > 0) {
                    for (const msg of messagesToSend) {
                        const payload = JSON.stringify(msg);
                        console.log(`🔔 [TEST] Notifica ARMADIETTO per ${farmaco.farmaco.denominazione}:`, payload);
                        farmaco.utente.notifiche.forEach(sub => {
                            notificheInviate.push(sendNotificationSafely(sub, payload));
                        });
                    }
                }

                // Invio notifiche Caregiver
                if (caregiverMessagesToSend.length > 0 && farmaco.utente.assistito && farmaco.utente.assistito.length > 0) {
                    for (const relazione of farmaco.utente.assistito) {
                        const caregiver = relazione.caregiver;
                        if (caregiver && caregiver.notifiche && caregiver.notifiche.length > 0) {
                            for (const msg of caregiverMessagesToSend) {
                                const payload = JSON.stringify(msg);
                                console.log(`🔔 [TEST] Notifica CAREGIVER ARMADIETTO (${caregiver.email}):`, payload);
                                caregiver.notifiche.forEach(sub => {
                                    notificheInviate.push(sendNotificationSafely(sub, payload));
                                });
                            }
                        }
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