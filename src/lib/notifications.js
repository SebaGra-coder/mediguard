export async function subscribeUserToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert("Il tuo browser non supporta le notifiche push.");
      return false;
    }
  
    try {
      // 1. Registra il Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
  
      // 2. Chiedi il permesso all'utente (appare il popup del browser)
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert("Devi consentire le notifiche per riceverle.");
        return false;
      }
  
      // 3. Ottieni la sottoscrizione dal browser
      // NOTA: Devi mettere la tua VAPID PUBLIC KEY qui sotto!
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "BEZC-gx9nl0jyDYQMxEaYzc7Kexjur-T4IhxjoY-H81TPNH8tqhk9xBxQxGmaYzCfot63mRqIgf45fsAVUKCS5Y" 
      });
  
      // 4. CHIAMATA ALLA TUA API (Ecco il collegamento!)
      // Recuperiamo l'ID utente chiamando prima /api/auth/me per sicurezza
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      const userId = authData.user?.id_utente;
  
      if (!userId) return false;
  
      await fetch('/api/subscribe', { // Assicurati che il percorso API sia corretto
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, userId }),
      });
  
      return true;
  
    } catch (error) {
      console.error("Errore attivazione notifiche:", error);
      return false;
    }
  }