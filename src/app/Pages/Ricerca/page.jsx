'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddMedicationModal from "../../../components/modals/AddMedicationModal";
import styles from "./Ricerca.module.css";
import { Icons } from "@/components/ui/Icons";

// -- ICONE SVG INLINE --

export default function Ricerca({ isAuthenticated: initialAuth = false }) {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [risultati, setRisultati] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  // Stati per il Modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  
  // Stati per le allergie
  const [userAllergies, setUserAllergies] = useState([]);

  // NUOVO: Stato per gestire la paginazione
  const ITEMS_PER_PAGE = 5;
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setIsUserAuthenticated(data.isAuthenticated);
        if (data.isAuthenticated) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Errore verifica auth", err);
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();

    if (searchQuery.length < 3) {
      setRisultati([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/farmaci/cerca?q=${encodeURIComponent(searchQuery)}`);

        if (!res.ok) throw new Error("Errore API");

        const data = await res.json();
        setRisultati(data.farmaci || []);
        setHasSearched(true);
        setVisibleCount(ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Errore ricerca:", error);
        setRisultati([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Allergie quando l'utente è loggato
  useEffect(() => {
    if (currentUser?.id_utente) {
      fetch(`/api/CRUD-allergia-utente?id_utente=${currentUser.id_utente}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && Array.isArray(data.data)) {
                // Mappiamo solo i nomi delle sostanze, lowercase per confronto facile
                setUserAllergies(data.data.map(item => item.allergene.sostanza_allergene.toLowerCase()));
            }
        })
        .catch(err => console.error("Error fetching allergies", err));
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsUserAuthenticated(false);
      setCurrentUser(null);
      window.location.href = '/Pages/Autenticazione';
    } catch (err) {
      console.error("Errore logout", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // --- LOGICA AGGIUNTA ARMADIETTO ---
  const handleAddToCabinet = (medicine) => {
    if (!isUserAuthenticated) {
      router.push('/Pages/Autenticazione');
      return;
    }
    
    setSelectedMedication(medicine);
    setIsModalOpen(true);
  };

  if (isAuthChecking) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.pageSpinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      
      <main className={styles.mainContent}>
        <div className={styles.container}>

          {/* Header */}
          <div className={styles.header}>
            <span className={styles.headerBadge}>
              Accesso libero - Nessuna registrazione richiesta
            </span>
            <h1 className={styles.title}>
              Database Farmaci <span className={styles.highlightText}>AIFA</span>
            </h1>
            <p className={styles.subtitle}>
              Cerca informazioni dettagliate su qualsiasi farmaco autorizzato in Italia.
              Dati ufficiali verificati e sempre aggiornati.
            </p>
          </div>

          {/* Search Box */}
          <div className={styles.searchContainer}>
            <div className={styles.searchContent}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.inputWrapper}>
                  <div className={styles.searchIcon}>
                    <Icons.Search width={20} height={20} />
                  </div>
                  <input
                    placeholder="Cerca per nome farmaco, principio attivo o codice AIC..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {loading && (
                    <div className={styles.loadingSpinnerWrapper}>
                      <div className={styles.loadingSpinner}></div>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className={styles.searchButton}
                >
                  Cerca
                </button>
              </form>
              <div className={styles.searchFooter}>
                <button className={styles.scanButton}>
                  <Icons.Scan width={16} height={16} />
                  Scansiona barcode
                </button>
                <span>•</span>
                <span>Esempio: "Tachipirina", "Paracetamolo"</span>
              </div>
            </div>
          </div>

          {/* LISTA FARMACI */}
          {hasSearched && risultati.length > 0 ?(
            <div className={styles.resultsContainer}>
              {risultati.slice(0, visibleCount).map((medicine, index) => (
                <div
                  key={medicine.codice_aic || index}
                  className={`${styles.card} ${styles.fadeInAnim}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Contenuto Superiore */}
                  <div className={styles.cardContent}>

                    <div className={styles.cardIcon}>
                      <Icons.Pill />
                    </div>

                    <div className={styles.cardDetails}>
                      <div className={styles.cardTitleRow}>
                        <div>
                          <h3 className={styles.cardTitle}>
                            {medicine.denominazione} {medicine.dosaggio}
                          </h3>
                          <p className={styles.cardSubtitle}>
                            {medicine.principio_attivo}
                          </p>
                        </div>
                        <span className={styles.measureBadge}>
                          {medicine.unita_misura}
                        </span>
                      </div>

                      <p className={styles.cardDescription}>
                        {medicine.descrizione}
                      </p>

                      {/* Warning Allergie */}
                      {(() => {
                        if (!medicine.principio_attivo || userAllergies.length === 0) return null;
                        const pa = medicine.principio_attivo.toLowerCase();
                        const conflict = userAllergies.find(allergy => pa.includes(allergy));
                        
                        if (conflict) {
                          return (
                            <div className={styles.warningBox}>
                               <div className={styles.warningIcon}><Icons.AlertTriangle width={20} height={20} /></div>
                               <div>
                                 <p className={styles.warningTitle}>Attenzione: Possibile allergia</p>
                                 <p className={styles.warningText}>
                                   Contiene <span className={styles.warningHighlight}>{conflict}</span>, presente nelle tue allergie.
                                 </p>
                               </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className={styles.cardInfoRow}>
                        <span className={styles.companyName}>{medicine.ragione_sociale}</span>
                        <span>• AIC: {medicine.codice_aic}</span>
                        <span className={styles.categoryBadge}>
                          {medicine.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Azioni Compatte */}
                  <div className={styles.cardActions}>
                    <button 
                      onClick={() => handleAddToCabinet(medicine)}
                      className={styles.addButton}
                    >
                      <span className={styles.buttonIcon}><Icons.Plus width={16} height={16} /></span> Aggiungi al mio armadietto
                    </button>
                  </div>

                </div>
              ))}

              {/* Load More Button */}
              {visibleCount < risultati.length && (
                <div className={styles.loadMoreContainer}>
                  <button
                    onClick={loadMore}
                    className={styles.loadMoreButton}
                  >
                    Carica altri
                    <span className={styles.loadMoreIcon}><Icons.ChevronDown width={16} height={16} /></span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>
                <Icons.Pill />
              </div>
              <h3 className={styles.cardTitle} style={{textAlign: 'center', marginBottom: '0.5rem'}}>Nessun risultato trovato</h3>
              <p className={styles.subtitle} style={{textAlign: 'center', fontSize: '0.875rem'}}>
                Prova con un altro termine di ricerca o verifica l'ortografia.
              </p>
            </div>
          )}

          {/* Empty State - Before Search */}
          {!hasSearched && (
            <div className={styles.resultsContainer}>
              <div className={styles.featuresGrid}>
                <div className={`${styles.featureCard} ${styles.featureCardPrimary}`}>
                  <div className={`${styles.featureIcon} ${styles.featureIconPrimary}`}>
                    <Icons.Pill />
                  </div>
                  <h3 className={styles.cardTitle} style={{marginBottom: '0.5rem', fontSize: '1rem'}}>Database Ufficiale</h3>
                  <p className={styles.subtitle} style={{fontSize: '0.875rem'}}>
                    Dati provenienti direttamente dall'Agenzia Italiana del Farmaco
                  </p>
                </div>
                <div className={`${styles.featureCard} ${styles.featureCardGreen}`}>
                  <div className={`${styles.featureIcon} ${styles.featureIconGreen}`}>
                    <Icons.FileText width={16} height={16} />
                  </div>
                  <h3 className={styles.cardTitle} style={{marginBottom: '0.5rem', fontSize: '1rem'}}>Informazioni Complete</h3>
                  <p className={styles.subtitle} style={{fontSize: '0.875rem'}}>
                    Schede tecniche, foglietti illustrativi e controindicazioni
                  </p>
                </div>
                <div className={`${styles.featureCard} ${styles.featureCardAmber}`}>
                  <div className={`${styles.featureIcon} ${styles.featureIconAmber}`}>
                    <Icons.AlertTriangle width={20} height={20} />
                  </div>
                  <h3 className={styles.cardTitle} style={{marginBottom: '0.5rem', fontSize: '1rem'}}>Verifica Interazioni</h3>
                  <p className={styles.subtitle} style={{fontSize: '0.875rem'}}>
                    Controlla le interazioni tra farmaci per la tua sicurezza
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            © {new Date().getFullYear()} MediGuard. Dati forniti da AIFA.
          </div>
        </div>
      </footer>

      {/* MODALE PER AGGIUNGERE FARMACO */}
      <AddMedicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userId={currentUser?.id_utente}
        preSelectedMedication={selectedMedication}
        userAllergies={userAllergies}
        onSuccess={(msg) => alert(msg)}
      />
    </div>
  );
}