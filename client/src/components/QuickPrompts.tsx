import { useTranslation } from "react-i18next";
import { 
  TrendingUp, 
  BarChart3, 
  GraduationCap, 
  Star, 
  LineChart, 
  SmilePlus,
  Globe,
  Wallet,
  BookOpen,
  Bitcoin,
  Info,
  HelpCircle,
  PieChart,
  DollarSign,
  HeartHandshake,
  Lightbulb,
  Shield 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  inDialog?: boolean;
  onClose?: () => void;
}

const QuickPrompts = ({ onSelectPrompt, inDialog = false, onClose }: QuickPromptsProps) => {
  const { t } = useTranslation();
  
  // Different categories of prompts
  const trendingPrompts = [
    { icon: <TrendingUp size={18} />, text: "What's trending in crypto today?" },
    { icon: <BarChart3 size={18} />, text: "BTC price prediction for next week" },
    { icon: <Star size={18} />, text: "Top 5 altcoins to watch right now" },
    { icon: <LineChart size={18} />, text: "Latest on-chain analysis for ETH" },
    { icon: <SmilePlus size={18} />, text: "Current crypto market sentiment" },
    { icon: <Bitcoin size={18} />, text: "Bitcoin halving effects on price" },
  ];
  
  const educationalPrompts = [
    { icon: <GraduationCap size={18} />, text: "Explain DeFi in simple terms" },
    { icon: <BookOpen size={18} />, text: "How do smart contracts work?" },
    { icon: <Shield size={18} />, text: "Best security practices for crypto" },
    { icon: <Info size={18} />, text: "What is a blockchain consensus mechanism?" },
    { icon: <Wallet size={18} />, text: "Pros and cons of different wallet types" },
    { icon: <Lightbulb size={18} />, text: "Explain tokenomics principles" },
  ];
  
  const portfolioPrompts = [
    { icon: <PieChart size={18} />, text: "Suggest portfolio allocation strategy" },
    { icon: <DollarSign size={18} />, text: "How to DCA effectively in crypto" },
    { icon: <HeartHandshake size={18} />, text: "Best staking opportunities right now" },
    { icon: <HelpCircle size={18} />, text: "How to analyze token fundamentals" },
    { icon: <Globe size={18} />, text: "International tax implications for crypto" },
    { icon: <Wallet size={18} />, text: "Guide for first-time crypto investors" },
  ];
  
  const renderPromptButtons = (prompts: any[]) => {
    return prompts.map((prompt, index) => (
      <Button
        key={index}
        variant="outline"
        size="sm"
        className="flex items-center justify-start gap-2 h-10 mb-2 w-full"
        onClick={() => {
          onSelectPrompt(prompt.text);
          if (onClose && inDialog) onClose();
        }}
      >
        <span className="flex-shrink-0">{prompt.icon}</span>
        <span className="text-sm truncate text-left">{prompt.text}</span>
      </Button>
    ));
  };
  
  // If rendered inside dialog, show full layout
  if (inDialog) {
    return (
      <div className="p-4 w-full max-w-lg">
        <h2 className="text-lg font-medium mb-4">Quick Prompts</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select a prompt to get started with your conversation
        </p>
        
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="educational">Educational</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending">
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-1">
                {renderPromptButtons(trendingPrompts)}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="educational">
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-1">
                {renderPromptButtons(educationalPrompts)}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="portfolio">
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-1">
                {renderPromptButtons(portfolioPrompts)}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        {onClose && (
          <div className="flex justify-end mt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  // Default compact view for the chat input area
  return (
    <div className="py-2 overflow-x-auto scrollbar-hide">
      <div className="flex space-x-2">
        {trendingPrompts.map((prompt, index) => (
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
