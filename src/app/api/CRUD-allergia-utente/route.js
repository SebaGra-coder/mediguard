// Importa l'oggetto per gestire le risposte HTTP in Next.js
import { NextResponse } from "next/server";
// Importa l'istanza di Prisma configurata per interagire con il database
import { prisma } from "@/lib/prisma";

// Forza la generazione dinamica della rotta per evitare il caching dei dati
export const dynamic = "force-dynamic";

/**
 * POST → Registra una nuova allergia per un utente
 */
export async function POST(request) {
  try {
    // Legge il corpo della richiesta JSON
    const body = await request.json();
    // Estrae i campi necessari dal body
    const { id_utente, id_allergene, gravita_reazione } = body;

    // Verifica la presenza dei campi obbligatori
    if (!id_utente || !id_allergene || gravita_reazione === undefined) {
      // Ritorna errore 400 se mancano dati
      return NextResponse.json({ success: false, message: "Dati mancanti" }, { status: 400 });
    }

    // Crea il record nel database
    const nuovaAllergia = await prisma.allergia_utente.create({
      data: {
        id_utente,
        id_allergene,
        gravita_reazione: parseInt(gravita_reazione) // Assicura che sia un intero
      }
    });

    // Ritorna il record creato con successo
    return NextResponse.json({ success: true, data: nuovaAllergia }, { status: 201 });
  } catch (error) {
    // Gestione errore e log in console
    console.error("Errore POST:", error);
    // Ritorna errore server
    return NextResponse.json({ success: false, error: "Errore creazione" }, { status: 500 });
  }
}

/**
 * GET → Recupera le allergie di un utente
 */
export async function GET(request) {
  try {
    // Estrae i parametri dalla URL
    const { searchParams } = new URL(request.url);
    // Recupera l'ID utente dai parametri
    const id_utente = searchParams.get("id_utente");

    // Verifica se l'ID utente è presente
    if (!id_utente) {
      return NextResponse.json({ success: false, message: "ID utente mancante" }, { status: 400 });
    }

    // Cerca tutte le allergie associate a quell'utente
    const allergie = await prisma.allergia_utente.findMany({
      where: { id_utente: id_utente },
      // Include il nome della sostanza dalla tabella Allergeni
      include: { allergene: { select: { sostanza_allergene: true } } }
    });

    // Ritorna la lista delle allergie
    return NextResponse.json({ success: true, data: allergie });
  } catch (error) {
    // Log e ritorno errore
    console.error("Errore GET:", error);
    return NextResponse.json({ success: false, error: "Errore recupero" }, { status: 500 });
  }
}

/**
 * PATCH → Modifica la gravità di un'allergia esistente
 */
export async function PATCH(request) {
  try {
    // Legge il corpo della richiesta
    const body = await request.json();
    // Estrae l'ID univoco dell'allergia e la nuova gravità
    const { id_allergia, gravita_reazione } = body;

    // Verifica che l'ID sia fornito
    if (!id_allergia || gravita_reazione === undefined) {
      return NextResponse.json({ success: false, message: "ID o Gravità mancanti" }, { status: 400 });
    }

    // Aggiorna il record specifico tramite il suo ID (UUID)
    const aggiornata = await prisma.allergia_utente.update({
      where: { id_allergia: id_allergia },
      data: { gravita_reazione: parseInt(gravita_reazione) }
    });

    // Ritorna il record aggiornato
    return NextResponse.json({ success: true, data: aggiornata });
  } catch (error) {
    // Log e gestione errore (es. se l'ID non esiste)
    console.error("Errore PATCH:", error);
    return NextResponse.json({ success: false, error: "Errore aggiornamento" }, { status: 500 });
  }
}

/**
 * DELETE → Rimuove un'allergia dal profilo utente
 */
export async function DELETE(request) {
  try {
    // Estrae i parametri dalla URL
    const { searchParams } = new URL(request.url);
    // Recupera l'ID dell'allergia da eliminare
    const id_allergia = searchParams.get("id_allergia");

    // Verifica se l'ID è presente
    if (!id_allergia) {
      return NextResponse.json({ success: false, message: "ID allergia mancante" }, { status: 400 });
    }

    // Elimina il record dal database
    await prisma.allergia_utente.delete({
      where: { id_allergia: id_allergia }
    });

    // Ritorna messaggio di successo
    return NextResponse.json({ success: true, message: "Allergia eliminata" });
  } catch (error) {
    // Log e ritorno errore
    console.error("Errore DELETE:", error);
    return NextResponse.json({ success: false, error: "Errore eliminazione" }, { status: 500 });
  }
}