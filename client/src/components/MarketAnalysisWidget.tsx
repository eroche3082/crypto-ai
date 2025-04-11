import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function MarketAnalysisWidget() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const { toast } = useToast();
  const [coins] = useState(['BTC', 'ETH', 'SOL', 'XRP']);

  const handleAnalyzeMarket = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/v2/vertex/market/analyze', {
        coins,
        timeframe: '7d',
        language: 'en'
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAnalysis(data.analysis);
      
      toast({
        title: "Market Analysis Complete",
        description: "Successfully analyzed market trends using Vertex AI",
      });
    } catch (error) {
      console.error('Error analyzing market:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze market trends",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-lg flex items-center">
          <span>Advanced AI Market Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Selected Coins</h3>
              <p className="text-sm text-muted-foreground">
                {coins.join(', ')}
              </p>
            </div>
            <Button 
              onClick={handleAnalyzeMarket} 
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Market'
              )}
            </Button>
          </div>
          
          {analysis && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium">Analysis Results</h3>
                <div className="bg-muted/30 p-3 rounded-md text-sm whitespace-pre-line">
                  {analysis}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}