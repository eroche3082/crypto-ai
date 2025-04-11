import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";
import { useGemini } from "../contexts/GeminiContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const AIConfiguration = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { model, setModel } = useGemini();
  const [isEditing, setIsEditing] = useState(false);
  
  const availableModels = [
    { id: "gemini-1.5-pro", name: "gemini-1.5-pro" },
    { id: "gemini-1.5-flash", name: "gemini-1.5-flash" },
  ];
  
  const handleSave = () => {
    setIsEditing(false);
  };
  
  return (
    <div className="bg-secondary/70 p-4 border-b border-gray-800 flex justify-between items-center">
      {!isEditing ? (
        <>
          <div>
            <h2 className="text-sm font-medium text-gray-400">{t("aiConfig.currentConfig")}:</h2>
            <div className="flex items-center mt-1 text-sm">
              <div className="flex items-center mr-4">
                <span className="text-gray-400 mr-1">{t("aiConfig.model")}:</span>
                <span className="text-lightText">{model}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 mr-1">{t("aiConfig.language")}:</span>
                <span className="text-lightText">{t(`languages.${language}`)}</span>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            {t("aiConfig.change")}
          </Button>
        </>
      ) : (
        <>
          <div className="flex flex-1 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">{t("aiConfig.model")}</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={t("aiConfig.selectModel")} />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 block mb-1">{t("aiConfig.language")}</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={t("aiConfig.selectLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">{t("languages.es")}</SelectItem>
                  <SelectItem value="en">{t("languages.en")}</SelectItem>
                  <SelectItem value="pt">{t("languages.pt")}</SelectItem>
                  <SelectItem value="fr">{t("languages.fr")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleSave}>
            {t("aiConfig.save")}
          </Button>
        </>
      )}
    </div>
  );
};

export default AIConfiguration;
