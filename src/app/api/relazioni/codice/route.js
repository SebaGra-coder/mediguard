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
    try {
      const decoded = jwt.verify(token.value, secret);
      const id_utente = decoded.id;

      const body = await request.json();
      // targetRole: Chi userà il codice?
      // Se io sono Caregiver, targetRole = 'ASSISTITO'
      const { targetRole = 'ASSISTITO' } = body; 

      // Genera codice univoco 6 caratteri
      const codeString = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Data scadenza (24 ore)
      const data_scadenza = new Date();
      data_scadenza.setHours(data_scadenza.getHours() + 24);

      const nuovoCodice = await prisma.codice_abbinamento.create({
        data: {
          codeString,
          id_creatore: id_utente,
          ruolo_target: targetRole,
          data_scadenza
        }
      });

      return NextResponse.json({ code: nuovoCodice.codeString }, { status: 200 });

    } catch (err) {
      console.error("Errore JWT o DB:", err);
      return NextResponse.json({ message: "Errore interno o token non valido" }, { status: 500 });
    }

  } catch (error) {
    console.error("Errore API generate code:", error);
    return NextResponse.json({ message: "Errore server" }, { status: 500 });
  }
}
