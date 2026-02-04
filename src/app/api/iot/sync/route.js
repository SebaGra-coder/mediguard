import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as googleTTS from 'google-tts-api';

export const dynamic = 'force-dynamic';

// --- GENERATORE AUDIO (Uguale a prima) ---
async function generateTTSHex(text) {
  try {
    const ttsUrl = googleTTS.getAudioUrl(text, {
      lang: 'it', slow: false, host: 'https://translate.google.com',
    });
    const response = await fetch(ttsUrl);
    const arrayBuffer = await response.arrayBuffer();
    const voiceBuffer = Buffer.from(arrayBuffer);
    const silenceHex = "FFFB90C4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000".repeat(50);
    const silenceBuffer = Buffer.from(silenceHex, 'hex');
    const combinedBuffer = Buffer.concat([silenceBuffer, voiceBuffer]);
    return combinedBuffer.toString('hex').toUpperCase(); 
  } catch (error) {
    console.error("Errore TTS:", error);
    return ""; 
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const mode = searchParams.get('mode');

  // --- CASO 1: AUDIO ---
  if (mode === 'audio') {
    const text = searchParams.get('text');
    if (!text) return NextResponse.json({ error: 'Testo mancante' }, { status: 400 });
    const hexAudio = await generateTTSHex(text);
    return new NextResponse(hexAudio, { headers: { 'Content-Type': 'text/plain' } });
  }

  // --- CASO 2: SYNC (DEBUGGATO) ---
  if (!userId) return NextResponse.json({ error: 'User ID mancante' }, { status: 400 });

  try {
    // 1. FIX FUSO ORARIO: Calcoliamo "Oggi" basandoci su ROMA, non UTC.
    const now = new Date();
    
    // Convertiamo l'ora attuale nell'ora italiana mantenendo l'oggetto Date
    // Questo trucco sposta l'orario UTC per combaciare con l'ora locale italiana
    const timeZone = 'Europe/Rome';
    const italyDateStr = now.toLocaleString('en-US', { timeZone });
    const italyDate = new Date(italyDateStr);

    // Impostiamo inizio e fine giornata basati sull'ora italiana
    const startOfDay = new Date(italyDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(italyDate);
    endOfDay.setHours(23, 59, 59, 999);

    // DEBUG: Stampa nella console del server cosa stiamo cercando
    console.log(`[SYNC] Richiesta User: ${userId}`);
    console.log(`[SYNC] Range Ricerca (Server Time): ${startOfDay.toISOString()} -> ${endOfDay.toISOString()}`);

    const assunzioni = await prisma.registro_assunzioni.findMany({
      where: {
        terapia: { id_paziente: userId, terapia_attiva: true },
        data_programmata: { 
            gte: startOfDay, 
            lte: endOfDay 
        },
        orario_effettivo: null // <-- NOTA BENE: Se l'hai già confermata, qui sparisce!
      },
      include: { 
        terapia: { 
            include: { farmaco: { include: { farmaco: true } } } 
        } 
      },
      orderBy: { data_programmata: 'asc' }
    });

    console.log(`[SYNC] Trovati ${assunzioni.length} elementi.`);

    const schedule = [];

    for (const evento of assunzioni) {
      const d = new Date(evento.data_programmata);
      // Anche qui, assicurati di formattare l'ora in Italiano, non UTC
      const timeStr = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' });
      
      const nomeFarmaco = evento.terapia.farmaco?.farmaco?.denominazione || "Farmaco";
      const dose = evento.terapia.dose_singola;
      const textToSpeak = `è ora di prendere ${dose} di ${nomeFarmaco}`;

      schedule.push({
        id_evento: evento.id_evento,
        time: timeStr,
        drug: nomeFarmaco, 
        text_tts: textToSpeak, 
        taken: evento.esito === true
      });
    }

    return NextResponse.json({ schedule: schedule });

  } catch (error) {
    console.error("Errore API Sync:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}