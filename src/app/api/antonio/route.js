import { NextResponse } from 'next/server';

// Importa le tue funzioni dalla cartella lib
// Nota: in Next.js si usa 'import' invece di 'require'
import { isValidAIC } from '@/lib/ValidatoreAIC';
import { isValidNaturalNumber } from '@/lib/ValidatoreInteri';
import { isNotEmpty } from '@/lib/ValidatoreStringhe';

/**
 * Gestisce la richiesta POST all'indirizzo /antonio/api/valida
 */
export async function POST(request) {
    try {
        // Legge i dati JSON inviati (es: { "valore": "0123", "tipo": "aic" })
        const body = await request.json();
        const valore = body.valore;
        const tipo = body.tipo;

        // 1. Controllo se il valore è vuoto (usando la tua funzione)
        if (!isNotEmpty(valore)) {
            return NextResponse.json({ 
                successo: false, 
                messaggio: "ERRORE: Hai inviato un valore vuoto" 
            }, { status: 400 });
        }

        // 2. Logica di validazione
        let esito = false;
        if (tipo === 'aic') {
            esito = isValidAIC(valore);
        } else if (tipo === 'intero') {
            esito = isValidNaturalNumber(valore);
        }

        // 3. Risposta JSON (equivalente al tuo res.send)
        return NextResponse.json({
            successo: true,
            esito: esito ? "VALIDO" : "NON VALIDO",
            valore_testato: valore
        });

    } catch (error) {
        // Se l'invio non è un JSON valido, gestiamo l'errore
        return NextResponse.json({ successo: false, messaggio: "Dati non validi" }, { status: 400 });
    }
}