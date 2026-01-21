'use client';

import { useState } from "react";
import Link from "next/link";
import Home from "@/app/page";

export function Navbar({ isAuthenticated, onLogout }) {
  // Colore primario estratto dall'immagine (un verde acqua/teal)
  const primaryColorClass = "text-[#14b8a6]"; // Teal-500 di Tailwind approx
  const bgPrimaryClass = "bg-[#14b8a6]";
  const bgLightClass = "bg-[#f0fdfa]"; // Teal-50 molto chiaro

  // -- ICONE SVG --
  const Icons = {
    Home: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    ),
    Pill: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>
    ),
    Box: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-9" /></svg>
    ),
    Calendar: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
    ),
    Users: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    Search: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    ),
    Login: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
    )
  };

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 font-sans">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* --- 1. LOGO --- */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className={`${bgPrimaryClass} w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm`}>
            <Icons.Pill />
          </div>
          <div className="text-xl tracking-tight">
            <span className="font-bold text-slate-800">Medi</span>
            <span className={`font-bold ${primaryColorClass}`}>Guard</span>
          </div>
        </div>

        {/* --- 2. MENU CENTRALE (Desktop) --- */}
        <div className="hidden md:flex items-center space-x-8">

          {/* Link Standard */}
          <a href={isAuthenticated ? "HomePage" : ""} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors text-sm">
            <Icons.Home />
            Home
          </a>

          <a href="Armadietto" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors text-sm">
            <Icons.Box />
            Armadietto
          </a>

          <a href="Terapie" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors text-sm">
            <Icons.Calendar />
            Terapie
          </a>

          <a href="Caregiver" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors text-sm">
            <Icons.Users />
            Caregiver
          </a>

          {/* Pulsante Speciale "Cerca Farmaci" */}
          <a href="Ricerca" className={`${bgLightClass} ${primaryColorClass} px-5 py-2 rounded-full flex items-center gap-2 text-sm font-semibold hover:bg-teal-100 transition-colors`}>
            <Icons.Search />
            Cerca Farmaci
          </a>
        </div>

        {/* --- 3. PARTE DESTRA (Auth) --- */}
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              Esci
            </button>
          ) : (
            <div className="flex gap-2 w-full">
              {/* Pulsante Accedi */}
              <Link
                href="Autenticazione"  // <--- IMPORTANTE: Deve essere 'href', non 'to'
                onClick={() => setIsOpen(false)}
                className="flex-1 inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium text-slate-700 bg-transparent hover:bg-slate-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                Accedi
              </Link>

              {/* Pulsante Registrati */}
              <Link
                href="Autenticazione?mode=register" // <--- IMPORTANTE: Deve essere 'href', non 'to'
                onClick={() => setIsOpen(false)}
                className="flex-1 inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-bold text-white bg-[#14b8a6] hover:bg-[#0d9488] rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:ring-offset-2"
              >
                Registrati
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}