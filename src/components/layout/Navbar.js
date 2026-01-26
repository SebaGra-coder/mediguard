'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
// Assicurati di aver creato questo file come discusso prima!
import { subscribeUserToPush } from "@/lib/notifications";

export function Navbar({ isAuthenticated: initialAuth = false, onLogout }) {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(initialAuth);
  const [subscribeActivated, setSubscribeActivated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  // --- LOGICA AUTENTICAZIONE ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setIsUserAuthenticated(data.isAuthenticated);
          console.log(data);
          if (data.user) {
            try {
              const resSubscription = await fetch('/api/subscribe?userId=' + data.user.id_utente);
              if (resSubscription.ok) {
                const dataSubscription = await resSubscription.json();
                console.log(dataSubscription);
                if (dataSubscription) {
                  setSubscribeActivated(dataSubscription.hasSubscription);
                }
              } else {
                console.error("Errore verifica subscription", resSubscription.status);
              }
            } catch (err) {
              console.error("Errore verifica subscription", err);
            }
            setUserRole(data.user.ruolo);
          }
        } else {
          console.error("Errore verifica auth", res.status);
        }
      } catch (err) {
        console.error("Errore verifica auth", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
    }, []);

    const handleLogout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        setIsUserAuthenticated(false);
        if (onLogout) onLogout();
        router.push('/Pages/Autenticazione'); // Redirect fluido
      } catch (err) {
        console.error("Errore logout", err);
      }
    };

    // --- LOGICA NOTIFICHE ---
    const handleEnableNotifications = async () => {
      if (!isUserAuthenticated) return alert("Devi essere loggato!");

      // Chiama la funzione importata da @/lib/notifications
      const result = await subscribeUserToPush();
      if (result)
      {
        setSubscribeActivated(true);
        alert("Notifiche attivate con successo!");
      }
    };

    // --- STILI ---
    const primaryColorClass = "text-[#14b8a6]";
    const bgPrimaryClass = "bg-[#14b8a6]";
    const bgLightClass = "bg-[#f0fdfa]";

    const getLinkClass = (targetPath) => {
      const isActive = pathname?.includes(targetPath);
      if (isActive) {
        return `${bgLightClass} ${primaryColorClass} px-5 py-2 rounded-full flex items-center gap-2 text-sm font-semibold hover:bg-teal-100 transition-colors`;
      }
      return "flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors text-sm";
    };

    // --- ICONE SVG ---
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
      ),
      // AGGIUNTA ICONA MANCANTE
      Bell: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
      )
    };

    return (
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 font-sans">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">

          {/* --- 1. LOGO --- */}
          <Link href={isUserAuthenticated ? "/" : "/"} className="flex items-center gap-2.5 cursor-pointer">
            <div className={`${bgPrimaryClass} w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm`}>
              <Icons.Pill />
            </div>
            <div className="text-xl tracking-tight">
              <span className="font-bold text-slate-800">Medi</span>
              <span className={`font-bold ${primaryColorClass}`}>Guard</span>
            </div>
          </Link>

          {/* --- 2. MENU CENTRALE (Desktop) --- */}
          <div className="hidden md:flex items-center space-x-8">

            {/* Home ora punta alla radice "/" dato che abbiamo sistemato il layout */}
            {isUserAuthenticated && (
              <Link href="/" className={getLinkClass("HomePage")}>
                <Icons.Home />
                Home
              </Link>
            )}

            <Link href="/Pages/Armadietto" className={getLinkClass("Armadietto")}>
              <Icons.Box />
              Armadietto
            </Link>

            <Link href="/Pages/Terapie" className={getLinkClass("Terapie")}>
              <Icons.Calendar />
              Terapie
            </Link>

            {isLoading ? (
              <div className="h-5 w-24 bg-slate-200 rounded animate-pulse"></div>
            ) : userRole === "Nessuno" ? (
              <Link href="/Pages/CollegaCaregiver" className={getLinkClass("CollegaCaregiver")}>
                <Icons.Users />
                Collega Caregiver
              </Link>
            ) : (
              <Link href="/Pages/Caregiver" className={getLinkClass("Caregiver")}>
                <Icons.Users />
                Caregiver
              </Link>
            )}

            <Link href="/Pages/Ricerca" className={getLinkClass("Ricerca")}>
              <Icons.Search />
              Cerca Farmaci
            </Link>
          </div>

          {/* --- 3. PARTE DESTRA (Auth & Notifiche) --- */}
          <div className="flex items-center gap-6">

            {/* Bottone Notifiche (Visibile solo se loggato) */}
            {(isUserAuthenticated && !subscribeActivated) && (
              <button
                onClick={handleEnableNotifications}
                className="text-slate-500 hover:text-[#14b8a6] transition-colors p-2 rounded-full hover:bg-slate-50 focus:outline-none"
                title="Attiva Notifiche Push"
              >
                <Icons.Bell />
              </button>
            )}

            {isLoading ? (
              <div className="h-10 w-20 bg-slate-200 rounded animate-pulse"></div>
            ) : isUserAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
              >
                Esci
              </button>
            ) : (
              <div className="flex gap-2 w-full">
                <Link
                  href="/Pages/Autenticazione"
                  className="flex-1 inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium text-slate-700 bg-transparent hover:bg-slate-100 rounded-md transition-colors"
                >
                  Accedi
                </Link>

                <Link
                  href="/Pages/Autenticazione?mode=register"
                  className="flex-1 inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-bold text-white bg-[#14b8a6] hover:bg-[#0d9488] rounded-md shadow-sm transition-colors"
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