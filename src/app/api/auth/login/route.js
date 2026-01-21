import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Forza Next.js a eseguire sempre il codice senza usare versioni salvate in cache
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Cerca l'utente nel DB
    const utente = await prisma.utente.findUnique({
      where: { email }
    });

    if (!utente) {
      return NextResponse.json({ message: 'Credenziali errate' }, { status: 401 });
    }

    // 2. Verifica la password
    const passwordCorretta = await bcrypt.compare(password, utente.password_cifrata);

    if (!passwordCorretta) {
      return NextResponse.json({ message: 'Credenziali errate' }, { status: 401 });
    }

    // 3. Gestione del Segreto
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("ERRORE: JWT_SECRET non configurata nel file .env");
      return NextResponse.json({ message: "Errore configurazione server" }, { status: 500 });
    }

    // 4. Reset del cookie precedente
    const cookieStore = await cookies();
    cookieStore.delete('session_token');

    // 5. Crea il nuovo token con i dati dell'utente ATTUALE
    const token = jwt.sign(
      { 
        id: utente.id_utente, 
        email: utente.email,
        iat: Math.floor(Date.now() / 1000) 
      }, 
      secret, 
      { expiresIn: '1d' }
    );

    // 6. Salva il nuovo token nel cookie
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400, // 1 giorno
      path: '/',
      sameSite: 'lax', // Protezione base contro CSRF
    });

    return NextResponse.json({ 
      message: 'Login effettuato con successo',
      user: { email: utente.email } // Opzionale: torna i dati per il frontend
    }, { status: 200 });

  } catch (error) {
    console.error("Errore nel processo di login:", error);
    return NextResponse.json({ message: 'Errore interno' }, { status: 500 });
  }
}