'use client';

import Link from "next/link";
import { useEffect } from "react";

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
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-xl ${className}`}>
    {children}
  </div>
);

const ButtonLink = ({ href, children, variant = "primary", className = "" }) => {
  const base = "inline-flex items-center justify-center rounded-lg font-bold text-sm transition-all focus:outline-none h-11 px-5 w-full";
  const variants = {
    primary: "bg-[#14b8a6] text-white hover:bg-[#0d9488] shadow-md hover:shadow-lg", // Teal MediGuard
    outline: "border border-slate-300 text-slate-700 bg-white hover:bg-slate-50",
  };

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300 h-screen w-screen overflow-hidden">
      <Card className="max-w-md w-full mx-auto animate-in zoom-in-95 duration-300 relative z-50">
        
        {/* Header Card */}
        <div className="p-6 pb-2 text-center">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4 text-[#14b8a6]">
            <Icons.Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
          <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
        </div>

        {/* Content Card */}
        <div className="p-6 space-y-6">
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Con un account potrai:
            </p>
            <ul className="space-y-2.5">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-slate-600">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#14b8a6] shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
            <ButtonLink href="Autenticazione?mode=register" variant="primary">
              <Icons.UserPlus className="w-4 h-4 mr-2" />
              Registrati Gratis
            </ButtonLink>
            
            <ButtonLink href="Autenticazione" variant="outline">
              <Icons.LogIn className="w-4 h-4 mr-2" />
              Accedi
            </ButtonLink>
          </div>
          
          <p className="text-xs text-center text-slate-400 mt-2">
            Puoi sempre <Link href="/ricerca" className="text-[#14b8a6] font-medium hover:underline">cercare farmaci</Link> senza registrarti
          </p>
        </div>
      </Card>
    </div>
  );
}