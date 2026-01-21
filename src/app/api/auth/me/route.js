import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');

    if (!token) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("ERRORE: JWT_SECRET non configurata");
      return NextResponse.json({ message: "Errore configurazione server" }, { status: 500 });
    }

    try {
      const decoded = jwt.verify(token.value, secret);
      
      // Opzionale: verificare se l'utente esiste ancora nel DB
      const utente = await prisma.utente.findUnique({
        where: { id_utente: decoded.id },
        select: { 
          id_utente: true, 
          email: true, 
          nome: true, 
          cognome: true,
          caregiver: {
            select: { id_relazione: true }
          },
          assistito: {
            select: { id_relazione: true }
          }
        }
      });

      if (!utente) {
         return NextResponse.json({ isAuthenticated: false }, { status: 200 });
      }

      let ruolo = "Nessuno";
      if (utente.caregiver.length > 0) {
        ruolo = "Caregiver";
      } else if (utente.assistito.length > 0) {
        ruolo = "Assistito";
      }

      return NextResponse.json({ 
        isAuthenticated: true, 
        user: { ...utente, ruolo } 
      }, { status: 200 });

    } catch (err) {
      // Token non valido o scaduto
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

  } catch (error) {
    console.error("Errore verifica auth:", error);
    return NextResponse.json({ message: 'Errore interno' }, { status: 500 });
  }
}