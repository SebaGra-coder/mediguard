-- AddForeignKey
ALTER TABLE "piano_terapeutico" ADD CONSTRAINT "piano_terapeutico_id_farmaco_armadietto_fkey" FOREIGN KEY ("id_farmaco_armadietto") REFERENCES "farmaco_armadietto"("id_farmaco_armadietto") ON DELETE RESTRICT ON UPDATE CASCADE;
