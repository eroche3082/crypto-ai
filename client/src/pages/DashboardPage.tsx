import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart4, 
  BrainCircuit, 
  Bell, 
  User, 
  LogOut, 
  Home, 
  Settings, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Layers,
  MessageCircle,
  ChevronDown,
  Search,
  Bitcoin,
  Gem,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
  Plus,
  DollarSign,
  LineChart,
  Activity,
  PieChart
} from 'lucide-react';
import ChatBot from '@/components/ChatBot';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  // Fetch crypto data
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch('/api/crypto/coins/markets');
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setCryptoData(data.slice(0, 6)); // Just use the first 6 for the dashboard
        }
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCryptoData();
  }, []);

  // If not authenticated, don't render anything (redirection will happen)
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-background border-r border-border">
        <div className="flex h-16 items-center border-b border-border px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 text-primary rounded-full w-8 h-8 flex items-center justify-center">
              <MessageCircle size={16} />
            </div>
            <span className="font-bold">CryptoBot</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            <Button variant="ghost" className="justify-start gap-2">
              <Home size={16} />
              <span>Dashboard</span>
            </Button>
            <Button variant="ghost" className="justify-start gap-2">
              <BarChart4 size={16} />
              <span>Portfolio</span>
            </Button>
            <Button variant="ghost" className="justify-start gap-2">
              <TrendingUp size={16} />
              <span>Markets</span>
            </Button>
            <Button variant="ghost" className="justify-start gap-2">
              <Bell size={16} />
              <span>Alerts</span>
            </Button>
            <Button variant="ghost" className="justify-start gap-2">
              <BrainCircuit size={16} />
              <span>AI Advisor</span>
            </Button>
            <Button variant="ghost" className="justify-start gap-2">
              <Layers size={16} />
              <span>News</span>
            </Button>
            <Button variant="ghost" className="justify-start gap-2">
              <CreditCard size={16} />
              <span>Transactions</span>
            </Button>
          </nav>
        </div>
        
        <div className="mt-auto border-t border-border p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <div>
              <div className="font-medium">{user.username}</div>
              <div className="text-xs text-muted-foreground">{user.plan?.toUpperCase()} Plan</div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            onClick={() => {
              logout();
              setLocation('/');
            }}
          >
            <LogOut size={14} />
            Sign Out
          </Button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="h-16 border-b border-border flex items-center px-6 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
          <div className="md:hidden mr-4">
            <Button variant="ghost" size="icon">
              <MessageCircle size={20} />
            </Button>
          </div>
          
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search markets, news, tools..."
              className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell size={18} />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings size={18} />
            </Button>
            
            <div className="md:hidden">
              <Button variant="ghost" size="icon">
                <User size={18} />
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.username}!</h1>
              <p className="text-muted-foreground">Your portfolio overview and market insights are ready.</p>
            </div>
            
            {/* Dashboard Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$124,532.80</div>
                  <div className="flex items-center mt-1 text-sm">
                    <div className="flex items-center text-green-500 mr-2">
                      <ArrowUpRight size={14} />
                      <span>4.3%</span>
                    </div>
                    <span className="text-muted-foreground">Today</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Market Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Bullish</div>
                  <div className="flex items-center mt-1 text-sm">
                    <div className="flex items-center text-green-500 mr-2">
                      <Activity size={14} />
                      <span>Medium Volatility</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.plan?.toUpperCase() || 'Basic'}</div>
                  <div className="flex items-center mt-1 text-sm">
                    <div className="flex items-center text-blue-500 mr-2">
                      <Gem size={14} />
                      <span>Upgrade available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Tabs: Markets, Portfolio Analysis, AI Insights */}
            <Tabs defaultValue="markets">
              <TabsList className="mb-6">
                <TabsTrigger value="markets">Markets</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio Analysis</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
              </TabsList>
              
              {/* Markets Tab */}
              <TabsContent value="markets">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Trending Cryptocurrencies</CardTitle>
                        <CardDescription>Live market data from top coins</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        ) : cryptoData.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            <p>Unable to load market data</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {cryptoData.map((coin) => (
                              <div key={coin.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                                <div className="flex items-center gap-3">
                                  <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                                  <div>
                                    <div className="font-medium">{coin.name}</div>
                                    <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">${coin.current_price.toLocaleString()}</div>
                                  <div className={`text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                                  </div>
                                </div>
                              </div>
                            ))}
                            <Button variant="outline" className="w-full">View All Markets</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Tools and shortcuts</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <Plus size={16} /> Add New Asset
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <Bell size={16} /> Create Price Alert
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <LineChart size={16} /> Technical Analysis
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <DollarSign size={16} /> Crypto Converter
                          </Button>
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <Landmark size={16} /> DeFi Opportunities
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* Portfolio Tab */}
              <TabsContent value="portfolio">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Portfolio Allocation</CardTitle>
                        <CardDescription>Your current asset distribution</CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-center">
                        <div className="h-60 w-60 rounded-full border-8 border-border flex items-center justify-center relative">
                          <div className="absolute inset-0" style={{ background: 'conic-gradient(#8b5cf6 0% 45%, #3b82f6 45% 65%, #10b981 65% 85%, #6366f1 85% 100%)', borderRadius: '100%' }}></div>
                          <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl font-bold">12</div>
                              <div className="text-sm text-muted-foreground">Assets</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Top Holdings</CardTitle>
                        <CardDescription>Your largest investments</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bitcoin className="text-orange-500" size={20} />
                              <span>Bitcoin</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">45%</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">E</div>
                              <span>Ethereum</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">23%</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">S</div>
                              <span>Solana</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">11%</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">P</div>
                              <span>Polkadot</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">8%</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">O</div>
                              <span>Others</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">13%</div>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full mt-3">View All Assets</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* AI Insights Tab */}
              <TabsContent value="insights">
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Investment Insights</CardTitle>
                      <CardDescription>Personalized recommendations based on your portfolio</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                          <div className="flex items-start gap-3">
                            <BrainCircuit className="h-6 w-6 text-primary mt-1" />
                            <div>
                              <h3 className="font-medium mb-1">Portfolio Rebalancing Opportunity</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                Your portfolio has become overweight in large-cap cryptocurrencies. Consider diversifying 
                                into mid-cap assets for better risk-adjusted returns.
                              </p>
                              <div className="flex gap-2">
                                <Button size="sm" variant="default">Learn More</Button>
                                <Button size="sm" variant="outline">Dismiss</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 border border-blue-600/20 bg-blue-600/5 rounded-lg">
                          <div className="flex items-start gap-3">
                            <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
                            <div>
                              <h3 className="font-medium mb-1">Market Trend Analysis</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                Bitcoin is showing technical signs of strength after the recent consolidation phase. 
                                On-chain metrics suggest continued institutional accumulation.
                              </p>
                              <div className="flex gap-2">
                                <Button size="sm" variant="default">View Analysis</Button>
                                <Button size="sm" variant="outline">Dismiss</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 border border-green-600/20 bg-green-600/5 rounded-lg">
                          <div className="flex items-start gap-3">
                            <PieChart className="h-6 w-6 text-green-600 mt-1" />
                            <div>
                              <h3 className="font-medium mb-1">DeFi Yield Opportunity</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                Based on your risk profile, we've identified several stablecoin yield opportunities 
                                with APYs ranging from 8-12% in vetted protocols.
                              </p>
                              <div className="flex gap-2">
                                <Button size="sm" variant="default">Explore Options</Button>
                                <Button size="sm" variant="outline">Dismiss</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button className="w-full">Get More AI Insights</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* ChatBot */}
      <ChatBot />
    </div>
  );
}