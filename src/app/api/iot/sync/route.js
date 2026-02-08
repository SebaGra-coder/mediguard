import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as googleTTS from 'google-tts-api';

// Importiamo la mappa dei farmaci (quella con 4000 voci)
import { audioMap } from '@/lib/audioMap';

// Mappa delle DOSI (Numeri -> ID File Audio cartella 02)
const doseMap = {
  "0.5": 1,
  "1": 2,
  "2": 3,
  "3": 4,
  "4": 5,
  "5": 6,
  "6": 7,
  "7": 8,
  "8": 9,
  "9": 10,
  "10": 11
};

export const dynamic = 'force-dynamic';

// ============================================================================
// 2. GENERATORE AUDIO PER MEDI-PENDANT (Google TTS)
// ============================================================================
async function generateTTSHex(text) {
  try {
    const ttsUrl = googleTTS.getAudioUrl(text, {
      lang: 'it', slow: false, host: 'https://translate.google.com',
    });
    const response = await fetch(ttsUrl);
    const arrayBuffer = await response.arrayBuffer();
    const voiceBuffer = Buffer.from(arrayBuffer);
    
    // 50 byte di silenzio iniziale
    const silenceHex = "FFFB90C4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000".repeat(50);
    const silenceBuffer = Buffer.from(silenceHex, 'hex');
    const combinedBuffer = Buffer.concat([silenceBuffer, voiceBuffer]);
    
    return combinedBuffer.toString('hex').toUpperCase(); 
  } catch (error) {
    console.error("Errore TTS:", error);
    return ""; 
  }
}

// ============================================================================
// 3. API HANDLER PRINCIPALE
// ============================================================================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const mode = searchParams.get('mode');

  // --- MODALITÀ AUDIO (Usata solo dal Pendant) ---
  if (mode === 'audio') {
    const text = searchParams.get('text');
    if (!text) return NextResponse.json({ error: 'Testo mancante' }, { status: 400 });
    const hexAudio = await generateTTSHex(text);
    return new NextResponse(hexAudio, { headers: { 'Content-Type': 'text/plain' } });
  }

  // --- MODALITÀ SYNC (Usata da Station e Pendant) ---
  if (!userId) return NextResponse.json({ error: 'User ID mancante' }, { status: 400 });

  try {
    // 1. Calcolo Orari (Fuso Roma)
    const now = new Date();
    const timeZone = 'Europe/Rome';
    const italyDateStr = now.toLocaleString('en-US', { timeZone });
    const italyDate = new Date(italyDateStr);

    const startOfDay = new Date(italyDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(italyDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`[SYNC] User: ${userId} | Range: ${startOfDay.toISOString()} -> ${endOfDay.toISOString()}`);

    // 2. Query Database
    const assunzioni = await prisma.registro_assunzioni.findMany({
      where: {
        terapia: { id_paziente: userId, terapia_attiva: true },
        data_programmata: { gte: startOfDay, lte: endOfDay },
        orario_effettivo: null 
      },
      include: { 
        terapia: { 
            include: { farmaco: { include: { farmaco: true } } } 
        } 
      },
      orderBy: { data_programmata: 'asc' }
    });

    console.log(`[SYNC] Trovati ${assunzioni.length} elementi.`);

    // 3. Costruzione JSON Universale
    const schedule = [];

    for (const evento of assunzioni) {
      const d = new Date(evento.data_programmata);
      const timeStr = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' });
      
      // Dati Farmaco
      const nomeFarmaco = evento.terapia.farmaco?.farmaco?.denominazione || "Farmaco";
      const dose = evento.terapia.dose_singola;
      
      // A. Logica per Pendant (Testo TTS)
      const textToSpeak = `è ora di prendere ${dose} di ${nomeFarmaco}`;

      // B. Logica per Station (ID Audio e Dose)
      
      // 1. GESTIONE FARMACO (AudioMap)
      const nomeClean = nomeFarmaco.toUpperCase().trim();
      let audioId = 0;
      
      if (audioMap[nomeClean]) {
        audioId = audioMap[nomeClean];
      } else {
        // Fallback: cerca corrispondenza parziale
        const keys = Object.keys(audioMap);
        for (const key of keys) {
            if (nomeClean.includes(key)) {
                audioId = audioMap[key];
                break;
            }
        }
      }

      // 2. GESTIONE DOSE (DoseMap) - NUOVA MODIFICA
      // Convertiamo in stringa (per sicurezza), maiuscolo e trim
      const doseClean = String(dose || "").toUpperCase().trim();
      // Cerchiamo nella mappa. Se non c'è corrispondenza, ID = 0.
      const doseId = doseMap[doseClean] || 0;

      schedule.push({
        id_evento: evento.id_evento,
        time: timeStr,
        drug: nomeFarmaco,
        
        // Campo per Pendant
        text_tts: textToSpeak, 
        
        // Campi per Station
        audio_id: audioId, 
        dose_id: doseId, // <--- ID della dose per la cartella 02
        
        taken: evento.esito === true
      });
    }

    return NextResponse.json({ schedule: schedule });

  } catch (error) {
    console.error("Errore API Sync:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}