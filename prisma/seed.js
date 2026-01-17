const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');

const prisma = new PrismaClient();

// CONFIGURAZIONE
const BATCH_SIZE = 2000; // Quanti farmaci salvare alla volta (2000 è un buon compromesso)
const PERCORSO_FILE = 'prisma/farmaci_master_v8.csv'; 

async function main() {
  console.log(`📂 Inizio lettura stream da: ${PERCORSO_FILE}...`);

  if (!fs.existsSync(PERCORSO_FILE)) {
    console.error(`❌ ERRORE: Il file ${PERCORSO_FILE} non esiste!`);
    process.exit(1);
  }

  const stream = fs.createReadStream(PERCORSO_FILE).pipe(csv({ separator: ';' }));
  
  let batch = [];       // Contenitore temporaneo per il blocco corrente
  let totalProcessed = 0; // Contatore totale

  // Funzioni di pulizia (definite fuori dal loop per performance)
  const pulisciNumero = (valore) => {
    if (!valore) return null;
    return parseFloat(String(valore).replace(',', '.')); 
  };

  const pulisciIntero = (valore) => {
    if (!valore) return null;
    return parseInt(valore);
  };

  // 🔄 USIAMO UN ITERATORE ASINCRONO (for await)
  // Questo permette di leggere il file riga per riga senza caricare tutto in RAM
  for await (const row of stream) {
    
    // 1. Controllo Validità Riga
    if (!row.codice_aic && !row.AIC && !row['Codice AIC']) continue;

    // 2. Mappatura Dati
    const farmaco = {
        codice_aic:          row['codice_aic'] || row['AIC'] || row['Codice AIC'],
        codice_atc:          row['codice_atc'] || row['ATC'],
        denominazione:       row['denominazione'] || row['DENOMINAZIONE'],
        descrizione:         row['descrizione'] || row['DESCRIZIONE'],
        
        ragione_sociale:     row['ragione_sociale'] || row['DITTA'],
        forma:               row['forma'] || row['FORMA_FARMACEUTICA'],
        principio_attivo:    row['principio_attivo'] || row['pa_associati'],
        dosaggio:            row['dosaggio'] || row['DOSAGGIO'],
        confezione:          row['confezione'] || row['CONFEZIONE'],
        unita_misura:        row['unita_misura'],

        codice_ditta:        pulisciIntero(row['codice_ditta']),
        quantita_confezione: pulisciNumero(row['quantita_confezione'] || row['quantita']),
        
        json_dati_grezzi:    row
    };

    // 3. Aggiungi al blocco corrente
    batch.push(farmaco);

    // 4. SE IL BLOCCO È PIENO -> SALVA E SVUOTA
    if (batch.length >= BATCH_SIZE) {
        await prisma.farmaci.createMany({
            data: batch,
            skipDuplicates: true, 
        });
        
        totalProcessed += batch.length;
        console.log(`⏳ Salvati ${totalProcessed} farmaci...`);
        
        batch = []; // 🧹 Svuota la memoria per il prossimo giro
    }
  }

  // 5. SALVA I RIMANENTI (Il "resto" dell'ultimo blocco)
  if (batch.length > 0) {
    await prisma.farmaci.createMany({
        data: batch,
        skipDuplicates: true, 
    });
    totalProcessed += batch.length;
    console.log(`⏳ Salvati gli ultimi ${batch.length} farmaci.`);
  }

  console.log(`✅ FINITO! Totale farmaci inseriti/processati: ${totalProcessed}`);
}

main()
  .catch((e) => {
    console.error("❌ Errore critico durante l'importazione:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
