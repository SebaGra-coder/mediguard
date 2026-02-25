'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import styles from "./Autenticazione.module.css";
import { Icons } from "@/components/ui/Icons";

function AuthContent({ onLogin }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    surname: "",
    confirmPassword: "",
    dob: "",
  }); 

  useEffect(() => {
    const mode = searchParams.get("mode");
    setIsLogin(mode !== "register");
  }, [searchParams]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!isLogin && formData.password !== formData.confirmPassword) {
      showToast("Errore: Le password non coincidono", "error");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // --- LOGIN ---
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        const data = await res.json();

        if (res.ok) {
          if (onLogin) onLogin();
          // Redirect alla HomePage o dove preferisci
          window.location.href = "/Pages/HomePage";
        } else {
          showToast("Errore durante il login", "error");
        }

      } else {
        // --- REGISTRAZIONE ---
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            nome: formData.name,       // Nota: il backend aspetta 'nome', nel form è 'name'
            cognome: formData.surname, // Nota: il backend aspetta 'cognome', nel form è 'surname'
            data_nascita: formData.dob // Nota: il backend aspetta 'data_nascita', nel form è 'dob'
          }),
        });

        const data = await res.json();

        if (res.ok) {
          showToast("Registrazione effettuata con successo!", "success");
          setIsLogin(true); // Passa alla modalità login
        } else {
          showToast("Errore durante la registrazione", "error");
        }
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      showToast("Errore di rete", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };



  return (
    <div className={styles.pageContainer}>
      <ToastComponent className={styles.toastPosition} />
      
      {/* Background decorations */}
      <div className={styles.bgDecorationContainer}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </div>

      <div className={styles.contentWrapper}>
        {/* Back to home */}
        <Link 
          href="Ricerca"
          className={styles.backLink}
        >
          <Icons.ArrowLeft width={16} height={16} />
          Torna alla home
        </Link>

        {/* Card Container */}
        <div className={styles.card}>
          
          {/* Card Header */}
          <div className={styles.cardHeader}>
            {/* Logo */}
            <div className={styles.logoContainer}>
              <Icons.Pill width={32} height={32} />
            </div>
            <h2 className={styles.title}>
              {isLogin ? "Bentornato" : "Crea il tuo account"}
            </h2>
            <p className={styles.subtitle}>
              {isLogin 
                ? "Accedi per gestire i tuoi farmaci" 
                : "Inizia a gestire i tuoi farmaci in modo intelligente"
              }
            </p>
          </div>

          {/* Card Content */}
          <div className={styles.cardContent}>
            <form onSubmit={handleSubmit} className={styles.form}>
              
              {!isLogin && (
                <>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>
                      Nome
                    </label>
                    <div className={styles.inputWrapper}>
                      <div className={styles.inputIcon}>
                        <Icons.User width={16} height={16} />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Mario"
                        className={styles.input}
                        value={formData.name}
                        onChange={handleChange}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="surname" className={styles.label}>
                      Cognome
                    </label>
                    <div className={styles.inputWrapper}>
                      <div className={styles.inputIcon}>
                        <Icons.User width={16} height={16} />
                      </div>
                      <input
                        id="surname"
                        name="surname"
                        type="text"
                        placeholder="Rossi"
                        className={styles.input}
                        value={formData.surname}
                        onChange={handleChange}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="dob" className={styles.label}>
                      Data di Nascita
                    </label>
                    <div className={styles.inputWrapper}>
                      <div className={styles.inputIcon}>
                        <Icons.Calendar width={16} height={16} />
                      </div>
                      <input
                        id="dob"
                        name="dob"
                        type="date"
                        className={styles.input}
                        value={formData.dob}
                        onChange={handleChange}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputIcon}>
                    <Icons.Mail width={16} height={16} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="mario@esempio.it"
                    className={styles.input}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputIcon}>
                    <Icons.Lock width={16} height={16} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`${styles.input} ${styles.passwordInput}`}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.togglePasswordButton}
                  >
                    {showPassword ? <Icons.EyeOff width={16} height={16} /> : <Icons.Eye width={16} height={16} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword"
                   className={styles.label}>
                    Conferma password
                  </label>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputIcon}>
                      <Icons.Lock width={16} height={16} />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={styles.input}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                      minLength={8}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className={styles.submitButton}
              >
                {isLoading ? (
                  <span className={styles.spinnerWrapper}>
                    <span className={styles.spinner} />
                    {isLogin ? "Accesso in corso..." : "Registrazione..."}
                  </span>
                ) : (
                  isLogin ? "Accedi" : "Crea account"
                )}
              </button>
            </form>

            <div className={styles.footer}>
              <span className={styles.footerText}>
                {isLogin ? "Non hai un account?" : "Hai già un account?"}
              </span>{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className={styles.switchButton}
              >
                {isLogin ? "Registrati" : "Accedi"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Auth(props) {
  return (
    <Suspense fallback={<div className={styles.loadingScreen}><div className={styles.largeSpinner}></div></div>}>
      <AuthContent {...props} />
    </Suspense>
  );
}