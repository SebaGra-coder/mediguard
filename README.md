````markdown
# 🏥 MediGuard

Piattaforma per la gestione dell'inventario farmaceutico domestico con supporto IoT.

## 🚀 Prerequisiti

Prima di iniziare, assicurati di avere installato sul tuo computer:

1.  **Node.js** (versione 18 o superiore) - [Scarica qui](https://nodejs.org/)
2.  **Git** - [Scarica qui](https://git-scm.com/)
3.  **Docker Desktop** (necessario per il Database) - [Scarica qui](https://www.docker.com/products/docker-desktop/)
4.  **VS Code** (consigliato)

---

## 🛠️ Installazione (Solo la prima volta)

Esegui questi passaggi nell'ordine esatto:

### 1. Clona il Repository
Apri il terminale nella cartella dove vuoi salvare il progetto:
```bash
git clone [https://github.com/TUO_NOME_UTENTE/mediguard.git](https://github.com/TUO_NOME_UTENTE/mediguard.git)
cd mediguard
````

### 2\. Installa le dipendenze

Scarica le librerie di Next.js, React, ecc.

```bash
npm install
```

### 3\. Configura le variabili d'ambiente (.env)

Il file `.env` non è su GitHub per sicurezza.

1.  Crea un file chiamato `.env` nella cartella principale del progetto.
2.  Incollaci dentro le chiavi condivise nel gruppo (o chiedi al Team Lead).

*Esempio di contenuto .env:*

```env
# URL per connettersi al DB Docker locale
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mediguard"

# URL per Auth (in locale)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="segreto-temporaneo-sviluppo"
```

### 4\. Avvia il Database (via Docker)

Non serve avviare tutta l'app con Docker, ci serve solo il Database acceso:

```bash
docker-compose up -d postgres
```

*(Assicurati che Docker Desktop sia aperto\!)*

### 5\. Sincronizza il Database (Prisma)

Crea le tabelle nel tuo database locale vuoto:

```bash
npx prisma db push
```

-----

## ▶️ Avvio Sviluppo (Ogni giorno)

Ogni volta che vuoi lavorare, esegui:

1.  Assicurati che il container del DB sia acceso: `docker-compose up -d postgres`
2.  Avvia l'app Next.js:

<!-- end list -->

```bash
npm run dev
```

3.  Apri il browser su: [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

-----

## 🔄 Workflow di Sviluppo (Guida Git)

[Image of git feature branch workflow diagram]

Segui **sempre** questi passaggi per evitare conflitti e non rompere il progetto agli altri.

### 1\. Iniziare una nuova task (Start)

Prima di scrivere codice, scarica gli aggiornamenti degli altri e crea il tuo spazio di lavoro.

```bash
# 1. Spostati sul ramo principale
git checkout main

# 2. Scarica gli aggiornamenti dal cloud
git pull

# 3. Crea il tuo ramo (es. feature/login-page)
git checkout -b feature/nome-tua-funzionalita
```

### 2\. Salvare il lavoro (Save)

Hai modificato dei file? Salviamoli nella "scatola" (Commit).

```bash
# 1. Controlla cosa hai modificato (Rosso = non aggiunto, Verde = aggiunto)
git status

# 2. Aggiungi tutti i file modificati al carrello
git add .

# 3. Chiudi il pacco con un messaggio chiaro
git commit -m "Descrizione breve di cosa ho fatto"
```

### 3\. Inviare su GitHub (Push)

Manda il tuo ramo nel cloud.

```bash
# La prima volta che invii un nuovo ramo:
git push -u origin feature/nome-tua-funzionalita

# Le volte successive basta:
git push
```

### 4. Unire il lavoro (Pull Request)
> **❓ Cos'è una Pull Request (PR)?**
> È una "Sala d'Attesa" per il tuo codice. Invece di buttare le modifiche direttamente nel progetto finale, chiedi al team di controllarle.
> 1. **Tu** proponi la modifica (la PR).
> 2. **I colleghi** leggono il codice per cercare errori (Review).
> 3. **Solo se approvato**, il codice viene incollato nel progetto principale (Merge).

**Come si fa:**
1.  Vai sulla pagina GitHub del progetto dopo aver fatto il push.
2.  Vedrai un banner giallo "Compare & pull request". Cliccalo.
3.  Scrivi un titolo chiaro (es. "Creata pagina Login") e clicca **Create Pull Request**.
4.  Avvisa il team: *"Ragazzi ho aperto la PR, mi date un'occhiata?"*.
5.  Quando ricevi l'approvazione, clicca il tasto verde **Merge**.


----
## 🔍 Come testare una Pull Request (PR)

Se un collega ha aperto una PR e vuoi **provare le modifiche sul tuo PC** (vedere la grafica, cliccare i bottoni) prima di approvarle:

1.  **Scarica i rami aggiornati:**
    ```bash
    git fetch
    ```
2.  **Entra nel ramo del collega:**
    ```bash
    git checkout feature/nome-del-ramo-collega
    ```
3.  **Aggiorna l'ambiente (Fondamentale!):**
    Il collega potrebbe aver aggiunto librerie o cambiato il DB. Se non fai questo, l'app si rompe.
    ```bash
    npm install
    npx prisma db push
    ```
4.  **Prova l'app:**
    Avvia `npm run dev` e testa le nuove funzioni su [http://localhost:3000](http://localhost:3000).
5.  **Torna indietro:**
    Quando hai finito il test, spegni il server e torna sul ramo principale:
    ```bash
    git checkout main
    ```

## 🆘 Risoluzione Problemi Comuni

### Errore: "Author identity unknown"

Se Git ti dice che non sa chi sei quando fai il commit:

```bash
git config --global user.name "Tuo Nome"
git config --global user.email "tua@email.com"
```

### Errore: "Updates were rejected because the remote contains work..."

Significa che qualcuno ha modificato il file prima di te.

1.  Fai `git pull` per scaricare le loro modifiche.
2.  Se ci sono conflitti, apri i file in VS Code, risolvili (scegli quale codice tenere).
3.  Fai `git add .`, `git commit` e poi `git push`.

-----

## ⚠️ Regole del Team

  * **Database:** Se modifichi `prisma/schema.prisma`, avvisa tutti\! Gli altri dovranno fare `git pull` e `npx prisma db push`.
  * **Cartelle:**
      * Backend: `app/api/...`
      * Frontend: `app/(pages)/...`
  * **Main:** Vietato fare `push` direttamente su `main`. Si passa sempre dalle Pull Request.

-----

## 🧪 Comandi Utili

  * **Vedere il DB con interfaccia grafica:**
    ```bash
    npx prisma studio
    ```
  * **Resettare il DB (Cancella tutto\!):**
    ```bash
    npx prisma migrate reset
    ```
