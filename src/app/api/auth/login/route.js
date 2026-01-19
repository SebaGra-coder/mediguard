import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email e password obbligatorie' }, { status: 400 });
    }

    // Trova l'utente
    const utente = await prisma.utente.findUnique({ where: { email } });
    if (!utente) {
      return NextResponse.json({ message: 'Credenziali non valide' }, { status: 401 });
    }

    // Confronta la password
    const valid = await bcrypt.compare(password, utente.password_cifrata);
    if (!valid) {
      return NextResponse.json({ message: 'Credenziali non valide' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Login effettuato con successo', id: utente.id_utente }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Errore interno del server' }, { status: 500 });
  }
}
