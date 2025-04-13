import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCryptoData } from "@/hooks/useCryptoData";
import CryptoCard from "@/components/CryptoCard";
import Header from "@/components/Header";
import PriceChart from "@/components/PriceChart";
import CryptoConverter from "@/components/CryptoConverter";
import { RefreshCw, ArrowRight, User, Lock, CheckCircle, Stars, Star, Award, Trophy, Copy, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { CryptoData } from "@/lib/cryptoApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Define the features that will be unlocked based on user category
const CATEGORY_FEATURES = {
  BEGINNER: ['Market Analysis', 'Educational Content', 'Basic Alerts'],
  INTER: ['Portfolio Tracking', 'Advanced Charts', 'Trend Detection', 'DeFi Insights'],
  EXPERT: ['AI Trading Signals', 'Risk Analysis', 'Market Sentiment', 'Advanced Alerts'],
  VIP: ['Priority Support', 'Premium Research', 'Custom Alerts', 'Whale Activity']
};

// Define the journey levels for each category
const JOURNEY_LEVELS = {
  BEGINNER: [
    { name: 'Novice', unlocked: true, icon: <User size={16} /> },
    { name: 'Explorer', unlocked: true, icon: <Star size={16} /> },
    { name: 'Learner', unlocked: true, icon: <Trophy size={16} /> },
    { name: 'Enthusiast', unlocked: false, icon: <Lock size={16} /> },
    { name: 'Trader', unlocked: false, icon: <Lock size={16} /> }
  ],
  INTER: [
    { name: 'Novice', unlocked: true, icon: <User size={16} /> },
    { name: 'Explorer', unlocked: true, icon: <Star size={16} /> },
    { name: 'Learner', unlocked: true, icon: <Trophy size={16} /> },
    { name: 'Enthusiast', unlocked: true, icon: <Stars size={16} /> },
    { name: 'Trader', unlocked: false, icon: <Lock size={16} /> }
  ],
  EXPERT: [
    { name: 'Novice', unlocked: true, icon: <User size={16} /> },
    { name: 'Explorer', unlocked: true, icon: <Star size={16} /> },
    { name: 'Learner', unlocked: true, icon: <Trophy size={16} /> },
    { name: 'Enthusiast', unlocked: true, icon: <Stars size={16} /> },
    { name: 'Trader', unlocked: true, icon: <Award size={16} /> }
  ],
  VIP: [
    { name: 'Novice', unlocked: true, icon: <User size={16} /> },
    { name: 'Explorer', unlocked: true, icon: <Star size={16} /> },
    { name: 'Learner', unlocked: true, icon: <Trophy size={16} /> },
    { name: 'Enthusiast', unlocked: true, icon: <Stars size={16} /> },
    { name: 'Trader', unlocked: true, icon: <Award size={16} /> }
  ]
};

const Dashboard = () => {
  const { t } = useTranslation();
  const [timeFilter, setTimeFilter] = useState("24h");
  const [fromCrypto, setFromCrypto] = useState("btc");
  const [toCrypto, setToCrypto] = useState("usdt");
  const [amount, setAmount] = useState("1");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const { data, isLoading, error, refetch } = useCryptoData({ timeFilter });
  
  // Load user profile and access code on mount
  useEffect(() => {
    // Try to get from session storage first (freshly onboarded users)
    const code = sessionStorage.getItem('cryptoAccessCode');
    if (code) {
      setAccessCode(code);
    }
    
    // Try to get from local storage (returning users)
    const storedProfile = localStorage.getItem('cryptoUserProfile');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        setUserProfile(profile);
        
        // If we didn't have the code in session storage, use the one from profile
        if (!code && profile.unique_code) {
          setAccessCode(profile.unique_code);
        }
      } catch (e) {
        console.error('Error parsing user profile:', e);
      }
    }
  }, []);
  
  const handleTimeFilterChange = (filter: string) => {
    setTimeFilter(filter);
  };

  // Calculate crypto conversion result based on current prices
  const calculateConversion = () => {
    if (!data) return "0";
    
    const fromCryptoData = data.find(c => c.symbol === fromCrypto);
    const toCryptoData = data.find(c => c.symbol === toCrypto);
    
    if (!fromCryptoData || !toCryptoData || !amount) return "0";
    
    const fromValueInUSD = fromCryptoData.current_price * parseFloat(amount);
    const toAmount = fromValueInUSD / toCryptoData.current_price;
    
    return toAmount.toFixed(8);
  };
  
  // Get user category from access code or default to BEGINNER
  const getUserCategory = () => {
    if (!accessCode) return 'BEGINNER';
    const parts = accessCode.split('-');
    return parts.length > 1 ? parts[1] : 'BEGINNER';
  };
  
  // Get features for the user's category
  const getUnlockedFeatures = () => {
    const category = getUserCategory();
    return CATEGORY_FEATURES[category as keyof typeof CATEGORY_FEATURES] || CATEGORY_FEATURES.BEGINNER;
  };
  
  // Get journey levels for the user's category
  const getJourneyLevels = () => {
    const category = getUserCategory();
    return JOURNEY_LEVELS[category as keyof typeof JOURNEY_LEVELS] || JOURNEY_LEVELS.BEGINNER;
  };
  
  // Copy access code to clipboard
  const { toast } = useToast();
  const copyAccessCode = () => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode);
      toast({
        title: "Code copied to clipboard",
        description: "You can share this code to invite friends",
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full overflow-auto pb-8">
      <Header />
      
      {/* Personalized Code Section - Always visible at the top of the dashboard */}
      {accessCode && (
        <div className="bg-primary/10 border-b border-primary/20">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Your Access Code:</span>
              <code className="bg-background px-2 py-1 rounded text-sm font-mono">{accessCode}</code>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={copyAccessCode}>
                <Copy size={14} className="mr-1" /> Copy
              </Button>
              <Button variant="ghost" size="sm" disabled title="Coming soon">
                <QrCode size={14} className="mr-1" /> QR Code
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Dashboard Tabs */}
      <div className="px-6 pt-4">
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="journey">Your Journey</TabsTrigger>
          </TabsList>
          
          <TabsContent value="journey" className="space-y-4">
            {accessCode ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Your Personalized Profile</CardTitle>
                    <CardDescription>
                      Based on your onboarding responses, we've personalized your crypto experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-primary/5 p-4 rounded-lg mb-6 border border-primary/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <span className="text-xl font-semibold">{getUserCategory().charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{getUserCategory()} Level</h3>
                          <p className="text-sm text-muted-foreground">
                            {getUserCategory() === 'BEGINNER' && 'Perfect for new crypto enthusiasts'}
                            {getUserCategory() === 'INTER' && 'Ideal for growing crypto investors'}
                            {getUserCategory() === 'EXPERT' && 'Advanced features for experienced traders'}
                            {getUserCategory() === 'VIP' && 'Premium experience with exclusive features'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Profile Completion</span>
                          <span>100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Your Access Code</h4>
                          <div className="flex items-center gap-2 mb-4">
                            <code className="flex-1 bg-background px-3 py-2 rounded text-sm font-mono border">{accessCode}</code>
                            <Button size="sm" variant="outline" onClick={copyAccessCode} title="Copy code">
                              <Copy size={14} />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Use this code as your referral ID</span>
                            <Button variant="link" size="sm" className="h-auto p-0">Share</Button>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">QR Code</h4>
                          <div className="bg-muted rounded-lg border border-border flex items-center justify-center p-4 h-[100px]">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground mb-2">Coming Soon</p>
                              <Button variant="outline" size="sm" disabled>
                                <Download size={14} className="mr-1" /> Download QR Code
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-4">Your Journey Progress</h3>
                    <div className="space-y-6 mb-6">
                      {getJourneyLevels().map((level, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1 ${level.unlocked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {level.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-medium">{level.name}</h4>
                              {level.unlocked ? (
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                                  <CheckCircle size={12} className="mr-1" /> Unlocked
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-muted text-muted-foreground">
                                  <Lock size={12} className="mr-1" /> Locked
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {index === 0 && 'Basic market analysis and educational resources'}
                              {index === 1 && 'Access to price alerts and portfolio tracking tools'}
                              {index === 2 && 'Advanced market data and personalized insights'}
                              {index === 3 && 'AI-powered trading recommendations and risk assessment'}
                              {index === 4 && 'Premium features with priority support and exclusive reports'}
                            </p>
                            {!level.unlocked && (
                              <Button variant="outline" size="sm">
                                Upgrade to Unlock
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-4">Unlocked Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      {getUnlockedFeatures().map((feature, index) => (
                        <div key={index} className="bg-card rounded-lg p-3 border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={14} className="text-green-500" />
                            <h4 className="font-medium">{feature}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Access premium {feature.toLowerCase()} tools tailored to your profile
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <User size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No Profile Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete the onboarding process to create your personalized crypto journey
                    </p>
                    <Button>Start Onboarding</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="dashboard">
            {/* Welcome section for personalized dashboard based on onboarding code */}
            {showWelcome && accessCode && (
              <Card className="bg-primary/5 border-primary/20 mb-6">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Welcome to Your Personalized Dashboard</CardTitle>
                      <CardDescription>
                        Access Code: <Badge variant="outline" className="ml-1 font-mono">{accessCode}</Badge>
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowWelcome(false)}>
                      Hide
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-sm font-semibold mb-2">Your Journey</h3>
                  <div className="flex items-center justify-between mb-4">
                    {getJourneyLevels().map((level, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${level.unlocked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {level.icon}
                        </div>
                        <span className="text-xs">{level.name}</span>
                        {level.unlocked && <CheckCircle size={12} className="text-green-500 mt-1" />}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mb-2 flex justify-between items-center">
                    <h3 className="text-sm font-semibold">Unlocked Features</h3>
                    <Badge>{getUserCategory()}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {getUnlockedFeatures().map((feature, index) => (
                      <div key={index} className="bg-background rounded-md p-2 text-center text-xs border border-border">
                        <CheckCircle size={12} className="text-green-500 inline-block mr-1" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="py-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
                  <p className="text-muted-foreground text-sm">
                    {t("dashboard.subtitle", "Track prices, trends, and news in real-time")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => refetch()}
                    title={t("common.refresh")}
                  >
                    <RefreshCw size={20} />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {t("dashboard.lastUpdated", "Last updated")}: {t("dashboard.justNow", "Just now")}
                  </span>
                </div>
              </div>
              
              {/* Market Overview */}
              <div className="mb-8">
                <h2 className="text-xl font-medium mb-4">{t("dashboard.marketOverview", "Market Overview")}</h2>
                
                <div className="flex gap-2 mb-4">
                  <Button 
                    variant={timeFilter === "24h" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleTimeFilterChange("24h")}
                  >
                    24h
                  </Button>
                  <Button 
                    variant={timeFilter === "7d" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleTimeFilterChange("7d")}
                  >
                    7d
                  </Button>
                  <Button 
                    variant={timeFilter === "1m" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleTimeFilterChange("1m")}
                  >
                    1m
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, index) => (
                      <div key={index} className="bg-card rounded-lg p-4 h-[140px] animate-pulse" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center p-8 text-error">
                    <p className="text-lg mb-2">{t("dashboard.error", "Error loading data")}</p>
                    <p className="text-sm">{String(error)}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data?.slice(0, 8).map((crypto: CryptoData) => (
                      <CryptoCard 
                        key={crypto.id} 
                        crypto={crypto} 
                        timeFilter={timeFilter}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Featured Chart */}
              {data && data.length > 0 && (
                <div className="bg-card rounded-lg p-4 mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                      <span>{data[0].symbol.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{data[0].name} <span className="text-muted-foreground text-sm">{data[0].symbol.toUpperCase()}</span></h3>
                      <div className="flex items-center">
                        <span className="text-xl font-bold">${data[0].current_price.toLocaleString()}</span>
                        <span 
                          className={`ml-2 text-sm ${data[0].price_change_percentage_24h >= 0 ? 'text-success' : 'text-error'}`}
                        >
                          {data[0].price_change_percentage_24h >= 0 ? '+' : ''}{data[0].price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <Button variant="outline" size="sm">1D</Button>
                    <Button variant="outline" size="sm">1W</Button>
                    <Button variant="outline" size="sm">1M</Button>
                    <Button variant="outline" size="sm">3M</Button>
                    <Button variant="outline" size="sm">1Y</Button>
                    <Button variant="outline" size="sm">All</Button>
                  </div>
                  
                  <div className="h-64 bg-secondary/50 rounded-lg mb-4 overflow-hidden">
                    {data[0].sparkline_in_7d?.price ? (
                      <PriceChart 
                        data={data[0].sparkline_in_7d.price}
                        isPositive={data[0].price_change_percentage_24h >= 0}
                        timeFilter="7d"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-muted-foreground">No chart data available</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                      <p className="font-semibold">${data[0].market_cap?.toLocaleString()}</p>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Volume (24h)</p>
                      <p className="font-semibold">${data[0].total_volume?.toLocaleString()}</p>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">High (24h)</p>
                      <p className="font-semibold">${data[0].high_24h?.toLocaleString()}</p>
                    </div>
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Low (24h)</p>
                      <p className="font-semibold">${data[0].low_24h?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Latest News */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">{t("news.title", "Latest Crypto News")}</h2>
                  <Button variant="link" className="text-primary">
                    {t("news.viewAll", "View All")}
                  </Button>
                </div>
                
                <div className="bg-card rounded-lg p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-secondary rounded-lg flex-shrink-0"></div>
                    <div>
                      <h3 className="font-medium mb-1">XRP Price Eyes $2.0 Breakout—Can It Hold and Ignite a Bullish Surge?</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        XRP price started a fresh increase above the $1.850 resistance. The price is now consolidating
                        and must settle above $2.00 for more gains.
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">newsbtc • 4/10/2025</span>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">AI Summary</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Currency Converter */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">{t("converter.title", "Currency Converter")}</h2>
                </div>
                
                <div className="bg-card rounded-lg p-4">
                  {/* Simplified version of the converter for the dashboard */}
                  {data && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-sm text-muted-foreground block">
                          {t("converter.quickConvert", "Quick Convert")}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <Select 
                            value={fromCrypto} 
                            onValueChange={setFromCrypto}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {data.slice(0, 10).map((crypto) => (
                                <SelectItem key={crypto.id} value={crypto.symbol}>
                                  {crypto.symbol.toUpperCase()} - {crypto.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input 
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00" 
                            min="0"
                            step="0.0001"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm text-muted-foreground block">
                          {t("converter.to", "To")}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <Select 
                            value={toCrypto}
                            onValueChange={setToCrypto}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {data.slice(0, 10).map((crypto) => (
                                <SelectItem key={crypto.id} value={crypto.symbol}>
                                  {crypto.symbol.toUpperCase()} - {crypto.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input 
                            type="text"
                            value={calculateConversion()}
                            readOnly 
                            className="bg-secondary/30"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/converter'}
                      className="flex items-center gap-1 text-sm"
                    >
                      <span>{t("converter.fullConverter", "Go to full converter")}</span>
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;