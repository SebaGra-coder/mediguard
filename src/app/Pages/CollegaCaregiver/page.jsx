'use client';

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import styles from "./CollegaCaregiver.module.css";

// --- ICONE SVG INTERNE ---
const Icons = {
  Users: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Shield: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>,
  Heart: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  Eye: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  Bell: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  Smartphone: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>,
  ArrowRight: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  Copy: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Check: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  UserPlus: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="20" x2="20" y1="8" y2="14"/><line x1="23" x2="17" y1="11" y2="11"/></svg>,
};

// --- UI COMPONENTS ---
const Card = ({ children, className = "", onClick, interactive = false }) => (
  <div onClick={onClick} className={`${styles.card} ${interactive ? styles.cardInteractive : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", disabled }) => {
  const variantClass = {
    primary: styles.btnPrimary,
    secondary: styles.btnSecondary,
    outline: styles.btnOutline,
    ghost: styles.btnGhost,
  };
  return <button onClick={onClick} disabled={disabled} className={`${styles.button} ${variantClass[variant]} ${className}`}>{children}</button>;
};

const Badge = ({ children }) => (
  <span className={styles.badge}>
    {children}
  </span>
);

// --- MAIN PAGE ---
export default function CollegaCaregiver({ isAuthenticated: initialAuth = false }) {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
  const [selectedRole, setSelectedRole] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [inputCode, setInputCode] = useState("");
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setIsUserAuthenticated(data.isAuthenticated);
      } catch (err) {
        console.error("Errore verifica auth", err);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsUserAuthenticated(false);
      window.location.href = '/Pages/Autenticazione';
    } catch (err) {
      console.error("Errore logout", err);
    }
  };

  const generateCode = async () => {
    try {
      const res = await fetch('/api/relazioni/codice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: 'ASSISTITO' })
      });
      const data = await res.json();
      
      if (res.ok) {
        setGeneratedCode(data.code);
        showToast("Codice generato con successo!");
      } else {
        showToast(data.message || "Errore generazione codice", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Errore di comunicazione col server", "error");
    }
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      showToast("Copiato negli appunti!");
    }
  };

  const submitCode = async () => {
    if (inputCode.length === 6) {
      try {
        const res = await fetch('/api/relazioni/collega', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: inputCode })
        });
        const data = await res.json();

        if (res.ok) {
          showToast("Collegamento avvenuto con successo!", "success");
          setInputCode("");
          setTimeout(() => {
             window.location.href = '/Pages/HomePage';
          }, 2000);
        } else {
          showToast(data.message || "Codice non valido", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Errore di comunicazione col server", "error");
      }
    } else {
      showToast("Codice non valido", "error");
    }
  };

  return (
    <div className={styles.pageContainer}>
      
      
      {/* Toast Container */}
      <ToastComponent />

      <main className={styles.mainContent}>
        
        {/* Header Page */}
        <div className={styles.headerSection}>
          <Badge><Icons.Users className={`${styles.iconSmall} ${styles.mr2}`} /> Connessione Caregiver</Badge>
          <h1 className={styles.title}>Collega un Caregiver</h1>
          <p className={styles.subtitle}>
            Scegli se vuoi assistere qualcuno come caregiver o se desideri essere monitorato da un familiare o assistente di fiducia.
          </p>
        </div>

        {/* --- SELEZIONE RUOLO (Main View) --- */}
        {!selectedRole && (
          <div>
            <div className={styles.roleSelectionGrid}>
              
              {/* Card Caregiver (Teal) */}
              <Card interactive={true} onClick={() => setSelectedRole("caregiver")}>
                <div className={styles.roleCardContent}>
                  <div className={`${styles.iconCircle} ${styles.tealBg}`}>
                    <Icons.Shield className={`${styles.iconXLarge} ${styles.tealText}`} />
                  </div>
                  <h2 className={styles.roleTitle}>Voglio Assistere</h2>
                  <p className={styles.roleDescription}>Diventa caregiver per un familiare o paziente</p>
                  
                  <ul className={styles.featureList}>
                    <li className={styles.featureItem}><Icons.Eye className={`${styles.iconLarge} ${styles.tealText}`}/> Monitora l'aderenza terapeutica</li>
                    <li className={styles.featureItem}><Icons.Bell className={`${styles.iconLarge} ${styles.tealText}`}/> Ricevi alert per mancate assunzioni</li>
                    <li className={styles.featureItem}><Icons.Smartphone className={`${styles.iconLarge} ${styles.tealText}`}/> Gestisci terapie da remoto</li>
                  </ul>

                  <Button variant="primary" onClick={(e) => { e.stopPropagation(); setSelectedRole("caregiver"); }}>
                    Genera Codice Invito <Icons.ArrowRight className={`${styles.iconMedium} ${styles.ml2}`} />
                  </Button>
                </div>
              </Card>

              {/* Card Paziente (Orange) */}
              <Card interactive={true} onClick={() => setSelectedRole("paziente")}>
                <div className={styles.roleCardContent}>
                  <div className={`${styles.iconCircle} ${styles.orangeBg}`}>
                    <Icons.Heart className={`${styles.iconXLarge} ${styles.orangeText}`} />
                  </div>
                  <h2 className={styles.roleTitle}>Voglio Essere Assistito</h2>
                  <p className={styles.roleDescription}>Collega un caregiver per monitorare la tua salute</p>
                  
                  <ul className={styles.featureList}>
                    <li className={styles.featureItem}><Icons.Users className={`${styles.iconLarge} ${styles.orangeText}`}/> Un familiare ti terrà d'occhio</li>
                    <li className={styles.featureItem}><Icons.Bell className={`${styles.iconLarge} ${styles.orangeText}`}/> Mai più farmaci dimenticati</li>
                    <li className={styles.featureItem}><Icons.Shield className={`${styles.iconLarge} ${styles.orangeText}`}/> Maggiore sicurezza quotidiana</li>
                  </ul>

                  <Button variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedRole("paziente"); }}>
                    Inserisci Codice Caregiver <Icons.ArrowRight className={`${styles.iconMedium} ${styles.ml2}`} />
                  </Button>
                </div>
              </Card>
            </div>

            {/* How it works */}
            <div className={styles.howItWorksSection}>
               <h3 className={styles.howItWorksTitle}>Come Funziona?</h3>
               <div className={styles.stepsGrid}>
                  <div>
                     <div className={styles.stepNumber}>1</div>
                     <h4 className={styles.stepTitle}>Genera o Ricevi Codice</h4>
                     <p className={styles.stepDescription}>Il caregiver genera un codice univoco da condividere.</p>
                  </div>
                  <div>
                     <div className={styles.stepNumber}>2</div>
                     <h4 className={styles.stepTitle}>Collegamento Sicuro</h4>
                     <p className={styles.stepDescription}>Il paziente inserisce il codice per stabilire la connessione.</p>
                  </div>
                  <div>
                     <div className={styles.stepNumber}>3</div>
                     <h4 className={styles.stepTitle}>Monitoraggio Attivo</h4>
                     <p className={styles.stepDescription}>Il caregiver può monitorare e ricevere alert in tempo reale.</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* --- CAREGIVER FLOW (Genera Codice) --- */}
        {selectedRole === "caregiver" && (
          <div className={styles.flowContainer}>
            <Card>
              <div className={styles.flowHeader}>
                <div className={`${styles.flowIconContainer} ${styles.tealBg} ${styles.tealText}`}>
                  <Icons.Shield className={styles.iconXLarge} />
                </div>
                <h2 className={styles.roleTitle}>Genera Codice Invito</h2>
                <p className={styles.roleDescription}>Condividi questo codice con il paziente.</p>
              </div>

              {!generatedCode ? (
                <Button variant="primary" onClick={generateCode}>
                  <Icons.UserPlus className={`${styles.iconLarge} ${styles.mr2}`} /> Genera Nuovo Codice
                </Button>
              ) : (
                <div className={styles.spacerY6}>
                  <div className={styles.codeDisplayBox}>
                    <p className={styles.codeText}>{generatedCode}</p>
                    <button onClick={copyCode} className={styles.copyButton}>
                       <Icons.Copy className={styles.iconLarge} />
                    </button>
                  </div>
                  <p className={styles.expirationText}>Il codice scade tra 24 ore.</p>
                  <Button variant="outline" onClick={() => setGeneratedCode(null)}>Rigenera</Button>
                </div>
              )}

              <button onClick={() => setSelectedRole(null)} className={styles.backButton}>
                 ← Torna indietro
              </button>
            </Card>
          </div>
        )}

        {/* --- PATIENT FLOW (Inserisci Codice) --- */}
        {selectedRole === "paziente" && (
          <div className={styles.flowContainer}>
            <Card>
              <div className={styles.flowHeader}>
                <div className={`${styles.flowIconContainer} ${styles.orangeBg} ${styles.orangeText}`}>
                  <Icons.Heart className={styles.iconXLarge} />
                </div>
                <h2 className={styles.roleTitle}>Inserisci Codice</h2>
                <p className={styles.roleDescription}>Inserisci il codice ricevuto dal caregiver.</p>
              </div>

              <div className={styles.spacerY4}>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="ES: ABC123"
                  className={styles.codeInput}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                />
                
                <Button variant="secondary" onClick={submitCode} disabled={inputCode.length !== 6}>
                   Collega Caregiver <Icons.ArrowRight className={`${styles.iconMedium} ${styles.ml2}`} />
                </Button>
              </div>

              <button onClick={() => setSelectedRole(null)} className={styles.backButton}>
                 ← Torna indietro
              </button>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
}