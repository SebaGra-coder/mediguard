// src/app/api/farmaci/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Questa riga rimane uguale
export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const codiceDaCercare = "041045028";

    // Prisma funziona uguale, ma senza suggerimenti intelligenti
    const farmaco = await prisma.farmaci.findUnique({
      where: {
        codice_aic: codiceDaCercare
      }
    });

    if (!farmaco) {
      return NextResponse.json({
         success: false,
         message: "Nessun farmaco trovato"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: farmaco.denominazione
    });

  } catch (error) {
    console.error("Errore:", error);
    return NextResponse.json({ success: false, error: "Errore server" }, { status: 500 });
  }
}