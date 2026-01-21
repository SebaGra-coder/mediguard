import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    // 1. Identificazione della modalità
    // Controlla se l'URL contiene il flag "me" (es. ?me oppure ?me=true)
    const isMeAction = url.searchParams.has('me');
    
    // Altri filtri definiscono una ricerca pubblica
    const isSearch = queryParams.email || queryParams.nome || queryParams.cognome || queryParams.id;

    // 2. Gestione Token
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    let decoded = null;

    if (token) {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return NextResponse.json({ message: 'Sessione scaduta o invalida' }, { status: 401 });
      }
    }

    // 3. Configurazione Campi Consentiti
    const allowedFieldsSearch = ['id_utente', 'email', 'nome', 'cognome', 'data_nascita'];
    const allowedFieldsPersonal = [
      'id_utente', 'email', 'nome', 'cognome', 'data_nascita', 'allergie', 
      'permessi_armadietto', 'permessi_piano', 'caregiver', 'assistito', 
      'armadietto', 'terapie', 'codici_generati'
    ];
    const fieldAliases = { DOB: 'data_nascita' };

    let selectFields = {};
    let allowedFields = [];

    // --- LOGICA DI SELEZIONE ---
    if (isMeAction) {
      // Caso ?me -> Carica tutto il profilo personale
      if (!decoded) {
        return NextResponse.json({ message: 'Autenticazione richiesta' }, { status: 401 });
      }
      allowedFields = allowedFieldsPersonal;
      // Inizializza selectFields con tutti i campi personali a true
      allowedFieldsPersonal.forEach(f => selectFields[f] = true);
    } else if (isSearch) {
      // Caso Ricerca -> Carica solo i campi base
      allowedFields = allowedFieldsSearch;
      allowedFieldsSearch.forEach(f => selectFields[f] = true);
    } else {
      return NextResponse.json({ message: 'Specificare ?me o un parametro di ricerca' }, { status: 400 });
    }

    // 4. Sovrascrittura dinamica se l'utente specifica "fields" nell'URL
    if (queryParams.fields) {
      const requested = queryParams.fields.split(',').map(s => s.trim()).filter(Boolean);
      const customSelect = {};
      requested.forEach(f => {
        const realField = fieldAliases[f] || f;
        if (allowedFields.includes(realField)) {
          customSelect[realField] = true;
        }
      });
      if (Object.keys(customSelect).length > 0) {
        selectFields = customSelect; // Sostituisce la selezione predefinita
      }
    }

    // 5. Esecuzione Query
    if (isMeAction) {
      const utente = await prisma.utente.findUnique({
        where: { id_utente: decoded.id },
        select: selectFields
      });
      return NextResponse.json(utente, { status: 200 });
    } else {
      const whereClause = {};
      if (queryParams.email) whereClause.email = { contains: queryParams.email, mode: 'insensitive' };
      if (queryParams.nome) whereClause.nome = { contains: queryParams.nome, mode: 'insensitive' };
      if (queryParams.cognome) whereClause.cognome = { contains: queryParams.cognome, mode: 'insensitive' };
      if (queryParams.id) whereClause.id_utente = parseInt(queryParams.id, 10);

      const utenti = await prisma.utente.findMany({
        where: whereClause,
        select: selectFields
      });
      return NextResponse.json(utenti, { status: 200 });
    }

  } catch (error) {
    console.error("Errore RUD-account:", error);
    return NextResponse.json({ message: 'Errore interno' }, { status: 500 });
  }
}


export async function PUT(req) {
  try {
    // Recupera il token dai cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Non autenticato' }, { status: 401 });
    }

    // Verifica il token
    const secret = process.env.JWT_SECRET;
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json({ message: 'Sessione scaduta o invalida' }, { status: 401 });
    }

    // Leggi il body della richiesta
    const body = await req.json();

    const allowedUpdateFields = ['email', 'password', 'nome', 'cognome', 'data_nascita', 'permessi_armadietto', 'permessi_piano'];

    // Filtra i campi dal body
    const updateData = {};
    for (const field of allowedUpdateFields) {
      if (body[field] !== undefined) {
        if (field === 'password') {
          // Cifra la password
          const bcrypt = await import('bcryptjs');
          updateData.password_cifrata = await bcrypt.hash(body[field], 10);
        } else if (field === 'data_nascita') {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'Nessun campo valido da aggiornare' }, { status: 400 });
    }

    // Aggiorna l'utente
    await prisma.utente.update({
      where: { id_utente: decoded.id },
      data: updateData
    });

    return NextResponse.json({ message: 'Dati aggiornati con successo' }, { status: 200 });

  } catch (error) {
    console.error("Errore aggiornamento dati:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Utente non trovato' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Errore interno' }, { status: 500 });
  }
}


export async function DELETE() {
  try {
    // Recupera il token dai cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Non autorizzato' }, { status: 401 });
    }

    // Verifica il token e ottiene i dati dell'utente
    const secret = process.env.JWT_SECRET;
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json({ message: 'Sessione non valida o scaduta' }, { status: 401 });
    }

    const userId = decoded.id; // L'ID estratto dal JWT

    // Cancella l'utente dal database tramite Prisma
    await prisma.utente.delete({
      where: { id_utente: userId }
    });

    // Cancella il cookie di sessione
    cookieStore.delete('session_token');

    return NextResponse.json({ message: 'Account eliminato con successo' }, { status: 200 });

  } catch (error) {
    console.error("Errore durante l'eliminazione:", error);

    // Gestione errore se l'utente non esiste più nel DB
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Utente non trovato' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Errore interno del server' }, { status: 500 });
  }
}