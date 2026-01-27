import { useState, useCallback } from 'react';

export function useTherapies() {
    const [therapyPlans, setTherapyPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTherapies = useCallback(async (userId) => {
        if (!userId) return;
        
        setIsLoading(true);
        try {
            const res = await fetch(`/api/terapia?id_paziente=${userId}`);
            const json = await res.json();
            
            if (json.success && Array.isArray(json.data)) {
                const mappedPlans = json.data.map(t => ({
                    id: t.id_terapia,
                    medicine: t.nome_utilita || t.farmaco?.farmaco?.denominazione || "Farmaco sconosciuto",
                    dosaggio: t.dose_singola + (t.farmaco?.farmaco?.unita_misura || ""),
                    frequency: t.solo_al_bisogno
                        ? "Al bisogno"
                        : (() => {
                            const dateValide = (t.assunzioni || [])
                                .map(a => new Date(a.data_programmata))
                                .filter(d => !isNaN(d.getTime()))
                                .sort((a, b) => a - b);

                            if (dateValide.length === 0) return "N/D";
                            const primoGiornoIso = dateValide[0].toISOString().split('T')[0];
                            const assunzioniGiornaliere = new Set(
                                dateValide
                                    .filter(d => d.toISOString().startsWith(primoGiornoIso))
                                    .map(d => d.toISOString().split('T')[1].slice(0, 5))
                            );

                            return assunzioniGiornaliere.size > 0
                                ? `${assunzioniGiornaliere.size} volte al giorno`
                                : "N/D";
                        })(),
                    duration: t.data_fine ? "Fino a: " + t.data_fine.split('T')[0] : "Continuativa",
                    startDate: t.data_inizio ? t.data_inizio.split('T')[0] : "",
                    endDate: t.data_fine ? t.data_fine.split('T')[0] : "",
                    adherence: (() => {
                        const now = new Date();
                        const endOfToday = new Date(now);
                        endOfToday.setHours(23, 59, 59, 999);
                        
                        const relevantIntakes = (t.assunzioni || []).filter(a => new Date(a.data_programmata) <= endOfToday);
                        if (relevantIntakes.length === 0) return 0;
                        const taken = relevantIntakes.filter(a => a.esito === true).length;
                        return Math.round((taken / relevantIntakes.length) * 100);
                    })(),
                    orari: (Array.isArray(t.orari) && t.orari.length > 0) 
                        ? t.orari 
                        : Array.from(new Set((t.assunzioni || []).map(a => {
                            return a.data_programmata.split('T')[1].slice(0, 5);
                        }))).sort(),
                    stato: t.terapia_attiva ? "attiva" : "sospesa",
                    originalData: t
                }));
                setTherapyPlans(mappedPlans);
            }
        } catch (err) {
            console.error("Errore caricamento terapie", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { therapyPlans, fetchTherapies, isLoading };
}