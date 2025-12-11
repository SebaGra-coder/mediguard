import { NextResponse } from 'next/server';

// Questa funzione risponde alle chiamate GET
export async function GET() {
  
  // Qui potresti mettere logica complessa, leggere dal DB, ecc.
  // Per ora restituiamo solo un JSON di conferma.
  
  return NextResponse.json({ 
    status: "success",
    message: "Connessione riuscita! Il server MediGuard risponde.",
    timestamp: new Date().toISOString(),
    serverInfo: "API v1.0 - Ready"
  });
}