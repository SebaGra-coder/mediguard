const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function main() {
  const results = [];
  
  // ⚠️ Assicurati che il file sia in questa cartella esatta
  const PERCORSO_FILE = 'prisma/farmaci.csv'; 

  console.log(`📂 Inizio lettura da: ${PERCORSO_FILE}...`);

  // Controllo se il file esiste
  if (!fs.existsSync(PERCORSO_FILE)) {
    console.error(`❌ ERRORE: Il file ${PERCORSO_FILE} non esiste!`);
    process.exit(1);
  }

  fs.createReadStream(PERCORSO_FILE)
    // ⚠️ Se il CSV usa la virgola, cambia separator in ','
    .pipe(csv({ separator: ';' })) 
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      
      console.log(`📊 Trovate ${results.length} righe. Inizio elaborazione...`);

      const farmaciDaInserire = [];

      for (const row of results) {
        // Pulizia dati: saltiamo le righe vuote se mancano codici fondamentali
        if (!row.codice_aic && !row.AIC && !row['Codice AIC']) continue;

        // Funzione per pulire i numeri (trasforma "10,5" in 10.5)
        // Nota: In JS non specifichiamo il tipo (valore)
        const pulisciNumero = (valore) => {
          if (!valore) return null;
          // Converte in stringa per sicurezza, poi rimpiazza virgola e parsa
          return parseFloat(String(valore).replace(',', '.')); 
        };

        const pulisciIntero = (valore) => {
            if (!valore) return null;
            return parseInt(valore);
        };

        // MAPPING: Colleghiamo le colonne CSV al Database
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
            
            // Salvataggio JSON completo (assicurati che il campo nel DB sia di tipo Json)
            json_dati_grezzi:    row
        });
      }

      console.log(`💾 Sto salvando ${farmaciDaInserire.length} farmaci nel database...`);

      // Usiamo createMany per velocità (salta i duplicati se esistono già)
      // Nota: createMany funziona solo se il DB è PostgreSQL, MySQL o Mongo. Non SQLite.
      await prisma.farmaci.createMany({
        data: farmaciDaInserire,
        skipDuplicates: true, 
      });

      console.log("✅ Importazione completata! Database aggiornato.");
    });
}

main()
  .catch((e) => {
    console.error("❌ Errore durante l'importazione:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });