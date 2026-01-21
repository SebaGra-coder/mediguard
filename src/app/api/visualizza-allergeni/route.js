import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET → Recupera la lista degli allergeni disponibili
 * Supporta un parametro opzionale 'search' per filtrare per nome sostanza
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");

        // Definiamo il filtro di ricerca se il parametro è presente
        const whereClause = search 
            ? {
                sostanza_allergene: {
                    contains: search,
                    mode: 'insensitive', // Ricerca non case-sensitive
                },
              }
            : {};

        // Recupera gli allergeni dal database
        const allergeni = await prisma.allergeni.findMany({
            where: whereClause,
            orderBy: {
                sostanza_allergene: 'asc', // Ordina alfabeticamente
            },
        });

        return NextResponse.json({ 
            success: true, 
            count: allergeni.length,
            data: allergeni 
        });

    } catch (error) {
        console.error("Errore nel recupero allergeni:", error);
        return NextResponse.json({ 
            success: false, 
            error: "Errore durante il recupero degli allergeni dal database" 
        }, { status: 500 });
    }
}