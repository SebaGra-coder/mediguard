/**
 * Verifica che il codice AIC sia una stringa lunga esattamente 9 caratteri
 */
function hasValidLength(aic) {
  return typeof aic === "string" && aic.length === 9;
}

/**
 * Verifica che ogni carattere della stringa sia un numero (0–9)
 */
function hasOnlyNumbers(aic) {
  for (let i = 0; i < aic.length; i++) {
    const char = aic[i];

    // Se il carattere NON è un numero, il codice non è valido
    if (isNaN(char)) {
      return false;
    }
  }

  return true;
}

/**
 * Verifica che il codice non sia composto solo da zeri
 */
function isNotAllZeros(aic) {
  return aic !== "000000000";
}

/**
 * Verifica completa del codice AIC
 */
function isValidAIC(aic) {
  return (
    hasValidLength(aic) &&
    hasOnlyNumbers(aic) &&
    isNotAllZeros(aic)
  );
}


// Esporta la funzione principale
module.exports = { isValidAIC };