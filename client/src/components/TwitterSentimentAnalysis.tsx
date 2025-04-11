import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useCrypto } from "@/contexts/CryptoContext";
import { Circle, TrendingDown, TrendingUp, Minus, Twitter, BarChart, PieChart, BarChart2 } from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useLocation } from 'wouter';

interface SentimentData {
  symbol: string;
  name: string;
  overallSentiment: {
    score: number;
    sentiment: "positive" | "negative" | "neutral";
    confidence: number;
  };
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentTweets: {
    id: string;
    text: string;
    created_at: string;
    sentiment: {
      sentiment: "positive" | "negative" | "neutral";
      score: number;
      confidence: number;
    };
  }[];
  tweetCount: number;
  trend: "up" | "down" | "stable";
  volume24h: number;
  lastUpdated: string;
}

interface MarketSentimentData {
  tokens: Record<string, {
    symbol: string;
    name: string;
    sentiment: {
      score: number;
      sentiment: "positive" | "negative" | "neutral";
      confidence: number;
    };
    trend: "up" | "down" | "stable";
    volume24h: number;
    lastUpdated: string;
  }>;
  count: number;
  last_updated: string;
}

const COLORS = ['#10b981', '#6b7280', '#ef4444'];

const TwitterSentimentAnalysis: React.FC = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC');
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [marketSentiment, setMarketSentiment] = useState<MarketSentimentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartTab, setChartTab] = useState<'pie' | 'bar'>('pie');
  const { toast } = useToast();
  const { cryptos } = useCrypto();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (selectedCrypto) {
      fetchSentimentData(selectedCrypto);
    }
    
    fetchMarketSentiment();
  }, [selectedCrypto]);

  const fetchSentimentData = async (symbol: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sentiment/twitter/${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sentiment data');
      }
      const data = await response.json();
      setSentimentData(data);
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
      toast({
        title: "Error",
        description: "Could not load Twitter sentiment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketSentiment = async () => {
    try {
      // Get the top 10 cryptocurrencies by market cap
      const symbols = cryptos.slice(0, 10).map(crypto => crypto.symbol.toUpperCase()).join(',');
      const response = await fetch(`/api/sentiment/market?symbols=${symbols}`);
      if (!response.ok) {
        throw new Error('Failed to fetch market sentiment data');
      }
      const data = await response.json();
      setMarketSentiment(data);
    } catch (error) {
      console.error("Error fetching market sentiment data:", error);
    }
  };

  const getSentimentColor = (sentiment: "positive" | "negative" | "neutral") => {
    switch (sentiment) {
      case "positive": return "bg-green-500";
      case "negative": return "bg-red-500";
      case "neutral": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getSentimentText = (sentiment: "positive" | "negative" | "neutral") => {
    switch (sentiment) {
      case "positive": return "Positivo";
      case "negative": return "Negativo";
      case "neutral": return "Neutral";
      default: return "Desconocido";
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up": return <TrendingUp className="text-green-500" />;
      case "down": return <TrendingDown className="text-red-500" />;
      case "stable": return <Minus className="text-gray-500" />;
      default: return <Circle className="text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Data for the pie chart
  const getPieChartData = () => {
    if (!sentimentData) return [];
    
    return [
      { name: 'Positivo', value: sentimentData.breakdown.positive },
      { name: 'Neutral', value: sentimentData.breakdown.neutral },
      { name: 'Negativo', value: sentimentData.breakdown.negative },
    ];
  };

  // Data for the bar chart comparing top cryptocurrencies
  const getBarChartData = () => {
    if (!marketSentiment) return [];
    
    return Object.values(marketSentiment.tokens).map(token => ({
      name: token.symbol,
      score: parseFloat((token.sentiment.score * 100).toFixed(1)),
    })).sort((a, b) => b.score - a.score);
  };

  // Create a color scale based on sentiment score
  const getScoreColor = (score: number) => {
    if (score > 30) return '#10b981';  // Green for positive
    if (score < -30) return '#ef4444'; // Red for negative
    return '#6b7280';                  // Gray for neutral
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <Card>
          <CardHeader className="bg-card/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Twitter className="h-6 w-6 text-[#1DA1F2]" />
                  Análisis de Sentimiento Twitter/X
                </CardTitle>
                <CardDescription>Analiza el sentimiento de la comunidad cripto en tiempo real</CardDescription>
              </div>
              <Tabs value={chartTab} onValueChange={(value) => setChartTab(value as 'pie' | 'bar')} className="w-auto">
                <TabsList>
                  <TabsTrigger value="pie" className="flex items-center gap-1"><PieChart className="h-4 w-4" />Sentimiento</TabsTrigger>
                  <TabsTrigger value="bar" className="flex items-center gap-1"><BarChart2 className="h-4 w-4" />Comparación</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-6">
              <div className="flex overflow-x-auto pb-2 gap-2">
                {cryptos.slice(0, 12).map((crypto) => (
                  <Button
                    key={crypto.symbol}
                    variant={selectedCrypto === crypto.symbol.toUpperCase() ? "default" : "outline"}
                    className="whitespace-nowrap"
                    onClick={() => setSelectedCrypto(crypto.symbol.toUpperCase())}
                  >
                    {crypto.symbol.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <TabsContent value="pie" className="mt-0">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : sentimentData ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-card/50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Sentimiento General</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className={`h-3 w-3 rounded-full ${getSentimentColor(sentimentData.overallSentiment.sentiment)}`}></div>
                            <span className="font-bold text-lg">{getSentimentText(sentimentData.overallSentiment.sentiment)}</span>
                          </div>
                          <p className="text-muted-foreground">Score: {(sentimentData.overallSentiment.score * 100).toFixed(1)}%</p>
                          <p className="text-muted-foreground">Confianza: {(sentimentData.overallSentiment.confidence * 100).toFixed(0)}%</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 justify-end">
                            {getTrendIcon(sentimentData.trend)}
                            <span className="font-medium">
                              {sentimentData.trend === 'up' ? 'Tendencia al alza' : 
                               sentimentData.trend === 'down' ? 'Tendencia a la baja' : 'Tendencia estable'}
                            </span>
                          </div>
                          <p className="text-muted-foreground">Volumen: {sentimentData.tweetCount.toLocaleString()} tweets</p>
                          <p className="text-muted-foreground text-xs">Actualizado: {formatDate(sentimentData.lastUpdated)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-card/50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Distribución de Sentimiento</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Positivo ({sentimentData.breakdown.positive})</span>
                            <span className="text-sm text-muted-foreground">
                              {((sentimentData.breakdown.positive / 
                                (sentimentData.breakdown.positive + sentimentData.breakdown.neutral + sentimentData.breakdown.negative)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={
                            (sentimentData.breakdown.positive / 
                              (sentimentData.breakdown.positive + sentimentData.breakdown.neutral + sentimentData.breakdown.negative)) * 100
                          } className="h-2 bg-muted" indicatorClassName="bg-green-500" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Neutral ({sentimentData.breakdown.neutral})</span>
                            <span className="text-sm text-muted-foreground">
                              {((sentimentData.breakdown.neutral / 
                                (sentimentData.breakdown.positive + sentimentData.breakdown.neutral + sentimentData.breakdown.negative)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={
                            (sentimentData.breakdown.neutral / 
                              (sentimentData.breakdown.positive + sentimentData.breakdown.neutral + sentimentData.breakdown.negative)) * 100
                          } className="h-2 bg-muted" indicatorClassName="bg-gray-500" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Negativo ({sentimentData.breakdown.negative})</span>
                            <span className="text-sm text-muted-foreground">
                              {((sentimentData.breakdown.negative / 
                                (sentimentData.breakdown.positive + sentimentData.breakdown.neutral + sentimentData.breakdown.negative)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={
                            (sentimentData.breakdown.negative / 
                              (sentimentData.breakdown.positive + sentimentData.breakdown.neutral + sentimentData.breakdown.negative)) * 100
                          } className="h-2 bg-muted" indicatorClassName="bg-red-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setLocation('/');
                          setTimeout(() => {
                            const dashboardElement = document.getElementById('crypto-dashboard');
                            if (dashboardElement) {
                              dashboardElement.scrollIntoView({ behavior: 'smooth' });
                            }
                          }, 100);
                        }}
                      >
                        Ver Precio Actual
                      </Button>
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={() => {
                          fetchSentimentData(selectedCrypto);
                          toast({
                            title: "Actualizando datos",
                            description: `Obteniendo el último sentimiento para ${selectedCrypto}`,
                          });
                        }}
                      >
                        Actualizar Datos
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-center h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={getPieChartData()}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {getPieChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, 'Cantidad']} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="bg-card/50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Tweets Recientes</h3>
                      <ScrollArea className="h-[220px]">
                        <div className="space-y-3">
                          {sentimentData.recentTweets.map((tweet) => (
                            <div key={tweet.id} className="p-3 bg-card rounded-lg">
                              <div className="flex justify-between mb-1">
                                <Badge variant="outline" className={`${getSentimentColor(tweet.sentiment.sentiment)} bg-opacity-10 text-xs`}>
                                  {getSentimentText(tweet.sentiment.sentiment)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{new Date(tweet.created_at).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-sm">{tweet.text}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No se pudieron cargar los datos de sentimiento.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => fetchSentimentData(selectedCrypto)}
                  >
                    Reintentar
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="bar" className="mt-0">
              {!marketSentiment ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-card/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Comparación de Sentimiento de Mercado</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={getBarChartData()}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 50,
                          }}
                          barSize={30}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                          <YAxis domain={[-100, 100]} label={{ value: 'Sentiment Score (%)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Sentiment Score']} />
                          <Bar dataKey="score" fill="#8884d8" name="Sentiment Score">
                            {getBarChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                            ))}
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="bg-card/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">Resumen de Sentimiento por Criptomoneda</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-muted">
                            <th className="px-4 py-2 text-left">Símbolo</th>
                            <th className="px-4 py-2 text-left">Nombre</th>
                            <th className="px-4 py-2 text-left">Sentimiento</th>
                            <th className="px-4 py-2 text-right">Score</th>
                            <th className="px-4 py-2 text-center">Tendencia</th>
                            <th className="px-4 py-2 text-right">Volumen 24h</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(marketSentiment.tokens)
                            .sort((a, b) => b.sentiment.score - a.sentiment.score)
                            .map(token => (
                            <tr key={token.symbol} className="border-b border-muted hover:bg-muted/20">
                              <td className="px-4 py-2.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedCrypto(token.symbol)}
                                  className="px-2 py-1 h-auto"
                                >
                                  {token.symbol}
                                </Button>
                              </td>
                              <td className="px-4 py-2.5">{token.name}</td>
                              <td className="px-4 py-2.5">
                                <Badge variant="outline" className={`${getSentimentColor(token.sentiment.sentiment)} bg-opacity-10`}>
                                  {getSentimentText(token.sentiment.sentiment)}
                                </Badge>
                              </td>
                              <td className="px-4 py-2.5 text-right font-medium">
                                {(token.sentiment.score * 100).toFixed(1)}%
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                {getTrendIcon(token.trend)}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                {token.volume24h.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-2 text-right text-xs text-muted-foreground">
                      Última actualización: {marketSentiment.last_updated ? formatDate(marketSentiment.last_updated) : 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TwitterSentimentAnalysis;