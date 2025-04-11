import { useTranslation } from "react-i18next";
import { 
  TrendingUp, 
  BarChart3, 
  GraduationCap, 
  Star, 
  LineChart, 
  SmilePlus 
} from "lucide-react";

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
}

const QuickPrompts = ({ onSelectPrompt }: QuickPromptsProps) => {
  const { t } = useTranslation();
  
  const prompts = [
    { icon: <TrendingUp size={14} />, text: "What's trending today?" },
    { icon: <BarChart3 size={14} />, text: "BTC price prediction" },
    { icon: <GraduationCap size={14} />, text: "Explain DeFi" },
    { icon: <Star size={14} />, text: "Best altcoins to watch" },
    { icon: <LineChart size={14} />, text: "On-chain analysis" },
    { icon: <SmilePlus size={14} />, text: "Market sentiment" },
  ];
  
  return (
    <div className="py-2 overflow-x-auto scrollbar-hide">
      <div className="flex space-x-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            className="prompt-button flex items-center justify-center px-3 py-1.5 bg-secondary rounded-full text-xs whitespace-nowrap transition-all hover:bg-primary/20"
            onClick={() => onSelectPrompt(prompt.text)}
          >
            <span className="mr-1.5">{prompt.icon}</span>
            {prompt.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickPrompts;
