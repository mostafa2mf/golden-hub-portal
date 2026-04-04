import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "fa" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  dir: "rtl" | "ltr";
  t: (fa: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "fa",
  setLang: () => {},
  dir: "rtl",
  t: (fa) => fa,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>("fa");
  const dir = lang === "fa" ? "rtl" : "ltr";
  const t = (fa: string, en: string) => (lang === "fa" ? fa : en);

  return (
    <LanguageContext.Provider value={{ lang, setLang, dir, t }}>
      <div dir={dir} className={lang === "fa" ? "font-sans" : "font-sans"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
