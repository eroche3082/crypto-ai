import React from 'react';
import PortfolioAnalyzer from '@/components/portfolio/PortfolioAnalyzer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  PieChart, 
  Brain, 
  Sparkles
} from "lucide-react";

export default function PortfolioAnalysis() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Portfolio AI Analysis</h1>
        <p className="text-muted-foreground">
          Advanced analysis and recommendations for your crypto portfolio powered by AI
        </p>
      </div>
      
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="analysis" className="flex items-center gap-1">
            <PieChart className="h-4 w-4" />
            <span>Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            <span>Insights</span>
          </TabsTrigger>
          <TabsTrigger value="strategies" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span>Strategies</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="analysis" className="space-y-6">
          <PortfolioAnalyzer />
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <div className="rounded-lg border p-6 bg-card/50 text-center">
            <div className="flex flex-col items-center justify-center mb-6">
              <Brain className="h-12 w-12 text-primary opacity-50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Deep Portfolio Insights</h2>
              <p className="text-muted-foreground max-w-md">
                Advanced AI-powered insights for optimizing your crypto portfolio performance.
              </p>
            </div>
            <p className="italic text-muted-foreground mb-4">
              This feature will be available in the next update.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="strategies" className="space-y-6">
          <div className="rounded-lg border p-6 bg-card/50 text-center">
            <div className="flex flex-col items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 text-primary opacity-50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Custom Trading Strategies</h2>
              <p className="text-muted-foreground max-w-md">
                AI-generated trading strategies tailored to your risk profile and market conditions.
              </p>
            </div>
            <p className="italic text-muted-foreground mb-4">
              This feature will be available in the next update.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}