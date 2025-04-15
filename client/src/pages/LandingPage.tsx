import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ChevronRight, CheckCircle, BarChart4, BrainCircuit, Bell, LineChart, Lock, RefreshCw, TrendingUp, Wallet, MessageCircle, AreaChart, ShieldAlert, Layers, PieChart, FileText, BarChart3, CloudLightning, ListChecks, Sparkles, Coins, ArrowUpRight, ArrowDownRight, Star as StarIcon, Mail, MapPin, Phone } from "lucide-react";
import ChatBot from "@/components/ChatBot";

// Create a custom StarHalfIcon component since it's not available in lucide-react
const StarHalfIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="lucide lucide-star-half"
  >
    <path d="M12 17.8 5.8 21 7 14.1 2 9.3l7-1L12 2" />
    <path d="M12 2v15.8l-6.2 3.2L7 14.1 2 9.3l7-1L12 2z" fill="currentColor" />
  </svg>
);

// Crypto data interface
interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  sparkline_in_7d: {
    price: number[];
  };
}

export default function LandingPage() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const startOnboardingRef = useRef<(() => void) | null>(null);
  
  // Fetch crypto data from the API
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch('/api/crypto/coins/markets');
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        const data = await response.json();
        
        // Make sure we have valid data before setting state
        if (Array.isArray(data) && data.length > 0) {
          setCryptoData(data);
        } else {
          console.warn('Received empty or invalid data from API');
        }
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCryptoData();
    
    // Retry if rate limited
    const retryTimeout = setTimeout(fetchCryptoData, 5000);
    return () => clearTimeout(retryTimeout);
  }, []);

  const features = [
    {
      title: "Portfolio Advisor",
      description: "Automatic portfolio analysis with optimization suggestions based on current market trends",
      icon: <BarChart4 className="h-8 w-8 text-primary" />
    },
    {
      title: "Market Sentiment Analyzer",
      description: "Real-time interpretation of market sentiment from news sources and social media",
      icon: <BrainCircuit className="h-8 w-8 text-primary" />
    },
    {
      title: "Price Alert Creator",
      description: "Set up personalized price alerts through the chat with simple commands",
      icon: <Bell className="h-8 w-8 text-primary" />
    },
    {
      title: "Chart Pattern Recognition",
      description: "Analysis of technical patterns in charts shared by the user with predictive insights",
      icon: <LineChart className="h-8 w-8 text-primary" />
    },
    {
      title: "Trading Strategy Simulator",
      description: "Suggests and simulates strategies with hypothetical results and risk assessment",
      icon: <RefreshCw className="h-8 w-8 text-primary" />
    },
    {
      title: "Crypto News Summarizer",
      description: "Summary of relevant industry news personalized based on your favorite assets",
      icon: <FileText className="h-8 w-8 text-primary" />
    },
    {
      title: "Tax Implications Calculator",
      description: "Evaluation of tax implications for potential transactions based on your jurisdiction",
      icon: <BarChart3 className="h-8 w-8 text-primary" />
    },
    {
      title: "Educational Content Recommender",
      description: "Educational recommendations based on your questions and knowledge level",
      icon: <ListChecks className="h-8 w-8 text-primary" />
    },
    {
      title: "Wallet Security Advisor",
      description: "Security recommendations for wallets, detecting and alerting about potential risks",
      icon: <Lock className="h-8 w-8 text-primary" />
    },
    {
      title: "Multi-Asset Converter",
      description: "Instant conversion between multiple cryptocurrencies and fiat currencies with simple commands",
      icon: <RefreshCw className="h-8 w-8 text-primary" />
    },
    {
      title: "Investment Diversification Guide",
      description: "Concentration analysis and diversification suggestions based on asset correlations",
      icon: <PieChart className="h-8 w-8 text-primary" />
    },
    {
      title: "Token Metrics Analyzer",
      description: "Detailed analysis of metrics, utility, demand, and supply for any cryptocurrency",
      icon: <BarChart4 className="h-8 w-8 text-primary" />
    },
    {
      title: "DeFi Yield Optimizer",
      description: "Identifies and compares yield opportunities in DeFi with risk analysis",
      icon: <TrendingUp className="h-8 w-8 text-primary" />
    },
    {
      title: "NFT Collection Evaluator",
      description: "Evaluation of NFT collections by volume, liquidity, and value projections",
      icon: <Layers className="h-8 w-8 text-primary" />
    },
    {
      title: "Regulatory Updates Tracker",
      description: "Information on regulatory changes that could affect your investments",
      icon: <FileText className="h-8 w-8 text-primary" />
    },
    {
      title: "Portfolio Risk Assessment",
      description: "Stress tests on your portfolio with customized hypothetical scenarios",
      icon: <ShieldAlert className="h-8 w-8 text-primary" />
    },
    {
      title: "Trading Bot Configuration",
      description: "Configuration and parameter adjustment for automated strategies through chat",
      icon: <Sparkles className="h-8 w-8 text-primary" />
    },
    {
      title: "Multi-Chain Gas Optimizer",
      description: "Recommendations on optimal times for transactions based on current fees",
      icon: <CloudLightning className="h-8 w-8 text-primary" />
    },
    {
      title: "Voice Note Market Analysis",
      description: "Send voice notes with questions about the market and receive detailed analysis",
      icon: <MessageCircle className="h-8 w-8 text-primary" />
    },
    {
      title: "Personalized Learning Path",
      description: "Create and adapt a personalized learning path based on your goals and knowledge",
      icon: <AreaChart className="h-8 w-8 text-primary" />
    },
  ];

  // Function to format market cap
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 text-primary rounded-full w-10 h-10 flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <span className="font-bold text-xl">CryptoBot</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Link href="/signup">
                <Button variant="ghost" className="text-white hover:bg-white/10">Sign Up</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="text-white border-white hover:bg-white/10">Log In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-black">
        {/* Dynamic background with gradients and animated particles */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5"></div>
          
          {/* Crypto-themed background elements */}
          <div className="absolute top-1/4 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute top-10 left-1/3 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
          
          {/* Bitcoin symbol styled element */}
          <div className="absolute bottom-20 right-[10%] text-primary/10 hidden md:block">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.5 11.5V7.5C11.5 6.39543 12.3954 5.5 13.5 5.5H15.5C16.6046 5.5 17.5 6.39543 17.5 7.5C17.5 8.60457 16.6046 9.5 15.5 9.5H17.5C18.6046 9.5 19.5 10.3954 19.5 11.5C19.5 12.6046 18.6046 13.5 17.5 13.5H15.5H13.5M11.5 11.5H8.5M11.5 11.5V15.5C11.5 16.6046 10.6046 17.5 9.5 17.5H7.5C6.39543 17.5 5.5 16.6046 5.5 15.5C5.5 14.3954 6.39543 13.5 7.5 13.5H5.5C4.39543 13.5 3.5 12.6046 3.5 11.5C3.5 10.3954 4.39543 9.5 5.5 9.5H7.5H9.5M8.5 5.5V8.5M8.5 14.5V17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* ETH symbol styled element */}
          <div className="absolute top-1/4 left-[15%] text-primary/10 hidden md:block">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 11.0001L12 13.0001L20 11.0001M4 11.0001L12 19.0001M4 11.0001L12 2.00006L20 11.0001M20 11.0001L12 19.0001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="max-w-3xl mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                Artificial Intelligence for Your Crypto Investments
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                A comprehensive AI-powered platform to analyze, manage, and optimize your cryptocurrency investments.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login">
                  <Button 
                    size="lg" 
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Get Started <Sparkles size={16} />
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Animated 3D Crypto dashboard mockup */}
            <div className="lg:w-1/2 relative hidden lg:block">
              <div className="relative bg-card/20 border border-primary/20 backdrop-blur-lg rounded-xl shadow-2xl p-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-xs text-white/60">CryptoBot Dashboard</div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-black/50 p-2 rounded-lg">
                    <div className="text-xs text-gray-400">Bitcoin</div>
                    <div className="text-sm text-white font-bold">$61,245.78</div>
                    <div className="text-xs text-green-500">+3.45%</div>
                  </div>
                  <div className="bg-black/50 p-2 rounded-lg">
                    <div className="text-xs text-gray-400">Ethereum</div>
                    <div className="text-sm text-white font-bold">$3,125.42</div>
                    <div className="text-xs text-red-500">-1.23%</div>
                  </div>
                </div>
                <div className="h-20 bg-black/50 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-primary text-xs">AI-Generated Price Chart</div>
                </div>
                <div className="bg-black/50 p-2 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <MessageCircle size={12} className="text-primary" />
                    <span>AI Assistant: How can I help with your investments today?</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Data */}
      <section className="py-12 bg-black/80">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-4 text-white">Live Market Data</h2>
            <p className="text-gray-400">
              Real-time cryptocurrency prices and market insights powered by CoinAPI
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : cryptoData.length === 0 ? (
            // Show a message when there's no data
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Unable to load cryptocurrency data at this moment</p>
              <Button 
                variant="outline" 
                className="text-primary border-primary hover:bg-primary/10"
                onClick={() => window.location.reload()}
              >
                Refresh Data
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cryptoData.slice(0, 8).map((coin) => (
                <Card key={coin.id} className="bg-black border border-gray-800 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      {/* Left side - Coin icon and name */}
                      <div className="flex items-center">
                        <img src={coin.image} alt={coin.name} className="w-10 h-10 mr-2" />
                        <div>
                          <h3 className="font-bold text-white">{coin.name}</h3>
                          <p className="text-xs text-gray-400 uppercase">{coin.symbol}</p>
                        </div>
                      </div>
                      
                      {/* Right side - Price and change */}
                      <div className="ml-auto text-right">
                        <p className="font-bold text-white">${coin.current_price.toLocaleString()}</p>
                        <p className={`text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {coin.price_change_percentage_24h >= 0 ? '↑' : '↓'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    
                    {/* Chart section */}
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">No chart data</p>
                    </div>
                    
                    {/* Market cap at bottom */}
                    <div className="mt-3 text-xs text-gray-500">
                      Market Cap: {formatMarketCap(coin.market_cap)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link href="/login">
              <Button variant="outline" className="mt-4 text-primary border-primary hover:bg-primary/10">
                View All Markets <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Powered by Artificial Intelligence</h2>
            <p className="text-muted-foreground">
              CryptoBot combines advanced data analysis, machine learning, and artificial intelligence to provide you with cutting-edge investment tools.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-background to-black/80">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-muted-foreground">
              Select the membership that best suits your investment strategy and goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="rounded-xl border border-border bg-card p-8 flex flex-col hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="mb-5">
                <h3 className="text-xl font-bold mb-2">Basic</h3>
                <div className="text-3xl font-bold mb-1">$9<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground text-sm">Perfect for beginners</p>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Real-time market data</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Basic portfolio tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>5 AI chat queries per day</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>News summaries</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Email support</span>
                </li>
              </ul>
              
              <Link href="/login" className="w-full">
                <Button className="w-full" variant="outline">Get Started</Button>
              </Link>
            </div>
            
            {/* Pro Plan - Featured */}
            <div className="rounded-xl border-2 border-primary bg-card p-8 flex flex-col shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold">
                POPULAR
              </div>
              
              <div className="mb-5">
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <div className="text-3xl font-bold mb-1">$29<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground text-sm">For serious investors</p>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Everything in Basic</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Advanced portfolio analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Unlimited AI chat queries</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Investment recommendations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Customizable price alerts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <Link href="/login" className="w-full">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
            
            {/* Enterprise Plan */}
            <div className="rounded-xl border border-border bg-card p-8 flex flex-col hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="mb-5">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <div className="text-3xl font-bold mb-1">$99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground text-sm">For professional traders</p>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Institutional-grade analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Trading bot integration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>API access</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                  <span>White-label options</span>
                </li>
              </ul>
              
              <Link href="/login" className="w-full">
                <Button className="w-full" variant="outline">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">What Our Users Say</h2>
            <p className="text-gray-400">
              Hear from investors who have transformed their crypto strategies with CryptoBot
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-card/30 backdrop-blur-sm p-6 rounded-lg border border-primary/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  JD
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">James Davis</h4>
                  <p className="text-sm text-muted-foreground">Day Trader</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "The Portfolio Advisor feature has completely changed my investment strategy. I've seen a 32% increase in my returns since using CryptoBot for the past 6 months."
              </p>
              <div className="flex mt-4">
                <div className="text-yellow-400 flex">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-card/30 backdrop-blur-sm p-6 rounded-lg border border-primary/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  SJ
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Sarah Johnson</h4>
                  <p className="text-sm text-muted-foreground">Crypto Enthusiast</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "As someone new to crypto, the educational content and personalized learning path have been invaluable. The AI makes complex topics easy to understand."
              </p>
              <div className="flex mt-4">
                <div className="text-yellow-400 flex">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-card/30 backdrop-blur-sm p-6 rounded-lg border border-primary/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  RM
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Robert Martinez</h4>
                  <p className="text-sm text-muted-foreground">Institutional Investor</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "The market sentiment analysis has given our firm an edge in anticipating market movements. CryptoBot's AI predictions have been remarkably accurate."
              </p>
              <div className="flex mt-4">
                <div className="text-yellow-400 flex">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarHalfIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Removed Mission Section - following user request */}

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-violet-950/90 to-indigo-900/90 relative overflow-hidden">
        {/* Dynamic background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Optimize Your Investments?</h2>
          <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto">
            Join thousands of investors who are already harnessing the power of artificial intelligence to improve their strategies.
          </p>
          
          {/* Statistics counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-3xl font-bold text-white">25k+</div>
              <div className="text-gray-300 text-sm">Active Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-3xl font-bold text-white">$1.8B+</div>
              <div className="text-gray-300 text-sm">Assets Tracked</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-3xl font-bold text-white">42M+</div>
              <div className="text-gray-300 text-sm">AI Predictions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-3xl font-bold text-white">18%</div>
              <div className="text-gray-300 text-sm">Avg. ROI Increase</div>
            </div>
          </div>
          
          {/* No additional call-to-action buttons needed - Using top navigation buttons */}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Logo and about */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/20 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <span className="font-bold text-xl">CryptoBot</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Using advanced AI to transform how you research, analyze, and manage your crypto investments.
              </p>
              {/* No social media icons since there are no active accounts yet */}
              <p className="text-gray-400 text-sm">
                Follow us on social media soon for updates and announcements.
              </p>
            </div>
            
            {/* Quick links */}
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="/login" className="text-gray-400 hover:text-white transition-colors">Dashboard</a></li>
              </ul>
            </div>
            
            {/* Resources section - only displaying related resources */}
            <div>
              <h3 className="font-bold text-lg mb-4">Learn</h3>
              <ul className="space-y-2">
                <li><a href="/login" className="text-gray-400 hover:text-white transition-colors">Crypto Guides</a></li>
                <li><a href="/login" className="text-gray-400 hover:text-white transition-colors">Investment Basics</a></li>
                <li><a href="/login" className="text-gray-400 hover:text-white transition-colors">NFT Analytics</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <span className="text-gray-400">For support inquiries, please log in to your account</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2025 CryptoBot AI. All rights reserved.</p>
              <div className="flex gap-6 text-sm text-gray-400">
                <button onClick={() => window.alert('Terms of Service will be available soon.')} className="hover:text-white transition-colors">Terms of Service</button>
                <button onClick={() => window.alert('Privacy Policy will be available soon.')} className="hover:text-white transition-colors">Privacy Policy</button>
                <button onClick={() => window.alert('Cookie Policy will be available soon.')} className="hover:text-white transition-colors">Cookie Policy</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* ChatBot Component with onboarding functionality */}
      <ChatBot startOnboardingRef={startOnboardingRef} />
    </div>
  );
}