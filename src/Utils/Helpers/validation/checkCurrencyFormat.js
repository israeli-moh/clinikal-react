/**
 * @author Idan Gigi idangi@matrix.co.il
 * @param {string} amount
 * @returns {Boolean}
 */
export const checkCurrencyFormat = (amount) => {
  if (!amount.length) return true;

  return amount.replace(/\d/g, '').replace(/,/g, '').replace('.', '').length
    ? false
    : true;
};
