-- CreateEnum
CREATE TYPE "Permessi" AS ENUM ('NIENTE', 'SOLO_LETTURA', 'ADMIN');

-- CreateTable
CREATE TABLE "utente" (
    "id_utente" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_cifrata" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "data_nascita" TIMESTAMP(3) NOT NULL,
    "account_attivo" BOOLEAN NOT NULL,
    "permessi_armadietto" "Permessi" NOT NULL,
    "permessi_piano" "Permessi" NOT NULL,

    CONSTRAINT "utente_pkey" PRIMARY KEY ("id_utente")
);

-- CreateTable
CREATE TABLE "farmaci" (
    "codice_aic" TEXT NOT NULL,
    "codice_atc" TEXT,
    "denominazione" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "codice_ditta" INTEGER,
    "ragione_sociale" TEXT NOT NULL,
    "forma" TEXT NOT NULL,
    "principio_attivo" TEXT NOT NULL,
    "dosaggio" TEXT,
    "confezione" TEXT,
    "quantita_confezione" DOUBLE PRECISION,
    "unita_misura" TEXT,
    "json_dati_grezzi" JSONB
);

-- CreateTable
CREATE TABLE "sottoscrizione_web_push" (
    "id_sottoscrizione" UUID NOT NULL,
    "id_utente" UUID NOT NULL,
    "endpoint_browser" TEXT NOT NULL,
    "chiavi_cifratura_json" JSONB NOT NULL,
    "user_agent" TEXT NOT NULL,
    "data_creazione" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sottoscrizione_web_push_pkey" PRIMARY KEY ("id_sottoscrizione")
);

-- CreateTable
CREATE TABLE "allergia_utente" (
    "id_allergia" UUID NOT NULL,
    "id_utente" UUID NOT NULL,
    "id_allergene" UUID NOT NULL,
    "gravita_reazione" INTEGER NOT NULL,

    CONSTRAINT "allergia_utente_pkey" PRIMARY KEY ("id_allergia")
);

-- CreateTable
CREATE TABLE "allergeni" (
    "id_allergene" UUID NOT NULL,
    "sostanza_allergene" TEXT NOT NULL,

    CONSTRAINT "allergeni_pkey" PRIMARY KEY ("id_allergene")
);

-- CreateTable
CREATE TABLE "relazione" (
    "id_relazione" UUID NOT NULL,
    "id_caregiver" UUID NOT NULL,
    "id_assistito" UUID NOT NULL,
    "permessi_armadietto" "Permessi" NOT NULL,
    "permessi_piano" "Permessi" NOT NULL,

    CONSTRAINT "relazione_pkey" PRIMARY KEY ("id_relazione")
);

-- CreateTable
CREATE TABLE "farmaco_armadietto" (
    "id_farmaco_armadietto" UUID NOT NULL,
    "id_utente_proprietario" UUID NOT NULL,
    "codice_aic" TEXT NOT NULL,
    "data_scadenza" TIMESTAMP(3) NOT NULL,
    "lotto_produzione" TEXT NOT NULL,
    "quantita_rimanente" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "farmaco_armadietto_pkey" PRIMARY KEY ("id_farmaco_armadietto")
);

-- CreateTable
CREATE TABLE "farmaco_armadietto_disuso" (
    "id_storico" UUID NOT NULL,
    "id_utente_proprietario" UUID NOT NULL,
    "codice_aic" TEXT NOT NULL,
    "data_scadenza" TIMESTAMP(3) NOT NULL,
    "lotto_produzione" TEXT NOT NULL,
    "quantita_rimanente" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "farmaco_armadietto_disuso_pkey" PRIMARY KEY ("id_storico")
);

-- CreateTable
CREATE TABLE "piano_terapeutico" (
    "id_terapia" UUID NOT NULL,
    "id_paziente" UUID NOT NULL,
    "id_farmaco_armadietto" UUID NOT NULL,
    "nome_utilita" TEXT NOT NULL,
    "dose_singola" DOUBLE PRECISION NOT NULL,
    "solo_al_bisogno" BOOLEAN NOT NULL,
    "terapia_attiva" BOOLEAN NOT NULL,
    "for_life" BOOLEAN NOT NULL,

    CONSTRAINT "piano_terapeutico_pkey" PRIMARY KEY ("id_terapia")
);

-- CreateTable
CREATE TABLE "registro_assunzioni" (
    "id_evento" UUID NOT NULL,
    "id_terapia" UUID NOT NULL,
    "data_programmata" TIMESTAMP(3) NOT NULL,
    "orario_effettivo" TIMESTAMP(3) NOT NULL,
    "esito" BOOLEAN NOT NULL,

    CONSTRAINT "registro_assunzioni_pkey" PRIMARY KEY ("id_evento")
);

-- CreateTable
CREATE TABLE "registro_assunzioni_passate" (
    "id_storico" UUID NOT NULL,
    "id_terapia" UUID NOT NULL,
    "data_programmata" TIMESTAMP(3) NOT NULL,
    "orario_effettivo" TIMESTAMP(3) NOT NULL,
    "esito" BOOLEAN NOT NULL,

    CONSTRAINT "registro_assunzioni_passate_pkey" PRIMARY KEY ("id_storico")
);

-- CreateIndex
CREATE UNIQUE INDEX "farmaci_codice_aic_key" ON "farmaci"("codice_aic");

-- AddForeignKey
ALTER TABLE "sottoscrizione_web_push" ADD CONSTRAINT "sottoscrizione_web_push_id_utente_fkey" FOREIGN KEY ("id_utente") REFERENCES "utente"("id_utente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergia_utente" ADD CONSTRAINT "allergia_utente_id_utente_fkey" FOREIGN KEY ("id_utente") REFERENCES "utente"("id_utente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergia_utente" ADD CONSTRAINT "allergia_utente_id_allergene_fkey" FOREIGN KEY ("id_allergene") REFERENCES "allergeni"("id_allergene") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relazione" ADD CONSTRAINT "relazione_id_caregiver_fkey" FOREIGN KEY ("id_caregiver") REFERENCES "utente"("id_utente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relazione" ADD CONSTRAINT "relazione_id_assistito_fkey" FOREIGN KEY ("id_assistito") REFERENCES "utente"("id_utente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmaco_armadietto" ADD CONSTRAINT "farmaco_armadietto_id_utente_proprietario_fkey" FOREIGN KEY ("id_utente_proprietario") REFERENCES "utente"("id_utente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmaco_armadietto" ADD CONSTRAINT "farmaco_armadietto_codice_aic_fkey" FOREIGN KEY ("codice_aic") REFERENCES "farmaci"("codice_aic") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmaco_armadietto_disuso" ADD CONSTRAINT "farmaco_armadietto_disuso_id_utente_proprietario_fkey" FOREIGN KEY ("id_utente_proprietario") REFERENCES "utente"("id_utente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piano_terapeutico" ADD CONSTRAINT "piano_terapeutico_id_paziente_fkey" FOREIGN KEY ("id_paziente") REFERENCES "utente"("id_utente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_assunzioni" ADD CONSTRAINT "registro_assunzioni_id_terapia_fkey" FOREIGN KEY ("id_terapia") REFERENCES "piano_terapeutico"("id_terapia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_assunzioni_passate" ADD CONSTRAINT "registro_assunzioni_passate_id_terapia_fkey" FOREIGN KEY ("id_terapia") REFERENCES "piano_terapeutico"("id_terapia") ON DELETE RESTRICT ON UPDATE CASCADE;
