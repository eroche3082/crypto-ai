import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BrainCircuit, BarChart2, TrendingUp, LineChart, BrainCog, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useCrypto } from "@/contexts/CryptoContext";
import { useToast } from "@/hooks/use-toast";

export default function Analysis() {
  const { t } = useTranslation();
  const { cryptoData } = useCrypto();
  const [selectedCrypto, setSelectedCrypto] = useState("bitcoin");
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisGenerated, setAnalysisGenerated] = useState(true);
  const { toast } = useToast();

  const generateAnalysis = () => {
    setIsAnalysisLoading(true);
    
    // Simulate analysis generation
    setTimeout(() => {
      setIsAnalysisLoading(false);
      setAnalysisGenerated(true);
      
      toast({
        title: "Analysis Generated",
        description: `AI analysis for ${selectedCrypto.toUpperCase()} has been generated successfully.`
      });
    }, 2000);
  };

  // Get the selected crypto data
  const cryptoInfo = cryptoData?.find(crypto => crypto.id === selectedCrypto) || null;
  
  // Mock sentiment score (between 0-100, higher is more positive)
  const sentimentScore = 72;
  
  // Mock technical analysis scores
  const technicalScores = {
    shortTerm: 65,
    mediumTerm: 82,
    longTerm: 78
  };
  
  // Mock AI predictions
  const predictions = {
    nextDay: {
      min: cryptoInfo ? (cryptoInfo.current_price * 0.98).toFixed(2) : "0",
      max: cryptoInfo ? (cryptoInfo.current_price * 1.05).toFixed(2) : "0" 
    },
    nextWeek: {
      min: cryptoInfo ? (cryptoInfo.current_price * 0.95).toFixed(2) : "0",
      max: cryptoInfo ? (cryptoInfo.current_price * 1.12).toFixed(2) : "0"
    },
    nextMonth: {
      min: cryptoInfo ? (cryptoInfo.current_price * 0.90).toFixed(2) : "0",
      max: cryptoInfo ? (cryptoInfo.current_price * 1.25).toFixed(2) : "0"
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BrainCircuit size={24} />
          {t("analysis.title", "AI Analysis")}
        </h1>
        
        <Button variant="outline" onClick={() => setAnalysisGenerated(false)}>
          <RefreshCw size={18} className="mr-2" />
          {t("analysis.new", "New Analysis")}
        </Button>
      </div>
      
      {!analysisGenerated ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("analysis.generate", "Generate New Analysis")}</CardTitle>
            <CardDescription>
              {t("analysis.description", "Select a cryptocurrency and our AI will analyze market trends, sentiment, and provide price predictions.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">
                {t("analysis.select_crypto", "Select Cryptocurrency")}
              </label>
              <Select 
                value={selectedCrypto} 
                onValueChange={setSelectedCrypto}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("analysis.select_placeholder", "Select a cryptocurrency")} />
                </SelectTrigger>
                <SelectContent>
                  {cryptoData?.slice(0, 10).map(crypto => (
                    <SelectItem key={crypto.id} value={crypto.id}>
                      {crypto.name} ({crypto.symbol.toUpperCase()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={generateAnalysis} 
              disabled={isAnalysisLoading || !selectedCrypto}
              className="w-full"
            >
              {isAnalysisLoading ? (
                <>
                  <BrainCog size={18} className="mr-2 animate-spin" />
                  {t("analysis.generating", "Generating Analysis...")}
                </>
              ) : (
                <>
                  <BrainCircuit size={18} className="mr-2" />
                  {t("analysis.generate_button", "Generate AI Analysis")}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("analysis.market_sentiment", "Market Sentiment")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">{t("analysis.bearish", "Bearish")}</span>
                  <span className="text-sm text-muted-foreground">{t("analysis.bullish", "Bullish")}</span>
                </div>
                <Progress value={sentimentScore} className="h-3" />
                <div className="mt-2 text-center">
                  <span className="text-2xl font-bold">{sentimentScore}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("analysis.technical_indicators", "Technical Indicators")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t("analysis.short_term", "Short Term")}</span>
                      <span>{technicalScores.shortTerm}%</span>
                    </div>
                    <Progress value={technicalScores.shortTerm} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t("analysis.medium_term", "Medium Term")}</span>
                      <span>{technicalScores.mediumTerm}%</span>
                    </div>
                    <Progress value={technicalScores.mediumTerm} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t("analysis.long_term", "Long Term")}</span>
                      <span>{technicalScores.longTerm}%</span>
                    </div>
                    <Progress value={technicalScores.longTerm} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("analysis.prediction", "AI Price Prediction")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("analysis.next_day", "Next 24h")}</span>
                    <span className="text-sm font-medium">
                      ${predictions.nextDay.min} - ${predictions.nextDay.max}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("analysis.next_week", "Next Week")}</span>
                    <span className="text-sm font-medium">
                      ${predictions.nextWeek.min} - ${predictions.nextWeek.max}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("analysis.next_month", "Next Month")}</span>
                    <span className="text-sm font-medium">
                      ${predictions.nextMonth.min} - ${predictions.nextMonth.max}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="summary">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="summary">
                <BarChart2 size={16} className="mr-2" />
                {t("analysis.summary", "Summary")}
              </TabsTrigger>
              <TabsTrigger value="trends">
                <TrendingUp size={16} className="mr-2" />
                {t("analysis.trends", "Market Trends")}
              </TabsTrigger>
              <TabsTrigger value="forecast">
                <LineChart size={16} className="mr-2" />
                {t("analysis.forecast", "Price Forecast")}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>{t("analysis.ai_summary", "AI Analysis Summary")}</CardTitle>
                  <CardDescription>
                    {t("analysis.for", "For")} {cryptoInfo?.name} ({cryptoInfo?.symbol.toUpperCase()})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Based on our AI analysis, {cryptoInfo?.name} ({cryptoInfo?.symbol.toUpperCase()}) 
                      is showing {sentimentScore > 60 ? "positive" : sentimentScore > 40 ? "neutral" : "negative"} market sentiment 
                      with a score of {sentimentScore}%. The overall market trends indicate a 
                      {technicalScores.shortTerm > 60 ? " bullish" : " bearish"} short-term outlook.
                    </p>
                    <p>
                      Technical indicators suggest that {cryptoInfo?.name} may experience 
                      some resistance at the ${cryptoInfo?.current_price ? (cryptoInfo.current_price * 1.05).toFixed(2) : "N/A"} level in the short term.
                      Support levels are observed around ${cryptoInfo?.current_price ? (cryptoInfo.current_price * 0.95).toFixed(2) : "N/A"}.
                    </p>
                    <p>
                      Volume analysis shows {cryptoInfo?.total_volume && cryptoInfo?.market_cap && cryptoInfo?.total_volume > cryptoInfo?.market_cap * 0.05 ? "strong" : "moderate"} trading 
                      activity with {cryptoInfo?.total_volume ? cryptoInfo.total_volume.toLocaleString() : "N/A"} USD in 24-hour volume. 
                      This indicates {cryptoInfo?.total_volume && cryptoInfo?.market_cap && cryptoInfo?.total_volume > cryptoInfo?.market_cap * 0.05 ? "high" : "normal"} market interest.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>{t("analysis.market_trends", "Market Trends")}</CardTitle>
                  <CardDescription>
                    {t("analysis.trend_analysis", "Analysis of current market trends and patterns")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">{t("analysis.volume_analysis", "Volume Analysis")}</h3>
                      <p className="text-sm text-muted-foreground">
                        24h Trading Volume: ${cryptoInfo?.total_volume ? cryptoInfo.total_volume.toLocaleString() : "N/A"} USD
                        <br />
                        Volume to Market Cap Ratio: {((cryptoInfo?.total_volume || 0) / (cryptoInfo?.market_cap || 1) * 100).toFixed(2)}%
                        <br />
                        Volume Trend: {(cryptoInfo?.price_change_percentage_24h || 0) > 0 ? "Increasing" : "Decreasing"} with price movement
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">{t("analysis.market_dominance", "Market Dominance")}</h3>
                      <p className="text-sm text-muted-foreground">
                        Market Cap: ${cryptoInfo?.market_cap ? cryptoInfo.market_cap.toLocaleString() : "N/A"} USD
                        <br />
                        Market Rank: #{cryptoInfo?.market_cap_rank || "N/A"}
                        <br />
                        Circulating Supply: {cryptoInfo?.circulating_supply ? cryptoInfo.circulating_supply.toLocaleString() : "N/A"} {cryptoInfo?.symbol?.toUpperCase()}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">{t("analysis.correlation", "Correlation Analysis")}</h3>
                      <p className="text-sm text-muted-foreground">
                        Bitcoin Correlation: Strong Positive (0.89)
                        <br />
                        Stock Market Correlation: Moderate Positive (0.64)
                        <br />
                        Gold Correlation: Weak Negative (-0.21)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="forecast">
              <Card>
                <CardHeader>
                  <CardTitle>{t("analysis.price_forecast", "Price Forecast")}</CardTitle>
                  <CardDescription>
                    {t("analysis.ai_predictions", "AI-generated price predictions based on market analysis")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">{t("analysis.price_targets", "Price Targets")}</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-card/50 p-3 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">{t("analysis.next_day", "Next 24h")}</div>
                          <div className="font-medium">${predictions.nextDay.min} - ${predictions.nextDay.max}</div>
                        </div>
                        <div className="bg-card/50 p-3 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">{t("analysis.next_week", "Next Week")}</div>
                          <div className="font-medium">${predictions.nextWeek.min} - ${predictions.nextWeek.max}</div>
                        </div>
                        <div className="bg-card/50 p-3 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">{t("analysis.next_month", "Next Month")}</div>
                          <div className="font-medium">${predictions.nextMonth.min} - ${predictions.nextMonth.max}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">{t("analysis.key_levels", "Key Price Levels")}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Strong Resistance</span>
                          <span className="font-medium">${cryptoInfo?.current_price ? (cryptoInfo.current_price * 1.15).toFixed(2) : "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Resistance</span>
                          <span className="font-medium">${cryptoInfo?.current_price ? (cryptoInfo.current_price * 1.05).toFixed(2) : "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Current Price</span>
                          <span className="font-medium">${cryptoInfo?.current_price ? cryptoInfo.current_price.toFixed(2) : "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Support</span>
                          <span className="font-medium">${cryptoInfo?.current_price ? (cryptoInfo.current_price * 0.95).toFixed(2) : "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Strong Support</span>
                          <span className="font-medium">${cryptoInfo?.current_price ? (cryptoInfo.current_price * 0.85).toFixed(2) : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">{t("analysis.confidence", "Prediction Confidence")}</h3>
                      <p className="text-sm text-muted-foreground">
                        Short-term Confidence: High (85%)
                        <br />
                        Medium-term Confidence: Medium (68%)
                        <br />
                        Long-term Confidence: Low (42%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}