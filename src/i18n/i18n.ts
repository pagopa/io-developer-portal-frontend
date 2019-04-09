import i18n from "i18next";

import it from "./it";
import en from "./en";

i18n.init({
  resources: {
    it,
    en
  },
  lng: "it",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false
  }
});

export default i18n;
