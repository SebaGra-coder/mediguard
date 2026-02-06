/*
  Warnings:

  - You are about to drop the column `note` on the `farmaco_armadietto` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `farmaco_armadietto_disuso` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "registro_assunzioni" DROP CONSTRAINT "registro_assunzioni_id_terapia_fkey";

-- AlterTable
ALTER TABLE "farmaco_armadietto" DROP COLUMN "note";

-- AlterTable
ALTER TABLE "farmaco_armadietto_disuso" DROP COLUMN "note";

-- AlterTable
ALTER TABLE "piano_terapeutico" ADD COLUMN     "note" TEXT;

-- AddForeignKey
ALTER TABLE "registro_assunzioni" ADD CONSTRAINT "registro_assunzioni_id_terapia_fkey" FOREIGN KEY ("id_terapia") REFERENCES "piano_terapeutico"("id_terapia") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_assunzioni_passate" ADD CONSTRAINT "registro_assunzioni_passate_id_terapia_fkey" FOREIGN KEY ("id_terapia") REFERENCES "piano_terapeutico"("id_terapia") ON DELETE SET NULL ON UPDATE CASCADE;
