import i18n from "i18next";

import en from "./en";
import it from "./it";

i18n
  .init({
    resources: {
      it,
      en
    },
    lng: "it",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false
    }
  })
  .catch(error => {
    console.error("i18n init error:", JSON.stringify(error, null, 4));
  });

export default i18n;
