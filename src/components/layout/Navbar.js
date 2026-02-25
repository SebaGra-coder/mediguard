'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icons } from "@/components/ui/Icons";
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



    const getMobileLinkClass = (targetPath) => {
      const isActive = pathname?.includes(targetPath);
      const baseClass = "flex flex-col items-center justify-center w-full h-full space-y-1";
      if (isActive) {
        return `${baseClass} ${primaryColorClass} font-semibold`;
      }
      return `${baseClass} text-slate-500 hover:text-slate-800 font-medium`;
    };

    return (
      <>
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

              {/* Home ora punta a /Pages/HomePage per coerenza con il routing */}
              {!isLoading && isUserAuthenticated && (
                <Link href="/Pages/HomePage" className={getLinkClass("HomePage")}>
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
                  Caregiver
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
                <div className="flex items-center gap-4">
                  <Link href="/Pages/Profilo" className={getLinkClass("Profilo")}>
                      <Icons.User />
                      <span className="hidden md:inline">Profilo</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 border border-slate-200 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Icons.Logout />
                    <span className="hidden md:block">Logout</span>
                  </button>
                </div>
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

        {/* --- MOBILE BOTTOM NAV --- */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-center h-16">
          {!isLoading && isUserAuthenticated && (
            <Link href="/Pages/HomePage" className={getMobileLinkClass("HomePage")}>
              <Icons.Home />
              <span className="text-[10px]">Home</span>
            </Link>
          )}

          <Link href="/Pages/Armadietto" className={getMobileLinkClass("Armadietto")}>
            <Icons.Box />
            <span className="text-[10px]">Armadietto</span>
          </Link>

          <Link href="/Pages/Terapie" className={getMobileLinkClass("Terapie")}>
            <Icons.Calendar />
            <span className="text-[10px]">Terapie</span>
          </Link>

          {isLoading ? (
             <div className="flex flex-col items-center justify-center w-full h-full space-y-1">
               <div className="h-4 w-4 bg-slate-200 rounded animate-pulse"></div>
               <div className="h-2 w-10 bg-slate-200 rounded animate-pulse"></div>
             </div>
          ) : userRole === "Nessuno" ? (
            <Link href="/Pages/CollegaCaregiver" className={getMobileLinkClass("CollegaCaregiver")}>
              <Icons.Users />
              <span className="text-[10px]">Caregiver</span>
            </Link>
          ) : (
            <Link href="/Pages/Caregiver" className={getMobileLinkClass("Caregiver")}>
              <Icons.Users />
              <span className="text-[10px]">Caregiver</span>
            </Link>
          )}

          <Link href="/Pages/Ricerca" className={getMobileLinkClass("Ricerca")}>
            <Icons.Search />
            <span className="text-[10px]">Cerca</span>
          </Link>
        </div>
      </>
    );
  }