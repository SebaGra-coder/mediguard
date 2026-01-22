'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { GuestOverlay } from "@/components/GuestOverlay";
import { useRouter } from "next/navigation";

// --- ICONE SVG INTERNE ---
const Icons = {
  Package: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-9"/></svg>,
  AlertTriangle: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>,
  Clock: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Search: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Scan: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>,
  Plus: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Calendar: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  MoreVertical: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  Edit: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  Trash2: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>,
  Pill: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>,
  X: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>,
  Check: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

// --- COMPONENTI UI RIUTILIZZABILI (Style MediGuard) ---
const Button = ({ children, onClick, variant = "primary", className = "", type = "button", disabled }) => {
  const base = "inline-flex items-center justify-center rounded-lg font-bold text-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed h-11 px-5";
  const variants = {
    primary: "bg-[#14b8a6] text-white hover:bg-[#0d9488] shadow-md hover:shadow-lg",
    secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <div className="bg-teal-50 p-1.5 rounded-lg text-[#14b8a6]"><Icons.Pill className="w-5 h-5"/></div>
            {title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"><Icons.X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};

// --- FUNZIONI HELPER ---
const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return 999;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getMedicineStatus = (med) => {
  const days = getDaysUntilExpiry(med.data_scadenza);
  const qtyPercent = (med.quantita_rimanente / (med.farmaco?.quantita_confezione || 100)) * 100;
  if (days <= 0) return "expired";
  if (days <= 30) return "expiring";
  if (med.quantita_rimanente <= 5 || qtyPercent < 20) return "low";
  return "ok";
};

const StatusBadge = ({ status }) => {
  const styles = {
    ok: "bg-teal-500 text-white",
    low: "bg-yellow-500 text-white",
    expiring: "bg-orange-500 text-white",
    expired: "bg-red-500 text-white",
  };
  const labels = { ok: "Disponibile", low: "Scorta Bassa", expiring: "In Scadenza", expired: "Scaduto" };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[status] || styles.ok}`}>{labels[status] || "Sconosciuto"}</span>;
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

  // Stato Modale Aggiungi/Modifica Farmaco
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit' | 'therapy' | 'delete'
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);
  
  const [formData, setFormData] = useState({
    nome: "", principio: "", forma: "compresse", dosaggio: "", quantita: "", scadenza: "", aic: "", lotto: ""
  });

  const [therapyData, setTherapyData] = useState({
    nome_utilita: "", dose_singola: "", solo_al_bisogno: false, terapia_attiva: true, for_life: false
  });
  
  // Stato ricerca farmaci nel modale
  const [modalSearchTerm, setModalSearchTerm] = useState("");
  const [modalSearchResults, setModalSearchResults] = useState([]);
  const [isSearchingDrug, setIsSearchingDrug] = useState(false);

  const fetchData = useCallback(async (userId) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/antonio?id_utente=" + userId);
      const json = await response.json();
      const rawData = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      
      const processedData = rawData.map(item => ({
        ...item,
        computedStatus: getMedicineStatus(item)
      }));

      setMedicines(processedData);
      setStats({
        total: processedData.length,
        low: processedData.filter(m => m.computedStatus === 'low').length,
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

  // Debounce ricerca farmaci modale
  useEffect(() => {
    const timer = setTimeout(async () => {
        if (modalSearchTerm.length > 2 && modalMode === "add") {
            setIsSearchingDrug(true);
            try {
                const res = await fetch(`/api/farmaci/cerca?q=${encodeURIComponent(modalSearchTerm)}`);
                const data = await res.json();
                setModalSearchResults(data.farmaci || []);
            } catch (error) {
                console.error("Errore ricerca farmaco", error);
            } finally {
                setIsSearchingDrug(false);
            }
        } else {
            setModalSearchResults([]);
        }
    }, 400);

    return () => clearTimeout(timer);
  }, [modalSearchTerm, modalMode]);

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

  const handleOpenAdd = () => {
      setModalMode("add");
      setFormData({ nome: "", principio: "", forma: "compresse", dosaggio: "", quantita: "", scadenza: "", aic: "", lotto: "" });
      setModalSearchTerm("");
      setIsModalOpen(true);
  };

  const handleOpenEdit = (med) => {
      setModalMode("edit");
      setSelectedMedicineId(med.id_farmaco_armadietto);
      setFormData({
          nome: med.farmaco.denominazione,
          principio: med.farmaco.principio_attivo,
          forma: med.farmaco.forma,
          dosaggio: med.farmaco.dosaggio,
          quantita: med.quantita_rimanente,
          scadenza: med.data_scadenza ? new Date(med.data_scadenza).toISOString().split('T')[0] : "",
          aic: med.codice_aic,
          lotto: med.lotto_produzione || ""
      });
      setIsModalOpen(true);
      setOpenDropdownId(null);
  };

  const handleOpenDelete = (med) => {
      setModalMode("delete");
      setSelectedMedicineId(med.id_farmaco_armadietto);
      setIsModalOpen(true);
      setOpenDropdownId(null);
  };

  const handleOpenTherapy = (med) => {
    setModalMode("therapy");
    setSelectedMedicineId(med.id_farmaco_armadietto);
    setFormData({ ...formData, nome: med.farmaco.denominazione }); // Just for display
    setTherapyData({
        nome_utilita: "", 
        dose_singola: "", 
        solo_al_bisogno: false, 
        terapia_attiva: true, 
        for_life: false
    });
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleSelectDrug = (drug) => {
      setFormData({
          ...formData,
          nome: drug.denominazione,
          principio: drug.principio_attivo || "",
          forma: drug.forma?.toLowerCase() || "compresse",
          dosaggio: drug.dosaggio || "",
          aic: drug.codice_aic,
          quantita: drug.quantita_confezione || ""
      });
      setModalSearchTerm("");
      setModalSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!currentUser?.id_utente) return;

    try {
        let res;
        if (modalMode === "add") {
             const payload = {
                id_utente_proprietario: currentUser.id_utente,
                codice_aic: formData.aic,
                data_scadenza: formData.scadenza,
                quantita_rimanente: formData.quantita,
                lotto_produzione: formData.lotto
            };
            res = await fetch('/api/antonio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else if (modalMode === "edit") {
            const payload = {
                id_farmaco_armadietto: selectedMedicineId,
                quantita_rimanente: formData.quantita,
                data_scadenza: formData.scadenza,
                lotto_produzione: formData.lotto
            };
            res = await fetch('/api/antonio', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else if (modalMode === "delete") {
            res = await fetch(`/api/antonio?id_farmaco=${selectedMedicineId}`, {
                method: 'DELETE'
            });
        } else if (modalMode === "therapy") {
            const payload = {
                id_paziente: currentUser.id_utente,
                id_farmaco_armadietto: selectedMedicineId,
                ...therapyData
            };
            res = await fetch('/api/terapia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (res.ok) {
            await fetchData(currentUser.id_utente);
            setIsModalOpen(false);
        } else {
            const errorData = await res.json();
            alert(errorData.error || "Si è verificato un errore");
        }
    } catch (err) {
        console.error("Errore operazione:", err);
        alert("Errore di connessione");
    }
  };

  const filteredMedicines = medicines.filter((medicine) => {
    const term = searchQuery.toLowerCase();
    const nome = medicine.farmaco?.denominazione?.toLowerCase() || "";
    const principio = medicine.farmaco?.principio_attivo?.toLowerCase() || "";
    return nome.includes(term) || principio.includes(term);
  });

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14b8a6]"></div>
      </div>
    );
  }

  // --- RENDER DEL CONTENUTO MODALE ---
  const renderModalContent = () => {
      if (modalMode === "delete") {
          return (
              <div className="text-center py-4">
                  <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icons.Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Sei sicuro?</h4>
                  <p className="text-slate-500 text-sm">Questa azione eliminerà il farmaco dal tuo armadietto. Non potrà essere annullata.</p>
              </div>
          );
      }

      if (modalMode === "therapy") {
        console.log(formData); 
          return (
            <div className="space-y-4">
                <div className="bg-teal-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-teal-800 font-semibold">Stai creando una terapia per:</p>
                    <p className="text-lg font-bold text-teal-900">{formData.nome} + {formData.dosaggio}</p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Utilità (es. "Mal di testa")</label>
                    <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]" 
                           value={therapyData.nome_utilita} onChange={e => setTherapyData({...therapyData, nome_utilita: e.target.value})} />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Dose Singola</label>
                    <input type="number" step="0.5" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]" 
                           placeholder="Es. 1.0" value={therapyData.dose_singola} onChange={e => setTherapyData({...therapyData, dose_singola: e.target.value})} />
                </div>

                <div className="flex flex-col gap-3 mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                               checked={therapyData.solo_al_bisogno} onChange={e => setTherapyData({...therapyData, solo_al_bisogno: e.target.checked})} />
                        <span className="text-sm text-slate-700">Solo al bisogno</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                               checked={therapyData.for_life} onChange={e => setTherapyData({...therapyData, for_life: e.target.checked})} />
                        <span className="text-sm text-slate-700">Terapia cronica (Per sempre)</span>
                    </label>
                </div>
            </div>
          );
      }

      return (
        <div className="space-y-4">
           {modalMode === "add" && (
            <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cerca Farmaco da aggiungere</label>
                <div className="relative">
                    <input 
                        type="text" 
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]" 
                        placeholder="Digita nome o AIC..." 
                        value={modalSearchTerm} 
                        onChange={e => setModalSearchTerm(e.target.value)} 
                    />
                    <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    {isSearchingDrug && <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>}
                </div>
                
                {modalSearchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-100 max-h-48 overflow-y-auto">
                        {modalSearchResults.map(farmaco => (
                            <button 
                                key={farmaco.codice_aic} 
                                onClick={() => handleSelectDrug(farmaco)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-teal-50 hover:text-teal-800 transition-colors border-b border-slate-50 last:border-0"
                            >
                                <div className="font-bold">{farmaco.denominazione}</div>
                                <div className="text-xs text-slate-500 flex justify-between">
                                    <span>{farmaco.principio_attivo}</span>
                                    <span>AIC: {farmaco.codice_aic}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
           )}

           {modalMode === "add" && <div className="h-px bg-slate-100 my-2"></div>}

           <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Commerciale</label>
              <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-500" 
                     value={formData.nome} readOnly={true} disabled />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Principio Attivo</label>
                <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-500" 
                      value={formData.principio} readOnly disabled />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Dosaggio</label>
                <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-slate-50 text-slate-500" 
                      value={formData.dosaggio} readOnly disabled />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Quantità Rimanente *</label>
                <input type="number" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]" 
                       value={formData.quantita} onChange={e => setFormData({...formData, quantita: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Scadenza *</label>
                <input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]" 
                       value={formData.scadenza} onChange={e => setFormData({...formData, scadenza: e.target.value})} />
              </div>
           </div>
        </div>
      );
  };

  const getModalTitle = () => {
      switch(modalMode) {
          case 'add': return "Nuovo Farmaco";
          case 'edit': return "Modifica Farmaco";
          case 'delete': return "Elimina Farmaco";
          case 'therapy': return "Nuova Terapia";
          default: return "";
      }
  };

  const getModalFooter = () => {
      if (modalMode === "delete") {
          return (
              <>
                 <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Annulla</Button>
                 <Button variant="danger" onClick={handleSubmit}>Elimina definitivamente</Button>
              </>
          );
      }
      return (
          <>
             <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Annulla</Button>
             <Button onClick={handleSubmit}>Salva</Button>
          </>
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 relative font-sans text-slate-900">
      <Navbar isAuthenticated={isUserAuthenticated} onLogout={handleLogout} />

      {!isUserAuthenticated && (
        <GuestOverlay 
          title="Dashboard Caregiver"
          description="Monitora la salute dei tuoi cari da remoto"
          features={[
            "Collegare pazienti tramite codice sicuro",
            "Ricevere alert per mancate assunzioni",
            "Visualizzare l'aderenza terapeutica",
            "Gestire le terapie da remoto"
          ]}
        />
      )}

      <main className="pt-10 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="mb-4">
              <h1 className="text-3xl font-bold mb-2 text-slate-800 tracking-tight">Il Mio Armadietto</h1>
              <p className="text-slate-500">Gestisci le scorte, controlla le scadenze e organizza i tuoi farmaci.</p>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleOpenAdd}>
                <Icons.Plus className="w-5 h-5 mr-2" />
                Aggiungi Farmaco
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={<Icons.Package className="w-7 h-7 text-[#14b8a6]" />} bg="bg-teal-50" value={stats.total} label="Farmaci Totali" />
            <StatCard icon={<Icons.AlertTriangle className="w-7 h-7 text-amber-500" />} bg="bg-amber-50" value={stats.low} label="Scorte Basse" />
            <StatCard icon={<Icons.Clock className="w-7 h-7 text-rose-500" />} bg="bg-rose-50" value={stats.expiring} label="In Scadenza / Scaduti" />
          </div>

          <div className="relative mb-8 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icons.Search className="h-4 w-4 text-slate-400 group-focus-within:text-[#14b8a6] transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent shadow-sm transition-all"
              placeholder="Cerca per nome farmaco o principio attivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
             <div className="text-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#14b8a6] mx-auto"></div>
                <p className="mt-4 text-slate-500">Caricamento armadietto...</p>
             </div>
          ) : filteredMedicines.length > 0 ? (
            <div className="space-y-6 max-w-8xl mx-auto">
              {filteredMedicines.map((medicine, index) => {
                const uniqueId = medicine.id_farmaco_armadietto || index;
                const daysLeft = getDaysUntilExpiry(medicine.data_scadenza);
                const maxQty = medicine.farmaco?.quantita_confezione || 100;
                const currentQty = medicine.quantita_rimanente;
                const percent = (currentQty / maxQty) * 100;
                let barColor = "bg-green-500";
                if (percent <= 20) barColor = "bg-red-500";
                else if (percent <= 50) barColor = "bg-yellow-400";

                return (
                  <div key={uniqueId} className="group relative bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all hover:border-teal-100">
                    <Link href={`/Visualizza_scheda_farmaco?id=${medicine.codice_aic}`} className="absolute inset-0 z-0" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-3 items-center">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 leading-tight">{medicine.farmaco?.denominazione + " " + medicine.farmaco?.dosaggio || "Farmaco non disponibile"}</h3>
                                <p className="text-xs text-slate-500 mt-0.5 font-medium">{medicine.farmaco?.forma || "Forma non specificata"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={medicine.computedStatus} />
                            <button className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors z-20 relative" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenDropdownId(openDropdownId === uniqueId ? null : uniqueId); }}>
                              <Icons.MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
                      </div>
                      {medicine.farmaco?.principio_attivo && (<p className="text-slate-600 text-sm mb-4 line-clamp-1">{medicine.farmaco.principio_attivo}</p>)}
                      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                        <div>
                          <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-600"><span>Quantità</span><span>{currentQty} / {maxQty}</span></div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${percent}%` }} /></div>
                        </div>
                        <div className="flex flex-col justify-center">
                           <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Icons.Calendar className={`w-4 h-4 ${daysLeft < 30 ? "text-rose-500" : "text-slate-400"}`} />
                              <span className="font-medium">{new Date(medicine.data_scadenza).toLocaleDateString("it-IT")}</span>
                           </div>
                           {daysLeft < 90 && (<span className={`text-xs mt-1 font-medium ${daysLeft < 30 ? "text-rose-600" : "text-amber-600"}`}>{daysLeft <= 0 ? "Scaduto!" : `Scade tra ${daysLeft} gg`}</span>)}
                        </div>
                      </div>
                    </div>
                    {openDropdownId === uniqueId && (
                      <div className="absolute right-3 top-12 w-44 bg-white rounded-lg shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                          <button onClick={(e) => { e.preventDefault(); handleOpenEdit(medicine); }} className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#14b8a6]"><Icons.Edit className="w-4 h-4 mr-2" /> Modifica</button>
                          <button onClick={(e) => { e.preventDefault(); handleOpenTherapy(medicine); }} className="w-full flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#14b8a6]"><Icons.Calendar className="w-4 h-4 mr-2" /> Terapia</button>
                          <div className="h-px bg-slate-100 my-1"></div>
                          <button onClick={(e) => { e.preventDefault(); handleOpenDelete(medicine); }} className="w-full flex items-center px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium"><Icons.Trash2 className="w-4 h-4 mr-2" /> Elimina</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Icons.Package className="w-8 h-8 text-slate-300" /></div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">Nessun farmaco trovato</h3>
              <p className="text-slate-500 max-w-xs mx-auto mb-5 text-sm">Non abbiamo trovato corrispondenze. Prova a cambiare i filtri o aggiungi un nuovo farmaco.</p>
              <Button onClick={handleOpenAdd}>Aggiungi il primo farmaco</Button>
            </div>
          )}
        </div>
      </main>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={getModalTitle()}
        footer={getModalFooter()}
      >
        {renderModalContent()}
      </Modal>

      <footer className="border-t border-slate-200 py-8 mt-auto text-center text-sm text-slate-400 bg-white">
          <p>© 2024 MediGuard. La tua salute, organizzata.</p>
      </footer>
    </div>
  );
}

// Helper per le Stats Card
function StatCard({ icon, bg, value, label }) {
    return (
        <div className="rounded-lg border border-slate-100 bg-white shadow-sm p-3 flex items-center gap-2 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-md ${bg} flex items-center justify-center shrink-0`}>
                {icon}
            </div>
            <div>
                <p className="text-xl font-bold text-slate-800 leading-none mb-0.5">{value}</p>
                <p className="text-s font-medium text-slate-500">{label}</p>
            </div>
        </div>
    )
}