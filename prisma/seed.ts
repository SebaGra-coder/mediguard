import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import csv from 'csv-parser'

const prisma = new PrismaClient()

async function main() {
  const results: any[] = [];
  
  // ⚠️ ATTENZIONE: Se il tuo file si chiama diversamente, cambia il nome qui sotto
  const PERCORSO_FILE = 'prisma/farmaci.csv'; 

  console.log(`📂 Inizio lettura da: ${PERCORSO_FILE}...`)

  fs.createReadStream(PERCORSO_FILE)
    // ⚠️ Importante: I CSV italiani usano il punto e virgola ';' 
    // Se il tuo usa la virgola, cambia in separator: ','
    .pipe(csv({ separator: ';' })) 
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      
      console.log(`📊 Trovate ${results.length} righe. Inizio elaborazione...`);

      const farmaciDaInserire = [];

      for (const row of results) {
        // Pulizia dati: saltiamo le righe vuote se ce ne sono
        if (!row.codice_aic && !row.AIC) continue;

        // Funzione per pulire i numeri (trasforma "10,5" in 10.5)
        const pulisciNumero = (valore: string) => {
          if (!valore) return null;
          return parseFloat(valore.replace(',', '.')); // Sostituisce virgola con punto
        };

        const pulisciIntero = (valore: string) => {
            if (!valore) return null;
            return parseInt(valore);
        };

        // MAPPING: Qui colleghiamo le colonne CSV (destra) al Database (sinistra)
        // Ho messo le varianti più comuni (es. 'codice_aic' o 'AIC')
        farmaciDaInserire.push({
            codice_aic:          row['codice_aic'] || row['AIC'] || row['Codice AIC'],
            codice_atc:          row['codice_atc'] || row['ATC'],
            denominazione:       row['denominazione'] || row['DENOMINAZIONE'],
            descrizione:         row['descrizione'] || row['DESCRIZIONE'],
            
            ragione_sociale:     row['ragione_sociale'] || row['DITTA'],
            forma:               row['forma'] || row['FORMA_FARMACEUTICA'],
            principio_attivo:    row['principio_attivo'] || row['pa_associati'],
            foglio_illustrativo: row['foglio_illustrativo'],
            unita_misura:        row['unita_misura'],

            // Conversione numeri
            codice_ditta:        pulisciIntero(row['codice_ditta']),
            quantita_confezione: pulisciNumero(row['quantita_confezione'] || row['quantita']),
            
            // Salvataggio JSON completo
            json_dati_grezzi:    row
        });
      }

      console.log(`💾 Sto salvando ${farmaciDaInserire.length} farmaci nel database...`);

      // Usiamo createMany per velocità (salta i duplicati se esistono già)
      await prisma.farmaci.createMany({
        data: farmaciDaInserire,
        skipDuplicates: true, 
      });

      console.log("✅ Importazione completata! Database aggiornato.");
    });
}

main()
  .catch((e) => {
    console.error("❌ Errore durante l'importazione:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })