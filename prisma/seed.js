// Importazione delle librerie necessarie: client DB, file system e parser CSV
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');

const prisma = new PrismaClient();

// CONFIGURAZIONE
const BATCH_SIZE = 2000; // Quanti record salvare alla volta (2000 è un buon compromesso tra velocità e memoria)
const PERCORSO_FARMACI_FILE = 'prisma/farmaci_final_v12.csv'; 
const PERCORSO_ALLERGENI_FILE = 'prisma/principi_attivi_unici.csv';

async function main() {
  console.log(`📂 Inizio lettura stream da: ${PERCORSO_FARMACI_FILE}...`);

  // Verifica preliminare dell'esistenza del file CSV dei farmaci
  if (!fs.existsSync(PERCORSO_FARMACI_FILE)) {
    console.error(`❌ ERRORE: Il file ${PERCORSO_FARMACI_FILE} non esiste!`);
    process.exit(1);
  }

  // Creazione dello stream di lettura: pipe del file raw verso il parser CSV
  const streamFarmaci = fs.createReadStream(PERCORSO_FARMACI_FILE).pipe(csv({ separator: ';' }));
  
  let batch = [];       // Contenitore temporaneo per il blocco corrente di dati
  let totalProcessed = 0; // Contatore totale record processati

  // Funzioni di pulizia dati (definite fuori dal loop per performance)
  // Converte stringhe con virgola in float (es. "10,5" -> 10.5)
  const pulisciNumero = (valore) => {
    if (!valore) return null;
    return parseFloat(String(valore).replace(',', '.')); 
  };

  // Converte in intero sicuro
  const pulisciIntero = (valore) => {
    if (!valore) return null;
    return parseInt(valore);
  };

  // 🔄 IMPORTAZIONE FARMACI: USIAMO UN ITERATORE ASINCRONO (for await)
  // Questo permette di leggere il file riga per riga (streaming) senza caricare tutto in RAM, prevenendo crash.
  for await (const row of streamFarmaci) {
    
    // 1. Controllo Validità Riga: Se manca l'AIC (chiave primaria), saltiamo la riga
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
        dosaggio:            row['Dosaggio_Estratto'] || row['Dosaggio_Estratto'],
        confezione:          row['Confezione_Estratta'] || row['CONFEZIONE'],
        unita_misura:        row['Unita_Misura'],

        codice_ditta:        pulisciIntero(row['codice_ditta']),
        quantita_confezione: pulisciNumero(row['Quantita_Num'] || row['quantita']),
        
        json_dati_grezzi:    row // Salviamo il record grezzo per debug o dati extra
    };

    // 3. Aggiungi al blocco corrente
    batch.push(farmaco);

    // 4. BATCH PROCESSING: SE IL BLOCCO È PIENO -> SALVA E SVUOTA
    // Invece di fare una INSERT per ogni riga (lento), ne facciamo una ogni 2000 righe.
    if (batch.length >= BATCH_SIZE) {
        await prisma.farmaci.createMany({
            data: batch,
            skipDuplicates: true, // Ignora errori se l'AIC esiste già
        });
        
        totalProcessed += batch.length;
        console.log(`⏳ Salvati ${totalProcessed} farmaci...`);
        
        batch = []; // 🧹 Svuota la memoria per il prossimo giro
    }
  }

  // 5. SALVA I RIMANENTI (Il "resto" dell'ultimo blocco che non raggiungeva BATCH_SIZE, es. gli ultimi 500 record)
  if (batch.length > 0) {
    await prisma.farmaci.createMany({
        data: batch,
        skipDuplicates: true, 
    });
    totalProcessed += batch.length;
    console.log(`⏳ Salvati gli ultimi ${batch.length} farmaci.`);
  }

  console.log(`✅ FINITO! Totale farmaci inseriti/processati: ${totalProcessed}`);

  // --- Popolamento tabella Allergeni ---
  console.log(`📂 Inizio lettura stream da: ${PERCORSO_ALLERGENI_FILE} per gli allergeni...`);

  if (!fs.existsSync(PERCORSO_ALLERGENI_FILE)) {
    console.warn(`⚠️ ATTENZIONE: Il file ${PERCORSO_ALLERGENI_FILE} non esiste. Saltando l'importazione degli allergeni.`);
  } else {
    // Setup stream per allergeni
    const streamAllergeni = fs.createReadStream(PERCORSO_ALLERGENI_FILE).pipe(csv({ separator: ';' }));
    let batchAllergeni = [];
    let totalAllergeniProcessed = 0;

    // Iterazione stream allergeni
    for await (const row of streamAllergeni) {
      if (!row['principio_attivo']) continue;

      batchAllergeni.push({
        sostanza_allergene: row['principio_attivo'],
      });

      // Batch processing anche per gli allergeni
      if (batchAllergeni.length >= BATCH_SIZE) {
        await prisma.allergeni.createMany({
          data: batchAllergeni,
          skipDuplicates: true,
        });
        totalAllergeniProcessed += batchAllergeni.length;
        console.log(`⏳ Salvati ${totalAllergeniProcessed} allergeni...`);
        batchAllergeni = [];
      }
    }

    // Salvataggio residuo allergeni
    if (batchAllergeni.length > 0) {
      await prisma.allergeni.createMany({
        data: batchAllergeni,
        skipDuplicates: true,
      });
      totalAllergeniProcessed += batchAllergeni.length;
      console.log(`⏳ Salvati gli ultimi ${batchAllergeni.length} allergeni.`);
    }
    console.log(`✅ FINITO! Totale allergeni inseriti/processati: ${totalAllergeniProcessed}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Errore critico durante l'importazione:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Chiude la connessione al DB in ogni caso
    await prisma.$disconnect();
  });
