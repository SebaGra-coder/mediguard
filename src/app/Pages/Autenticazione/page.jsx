'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import styles from "./Autenticazione.module.css";

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

  // -- ICONS --
  const Icons = {
    ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
    Pill: () => <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>,
    User: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
    Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
    EyeOff: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>,
    Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
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
          <Icons.ArrowLeft />
          Torna alla home
        </Link>

        {/* Card Container */}
        <div className={styles.card}>
          
          {/* Card Header */}
          <div className={styles.cardHeader}>
            {/* Logo */}
            <div className={styles.logoContainer}>
              <Icons.Pill />
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
                        <Icons.User />
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
                        <Icons.User />
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
                        <Icons.Calendar />
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
                    <Icons.Mail />
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
                    <Icons.Lock />
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
                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
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
                      <Icons.Lock />
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