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
            <Card>
              <CardHeader>
                <CardTitle>{t("portfolioAnalysis.marketVision", "Market Vision")}</CardTitle>
                <CardDescription>
                  {t("portfolioAnalysis.marketVisionDescription", "Upload financial charts or market data for AI-powered analysis and pattern recognition.")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-card/50 text-center">
                  <Upload size={40} className="text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {t("portfolioAnalysis.uploadTitle", "Upload Chart or Image")}
                  </h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    {t("portfolioAnalysis.uploadDescription", "Drag and drop market charts, technical analysis screenshots, or financial data visualizations for AI interpretation.")}
                  </p>
                  <Button className="mt-2">
                    {t("portfolioAnalysis.selectFile", "Select File")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("portfolioAnalysis.recentAnalyses", "Recent Chart Analyses")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  {t("portfolioAnalysis.noRecentAnalyses", "You haven't analyzed any charts yet. Upload a chart to get started.")}
                </div>
              </CardContent>
            </Card>
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