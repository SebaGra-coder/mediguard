/**
 * Verifica se l'input è una stringa e se contiene testo reale.
 * * @param  testo - Il valore da controllare.
 * @returns  Esito della validazione:
 * - true: se contiene stringhe
 * - false: se non contiente niente
 */
function isNotEmpty(testo) {
  // Se non è una stringa, è falsa
  if (typeof testo !== 'string') return false;

  // Togliamo gli spazi bianchi e guardiamo se resta qualcosa
  const testoPulito = testo.trim();
  return testoPulito.length > 0;
}

/**
 * Verifica se la stringa contiene la chiocciola (email molto semplice)
 */
function isEmailSemplice(testo) {
  // Una email deve avere almeno una "@" e un "."
  const haChiocciola = testo.includes("@");
  const haPunto = testo.includes(".");
  
  return haChiocciola && haPunto;
}

/**
 * Verifica se la stringa contiene solo numeri (senza usare Regex)
 */
function isSoloNumeri(testo) {
  // Proviamo a convertirla: se NON è NaN, allora sono tutti numeri
  // Usiamo Number.isNaN per sicurezza
  if (testo.trim() === "") return false;
  return !isNaN(testo);
}

/**
 * Verifica se la stringa è troppo corta o troppo lunga
 */
function haLunghezzaGiusta(testo, minimo, massimo) {
  const lunghezza = testo.length;
  return lunghezza >= minimo && lunghezza <= massimo;
}

module.exports = { 
  isNotEmpty, 
  isEmailSemplice, 
  isSoloNumeri, 
  haLunghezzaGiusta 
};