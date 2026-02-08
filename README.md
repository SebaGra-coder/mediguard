# 🏥 MediGuard

Piattaforma per la gestione dell'inventario farmaceutico domestico con supporto IoT.

## 🚀 Prerequisiti

Per avviare il progetto su qualsiasi computer, assicurati di avere installati:

1.  **Node.js** (v18 o superiore) - [Scarica qui](https://nodejs.org/)
2.  **Git** - [Scarica qui](https://git-scm.com/)
3.  **Docker Desktop** (Necessario per il database locale) - [Scarica qui](https://www.docker.com/products/docker-desktop/)

---

## 🛠️ Installazione e Setup Iniziale

Esegui questi comandi nel terminale, passo dopo passo.

### 1. Clona il Repository
```bash
git clone <https://github.com/SebaGra-coder/mediguard.git>
cd mediguard
```

### 2. Installa le dipendenze
Scarica tutte le librerie necessarie (Next.js, React, Prisma, ecc.) tramite npm:
```bash
npm install
```

### 3. Configura l'Ambiente (.env)
Crea un file chiamato `.env` nella root del progetto (accanto a `package.json`) e incollaci dentro la seguente configurazione.
**Nota:** Chiedi al team le chiavi reali per `JWT_SECRET` e VAPID, oppure generane di nuove per test locale.

```env
# --- DATABASE ---
# Connessione al DB Postgres gestito da Docker
# NOTA: Deve corrispondere alle credenziali in docker-compose.yml
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mediguard_db"

# --- SICUREZZA & AUTH ---
# Una stringa casuale lunga per firmare i token di login
JWT_SECRET="super-segreto-random-string-123!"

# --- NOTIFICHE PUSH (WebPush) ---
# Generabili con il comando: npx web-push generate-vapid-keys
VAPID_SUBJECT="mailto:tuo-email@example.com"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="incolla_qui_la_tua_chiave_pubblica"
VAPID_PRIVATE_KEY="incolla_qui_la_tua_chiave_privata"
```

### 4. Avvia il Database (Docker)
Avvia il container Postgres in background:
```bash
docker-compose up -d postgres
```
> *Verifica che Docker Desktop sia aperto se il comando fallisce.*

### 5. Inizializza il Database
Crea le tabelle e popola il database con i dati iniziali (farmaci, ecc.):
```bash
# Crea lo schema delle tabelle
npx prisma db push

# (Opzionale) Carica i dati di prova/iniziali se presenti nel seed
node prisma/seed.js
```

---

## ▶️ Avvio del Progetto

Una volta completato il setup iniziale, per lavorare ogni giorno ti basta fare:

1.  Assicurati che il DB sia acceso (se hai riavviato il PC):
    ```bash
    docker-compose up -d postgres
    ```
2.  Avvia il server di sviluppo:
    ```bash
    npm run dev
    ```
3.  Apri il browser su: [http://localhost:3000](http://localhost:3000)

---

## 🔧 Comandi Utili

| Comando | Descrizione |
| :--- | :--- |
| `npx prisma studio` | Apre un pannello web per vedere e modificare i dati nel DB manualmente. |
| `npx prisma db push` | Aggiorna il DB se hai modificato il file `schema.prisma`. |
| `docker-compose down` | Spegne il database (i dati rimangono salvati nel volume Docker). |

## 🆘 Risoluzione Problemi

**Errore connessione DB (`P1001`):**
*   Controlla che Docker sia acceso.
*   Controlla che `DATABASE_URL` nel `.env` usi la porta `5432` e il nome database `mediguard_db`.

**Errore Login:**
*   Verifica di aver impostato `JWT_SECRET` nel `.env`.

**Notifiche non funzionano:**
*   Assicurati di aver generato e inserito le chiavi VAPID nel `.env`.