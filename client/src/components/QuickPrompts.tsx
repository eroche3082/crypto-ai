import { useTranslation } from "react-i18next";

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
}

const QuickPrompts = ({ onSelectPrompt }: QuickPromptsProps) => {
  const { t } = useTranslation();
  
  const prompts = [
    { icon: "trending_up", text: t("quickPrompts.trending") },
    { icon: "analytics", text: t("quickPrompts.btcPrediction") },
    { icon: "school", text: t("quickPrompts.explainDefi") },
    { icon: "savings", text: t("quickPrompts.bestAltcoins") },
    { icon: "area_chart", text: t("quickPrompts.onChainAnalysis") },
    { icon: "sentiment_satisfied_alt", text: t("quickPrompts.marketSentiment") },
  ];
  
  return (
    <div className="py-4 overflow-x-auto scrollbar-hide">
      <div className="flex space-x-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            className="prompt-button flex items-center justify-center px-4 py-2 bg-secondary rounded-full text-xs text-gray-300 whitespace-nowrap transition-all hover:bg-primary/20"
            onClick={() => onSelectPrompt(prompt.text)}
          >
            <span className="material-icons text-xs mr-1">{prompt.icon}</span>
            {prompt.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickPrompts;
