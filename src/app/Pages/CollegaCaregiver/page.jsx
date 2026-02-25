// 'use client' indica che questo componente viene eseguito nel browser (Client Component)
// Necessario per usare hook come useState e useEffect
'use client';

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import styles from "./CollegaCaregiver.module.css";
import { Icons } from "@/components/ui/Icons";
import { GuestOverlay } from "@/components/GuestOverlay";

// --- UI COMPONENTS ---
// Componente Card: Contenitore generico con supporto per stili interattivi (hover, click)
const Card = ({ children, className = "", onClick, interactive = false }) => (
  <div onClick={onClick} className={`${styles.card} ${interactive ? styles.cardInteractive : ''} ${className}`}>
    {children}
  </div>
);

// Componente Button: Pulsante riutilizzabile con diverse varianti visive (primary, secondary, outline, ghost)
const Button = ({ children, onClick, variant = "primary", className = "", disabled }) => {
  const variantClass = {
    primary: styles.btnPrimary,
    secondary: styles.btnSecondary,
    outline: styles.btnOutline,
    ghost: styles.btnGhost,
  };
  return <button onClick={onClick} disabled={disabled} className={`${styles.button} ${variantClass[variant]} ${className}`}>{children}</button>;
};

// Componente Badge: Etichetta semplice per evidenziare categorie o stati
const Badge = ({ children }) => (
  <span className={styles.badge}>
    {children}
  </span>
);

// --- MAIN PAGE ---
export default function CollegaCaregiver({ isAuthenticated: initialAuth = false }) {
  // --- STATO DEL COMPONENTE ---
  // Stato per tracciare se l'utente è loggato
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
  // Stato per gestire il flusso UI: null (scelta ruolo), 'caregiver' (genera codice), 'paziente' (inserisci codice)
  const [selectedRole, setSelectedRole] = useState(null);
  // Memorizza il codice generato dal server (solo per flusso Caregiver)
  const [generatedCode, setGeneratedCode] = useState(null);
  // Memorizza l'input dell'utente (solo per flusso Paziente)
  const [inputCode, setInputCode] = useState("");
  // Hook per mostrare notifiche a comparsa (Toast)
  const { showToast, ToastComponent } = useToast();

  // Effetto iniziale: Verifica l'autenticazione chiamando l'API /api/auth/me
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

  // Funzione per gestire il logout (resetta stato e reindirizza)
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsUserAuthenticated(false);
      window.location.href = '/Pages/Autenticazione';
    } catch (err) {
      console.error("Errore logout", err);
    }
  };

  // Funzione per generare un nuovo codice di abbinamento (Flusso Caregiver)
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

  // Copia il codice generato negli appunti del dispositivo
  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      showToast("Copiato negli appunti!");
    }
  };

  // Invia il codice inserito al server per creare il collegamento (Flusso Paziente)
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
             // Reindirizza alla home dopo il successo
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
      {/* Protezione pagina: Se l'utente non è autenticato, mostra l'overlay */}
      {!isUserAuthenticated && (
        <GuestOverlay 
          title="Accesso Richiesto"
          description="Per collegare un caregiver o un assistito è necessario accedere al proprio account."
          features={["Generazione codici sicuri", "Collegamento univoco", "Privacy garantita"]}
        />
      )}
      
      {/* Toast Container */}
      <ToastComponent />

      <main className={styles.mainContent}>
        
        {/* Intestazione della pagina */}
        <div className={styles.headerSection}>
          <Badge><Icons.Users className={`${styles.iconSmall} ${styles.mr2}`} /> Connessione Caregiver</Badge>
          <h1 className={styles.title}>Collega un Caregiver</h1>
          <p className={styles.subtitle}>
            Scegli se vuoi assistere qualcuno come caregiver o se desideri essere monitorato da un familiare o assistente di fiducia.
          </p>
        </div>

        {/* --- VISTA 1: SELEZIONE RUOLO (Se nessun ruolo è selezionato) --- */}
        {!selectedRole && (
          <div>
            <div className={styles.roleSelectionGrid}>
              
              {/* Opzione 1: Caregiver (Voglio assistere) - Colore Teal */}
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

              {/* Opzione 2: Paziente (Voglio essere assistito) - Colore Orange */}
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

            {/* Sezione esplicativa "Come Funziona" */}
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

        {/* --- VISTA 2: FLUSSO CAREGIVER (Generazione Codice) --- */}
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

              {/* Se non c'è codice, mostra bottone per generarlo */}
              {!generatedCode ? (
                <Button variant="primary" onClick={generateCode}>
                  <Icons.UserPlus className={`${styles.iconLarge} ${styles.mr2}`} /> Genera Nuovo Codice
                </Button>
              ) : (
                /* Se il codice esiste, mostralo con opzione copia */
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

        {/* --- VISTA 3: FLUSSO PAZIENTE (Inserimento Codice) --- */}
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