import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Brain, LineChart, Upload, EyeIcon, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import AIConfiguration from "@/components/AIConfiguration";
import PortfolioSimulator from "@/components/PortfolioSimulator";
import PortfolioAnalyzer from "@/components/portfolio/PortfolioAnalyzer";
import MarketVision from "@/components/portfolio/MarketVision";

/**
 * Unified Portfolio Page
 * 
 * Combines:
 * - Portfolio (Portfolio Simulator)
 * - PortfolioAnalysis (AI Analysis, Market Vision)
 */
const UnifiedPortfolio = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("simulator");

  return (
    <>
      <Header />
      <AIConfiguration />
      <div className="p-4 h-[calc(100vh-132px)] overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LineChart size={24} className="text-primary" />
            {t("portfolio.title", "Cryptocurrency Portfolio")}
          </h1>
          <p className="text-muted-foreground max-w-[600px]">
            {t("portfolio.description", "Manage your portfolio, track investments, and get AI-powered insights and recommendations.")}
          </p>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-4"
        >
          <TabsList className="grid w-full md:w-[600px] grid-cols-3">
            <TabsTrigger value="simulator" className="flex items-center gap-2">
              <LineChart size={16} />
              {t("portfolio.simulator", "Portfolio Simulator")}
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain size={16} />
              {t("portfolioAnalysis.aiAnalysis", "AI Analysis")}
            </TabsTrigger>
            <TabsTrigger value="vision" className="flex items-center gap-2">
              <EyeIcon size={16} />
              {t("portfolioAnalysis.marketVision", "Market Vision")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulator" className="space-y-4">
            <PortfolioSimulator />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <PortfolioAnalyzer />
          </TabsContent>

          <TabsContent value="vision" className="space-y-4">
            <MarketVision />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-xs text-muted-foreground text-center border-t border-border pt-4">
          {t("portfolioAnalysis.disclaimer", "The analysis and recommendations provided are for informational purposes only and do not constitute financial advice.")}
        </div>
      </div>
    </>
  );
};

export default UnifiedPortfolio;