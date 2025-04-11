import { useState, useEffect } from "react";
import { useGemini } from "@/contexts/GeminiContext";
import { useCrypto } from "@/contexts/CryptoContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BarChart4, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "bot";
  content: string;
};

type Analysis = {
  price: string;
  prediction: string;
  sentiment: "positive" | "negative" | "neutral";
  risk: string;
  recommendation: string;
};

export default function Analysis() {
  const { generateResponse, isLoading: aiLoading } = useGemini();
  const { cryptoData, isLoading: dataLoading } = useCrypto();
  const [selectedCrypto, setSelectedCrypto] = useState("bitcoin");
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  // Generate analysis for selected crypto
  const generateAnalysis = async (cryptoId: string) => {
    if (isGenerating || !cryptoData) return;
    
    const crypto = cryptoData.find(c => c.id === cryptoId);
    if (!crypto) return;
    
    setIsGenerating(true);
    
    try {
      const prompt = `Please analyze ${crypto.name} (${crypto.symbol.toUpperCase()}) based on the following data:
Current price: $${crypto.current_price}
24h change: ${crypto.price_change_percentage_24h.toFixed(2)}%
7d volume: $${crypto.total_volume}

Provide a brief analysis with the following sections:
1. Price analysis
2. Short-term prediction (next 24-48 hours)
3. Market sentiment (positive, negative, or neutral)
4. Risk assessment
5. Recommendation

Please format your response as bullet points for each section and keep it concise.`;

      const messages: Message[] = [{ role: "user", content: prompt }];
      const response = await generateResponse(prompt, messages);
      
      // Parse response to extract sections
      // This is a simple parser and might need adjustments
      const sections = response.split(/\d\.\s+/).filter(Boolean);
      
      // Detect sentiment from the text
      const sentimentText = sections[2]?.toLowerCase() || "";
      let sentiment: "positive" | "negative" | "neutral" = "neutral";
      
      if (sentimentText.includes("positive") || sentimentText.includes("bullish")) {
        sentiment = "positive";
      } else if (sentimentText.includes("negative") || sentimentText.includes("bearish")) {
        sentiment = "negative";
      }
      
      // Create structured analysis
      const analysis: Analysis = {
        price: sections[0] || "No price analysis available",
        prediction: sections[1] || "No prediction available",
        sentiment,
        risk: sections[3] || "No risk assessment available",
        recommendation: sections[4] || "No recommendation available",
      };
      
      setAnalyses(prev => ({
        ...prev,
        [cryptoId]: analysis
      }));
      
      toast({
        title: "Analysis Generated",
        description: `AI analysis for ${crypto.name} is ready`
      });
      
    } catch (error) {
      console.error("Error generating analysis:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not generate AI analysis. Try again later.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Auto-generate analysis for selected crypto on first load
  useEffect(() => {
    if (cryptoData && selectedCrypto && !analyses[selectedCrypto] && !isGenerating) {
      generateAnalysis(selectedCrypto);
    }
  }, [cryptoData, selectedCrypto]);
  
  // Display loading state
  if (dataLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const selectedCryptoData = cryptoData?.find(c => c.id === selectedCrypto);
  const analysis = analyses[selectedCrypto];
  
  return (
    <div className="container mx-auto p-6 h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Analysis</h1>
        <p className="text-muted-foreground">Intelligent market insights powered by Gemini AI</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crypto selector sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Cryptocurrency</CardTitle>
              <CardDescription>Choose a crypto for AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              <div className="space-y-2">
                {cryptoData?.slice(0, 10).map(crypto => (
                  <Button
                    key={crypto.id}
                    variant={selectedCrypto === crypto.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCrypto(crypto.id)}
                  >
                    <div className="w-6 h-6 mr-2 flex items-center justify-center">
                      <img 
                        src={`https://cryptoicons.org/api/icon/${crypto.symbol.toLowerCase()}/25`} 
                        alt={crypto.name}
                        className="max-w-full max-h-full"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/25x25?text=' + crypto.symbol.substring(0, 1).toUpperCase();
                        }}
                      />
                    </div>
                    <span>{crypto.name}</span>
                    <span className="ml-auto flex items-center">
                      ${crypto.current_price.toLocaleString()}
                      <span className={`ml-2 text-xs ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {crypto.price_change_percentage_24h >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                      </span>
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main analysis content */}
        <div className="lg:col-span-2">
          {selectedCryptoData && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <img 
                        src={`https://cryptoicons.org/api/icon/${selectedCryptoData.symbol.toLowerCase()}/30`}
                        alt={selectedCryptoData.name}
                        className="mr-2"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/30x30?text=' + selectedCryptoData.symbol.substring(0, 1).toUpperCase();
                        }}
                      />
                      {selectedCryptoData.name} ({selectedCryptoData.symbol.toUpperCase()})
                    </CardTitle>
                    <CardDescription>
                      Current Price: ${selectedCryptoData.current_price.toLocaleString()}
                      <span className={`ml-2 ${selectedCryptoData.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedCryptoData.price_change_percentage_24h >= 0 ? '↑' : '↓'}
                        {Math.abs(selectedCryptoData.price_change_percentage_24h).toFixed(2)}%
                      </span>
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => generateAnalysis(selectedCrypto)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Refresh Analysis'
                    )}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )}
          
          {isGenerating && !analysis ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-xl font-medium">Generating AI Analysis</p>
                  <p className="text-muted-foreground">
                    Analyzing market data and trends for {selectedCryptoData?.name}...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : analysis ? (
            <Tabs defaultValue="analysis">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="prediction">Prediction</TabsTrigger>
                <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart4 className="mr-2 h-5 w-5" />
                      Price Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{analysis.price}</p>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                      Analysis based on current market data and historical patterns
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="prediction">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Short-Term Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{analysis.prediction}</p>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                      Predictions are estimates and not financial advice
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="sentiment">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {analysis.sentiment === "positive" ? (
                        <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                      ) : analysis.sentiment === "negative" ? (
                        <ArrowDownRight className="mr-2 h-5 w-5 text-red-500" />
                      ) : (
                        <span className="mr-2">→</span>
                      )}
                      Market Sentiment: {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`p-4 rounded-lg mb-4 ${
                      analysis.sentiment === "positive" ? "bg-green-500/10" :
                      analysis.sentiment === "negative" ? "bg-red-500/10" :
                      "bg-gray-500/10"
                    }`}>
                      <p className="whitespace-pre-line">{analysis.sentiment}</p>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Risk Assessment</h4>
                      <p className="whitespace-pre-line">{analysis.risk}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                      Sentiment analysis reflects the current market mood
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="recommendation">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      AI Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-secondary rounded-lg mb-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">DISCLAIMER</p>
                      <p className="text-sm text-muted-foreground">
                        This is not financial advice. All analyses and recommendations are provided for informational purposes only.
                        Always conduct your own research before making investment decisions.
                      </p>
                    </div>
                    <p className="whitespace-pre-line">{analysis.recommendation}</p>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                      Consider consulting with a financial advisor for personalized advice
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-xl font-medium">No Analysis Available</p>
                  <p className="text-muted-foreground mb-6">
                    Generate an AI analysis for {selectedCryptoData?.name} to see insights and predictions
                  </p>
                  <Button 
                    onClick={() => generateAnalysis(selectedCrypto)}
                    disabled={isGenerating}
                  >
                    Generate Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}