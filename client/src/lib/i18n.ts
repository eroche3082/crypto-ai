import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import esTranslation from "../assets/translations/es.json";
import enTranslation from "../assets/translations/en.json";
import ptTranslation from "../assets/translations/pt.json";
import frTranslation from "../assets/translations/fr.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: esTranslation },
      en: { translation: enTranslation },
      pt: { translation: ptTranslation },
      fr: { translation: frTranslation },
    },
    lng: "es", // Default language
    fallbackLng: "es",
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
  });

// Set the document language to match the i18n language
document.documentElement.lang = i18n.language;

export default i18n;
