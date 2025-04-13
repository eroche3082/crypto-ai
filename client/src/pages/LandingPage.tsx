import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ChevronRight, CheckCircle, BarChart4, BrainCircuit, Bell, LineChart, Lock, RefreshCw, TrendingUp, Wallet, MessageCircle, AreaChart, ShieldAlert, Layers, PieChart, FileText, BarChart3, CloudLightning, ListChecks, Sparkles, Coins, ArrowUpRight, ArrowDownRight } from "lucide-react";

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
  
  // Fetch crypto data from the API
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch('/api/crypto/coins/markets');
        const data = await response.json();
        setCryptoData(data);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCryptoData();
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
          
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/10 to-primary/5">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjUiPjxwYXRoIGQ9Ik0zNiAxOGMxLjIyOCAwIDIuNDQuMDQgMy42LjEyIDEuMTU0LjA3NSAyLjI5OC4xODYgMy40Mi4zMzIgMS4xMi4xNDUgMi4yMjYuMzI0IDMuMzE0LjUzOCAxLjA5LjIxIDIuMTYuNDUgMy4yMDQuNzJsLTEuNTU2IDQuNTU1Yy0uOTg0LS4zNDUtMi0uNjU3LTMuMDQ4LS45MzQtMS4wNDQtLjI4LTIuMTEyLS41Mi0zLjIwNC0uNzI2LTEuMDkzLS4yMDMtMi4yLS4zNjUtMy4zMjQtLjQ4NS0xLjEyNS0uMTItMi4yNi0uMTgtMy40MDgtLjE4LTEuMTQ2IDAtMi4yOC4wNi0zLjQwNC4xOC0xLjEyNi4xMi0yLjIzLjI4Mi0zLjMxOC40ODUtMS4wODguMjA3LTIuMTUzLjQ0Ny0zLjE5Ny43MjYtMS4wNDYuMjc3LTIuMDU4LjU5LTMuMDM2LjkzNEwxMC40IDE4Ljk5Yy41LS4xMzMgMS4wMTMtLjI2IDEuNTQtLjM4LjUyNy0uMTIgMS4wNi0uMjMzIDEuNi0uMzQuNTMzLS4xMDcgMS4wNzYtLjIwNCAxLjYyOC0uMjkuNTUzLS4wODcgMS4xMS0uMTY3IDEuNjc2LS4yNC41NjQtLjA3MyAxLjEzMi0uMTM3IDEuNzA0LS4xOS41Ny0uMDU0IDEuMTQ2LS4xIDEuNzI0LS4xNC41OC0uMDQgMS4xNjMtLjA3IDEuNzUyLS4wOS41ODgtLjAyIDEuMTgtLjAzIDEuNzc2LS4wM3oiLz48cGF0aCBkPSJNNiAzNnYtNy42NDRsLTQgMi40ODh2LTEyTDI0IDE1LjJ2LTEuNzc4Yy0xLjA5My4wNjQtMi4xNzQuMTYyLTMuMjQzLjI5NS0xLjA2NS4xMzMtMi4xMTIuMjktMy4xMzcuNDc1LTEuMDI2LjE4NC0yLjAzMi4zOTUtMy4wMi42MzMtLjk5LjIzNy0xLjk1OC41LTIuOTA0Ljc5TC0uMDQgMTQuMDdDLjQ0OCAxMy4xNzQgMS4wMTIgMTIuMyAxLjY1IDExLjQ1Yy42NC0uODUgMS4zNS0xLjY3NCAyLjEzNi0yLjQ3LjY4NC0uNjk0IDEuNDEtMS4zNTYgMi4xOC0xLjk4Ni43Ny0uNjMgMS41ODMtMS4yMjYgMi40NC0xLjc4NS44Ni0uNTYgMS43Ni0xLjA4IDIuNy0xLjU2czEuOTI0LS45MDggMi45NS0xLjI4YzEuMDI2LS4zNzMgMi4wOS0uNyAzLjE5LTEgMS4xLS4yNzIgMi4yMy0uNTA1IDMuMzktLjY5NiAxLjE2LS4xOTIgMi4zNS0uMzQ0IDMuNTYtLjQ1NmwxLjQ5LTQuMDMyQzI0LjUuMzQyIDIzLjMxLjIgMjIuMTI0LjA5NyAyMC45MzYtLjAwNyAxOS43MjMtLjA2IDE4LjQ5My0uMDZjLTEuMjMgMC0yLjQ0Mi4wNTUtMy42MzQuMTY1LTEuMTkuMTEtMi4zNjIuMjY3LTMuNTEzLjQ3Mi0xLjE1LjIwNS0yLjI3OC40NTQtMy4zODMuNzQ2LTEuMTA1LjI5Mi0yLjE4NC42Mi0zLjIzMyAxLjA0LS45NzcuMzgtMS45MjIuNzktMi44MyAxLjIzNC0uOTEzLjQ0LTEuODA1LjkyLTIuNjcgMS40My0uODY4LjUxLTEuNzA3IDEuMDQzLTIuNTIgMS42MXYyLjc0TC0uMDYgNi43MnYxMkw2IDE1LjY4NFYzNnptNDYuODU1LTI0LjM1NGwuMDY1LS4wMkM1NC42MTUgMTEuMDk1IDU2LjMgMTAuNjEgNTggMTAuMTVWOC41OTZjLS4yLjA0LS40MDMuMDgtLjYwNy4xMTgtLjIwNS4wNC0uNDEuMDgtLjYxNS4xMTctLjIwNi4wMzctLjQxLjA3NS0uNjE2LjExMy0uMjA1LjA0LS40MS4wNzUtLjYxNS4xMTNDNDQuODMyIDExLjcxNCAzNSAxNi40MyAzNSAyNHYxMS42ODRsNCAxLjFWMjRjMC0zLjQ4MiA1LjU5Mi03LjA4IDE1LjM4Ni05Ljc3OGwtLjA1Ny4wMjItMS40NzQuNTl2LjAxeiIvPjxwYXRoIGQ9Ik00OS44NCAyNy45MjVDNTEuMDcgMjguODcgNTIuNDggMjkuNjkzIDU0IDMwLjM5djEuMDFjLTEuOTItLjgyLTMuNzMtMS44Mi01LjM5LTNsMS4yMy0uNDc1ek0xMCAyOS4wNXYtLjQ3NWMwLS4wMjIuMDAzLS4wNDMuMDA5LS4wNjMuMDA1LS4wMi4wMTMtLjA0LjAyNC0uMDU1LjAxLS4wMTYuMDIzLS4wMy4wMzgtLjA0LjAxNC0uMDEuMDMtLjAxNi4wNDgtLjAxOGw1LjUyLTEuNDRjLjAyLS4wMDUuMDQtLjAwNS4wNi0uMDAyLjAyLjAwNC4wMzkuMDEyLjA1NC4wMjQuMDE2LjAxLjAzLjAyNC4wNC4wNC4wMS4wMTUuMDE1LjAzMi4wMTcuMDVWMjh2LjY4NmwtNS44MDkgMS41MlYyOS4wNXptMzMuODMtMTMuMzljLjEzOC4zMzQuMjY4LjY3Mi4zOTIgMS4wMTUuMTIzLjM0My4yNCAxLjE5LjM0OCAxLjU0OC4yNS44My40OTIgMS42OC43MTggMi41NDguMTUzLjU5Ni4yOSAxLjE5Ny40MDIgMS44LjExMi42MDMuMjA5IDEuMjEuMjg4IDEuODE4LjA3OS42MS4xNDMgMS4yMi4xODkgMS44MjguMDQ2LjYxLjA3NyAxLjIxMi4wOTMgMS44MDguMDE1LjU5Ni4wMTUgMS4xODMgMCAxLjc1OC0uMDE2LjU3Ni0uMDQ3IDEuMTQtLjA5NSAxLjY5LS4wNDcuNTUtLjExIDEuMDg4LS4xODggMS42MS0uMDguNTIzLS4xNzMgMS4wMy0uMjg3IDEuNTItLjExNC40OS0uMjQ2Ljk2NC0uMzk2IDEuNDIyLS4xNS40NTgtLjMxNy45LS40OTggMS4zMy0uMTguNDI3LS4zNzcuODM3LS41ODYgMS4yMzItLjIxLjM5NS0uNDM3Ljc3LS42NzggMS4xNC0uMjQuMzY3LS40OTUuNzItLjc2IDEuMDU1LS4yNjcuMzM2LS41NDQuNjU1LS44My45NkwzOC45NiA0Mi42Mzd6bS0zMi41Ni03Ljc5bC0uMDEzLS4wMDRDOS42NCA2Ljg3NCA4LjA4NyA2LjEyNCA2LjUgNS40NTVWNy4xMWwuMjQ4LjEzLjI1Ni4xMzUuMjYuMTM4YzEyLjQzMyA2LjY1IDE3LjczNiAxMi40MyAxNi4yNCAxOC41bC0yLjY2NC0uNzM0Yy42NzctMi40NTMtMS41ODgtNi40OS04LjU3LTExLjI1ek01MCA2LjY3di0uNDQ0bC0xLjcyLjY5TDYgMjAuNTcydjIuNDUybDQyLTE2Ljh2MS4yMDVsLTIgLjc0N1Y2LjY3em0tMTUgMzcuNjU4bC4wMi4wMDMuMzA4LjA3LjMuMDY4LjI5OC4wNjZjLS4wMjYtLjAwNS0uMDU1LS4wMS0uMDg0LS4wMTYtLjA3LS4wMTQtLjE0LS4wMjgtLjIxMy0uMDQzLS4xNDMtLjAzLS4yODgtLjA2LS40MzMtLjA5MmwtLjcxNS0uMTU0IDIuNjg4LjczLS4wMi0uMDA0YzMuMzkuNzMgNi44NjcgMS4zNjcgMTAuMzc3IDEuOTA1LjQzOC4wNzUuODUuMTcyIDEuMjUuMjk1bC0uMDI4LS4wMDYtLjU4OC4xMzItLjU4LjEzLS41NzcuMTMtLjU3Ni4xMy0uNTcuMTI3LS41NjguMTI3LS41NjIuMTI3LS41Ni4xMjUtLjU1LjEyMy0uNTQ2LjEyMi0uNTQyLjEyLS41MzQuMTItLjUzLjEyLS41MjYuMTE2LS41MTguMTE2LS41MS4xMTQtLjQ5OC4xMTItLjQ5LjExLS40NzguMTA4LS40Ny4xMDUtLjQ2LjEwMy0uNDUyLjEtLjQ0LjEtLjQzLjA5Ni0uNDIuMDk1LS40MS4wOS0uNC4wOXoiLz48cGF0aCBkPSJNNS45NzYgNC43QzUuNjUgNC41MyA1LjMyIDQuMzYgNC45ODggNC4yYy0uMzM1LS4xNi0uNjc0LS4zMS0xLjAxNi0uNDUtLjM0Mi0uMTQtLjY4OC0uMjctMS4wMzUtLjM5LS4zNDgtLjEyLS43LS4yMy0xLjA1LS4zM2wtMS41IDMuOTFhMTEuNDMgMTEuNDMgMCAwMTEuMjU0LjM1Yy40MTguMTM1LjgyLjI4NSAxLjIwNi40NS4zODYuMTY2Ljc2LjM0MyAxLjExOC41MzMuMzYuMTkuNy4zOSAxLjAzLjU5OC4zMy4yMS42NDMuNDMuOTM4LjY2LjI5Ni4yMjguNTc0LjQ2OC44MzQuNzE4LjI2LjI1LjUuNTEuNzIuNzgyLjIyMy4yNy40MjguNTUuNjE1LjgzOC4xODYuMjg4LjM1NS41ODQuNTA2Ljg5LjE1LjMwNS4yOC42MTguMzkzLjkzNGw0LjM0OC0xLjYyYy0uMTg3LS4zOTQtLjM5LS43ODMtLjYwNi0xLjE2Ny0uMjE4LS4zODItLjQ1LS43NTMtLjY5NC0xLjExLS4yNDUtLjM1OC0uNTAzLS43MDItLjc3Mi0xLjAzNS0uMjctLjMzLS41NTUtLjY1LS44NTMtLjk1NWwyLjA1NS0uNjljMS40ODQgMi4yNTMgMi41NzIgNC42NzMgMy4yNDUgNy4yMmwtMy41NjcgMS44NjJjLS42MzctMi43NTQtMS43ODctNS4zMS0zLjQzLTcuNjIzeiIvPjwvZz48L2c+PC9zdmc+')]"></div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Artificial Intelligence for Your Crypto Investments
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              A comprehensive AI-powered platform to analyze, manage, and optimize your cryptocurrency investments.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
                  Explore
                </Button>
              </Link>
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
              Real-time cryptocurrency prices and market insights powered by CoinGecko API
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cryptoData.slice(0, 8).map((coin) => (
                <Card key={coin.id} className="bg-card/30 border-primary/20 backdrop-blur-md overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center mb-3">
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 mr-3" />
                      <div>
                        <h3 className="font-bold">{coin.name}</h3>
                        <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="font-bold">${coin.current_price.toLocaleString()}</p>
                        <p className={`text-xs flex items-center ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {coin.price_change_percentage_24h >= 0 ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    
                    {/* Mini chart visualization */}
                    <div className="h-12 w-full">
                      <div className="h-full flex items-end">
                        {coin.sparkline_in_7d.price.filter((_, i) => i % 10 === 0).map((price, i, filteredPrices) => {
                          const maxPrice = Math.max(...filteredPrices);
                          const minPrice = Math.min(...filteredPrices);
                          const range = maxPrice - minPrice;
                          const normalizedHeight = range === 0 ? 50 : ((price - minPrice) / range) * 100;
                          
                          return (
                            <div 
                              key={i} 
                              className={`flex-1 mx-0.5 ${coin.price_change_percentage_24h >= 0 ? 'bg-green-500/40' : 'bg-red-500/40'}`}
                              style={{ height: `${normalizedHeight}%` }}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-muted-foreground">
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
      <section className="py-20 bg-card/30">
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

      {/* About / Mission Section */}
      <section className="py-20 bg-black/90">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-white">Our Mission</h2>
            <p className="text-lg mb-8 text-gray-300">
              CryptoBot was created with the goal of democratizing access to high-quality financial analysis for cryptocurrency investors. We combine advanced artificial intelligence with real-time market data to deliver insights and personalized recommendations that were previously only available to institutional investors.
            </p>
            <div className="flex justify-center">
              <Link href="/login">
                <Button size="lg" className="gap-2 bg-white text-primary hover:bg-white/90">
                  Chat with Assistant <MessageCircle size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Optimize Your Investments?</h2>
          <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto">
            Join thousands of investors who are already harnessing the power of artificial intelligence to improve their strategies.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Get Started Now <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="gap-2">
                Explore Platform <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center">
                <MessageCircle size={16} />
              </div>
              <span className="font-bold">CryptoBot</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <span>© 2025 CryptoBot AI. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}