/**
 * Utilitários para validação de dados
 */

/**
 * Validar email
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar URL
 * @param {string} url 
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validar valor monetário
 * @param {number} amount 
 * @returns {boolean}
 */
function isValidAmount(amount) {
  return typeof amount === 'number' && amount > 0 && amount < 1000000;
}

/**
 * Validar moeda
 * @param {string} currency 
 * @returns {boolean}
 */
function isValidCurrency(currency) {
  const validCurrencies = ['brl', 'usd', 'eur', 'gbp'];
  return validCurrencies.includes(currency.toLowerCase());
}

/**
 * Validar intervalo de assinatura
 * @param {string} interval 
 * @returns {boolean}
 */
function isValidInterval(interval) {
  const validIntervals = ['day', 'week', 'month', 'year'];
  return validIntervals.includes(interval.toLowerCase());
}

/**
 * Sanitizar metadados
 * @param {Object} metadata 
 * @returns {Object}
 */
function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  const sanitized = {};
  Object.keys(metadata).forEach(key => {
    if (typeof key === 'string' && key.length <= 40) {
      const value = metadata[key];
      if (typeof value === 'string' && value.length <= 500) {
        sanitized[key] = value;
      } else if (typeof value === 'number') {
        sanitized[key] = value.toString();
      }
    }
  });

  return sanitized;
}

/**
 * Gerar ID único
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

module.exports = {
  isValidEmail,
  isValidUrl,
  isValidAmount,
  isValidCurrency,
  isValidInterval,
  sanitizeMetadata,
  generateId
};
