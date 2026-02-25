'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GuestOverlay } from "@/components/GuestOverlay";
import AddMedicationModal from "@/components/modals/AddMedicationModal";
import EditMedicationModal from "@/components/modals/EditMedicationModal";
import DeleteMedicationModal from "@/components/modals/DeleteMedicationModal";
import AddTherapyModal from "@/components/modals/AddTherapyModal";
import { useToast } from "@/hooks/useToast";
import styles from "./Armadietto.module.css";

// --- ICONE SVG INTERNE ---
const Icons = {
  Package: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-9"/></svg>,
  AlertTriangle: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>,
  Clock: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Search: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Plus: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Calendar: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  MoreVertical: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  Edit: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  Trash2: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>,
};

const Button = ({ children, onClick, variant = "primary", className = "", type = "button", disabled }) => {
  const variantClass = variant === "primary" ? styles.btnPrimary : styles.btnSecondary;
  return <button type={type} onClick={onClick} disabled={disabled} className={`${styles.btn} ${variantClass} ${className}`}>{children}</button>;
};

// --- FUNZIONI HELPER ---
const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return 999;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getMedicineStatus = (med, totalQtyOverride = null) => {
  const days = getDaysUntilExpiry(med.data_scadenza);
  
  // Use total quantity if provided, otherwise fallback to item's quantity
  const qtyToCheck = totalQtyOverride !== null ? totalQtyOverride : med.quantita_rimanente;
  const maxQty = med.farmaco?.quantita_confezione || 100;
  
  // Calculate percentage based on total quantity vs single package size
  // This logic implies: "Is my TOTAL supply less than 50% of a STANDARD package?"
  const qtyPercent = (qtyToCheck / maxQty) * 100;

  if (med.quantita_rimanente <= 0) return "terminated";
  if (days <= 0) return "expired";
  if (days <= 30) return "expiring";
  
  // "Low" status is now based on the aggregate quantity
  if (qtyPercent < 50) return "low";
  
  return "ok";
};

const StatusBadge = ({ status }) => {
  const statusClasses = {
    ok: styles.badgeOk,
    low: styles.badgeLow,
    expiring: styles.badgeExpiring,
    expired: styles.badgeExpired,
    terminated: styles.badgeTerminated,
  };
  const labels = { ok: "Disponibile", low: "Scorta Bassa", expiring: "In Scadenza", expired: "Scaduto", terminated: "Terminato" };
  return <span className={`${styles.badge} ${statusClasses[status] || styles.badgeOk}`}>{labels[status] || "Sconosciuto"}</span>;
};

// --- COMPONENTE PRINCIPALE ---
export default function Inventario({ isAuthenticated: initialAuth = false }) {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [stats, setStats] = useState({ total: 0, low: 0, expiring: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const { showToast, ToastComponent } = useToast();

  // Stato Modali
  const [modalState, setModalState] = useState({ type: null, data: null }); // type: 'add' | 'edit' | 'delete' | 'therapy'

  const fetchData = useCallback(async (userId) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/armadietto?id_utente=" + userId);
      const json = await response.json();
      const rawData = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      
      // Calculate total quantity per AIC
      const quantityMap = {};
      rawData.forEach(item => {
        const aic = item.codice_aic;
        if (!quantityMap[aic]) quantityMap[aic] = 0;
        quantityMap[aic] += item.quantita_rimanente;
      });

      const processedData = rawData.map(item => ({
        ...item,
        computedStatus: getMedicineStatus(item, quantityMap[item.codice_aic])
      }));

      setMedicines(processedData);
      setStats({
        total: processedData.length,
        low: processedData.filter(m => ['low'].includes(m.computedStatus)).length, // terminated doesn't count as low stock warning, it's empty.
        expiring: processedData.filter(m => ['expiring', 'expired'].includes(m.computedStatus)).length
      });
    } catch (error) {
      console.error("Errore caricamento farmaci:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setIsUserAuthenticated(data.isAuthenticated);
        if (data.isAuthenticated && data.user) {
            setCurrentUser(data.user);
            fetchData(data.user.id_utente);
        } else {
            setIsLoading(false);
        }
      } catch (err) {
        console.error("Errore verifica auth", err);
        setIsLoading(false);
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [fetchData]);

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

  const handleSuccess = (message) => {
      fetchData(currentUser.id_utente);
      setModalState({ type: null, data: null });
      if (message) showToast(message, 'success');
  };

  const filteredMedicines = medicines.filter((medicine) => {
    const term = searchQuery.toLowerCase();
    const nome = medicine.farmaco?.denominazione?.toLowerCase() || "";
    const principio = medicine.farmaco?.principio_attivo?.toLowerCase() || "";
    return nome.includes(term) || principio.includes(term);
  });

  if (isAuthChecking) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      <ToastComponent />
      {!isUserAuthenticated && (
        <GuestOverlay 
          title="Il tuo Armadietto Digitale"
          description="Gestisci tutti i tuoi farmaci in un unico posto sicuro"
          features={[
            "Aggiungere farmaci tramite scansione barcode",
            "Monitorare quantità e scadenze automaticamente",
            "Ricevere alert per scorte basse",
            "Sincronizzare con le tue terapie"
          ]}
        />
      )}

      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>Il Mio Armadietto</h1>
              <p className={styles.subtitle}>Gestisci le scorte, controlla le scadenze e organizza i tuoi farmaci.</p>
            </div>
            
            <div className={styles.actions}>
              <Button onClick={() => setModalState({ type: 'add', data: null })}>
                <Icons.Plus className={`${styles.iconMd} ${styles.mr2}`} />
                Aggiungi Farmaco
              </Button>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <StatCard icon={<Icons.Package className={`${styles.iconLg} ${styles.textTeal}`} />} bgClass={styles.bgTeal50} value={stats.total} label="Farmaci Totali" />
            <StatCard icon={<Icons.AlertTriangle className={`${styles.iconLg} ${styles.textAmber}`} />} bgClass={styles.bgAmber50} value={stats.low} label="Scorte Basse" />
            <StatCard icon={<Icons.Clock className={`${styles.iconLg} ${styles.textRose}`} />} bgClass={styles.bgRose50} value={stats.expiring} label="In Scadenza / Scaduti" />
          </div>

          <div className={styles.searchContainer}>
            <div className={styles.searchIconWrapper}>
              <Icons.Search className={styles.searchIcon} />
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Cerca per nome farmaco o principio attivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
             <div className={styles.loadingSection}>
                <div className={styles.spinnerSmall}></div>
                <p className={styles.loadingText}>Caricamento armadietto...</p>
             </div>
          ) : filteredMedicines.length > 0 ? (
            <div className={styles.medicinesGrid}>
              {filteredMedicines.map((medicine, index) => {
                const uniqueId = medicine.id_farmaco_armadietto || index;
                const daysLeft = getDaysUntilExpiry(medicine.data_scadenza);
                const maxQty = medicine.farmaco?.quantita_confezione || 100;
                const currentQty = medicine.quantita_rimanente;
                const percent = (currentQty / maxQty) * 100;
                
                let barColorClass = styles.bgGreen500;
                if (percent <= 20) barColorClass = styles.bgRed500;
                else if (percent <= 50) barColorClass = styles.bgYellow400;

                return (
                  <div key={uniqueId} className={styles.medicineCard}>
                    <div className={styles.cardContent}>
                      <div className={styles.cardHeader}>
                          <div className={styles.cardInfo}>
                            <div>
                                <h3 className={styles.medicineName}>{medicine.farmaco?.denominazione + " " + medicine.farmaco?.dosaggio || "Farmaco non disponibile"}</h3>
                                <p className={styles.medicineForm}>{medicine.farmaco?.forma || "Forma non specificata"}</p>
                                {medicine.lotto_produzione && <p className={styles.medicineBatch}>Lotto: {medicine.lotto_produzione}</p>}
                            </div>
                          </div>
                          <div className={styles.cardActions}>
                            <StatusBadge status={medicine.computedStatus} />
                            <button className={styles.menuButton} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenDropdownId(openDropdownId === uniqueId ? null : uniqueId); }}>
                              <Icons.MoreVertical className={styles.iconMd} />
                            </button>
                          </div>
                      </div>
                      {medicine.farmaco?.principio_attivo && (<p className={styles.principleActive}>{medicine.farmaco.principio_attivo}</p>)}
                      <div className={styles.cardFooter}>
                        <div>
                          <div className={styles.progressLabel}><span>Quantità</span><span>{currentQty} / {maxQty}</span></div>
                          <div className={styles.progressTrack}><div className={`${styles.progressBar} ${barColorClass}`} style={{ width: `${percent}%` }} /></div>
                        </div>
                        <div className={styles.expiryContainer}>
                           <div className={styles.expiryDate}>
                              <Icons.Calendar className={`${styles.iconSm} ${daysLeft < 30 ? styles.iconRose : styles.iconSlate}`} />
                              <span className={styles.expiryText}>{new Date(medicine.data_scadenza).toLocaleDateString("it-IT")}</span>
                           </div>
                           {daysLeft < 90 && (<span className={`${styles.expiryWarning} ${daysLeft < 30 ? styles.textRose600 : styles.textAmber600}`}>{daysLeft <= 0 ? "Scaduto!" : `Scade tra ${daysLeft} gg`}</span>)}
                        </div>
                      </div>
                    </div>
                    {openDropdownId === uniqueId && (
                      <div className={styles.dropdown}>
                          <button onClick={(e) => { e.preventDefault(); setModalState({ type: 'edit', data: medicine }); setOpenDropdownId(null); }} className={styles.dropdownItem}><Icons.Edit className={`${styles.iconSm} ${styles.mr2}`} /> Modifica</button>
                          <button onClick={(e) => { e.preventDefault(); setModalState({ type: 'therapy', data: medicine }); setOpenDropdownId(null); }} className={styles.dropdownItem}><Icons.Calendar className={`${styles.iconSm} ${styles.mr2}`} /> Terapia</button>
                          <div className={styles.dropdownDivider}></div>
                          <button onClick={(e) => { e.preventDefault(); setModalState({ type: 'delete', data: medicine }); setOpenDropdownId(null); }} className={styles.dropdownItemDelete}><Icons.Trash2 className={`${styles.iconSm} ${styles.mr2}`} /> Elimina</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <center><div className={styles.emptyIconBox}><Icons.Package className={`${styles.iconXl} ${styles.textSlate300}`} /></div></center>
              <h3 className={styles.emptyTitle}>Nessun farmaco trovato</h3>
              <p className={styles.emptyDesc}>Non abbiamo trovato corrispondenze. Prova a cambiare i filtri o aggiungi un nuovo farmaco.</p>
              <Button onClick={() => setModalState({ type: 'add', data: null })}>Aggiungi il primo farmaco</Button>
            </div>
          )}
        </div>
      </main>

      {/* --- MODALS --- */}
      <AddMedicationModal
          isOpen={modalState.type === 'add'}
          onClose={() => setModalState({ type: null, data: null })}
          onSuccess={handleSuccess}
          userId={currentUser?.id_utente}
      />
      
      <EditMedicationModal
          isOpen={modalState.type === 'edit'}
          onClose={() => setModalState({ type: null, data: null })}
          medicine={modalState.data}
          onSuccess={handleSuccess}
      />

      <DeleteMedicationModal
          isOpen={modalState.type === 'delete'}
          onClose={() => setModalState({ type: null, data: null })}
          medicine={modalState.data}
          onSuccess={handleSuccess}
          allMedicines={medicines}
      />

      <AddTherapyModal
          isOpen={modalState.type === 'therapy'}
          onClose={() => setModalState({ type: null, data: null })}
          onSuccess={handleSuccess}
          userId={currentUser?.id_utente}
          cabinetMedicines={medicines}
          initialMedicineId={modalState.data?.id_farmaco_armadietto}
      />

      <footer className={styles.footer}>
          <p>© 2026 MediGuard. La tua salute, organizzata.</p>
      </footer>
    </div>
  );
}

// Helper per le Stats Card
function StatCard({ icon, bgClass, value, label }) {
    return (
        <div className={styles.statCard}>
            <div className={`${styles.statIconWrapper} ${bgClass}`}>
                {icon}
            </div>
            <div>
                <p className={styles.statValue}>{value}</p>
                <p className={styles.statLabel}>{label}</p>
            </div>
        </div>
    )
}