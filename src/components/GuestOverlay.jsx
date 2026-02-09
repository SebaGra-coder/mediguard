'use client';

import Link from "next/link";
import { useEffect } from "react";
import styles from "./GuestOverlay.module.css";

// --- ICONE SVG INTERNE ---
const Icons = {
  Lock: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  LogIn: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  ),
  UserPlus: ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="20" x2="20" y1="8" y2="14" />
      <line x1="23" x2="17" y1="11" y2="11" />
    </svg>
  ),
};

// --- COMPONENTI UI INTERNI ---
const Card = ({ children, className = "" }) => (
  <div className={`${styles.card} ${className}`}>
    {children}
  </div>
);

const ButtonLink = ({ href, children, variant = "primary", className = "" }) => {
  const variantClass = variant === "primary" ? styles.buttonPrimary : styles.buttonOutline;

  return (
    <Link href={href} className={`${styles.buttonBase} ${variantClass} ${className}`}>
      {children}
    </Link>
  );
};

// --- COMPONENTE PRINCIPALE ---
export function GuestOverlay({ title, description, features }) {
  // Blocca lo scroll del body quando l'overlay è attivo
  useEffect(() => {
    // Salva lo stile originale
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Blocca lo scroll
    document.body.style.overflow = "hidden";
    
    // Ripristina alla chiusura
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div className={styles.overlay}>
      <Card>
        
        {/* Header Card */}
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <Icons.Lock className={styles.iconLarge} />
          </div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>

        {/* Content Card */}
        <div className={styles.contentBody}>
          <div className={styles.featureBox}>
            <p className={styles.featureLabel}>
              Con un account potrai:
            </p>
            <ul className={styles.list}>
              {features.map((feature, index) => (
                <li key={index} className={styles.listItem}>
                  <div className={styles.bullet} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={styles.actions}>
            <ButtonLink href="Autenticazione?mode=register" variant="primary">
              <Icons.UserPlus className={styles.iconSmall} />
              Registrati Gratis
            </ButtonLink>
            
            <ButtonLink href="Autenticazione" variant="outline">
              <Icons.LogIn className={styles.iconSmall} />
              Accedi
            </ButtonLink>
          </div>
          
          <p className={styles.footer}>
            Puoi sempre <Link href="/ricerca" className={styles.link}>cercare farmaci</Link> senza registrarti
          </p>
        </div>
      </Card>
    </div>
  );
}
