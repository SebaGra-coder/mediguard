'use client';

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // Non mostrare la Navbar nella pagina di autenticazione
  // Aggiusta il controllo se il percorso cambia o se ci sono altre pagine senza navbar
  const showNavbar = !pathname?.includes("/Pages/Autenticazione");

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}
