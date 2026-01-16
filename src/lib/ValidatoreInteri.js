/**
 * Verifica se l'input è un numero o una stringa che contiene un numero
 */
function isNumeric(value) {
  // 1. Convertiamo l'input in un numero
  const convertito = Number(value);

  // 2. Verifichiamo se la conversione è fallita (NaN significa "Not a Number")
  if (isNaN(convertito)) {
    return false; // Non è un numero
  }

  // 3. Verifichiamo che l'input non sia una stringa vuota (che Number() trasforma in 0)
  if (value === "") {
    return false; // Stringa vuota non valida
  }

  // Se è passato oltre, è un numero valido!
  return true;
}

/**
 * Verifica che il numero sia intero (senza virgola)
 */
function isInteger(value) {
  const num = Number(value);
  return Number.isInteger(num);
}

/**
 * Verifica che il numero sia maggiore o uguale a zero
 */
function isNonNegative(value) {
  return Number(value) >= 0;
}

/**
 * Validatore completo: Numero intero da 0 a +infinito
 */
function isValidNaturalNumber(value) {
  return (
    isNumeric(value) && 
    isInteger(value) && 
    isNonNegative(value)
  );
}

module.exports = { isValidNaturalNumber };