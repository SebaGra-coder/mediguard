
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
git clone [https://github.com/SebaGra-coder/mediguard.git](https://github.com/SebaGra-coder/mediguard.git)
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

## ▶️ Avvio Sviluppo

Ogni volta che vuoi lavorare, esegui:

1.  Assicurati che il container del DB sia acceso (`docker ps`).
2.  Avvia l'app Next.js:

<!-- end list -->

```bash
npm run dev
```

3.  Apri il browser su: [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

-----

## ⚠️ Regole del Team

### 1\. Aggiornamento Database

Se qualcuno modifica il file `prisma/schema.prisma` e fa il push, tu devi:

1.  Scaricare le modifiche: `git pull`
2.  Aggiornare il tuo DB locale: `npx prisma db push`
3.  Riavviare il server (`npm run dev`) se necessario.

### 2\. Struttura Cartelle

  * **Frontend:** Lavorate dentro `app/(pages)/...` e `components/`.
  * **Backend:** Lavorate dentro `app/api/...`.
  * **Database:** Modifiche solo concordate su `prisma/schema.prisma`.

### 3\. Git Flow

  * **NON** lavorare mai direttamente su `main`.
  * Crea un branch per la tua feature: `git checkout -b feature/nome-tua-feature`.
  * Quando hai finito, fai una Pull Request.

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

<!-- end list -->