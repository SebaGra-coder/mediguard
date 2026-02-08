'use client';
// src/app/page.jsx
import { useState, useEffect } from "react";
import { redirect } from 'next/navigation';

export default function Page() {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const checkAuth = async () => {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            setIsUserAuthenticated(data.isAuthenticated);
          }
        } catch (err) {
          console.error("Errore verifica auth", err);
        } finally {
          setIsLoading(false);
        }
      };
      checkAuth();
  }, []);
  
  if (isLoading) {
    return null;
  }

  if (isUserAuthenticated) {
    redirect('/Pages/HomePage');
  } else {
    redirect('/Pages/Ricerca');
  }   
}