
export const isRTLLanguage = (langCode) => {

  const rtlLanguages = ['he', 'ar'];
  return rtlLanguages.includes(langCode);
};
