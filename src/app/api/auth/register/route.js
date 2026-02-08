import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { email, password, nome = 'Nome', cognome = 'Cognome', data_nascita = '2000-01-01' } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email e password obbligatorie' }, { status: 400 });
    }

    // Cripta la password
    const passwordCifrata = await bcrypt.hash(password, 10);

    // Crea l'utente con valori di default per i campi obbligatori
    const utente = await prisma.utente.create({
      data: {
        email,
        password_cifrata: passwordCifrata,
        nome,
        cognome,
        data_nascita: new Date(data_nascita),
        account_attivo: true,
        permessi_armadietto: 'ADMIN',  // default MVP
        permessi_piano: 'ADMIN'        // default MVP
      }
    });

    return NextResponse.json({ message: 'Utente registrato con successo', id: utente.id_utente }, { status: 201 });

  } catch (error) {
    console.error(error);

    // Controllo email già esistente
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Email già registrata' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Errore interno del server' }, { status: 500 });
  }
}
