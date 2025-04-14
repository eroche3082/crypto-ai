import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpCircle, ArrowDownCircle, Search, RefreshCw, Bell, Filter, BarChart3, ListFilter, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import LineChart from "@/components/ui/LineChart";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  sparkline_7d?: { price: number[] };
  last_updated: string;
}

const LivePriceTracker = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("market_cap_rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState("all");
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState<Record<string, boolean>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get market data with React Query
  const { data: coins, isLoading, refetch } = useQuery<CryptoCoin[]>({
    queryKey: ['/api/crypto/coins/markets'],
    queryFn: async () => {
      const res = await fetch('/api/crypto/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=true');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
    refetchInterval: liveUpdates ? 30000 : false, // Refetch every 30s if live updates are enabled
  });

  // Set up timer for live price udpates
  useEffect(() => {
    if (liveUpdates) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, 30000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [liveUpdates, refetch]);

  // Filter and sort coins
  const filteredCoins = coins ? coins
    .filter(coin => {
      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return coin.name.toLowerCase().includes(term) || 
               coin.symbol.toLowerCase().includes(term) ||
               coin.id.toLowerCase().includes(term);
      }
      
      // Apply category filter
      if (activeTab === 'all') return true;
      if (activeTab === 'gainers') return coin.price_change_percentage_24h > 0;
      if (activeTab === 'losers') return coin.price_change_percentage_24h < 0;
      if (activeTab === 'stable') return Math.abs(coin.price_change_percentage_24h) < 1;
      if (activeTab === 'high-volume') return coin.total_volume > 1000000000;
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      const propA = (a as any)[sortBy];
      const propB = (b as any)[sortBy];
      
      // Handle null or undefined values
      if (propA === null || propA === undefined) return 1;
      if (propB === null || propB === undefined) return -1;
      
      // Compare based on sort order
      if (sortOrder === 'asc') {
        return propA > propB ? 1 : -1;
      } else {
        return propA < propB ? 1 : -1;
      }
    }) : [];

  // Handle searching
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle alert toggle
  const handleAlertToggle = (coinId: string) => {
    const newState = !alertsEnabled[coinId];
    setAlertsEnabled(prev => ({
      ...prev,
      [coinId]: newState
    }));
    
    toast({
      title: newState 
        ? t("priceTracker.alertsEnabled", "Price alerts enabled") 
        : t("priceTracker.alertsDisabled", "Price alerts disabled"),
      description: newState 
        ? t("priceTracker.willNotify", "You will be notified of significant price movements for {{coin}}.", { coin: coinId.toUpperCase() }) 
        : t("priceTracker.noMoreAlerts", "You will no longer receive alerts for {{coin}}.", { coin: coinId.toUpperCase() })
    });
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Refresh data manually
  const handleRefresh = () => {
    refetch();
    toast({
      title: t("priceTracker.refreshing", "Refreshing price data"),
      description: t("priceTracker.latestData", "Getting the latest cryptocurrency data.")
    });
  };

  const renderTableHeader = () => (
    <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-card text-card-foreground rounded-t-lg border-b">
      <div className="col-span-1 font-medium">#</div>
      <div className="col-span-3 font-medium">{t("priceTracker.coin", "Coin")}</div>
      <div className="col-span-2 font-medium text-right">
        {t("priceTracker.price", "Price")}
      </div>
      <div className="col-span-2 font-medium text-right">
        {t("priceTracker.24h", "24h %")}
      </div>
      <div className="col-span-2 font-medium text-right hidden md:block">
        {t("priceTracker.marketCap", "Market Cap")}
      </div>
      <div className="col-span-2 font-medium text-right hidden md:block">
        {t("priceTracker.volume", "Volume (24h)")}
      </div>
      <div className="col-span-2 md:col-span-1 text-right font-medium">
        {t("priceTracker.graph", "Last 7d")}
      </div>
      <div className="col-span-1 text-right font-medium">
        <span className="sr-only">{t("common.actions", "Actions")}</span>
      </div>
    </div>
  );

  const renderMobileHeader = () => (
    <div className="flex justify-between items-center py-3 px-4 bg-card text-card-foreground rounded-t-lg border-b">
      <div className="font-medium">{t("priceTracker.coin", "Coin")}</div>
      <div className="font-medium">{t("priceTracker.price", "Price / 24h")}</div>
      <div className="font-medium">
        <span className="sr-only">{t("common.actions", "Actions")}</span>
      </div>
    </div>
  );

  const renderCoinRow = (coin: CryptoCoin, index: number) => (
    <div 
      key={coin.id}
      className={cn(
        "grid grid-cols-12 gap-4 py-4 px-4 hover:bg-accent/10 transition-colors border-b border-border/50",
        index % 2 === 0 ? "bg-background" : "bg-card/50"
      )}
    >
      <div className="col-span-1 flex items-center">
        <span className="text-muted-foreground">{coin.market_cap_rank}</span>
      </div>
      
      <div className="col-span-3 flex items-center gap-2">
        <div className="flex flex-col">
          <span className="font-medium">{coin.name}</span>
          <span className="text-xs text-muted-foreground uppercase">{coin.symbol}</span>
        </div>
      </div>
      
      <div className="col-span-2 flex items-center justify-end">
        <span className="font-mono">{formatCurrency(coin.current_price)}</span>
      </div>
      
      <div className="col-span-2 flex items-center justify-end">
        <Badge 
          variant={coin.price_change_percentage_24h > 0 ? "success" : "destructive"}
          className="flex items-center gap-1"
        >
          {coin.price_change_percentage_24h > 0 ? (
            <ArrowUpCircle className="h-3 w-3" />
          ) : (
            <ArrowDownCircle className="h-3 w-3" />
          )}
          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
        </Badge>
      </div>
      
      <div className="col-span-2 flex items-center justify-end hidden md:flex">
        <span className="text-muted-foreground">{formatCurrency(coin.market_cap, 0)}</span>
      </div>
      
      <div className="col-span-2 flex items-center justify-end hidden md:flex">
        <span className="text-muted-foreground">{formatCurrency(coin.total_volume, 0)}</span>
      </div>
      
      <div className="col-span-2 md:col-span-1 flex items-center justify-end h-10">
        {coin.sparkline_7d?.price ? (
          <LineChart 
            data={coin.sparkline_7d.price} 
            width={80} 
            height={40} 
            color={coin.price_change_percentage_24h > 0 ? "#22c55e" : "#ef4444"}
            hideAxis={true}
          />
        ) : (
          <div className="w-20 h-10 bg-muted rounded flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No data</span>
          </div>
        )}
      </div>
      
      <div className="col-span-1 flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{coin.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => window.open(`/crypto/${coin.id}`, '_blank')}
            >
              {t("priceTracker.viewDetails", "View details")}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleAlertToggle(coin.id)}
            >
              {alertsEnabled[coin.id] 
                ? t("priceTracker.disableAlerts", "Disable alerts") 
                : t("priceTracker.enableAlerts", "Enable alerts")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              {t("priceTracker.addToWatchlist", "Add to watchlist")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  const renderMobileCoinRow = (coin: CryptoCoin, index: number) => (
    <div 
      key={coin.id}
      className={cn(
        "flex justify-between items-center py-4 px-4 hover:bg-accent/10 transition-colors border-b border-border/50",
        index % 2 === 0 ? "bg-background" : "bg-card/50"
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="font-medium">{coin.name}</span>
          <span className="text-xs text-muted-foreground uppercase">{coin.symbol}</span>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <span className="font-mono">{formatCurrency(coin.current_price)}</span>
        <Badge 
          variant={coin.price_change_percentage_24h > 0 ? "success" : "destructive"}
          className="flex items-center gap-1 mt-1"
        >
          {coin.price_change_percentage_24h > 0 ? (
            <ArrowUpCircle className="h-3 w-3" />
          ) : (
            <ArrowDownCircle className="h-3 w-3" />
          )}
          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
        </Badge>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{coin.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => window.open(`/crypto/${coin.id}`, '_blank')}
          >
            {t("priceTracker.viewDetails", "View details")}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleAlertToggle(coin.id)}
          >
            {alertsEnabled[coin.id] 
              ? t("priceTracker.disableAlerts", "Disable alerts") 
              : t("priceTracker.enableAlerts", "Enable alerts")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            {t("priceTracker.addToWatchlist", "Add to watchlist")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t("priceTracker.title", "Live Price Tracker")}</h1>
          <p className="text-muted-foreground">{t("priceTracker.subtitle", "Real-time cryptocurrency prices with live updates and alerts")}</p>
        </div>
        
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center gap-2 mr-4">
            <Label htmlFor="live-updates" className="text-sm font-medium cursor-pointer">
              {t("priceTracker.liveUpdates", "Live Updates")}
            </Label>
            <Switch 
              id="live-updates" 
              checked={liveUpdates} 
              onCheckedChange={setLiveUpdates} 
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <Card className="col-span-1 md:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle>{t("priceTracker.marketOverview", "Market Overview")}</CardTitle>
            <CardDescription>
              {t("priceTracker.marketDesc", "Key cryptocurrency market indicators and performance")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">{t("priceTracker.totalMarketCap", "Total Market Cap")}</div>
                <div className="text-lg font-bold">$1.73T</div>
                <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                  <ArrowUpCircle className="h-3 w-3" />
                  2.3% (24h)
                </div>
              </div>
              
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">{t("priceTracker.totalVolume", "24h Volume")}</div>
                <div className="text-lg font-bold">$62.8B</div>
                <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <ArrowDownCircle className="h-3 w-3" />
                  5.1% (24h)
                </div>
              </div>
              
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">{t("priceTracker.btcDominance", "BTC Dominance")}</div>
                <div className="text-lg font-bold">52.4%</div>
                <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                  <ArrowUpCircle className="h-3 w-3" />
                  0.8% (24h)
                </div>
              </div>
              
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">{t("priceTracker.activeCoins", "Active Cryptocurrencies")}</div>
                <div className="text-lg font-bold">14,382</div>
                <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                  <ArrowUpCircle className="h-3 w-3" />
                  12 (24h)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle>{t("priceTracker.priceAlerts", "Price Alerts")}</CardTitle>
            <CardDescription>
              {t("priceTracker.alertsDesc", "Your active price movement notifications")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(alertsEnabled).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(alertsEnabled)
                  .filter(([_, enabled]) => enabled)
                  .map(([coinId]) => {
                    const coin = coins?.find(c => c.id === coinId);
                    return coin ? (
                      <div key={coinId} className="flex justify-between items-center p-2 border border-border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-primary" />
                          <span className="font-medium">{coin.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleAlertToggle(coinId)}
                        >
                          {t("common.remove", "Remove")}
                        </Button>
                      </div>
                    ) : null;
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">
                  {t("priceTracker.noAlerts", "You don't have any price alerts configured")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("priceTracker.alertsHelp", "Enable alerts for any coin to be notified of significant price movements")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("priceTracker.searchPlaceholder", "Search by name or symbol...")}
                    className="pl-8"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center">
                  <Label htmlFor="sort-by" className="mr-2 text-sm whitespace-nowrap">
                    {t("common.sortBy", "Sort by")}:
                  </Label>
                  <Select 
                    value={sortBy} 
                    onValueChange={setSortBy}
                  >
                    <SelectTrigger id="sort-by" className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market_cap_rank">{t("priceTracker.rank", "Rank")}</SelectItem>
                      <SelectItem value="current_price">{t("priceTracker.price", "Price")}</SelectItem>
                      <SelectItem value="price_change_percentage_24h">{t("priceTracker.24hChange", "24h Change")}</SelectItem>
                      <SelectItem value="market_cap">{t("priceTracker.marketCap", "Market Cap")}</SelectItem>
                      <SelectItem value="total_volume">{t("priceTracker.volume", "Volume")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={toggleSortOrder}
                  className="min-w-9 w-9 h-9"
                >
                  {sortOrder === 'asc' ? (
                    <ArrowUpCircle className="h-4 w-4" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <div className="px-4 py-2 border-b border-border">
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="all">{t("priceTracker.all", "All")}</TabsTrigger>
                <TabsTrigger value="gainers">{t("priceTracker.gainers", "Gainers")}</TabsTrigger>
                <TabsTrigger value="losers">{t("priceTracker.losers", "Losers")}</TabsTrigger>
                <TabsTrigger value="stable">{t("priceTracker.stable", "Stable")}</TabsTrigger>
                <TabsTrigger value="high-volume">{t("priceTracker.highVolume", "High Volume")}</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="m-0">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-5 w-20 ml-auto" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {isMobile ? (
                    <>
                      {renderMobileHeader()}
                      <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                        {filteredCoins.map((coin, index) => renderMobileCoinRow(coin, index))}
                      </ScrollArea>
                    </>
                  ) : (
                    <>
                      {renderTableHeader()}
                      <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                        {filteredCoins.map((coin, index) => renderCoinRow(coin, index))}
                      </ScrollArea>
                    </>
                  )}
                  
                  {filteredCoins.length === 0 && (
                    <div className="py-20 text-center">
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? t("priceTracker.noResults", "No cryptocurrencies found matching '{{searchTerm}}'", { searchTerm })
                          : t("priceTracker.noCoins", "No cryptocurrencies available")}
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            {/* All other tabs use the same content component */}
            <TabsContent value="gainers" className="m-0">
              {isMobile ? (
                <>
                  {renderMobileHeader()}
                  <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                    {filteredCoins.map((coin, index) => renderMobileCoinRow(coin, index))}
                  </ScrollArea>
                </>
              ) : (
                <>
                  {renderTableHeader()}
                  <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                    {filteredCoins.map((coin, index) => renderCoinRow(coin, index))}
                  </ScrollArea>
                </>
              )}
              
              {filteredCoins.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-muted-foreground">
                    {t("priceTracker.noGainers", "No gainers found in the current market")}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="losers" className="m-0">
              {isMobile ? (
                <>
                  {renderMobileHeader()}
                  <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                    {filteredCoins.map((coin, index) => renderMobileCoinRow(coin, index))}
                  </ScrollArea>
                </>
              ) : (
                <>
                  {renderTableHeader()}
                  <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                    {filteredCoins.map((coin, index) => renderCoinRow(coin, index))}
                  </ScrollArea>
                </>
              )}
              
              {filteredCoins.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-muted-foreground">
                    {t("priceTracker.noLosers", "No losers found in the current market")}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="stable" className="m-0">
              {isMobile ? (
                <>
                  {renderMobileHeader()}
                  <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                    {filteredCoins.map((coin, index) => renderMobileCoinRow(coin, index))}
                  </ScrollArea>
                </>
              ) : (
                <>
                  {renderTableHeader()}
                  <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                    {filteredCoins.map((coin, index) => renderCoinRow(coin, index))}
                  </ScrollArea>
                </>
              )}
              
              {filteredCoins.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-muted-foreground">
                    {t("priceTracker.noStable", "No stable coins found in the current market")}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="high-volume" className="m-0">
              {isMobile ? (
                <>
                  {renderMobileHeader()}
                  <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                    {filteredCoins.map((coin, index) => renderMobileCoinRow(coin, index))}
                  </ScrollArea>
                </>
              ) : (
                <>
                  {renderTableHeader()}
                  <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                    {filteredCoins.map((coin, index) => renderCoinRow(coin, index))}
                  </ScrollArea>
                </>
              )}
              
              {filteredCoins.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-muted-foreground">
                    {t("priceTracker.noHighVolume", "No high volume coins found in the current market")}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LivePriceTracker;