import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Prediction {
  timeframe: string;
  min: string;
  max: string;
  confidence: number;
}

export function PricePredictionWidget() {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [symbol, setSymbol] = useState("BTC");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const { toast } = useToast();

  const cryptoOptions = [
    { value: "BTC", label: "Bitcoin (BTC)" },
    { value: "ETH", label: "Ethereum (ETH)" },
    { value: "SOL", label: "Solana (SOL)" },
    { value: "XRP", label: "Ripple (XRP)" },
  ];

  const handlePredictPrice = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/vertex/market/predict', {
        symbol,
        timeframes: ['24h', '7d', '30d'],
        confidence: true
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPredictions(data.predictions);
      setCurrentPrice(data.currentPrice);
      
      toast({
        title: "Price Prediction Complete",
        description: `Successfully predicted ${symbol} prices using Vertex AI`,
      });
    } catch (error) {
      console.error('Error predicting prices:', error);
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "Failed to predict prices",
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
          <span>AI Price Prediction</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Select Cryptocurrency</h3>
            <RadioGroup
              defaultValue={symbol}
              onValueChange={setSymbol}
              className="flex flex-wrap gap-2"
            >
              {cryptoOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handlePredictPrice} 
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                'Predict Prices'
              )}
            </Button>
          </div>
          
          {predictions && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Prediction Results</h3>
                  {currentPrice && (
                    <div className="text-sm text-muted-foreground">
                      Current price: <span className="font-medium">${currentPrice.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  {predictions.map((prediction) => {
                    const timeframeLabel = 
                      prediction.timeframe === '24h' ? 'Next 24 Hours' :
                      prediction.timeframe === '7d' ? 'Next 7 Days' :
                      prediction.timeframe === '30d' ? 'Next 30 Days' : prediction.timeframe;
                    
                    // Calculate confidence percentage and color
                    const confidencePercent = Math.round(prediction.confidence * 100);
                    const confidenceColor = 
                      confidencePercent >= 75 ? 'text-green-600' :
                      confidencePercent >= 50 ? 'text-amber-600' : 'text-red-600';
                    
                    return (
                      <div key={prediction.timeframe} className="bg-muted/30 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{timeframeLabel}</span>
                          <span className={`text-xs ${confidenceColor}`}>
                            Confidence: {confidencePercent}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Min: <span className="font-medium">${(+prediction.min).toLocaleString()}</span></span>
                          <span>Max: <span className="font-medium">${(+prediction.max).toLocaleString()}</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <p className="text-xs text-muted-foreground italic mt-2">
                  Predictions are generated using AI and should not be considered financial advice.
                  Always do your own research before making investment decisions.
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}