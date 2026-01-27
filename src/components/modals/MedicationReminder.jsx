'use client';

import { useState, useEffect } from 'react';
import { createPortal } from "react-dom";

// --- ICONE SVG ---
const Icons = {
    Pill: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>,
    X: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>,
};

// --- COMPONENTS ---
const Button = ({ children, onClick, variant = "primary", className = "", disabled }) => {
    const base = "inline-flex items-center justify-center rounded-lg font-bold text-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed h-11 px-5";
    const variants = {
        primary: "bg-[#14b8a6] text-white hover:bg-[#0d9488] shadow-md hover:shadow-lg",
        secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    };
    return <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
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

export default function MedicationReminder() {
  const [isOpen, setIsOpen] = useState(false);
  const [farmaci, setFarmaci] = useState([]);
  const [userId, setUserId] = useState(null);

  // 1. RECUPERA L'UTENTE LOGGATO (Logica aggiunta)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          // Se l'utente è autenticato, salviamo l'ID
          if (data.isAuthenticated && data.user) {
            setUserId(data.user.id_utente);
          }
        }
      } catch (err) {
        console.error("Errore recupero utente per reminder:", err);
      }
    };
    fetchUser();
  }, []);

  // 2. POLLING: Controlla terapie solo se abbiamo un userId
  useEffect(() => {
    if (!userId) return; // Se non c'è utente, non fare nulla

    const checkMedicines = async () => {
      try {
        const res = await fetch(`/api/terapia/check-now?userId=${userId}`);
        const data = await res.json();

        if (data.daPrendere && data.daPrendere.length > 0) {
          setFarmaci(data.daPrendere);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Errore check farmaci:", error);
      }
    };

    // Controllo immediato
    checkMedicines();

    // Controllo periodico (ogni 60 secondi)
    const interval = setInterval(checkMedicines, 60000);

    return () => clearInterval(interval);
  }, [userId]); // Riesegui se l'userId cambia (es. login)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // ... Il resto del codice (handleClose, render del Modal, ecc.) rimane uguale ...
  
  // (Inserisco una versione semplificata del render per completezza)
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
       {/* ... Contenuto del tuo modale ... */}
       <div className="bg-white p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-bold mb-4">🔔 È ora delle medicine!</h2>
          {farmaci.map((f, i) => (
            <div key={i} className="mb-2">
               {f.nome_farmaco} - {f.dose_singola}
            </div>
          ))}
          <button onClick={() => setIsOpen(false)} className="mt-4 bg-teal-500 text-white px-4 py-2 rounded">
            Chiudi
          </button>
       </div>
    </div>,
    document.body
  );
}