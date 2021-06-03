/**
 * @author Yuriy Gershem yuriyge@matrix.co.il
 * getEmailRegexPattern - function returns a pattern RegEx for checking email
 * getCellPhoneRegexPattern - function returns a pattern RegEx for checking phone number by format: NN|NNN-(NNN)-NNNN
 */

export const getEmailRegexPattern = () => {
  //eslint-disable-next-line
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
};

export const getCellPhoneRegexPattern = () => {
 // return /^\(?0([1-9]|[1-9][0-9])\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\.0-9]*$/;
};

export const getOnlyNumbersRegexPattern = () => {
  return /^[0-9]*$/;
};

export const israelPhoneNumberRegex = () => {
  return /^05\d([-]{0,1})\d{7}$/;
};

export const getOnlyLettersRegexPattern = () => {
  return /[~`!@#$%^&*()_={}:;,.<>+?"'\\/]|[0-9+]/gm;
  // return /[~`!@#$%^&()_={}[\]:;,.<>+\/?-\\"']|[0-9+]/gm;
};

export const getPatientNamePattern = () => {
  return /[~!@#$%^&*={}:;,.<>+?\\/]|[0-9+]/gm;
  // return /[~`!@#$%^&()_={}[\]:;,.<>+\/?-\\"']|[0-9+]/gm;
};

