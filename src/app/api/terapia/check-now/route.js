import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  // NOTA: In produzione, recupera l'ID utente dalla sessione/token
  // Per ora usiamo un ID fisso o passato via query param per test
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId'); 

  if (!userId) return NextResponse.json({ error: 'User ID mancante' }, { status: 400 });

  const now = new Date();
  const ore = String(now.getHours()).padStart(2, '0');
  const minuti = String(now.getMinutes()).padStart(2, '0');
  const orarioAttuale = `${ore}:${minuti}`; // Es. "14:00"

  try {
    // 1. Trova terapie attive per questo utente che hanno l'orario attuale
    const terapie = await prisma.piano_terapeutico.findMany({
      where: {
        id_paziente: userId,
        terapia_attiva: true,
      },
      include: {
        assunzioni: true // Ci serve per controllare se l'ha già presa oggi
      }
    });

    const daPrendere = [];

    for (const terapia of terapie) {
      // Verifica se l'orario attuale è nella lista degli orari della terapia
      // Assumiamo che 'orari' sia un array JSON ["08:00", "14:00"]
      const orari = terapia.orari || []; 
      
      if (Array.isArray(orari) && orari.includes(orarioAttuale)) {
        
        // Controlla se esiste già una registrazione per oggi a quest'ora
        const oggi = new Date();
        oggi.setHours(0, 0, 0, 0);
        
        const giaPresa = terapia.assunzioni.some(a => {
          const dataA = new Date(a.data_programmata);
          dataA.setHours(0,0,0,0);
          // Verifica se la data è oggi E se l'orario corrisponde (se salvi l'orario nel record)
          // Per semplicità, qui controlliamo solo se esiste un'assunzione oggi.
          // In un caso reale dovresti salvare anche l'orario specifico "slot" nel registro.
          return dataA.getTime() === oggi.getTime(); 
        });

        if (!giaPresa) {
          daPrendere.push(terapia);
        }
      }
    }

    return NextResponse.json({ daPrendere });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}