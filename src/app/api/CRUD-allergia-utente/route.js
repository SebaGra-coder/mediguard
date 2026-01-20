import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const validaGravita = (valore) => {
    const num = parseInt(valore);
    if (isNaN(num) || num < 0 || num > 10) return { valid: false };
    return { valid: true, value: num };
};

/**
 * POST → Registra una nuova allergia con controllo duplicati
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { id_utente, id_allergene, gravita_reazione } = body;

        // 1. Verifica dati minimi
        if (!id_utente || !id_allergene || gravita_reazione === undefined) {
            return NextResponse.json({ success: false, message: "Dati mancanti" }, { status: 400 });
        }

        // 2. Controllo duplicati: l'utente ha già questa allergia?
        const allergiaEsistente = await prisma.allergia_utente.findFirst({
            where: {
                id_utente: id_utente,
                id_allergene: id_allergene
            }
        });

        if (allergiaEsistente) {
            return NextResponse.json({ 
                success: false, 
                message: "L'utente ha già registrato questo allergene. Modifica quella esistente." 
            }, { status: 409 }); // 409 Conflict
        }

        // 3. Validazione gravità
        const check = validaGravita(gravita_reazione);
        if (!check.valid) {
            return NextResponse.json({ success: false, message: "Gravità non valida (0-10)" }, { status: 400 });
        }

        // 4. Creazione
        const nuovaAllergia = await prisma.allergia_utente.create({
            data: {
                id_utente,
                id_allergene,
                gravita_reazione: check.value
            }
        });

        return NextResponse.json({ success: true, data: nuovaAllergia }, { status: 201 });
    } catch (error) {
        console.error("Errore POST:", error);
        return NextResponse.json({ success: false, error: "Errore interno del server" }, { status: 500 });
    }
}
/**
 * GET → Recupera allergie di un utente
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id_utente = searchParams.get("id_utente");

        if (!id_utente) {
            return NextResponse.json({ success: false, message: "ID utente mancante" }, { status: 400 });
        }

        const allergie = await prisma.allergia_utente.findMany({
            where: { id_utente: id_utente },
            include: { allergene: { select: { sostanza_allergene: true } } }
        });

        return NextResponse.json({ success: true, data: allergie });
    } catch (error) {
        console.error("Errore GET:", error);
        return NextResponse.json({ success: false, error: "Errore recupero" }, { status: 500 });
    }
}

/**
 * PATCH → Modifica la gravità di un'allergia
 */
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id_allergia, gravita_reazione } = body;

        console.log("Ricevuta richiesta PATCH:", { id_allergia, gravita_reazione });

        if (!id_allergia || gravita_reazione === undefined) {
            return NextResponse.json({ success: false, message: "Dati mancanti" }, { status: 400 });
        }

        const check = validaGravita(gravita_reazione);
        if (!check.valid) {
            return NextResponse.json({ success: false, message: "Gravità non valida (0-10)" }, { status: 400 });
        }

        const aggiornata = await prisma.allergia_utente.update({
            where: { id_allergia: id_allergia },
            data: { gravita_reazione: check.value }
        });

        return NextResponse.json({ success: true, data: aggiornata });
    } catch (error) {
        console.error("Errore PATCH dettagliato:", error);
        return NextResponse.json({ success: false, error: "Errore aggiornamento database" }, { status: 500 });
    }
}

/**
 * DELETE → Rimuove un'allergia
 */
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id_allergia = searchParams.get("id_allergia");

        if (!id_allergia) return NextResponse.json({ success: false, message: "ID mancante" }, { status: 400 });

        await prisma.allergia_utente.delete({ where: { id_allergia: id_allergia } });

        return NextResponse.json({ success: true, message: "Allergia eliminata" });
    } catch (error) {
        console.error("Errore DELETE:", error);
        return NextResponse.json({ success: false, error: "Errore eliminazione" }, { status: 500 });
    }
}