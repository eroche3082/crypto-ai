import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  onClose: () => void;
}

const LanguageSwitcher = ({ onClose }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  
  const languages = [
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ];
  
  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    onClose();
  };
  
  return (
    <div className="bg-secondary rounded-lg shadow-lg border border-gray-800 overflow-hidden w-48">
      <div className="p-3 border-b border-gray-800">
        <h3 className="font-medium text-sm">{t("languageSwitcher.selectLanguage")}</h3>
      </div>
      
      <div className="py-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`flex items-center w-full px-4 py-2 text-left text-sm hover:bg-primary/10 transition-colors
              ${language === lang.code ? "bg-primary/20 text-primary" : "text-gray-300"}
            `}
            onClick={() => handleLanguageChange(lang.code)}
          >
            <span className="mr-2 text-lg">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
