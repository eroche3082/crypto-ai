import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCryptoData } from "@/hooks/useCryptoData";
import CryptoCard from "@/components/CryptoCard";
import Header from "@/components/Header";
import PriceChart from "@/components/PriceChart";
import CryptoConverter from "@/components/CryptoConverter";
import { RefreshCw, ArrowRight, User, Lock, CheckCircle, Stars, Star, Award, Trophy } from "lucide-react";
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
  
  return (
    <div className="flex flex-col h-full overflow-auto pb-8">
      <Header />
      
      {/* Welcome section for personalized dashboard based on onboarding code */}
      {showWelcome && accessCode && (
        <div className="px-6 pt-4">
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
        </div>
      )}
      
      <div className="px-6 py-4">
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
    </div>
  );
};

export default Dashboard;
