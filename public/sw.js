self.addEventListener('push', function(event) {
  if (!event.data) return;

  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icon-192.png', // Assicurati che l'icona esista in public
    badge: '/badge.png',
    data: data.data, // Contiene id_evento e url
    actions: data.actions || [],
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // URL di destinazione corretto (preso dai dati o fallback)
  // CORREZIONE: Default a /Pages/Terapie invece di /
  const targetUrl = event.notification.data.url || '/Pages/Terapie';

  // 1. Gestione Click sul Bottone "Conferma"
  if (event.action === 'confirm') {
    const idEvento = event.notification.data.id_evento;

    if (idEvento) {
      event.waitUntil(
        // Chiama l'API per confermare (PUT)
        fetch('/api/assunzione', { 
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id_evento: idEvento,
            esito: true,
            orario_effettivo: new Date().toISOString()
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Errore conferma');
          }
          // Se va a buon fine, non facciamo nulla (o potresti mostrare un'altra notifica)
          console.log("Assunzione confermata!");
        })
        .catch(err => {
          console.error("Errore fetch:", err);
          // Se c'è un errore, apri la pagina per permettere la conferma manuale
          clients.openWindow(targetUrl);
        })
      );
    } else {
        // Se manca l'ID evento, apri la pagina
        clients.openWindow(targetUrl);
    }
    return;
  }

  // 2. Gestione Click normale sul corpo della notifica
  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});