/**
 * @author Yuriy Gershem yuriyge@matrix.co.il
 * validateLuhnAlgorithm - function validate value by luhn algorithm (ex. credit card, id)
 */

export const validateLuhnAlgorithm = (value) => {
  if (/[^0-9-\s]+/.test(value)) return false;

  let nCheck = 0,
    bEven = false;
  value = value.replace(/\D/g, '');

  for (var n = value.length - 1; n >= 0; n--) {
    var cDigit = value.charAt(n),
      nDigit = parseInt(cDigit, 10);

    if (bEven && (nDigit *= 2) > 9) nDigit -= 9;

    nCheck += nDigit;
    bEven = !bEven;
  }
  return nCheck % 10 === 0;
};
