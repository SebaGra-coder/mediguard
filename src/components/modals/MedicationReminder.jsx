'use client';

import { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import styles from "./ModalStyles.module.css";

export default function MedicationReminder() {
  const [isOpen, setIsOpen] = useState(false);
  const [farmaci, setFarmaci] = useState([]);
  const [userId, setUserId] = useState(null);

  // 1. RECUPERA L'UTENTE LOGGATO
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
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

  // 2. POLLING
  useEffect(() => {
    if (!userId) return;

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

    checkMedicines();
    const interval = setInterval(checkMedicines, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay}>
       <div className={styles.container}>
          <div className={styles.header}>
              <h3 className={styles.title}>
                  <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🔔</span>
                  È ora delle medicine!
              </h3>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
              </button>
          </div>
          <div className={styles.content}>
              {farmaci.map((f, i) => (
                <div key={i} className={styles.infoBox} style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ fontWeight: 'bold' }}>{f.nome_farmaco}</div>
                   <div style={{ color: '#64748b' }}>- {f.dose_singola}</div>
                </div>
              ))}
          </div>
          <div className={styles.footer}>
              <button onClick={() => setIsOpen(false)} className={`${styles.btn} ${styles.btnPrimary}`}>
                Ho capito, chiudi
              </button>
          </div>
       </div>
    </div>,
    document.body
  );
}