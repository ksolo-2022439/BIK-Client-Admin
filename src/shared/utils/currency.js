/**
 * Utility para formateo y manejo de monedas en el panel administrativo BIK.
 */

/**
 * Retorna el símbolo de moneda según el código ISO.
 * @param {string} moneda - Código de moneda (GTQ, USD)
 * @returns {string}
 */
export const getCurrencySymbol = (moneda) => {
  const symbols = {
    GTQ: 'Q',
    USD: '$',
    EUR: '€',
  };
  return symbols[moneda] || moneda || 'Q';
};

/**
 * Formatea un monto con el símbolo correcto según la moneda.
 * @param {number} amount - Monto a formatear
 * @param {string} moneda - Código de moneda (GTQ, USD)
 * @returns {string}
 */
export const formatCurrency = (amount, moneda = 'GTQ') => {
  const symbol = getCurrencySymbol(moneda);
  const formatted = (amount || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol} ${formatted}`;
};
