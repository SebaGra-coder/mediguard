import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id_evento, timestamp } = body; // Ora riceviamo id_evento!

    if (!id_evento) {
      return NextResponse.json({ success: false, error: "ID Evento mancante" }, { status: 400 });
    }

    // 1. Recupera l'evento esistente
    const evento = await prisma.registro_assunzioni.findUnique({
      where: { id_evento: id_evento },
      include: {
        terapia: {
          include: { farmaco: true } // Serve per scalare la quantità
        }
      }
    });

    if (!evento) {
      return NextResponse.json({ success: false, error: "Assunzione non trovata" }, { status: 404 });
    }

    // Se è già stata presa, fermati (evita doppi scarichi)
    if (evento.esito === true) {
      return NextResponse.json({ success: true, message: "Già confermata in precedenza" });
    }

    // 2. Controllo Quantità Armadietto
    const armadietto = evento.terapia.farmaco;
    const dose = evento.terapia.dose_singola || 1;

    if (armadietto && armadietto.quantita_rimanente < dose) {
      return NextResponse.json({ 
        success: false, 
        error: "Quantità insufficiente nell'armadietto!" 
      }, { status: 400 });
    }

    // 3. Aggiorna l'evento (UPDATE)
    const orarioEffettivo = timestamp ? new Date(timestamp * 1000) : new Date();
    
    await prisma.registro_assunzioni.update({
      where: { id_evento: id_evento },
      data: {
        esito: true,
        orario_effettivo: orarioEffettivo
      }
    });

    // 4. Scala la quantità
    if (armadietto) {
      await prisma.farmaco_armadietto.update({
        where: { id_farmaco_armadietto: armadietto.id_farmaco_armadietto },
        data: { quantita_rimanente: { decrement: dose } }
      });
    }

    return NextResponse.json({ success: true, message: "Assunzione registrata" });

  } catch (error) {
    console.error("[IoT] Errore Confirm:", error);
    return NextResponse.json({ success: false, error: "Errore interno" }, { status: 500 });
  }
}