-- DropForeignKey
ALTER TABLE "piano_terapeutico" DROP CONSTRAINT "piano_terapeutico_id_farmaco_armadietto_fkey";

-- AlterTable
ALTER TABLE "piano_terapeutico" ALTER COLUMN "id_farmaco_armadietto" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "piano_terapeutico" ADD CONSTRAINT "piano_terapeutico_id_farmaco_armadietto_fkey" FOREIGN KEY ("id_farmaco_armadietto") REFERENCES "farmaco_armadietto"("id_farmaco_armadietto") ON DELETE SET NULL ON UPDATE CASCADE;
