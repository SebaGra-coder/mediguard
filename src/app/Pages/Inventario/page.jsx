'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
// Usiamo le icone direttamente dalla libreria (assicurati di aver installato: npm install lucide-react)
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  Search, 
  Scan, 
  Plus, 
  Calendar, 
  MoreVertical, 
  Edit, 
  Trash2,
  Menu // Aggiunto per un placeholder della navbar
} from "lucide-react";

// --- MOCK DATA ---
const mockMedicines = [
  {
    id: 1,
    name: "Tachipirina 1000mg",
    activeIngredient: "Paracetamolo",
    quantity: 12,
    totalQuantity: 20,
    expiryDate: "2025-06-15",
    category: "Antidolorifico",
    status: "ok",
  },
  {
    id: 2,
    name: "Moment 200mg",
    activeIngredient: "Ibuprofene",
    quantity: 3,
    totalQuantity: 20,
    expiryDate: "2025-03-20",
    category: "Antinfiammatorio",
    status: "low",
  },
  {
    id: 3,
    name: "Enterogermina",
    activeIngredient: "Bacillus clausii",
    quantity: 8,
    totalQuantity: 10,
    expiryDate: "2024-02-28",
    category: "Probiotico",
    status: "expiring",
  },
  {
    id: 4,
    name: "Augmentin 875mg",
    activeIngredient: "Amoxicillina + Acido Clavulanico",
    quantity: 6,
    totalQuantity: 12,
    expiryDate: "2025-09-10",
    category: "Antibiotico",
    status: "ok",
  },
  {
    id: 5,
    name: "Cardioaspirin 100mg",
    activeIngredient: "Acido Acetilsalicilico",
    quantity: 2,
    totalQuantity: 30,
    expiryDate: "2025-12-01",
    category: "Cardiovascolare",
    status: "critical",
  },
];

// Funzione helper per le badge (sostituisce il componente Badge)
const StatusBadge = ({ status }) => {
  let classes = "px-2 py-0.5 rounded-full text-xs font-semibold ";
  let text = "";

  switch (status) {
    case "ok":
      classes += "bg-green-100 text-green-800";
      text = "In stock";
      break;
    case "low":
      classes += "bg-yellow-100 text-yellow-800";
      text = "Scorta bassa";
      break;
    case "expiring":
      classes += "bg-orange-100 text-orange-800";
      text = "In scadenza";
      break;
    case "critical":
      classes += "bg-red-100 text-red-800";
      text = "Critico";
      break;
    default:
      return null;
  }
  return <span className={classes}>{text}</span>;
};

const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function Inventario({ isAuthenticated = true, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [medicines] = useState(mockMedicines);
  // Stato per gestire il menu dropdown simulato (opzionale per semplicità)
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [risultati, setRisultati] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    low: 0,
    expiring: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/antonio?id_utente=20d16008-0f51-46a1-b522-c086d6c9b4b3");
        const data = await response.json();
        // Se l'API restituisce un oggetto wrapper (es. { data: [...] }), prendiamo l'array interno
        if (data && Array.isArray(data.data)) {
          setRisultati(data.data);
        } else {
          // Altrimenti usiamo data se è già un array, oppure un array vuoto per sicurezza
          setRisultati(Array.isArray(data) ? data : []);
        }
        console.log(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  // Filtra i risultati in base alla query di ricerca (Nome o Principio Attivo)
  const filteredRisultati = risultati.filter((medicine) => {
    const term = searchQuery.toLowerCase();
    const nome = medicine.farmaco?.denominazione?.toLowerCase() || "";
    const principio = medicine.farmaco?.principio_attivo?.toLowerCase() || "";
    return nome.includes(term) || principio.includes(term);
  });

  return (
    <div className="min-h-screen bg-gray-50 relative font-sans text-gray-900">
      
      {/* NAVBAR SIMULATA (Senza import esterni) */}
        <Navbar isAuthenticated={isAuthenticated} onLogout={onLogout} />

      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">Il Mio Armadietto</h1>
              <p className="text-gray-500">
                Gestisci e monitora tutti i tuoi farmaci in un unico posto
              </p>
            </div>
            <div className="flex gap-3">
              {/* Pulsante Scansiona */}
              <Link 
                href="/aggiungi-farmaco" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-gray-300 bg-white shadow-sm hover:bg-gray-100 h-10 px-4 py-2"
              >
                <Scan className="w-4 h-4 mr-2" />
                Scansiona
              </Link>
              
              {/* Pulsante Aggiungi */}
              <Link 
                href="/aggiungi-farmaco" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-emerald-600 text-white shadow hover:bg-emerald-700 h-10 px-4 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {/* Card 1 */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-500">Farmaci totali</p>
                </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.low}</p>
                  <p className="text-sm text-gray-500">Scorte basse</p>
                </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.expiring}</p>
                  <p className="text-sm text-gray-500">In scadenza</p>
                </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Cerca farmaci per nome o principio attivo..."
              className="flex h-12 w-full rounded-md border border-gray-200 bg-white px-3 py-2 pl-12 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Medicine List */}
          <div className="grid gap-4">
            {filteredRisultati.map((medicine, index) => {
              const daysUntilExpiry = getDaysUntilExpiry(medicine.data_scadenza);
              const quantityPercentage = (medicine.quantita_rimanente / medicine.farmaco.quantita_confezione) * 100;
              let progressBarColor = "bg-emerald-500";
              if (quantityPercentage <= 20) progressBarColor = "bg-red-500";
              else if (quantityPercentage <= 50) progressBarColor = "bg-yellow-500";
              const uniqueId = medicine.id_farmaco_armadietto || index;

              return (
                <div key={uniqueId} className="group relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                   {/* Link "invisibile" che copre la card per renderla cliccabile (tranne i bottoni) */}
                   <Link href={`/farmaco/${medicine.id_farmaco_armadietto || index }`} className="absolute inset-0 z-0" />
                   
                   <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{medicine.farmaco.denominazione}</h3>
                          <StatusBadge status={medicine.status} />
                        </div>
                        <p className="text-gray-500 text-sm mb-4">
                          {medicine.farmaco.principio_attivo}
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {/* Quantity */}
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-500">Quantità</span>
                              <span className="font-medium">{medicine.quantita_rimanente}/{medicine.farmaco.quantita_confezione}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${progressBarColor}`}
                                style={{ width: `${quantityPercentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Expiry */}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              <span className="text-gray-500">Scade: </span>
                              <span className={`font-medium ${daysUntilExpiry < 30 ? "text-red-600" : "text-gray-900"}`}>
                                {new Date(medicine.data_scadenza).toLocaleDateString("it-IT")}
                              </span>
                              {daysUntilExpiry < 30 && daysUntilExpiry > 0 && (
                                <span className="text-red-600 text-xs ml-2">
                                  ({daysUntilExpiry} giorni)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Menu "Finto" - Per semplicità in questo esempio statico, al click non fa nulla o si può espandere */}
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                        onClick={(e) => {
                             e.preventDefault(); 
                             setOpenDropdownId(openDropdownId === uniqueId ? null : uniqueId)
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {/* Menu a tendina manuale (se aperto) */}
                      {openDropdownId === uniqueId && (
                          <div className="absolute right-6 top-12 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-20">
                             <Link href={`/farmaco/${medicine.id_farmaco_armadietto || uniqueId}`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Edit className="w-4 h-4 mr-2" /> Modifica
                             </Link>
                             <Link href={`/nuova-terapia?farmaco=${uniqueId}`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Calendar className="w-4 h-4 mr-2" /> Aggiungi a terapia
                             </Link>
                             <button className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4 mr-2" /> Elimina
                             </button>
                          </div>
                      )}
                    </div>
                </div>
              );
            })}
          </div>

          {filteredRisultati.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2 text-gray-900">Nessun farmaco trovato</h3>
              <p className="text-gray-500">
                Prova a modificare la ricerca o aggiungi un nuovo farmaco.
              </p>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer Semplificato */}
      <footer className="border-t py-8 mt-8 text-center text-sm text-gray-500">
          <p>© 2024 MediGuard. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
}