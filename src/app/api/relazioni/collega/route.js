import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');

    if (!token) {
      return NextResponse.json({ message: "Non autenticato" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    let currentUser;
    try {
      const decoded = jwt.verify(token.value, secret);
      currentUser = decoded.id;
    } catch (err) {
      return NextResponse.json({ message: "Token non valido" }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ message: "Codice mancante" }, { status: 400 });
    }

    // 1. Cerca il codice
    const codiceRecord = await prisma.codice_abbinamento.findUnique({
      where: { codeString: code },
    });

    if (!codiceRecord) {
      return NextResponse.json({ message: "Codice non valido o inesistente" }, { status: 404 });
    }

    // 2. Controllo scadenza
    if (new Date() > new Date(codiceRecord.data_scadenza)) {
      await prisma.codice_abbinamento.delete({ where: { codeString: code } });
      return NextResponse.json({ message: "Codice scaduto" }, { status: 400 });
    }

    // 3. Controllo self-link
    if (codiceRecord.id_creatore === currentUser) {
      return NextResponse.json({ message: "Non puoi usare il tuo stesso codice" }, { status: 400 });
    }

    // 4. Determina ruoli
    let id_caregiver;
    let id_assistito;

    if (codiceRecord.ruolo_target === 'ASSISTITO') {
      // Il creatore era il caregiver, chi usa il codice è l'assistito
      id_caregiver = codiceRecord.id_creatore;
      id_assistito = currentUser;
    } else {
      // Il creatore era l'assistito, chi usa il codice è il caregiver
      id_caregiver = currentUser;
      id_assistito = codiceRecord.id_creatore;
    }

    // 5. Verifica se esiste già una relazione (opzionale ma consigliato)
    const existingRel = await prisma.relazione.findFirst({
      where: {
        id_caregiver,
        id_assistito
      }
    });

    if (existingRel) {
       // Elimina comunque il codice perché è stato "usato" per scoprire che sono già collegati
       await prisma.codice_abbinamento.delete({ where: { codeString: code } });
       return NextResponse.json({ message: "Relazione già esistente" }, { status: 409 });
    }

    // 6. Crea Relazione
    // Assegniamo permessi ADMIN di default per ora, per consentire gestione completa
    await prisma.relazione.create({
      data: {
        id_caregiver,
        id_assistito,
        permessi_armadietto: 'ADMIN',
        permessi_piano: 'ADMIN'
      }
    });

    // 7. Elimina codice
    await prisma.codice_abbinamento.delete({ where: { codeString: code } });

    return NextResponse.json({ message: "Collegamento avvenuto con successo!" }, { status: 200 });

  } catch (error) {
    console.error("Errore API collega:", error);
    return NextResponse.json({ message: "Errore server" }, { status: 500 });
  }
}
