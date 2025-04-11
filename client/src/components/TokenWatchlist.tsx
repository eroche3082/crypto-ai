import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, TrendingUp, TrendingDown, AlertTriangle, Shield, Eye, Star, StarOff, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

// Interface for crypto token data
interface Token {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h?: number;
  low_24h?: number;
  circulating_supply?: number;
  total_supply?: number;
  ath?: number;
  ath_change_percentage?: number;
  risk_index?: number; // Risk score from 0-100
  risk_factors?: {
    volatility: number;
    liquidity: number;
    marketCap: number;
    developer_activity?: number;
    community_growth?: number;
  };
  on_watchlist: boolean;
}

// Calculate a risk index from 0-100 based on various factors
const calculateRiskIndex = (token: Partial<Token>): number => {
  // Initialize base factors - all tokens start somewhat risky
  const volatilityFactor = Math.abs(token.price_change_percentage_24h || 0) / 2; // Higher volatility = higher risk
  
  // Market cap factor - lower market cap = higher risk (1-10 scale)
  let marketCapFactor = 10;
  if (token.market_cap) {
    if (token.market_cap > 100000000000) { // >$100B
      marketCapFactor = 1;
    } else if (token.market_cap > 50000000000) { // >$50B
      marketCapFactor = 2;
    } else if (token.market_cap > 10000000000) { // >$10B
      marketCapFactor = 3;
    } else if (token.market_cap > 5000000000) { // >$5B
      marketCapFactor = 4;
    } else if (token.market_cap > 1000000000) { // >$1B
      marketCapFactor = 5;
    } else if (token.market_cap > 500000000) { // >$500M
      marketCapFactor = 6;
    } else if (token.market_cap > 100000000) { // >$100M
      marketCapFactor = 7;
    } else if (token.market_cap > 50000000) { // >$50M
      marketCapFactor = 8;
    } else if (token.market_cap > 10000000) { // >$10M
      marketCapFactor = 9;
    }
  }
  
  // Liquidity factor (based on total volume relative to market cap)
  let liquidityFactor = 5;
  if (token.market_cap && token.total_volume) {
    const volumeToMarketCapRatio = token.total_volume / token.market_cap;
    if (volumeToMarketCapRatio < 0.01) {
      liquidityFactor = 10; // Very low liquidity = high risk
    } else if (volumeToMarketCapRatio < 0.05) {
      liquidityFactor = 8;
    } else if (volumeToMarketCapRatio < 0.1) {
      liquidityFactor = 6;
    } else if (volumeToMarketCapRatio < 0.2) {
      liquidityFactor = 4;
    } else if (volumeToMarketCapRatio < 0.3) {
      liquidityFactor = 2;
    } else {
      liquidityFactor = 1; // High liquidity = low risk
    }
  }
  
  // Market cap rank factor
  const rankFactor = (token.market_cap_rank || 100) / 10;
  
  // Age factor (not available from the API, would need additional data)
  const ageFactor = 5; // Default middle value
  
  // Calculate weighted average for overall risk score (0-100)
  const riskScore = (
    (volatilityFactor * 20) + 
    (marketCapFactor * 30) + 
    (liquidityFactor * 25) + 
    (rankFactor * 15) + 
    (ageFactor * 10)
  ) / 10;
  
  // Ensure risk score is between 0-100
  return Math.min(100, Math.max(0, riskScore));
};

// Get risk category label and color based on risk index
const getRiskCategory = (riskIndex: number): { label: string; color: string } => {
  if (riskIndex < 20) {
    return { label: "Very Low", color: "bg-emerald-500" };
  } else if (riskIndex < 40) {
    return { label: "Low", color: "bg-green-500" };
  } else if (riskIndex < 60) {
    return { label: "Medium", color: "bg-yellow-500" };
  } else if (riskIndex < 80) {
    return { label: "High", color: "bg-orange-500" };
  } else {
    return { label: "Very High", color: "bg-red-500" };
  }
};

// Helper to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
};

// Helper to format large numbers
const formatNumber = (value: number): string => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2) + 'B';
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'K';
  } else {
    return value.toString();
  }
};

const TokenWatchlist: React.FC = () => {
  const { t } = useTranslation();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [watchlistTokens, setWatchlistTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [riskSortOrder, setRiskSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [sortField, setSortField] = useState<keyof Token | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("desc");

  // Fetch data on mount
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/crypto/coins/markets');
        const data = await response.json();
        
        // Get watchlist from localStorage
        const storedWatchlist = localStorage.getItem('tokenWatchlist');
        const watchlistIds = storedWatchlist ? JSON.parse(storedWatchlist) : [];
        
        // Process tokens with risk calculation
        const processedTokens = data.map((token: any) => ({
          ...token,
          on_watchlist: watchlistIds.includes(token.id),
          risk_index: calculateRiskIndex(token),
          risk_factors: {
            volatility: Math.abs(token.price_change_percentage_24h || 0) / 2,
            liquidity: token.total_volume / token.market_cap,
            marketCap: token.market_cap,
          }
        }));
        
        setTokens(processedTokens);
        setFilteredTokens(processedTokens);
        setWatchlistTokens(processedTokens.filter((token: Token) => token.on_watchlist));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching token data:", error);
        setLoading(false);
      }
    };
    
    fetchTokens();
    
    // Refresh token data every 2 minutes
    const intervalId = setInterval(fetchTokens, 120000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Filter tokens when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTokens(tokens);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = tokens.filter(token => 
        token.name.toLowerCase().includes(query) || 
        token.symbol.toLowerCase().includes(query)
      );
      setFilteredTokens(filtered);
    }
  }, [searchQuery, tokens]);

  // Update filtered list when tab changes
  useEffect(() => {
    if (activeTab === "watchlist") {
      setFilteredTokens(watchlistTokens);
    } else {
      // Reset to all tokens or apply current search
      if (searchQuery.trim() === '') {
        setFilteredTokens(tokens);
      } else {
        const query = searchQuery.toLowerCase();
        const filtered = tokens.filter(token => 
          token.name.toLowerCase().includes(query) || 
          token.symbol.toLowerCase().includes(query)
        );
        setFilteredTokens(filtered);
      }
    }
  }, [activeTab, tokens, watchlistTokens, searchQuery]);
  
  // Toggle token watchlist status
  const toggleWatchlist = (tokenId: string) => {
    // Update tokens state
    const updatedTokens = tokens.map(token => 
      token.id === tokenId 
        ? { ...token, on_watchlist: !token.on_watchlist } 
        : token
    );
    
    setTokens(updatedTokens);
    
    // Update filtered tokens
    const updatedFilteredTokens = filteredTokens.map(token => 
      token.id === tokenId 
        ? { ...token, on_watchlist: !token.on_watchlist } 
        : token
    );
    
    setFilteredTokens(updatedFilteredTokens);
    
    // Update watchlist tokens
    const updatedWatchlistTokens = updatedTokens.filter((token: Token) => token.on_watchlist);
    setWatchlistTokens(updatedWatchlistTokens);
    
    // Save to localStorage
    const watchlistIds = updatedTokens
      .filter(token => token.on_watchlist)
      .map(token => token.id);
    
    localStorage.setItem('tokenWatchlist', JSON.stringify(watchlistIds));
  };
  
  // Sort tokens by field
  const sortTokens = (field: keyof Token) => {
    // If clicking the same field, toggle order
    const newSortOrder = 
      field === sortField && sortOrder === 'desc' ? 'asc' : 'desc';
    
    // Special handling for risk sorting
    if (field === 'risk_index') {
      const sorted = [...filteredTokens].sort((a, b) => {
        const aVal = a.risk_index || 0;
        const bVal = b.risk_index || 0;
        return newSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
      setFilteredTokens(sorted);
      setRiskSortOrder(newSortOrder);
    } else {
      // General sorting for other fields
      const sorted = [...filteredTokens].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        
        // Handle string comparison
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return newSortOrder === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        }
        
        // Handle number comparison
        return newSortOrder === 'asc' 
          ? (aVal as number) - (bVal as number) 
          : (bVal as number) - (aVal as number);
      });
      
      setFilteredTokens(sorted);
      setRiskSortOrder(null); // Reset risk sort indicator
    }
    
    setSortField(field);
    setSortOrder(newSortOrder);
  };
  
  // Open token risk details dialog
  const openRiskDetails = (token: Token) => {
    setSelectedToken(token);
    setShowRiskDialog(true);
  };
  
  // Render risk indicator badge
  const renderRiskBadge = (riskIndex: number) => {
    const { label, color } = getRiskCategory(riskIndex);
    
    return (
      <div className="flex items-center">
        <div className={`h-3 w-3 rounded-full ${color} mr-2`}></div>
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>{t("tokenWatchlist.title", "Token Watchlist with Risk Index")}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-5 w-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{t("tokenWatchlist.tooltip", "The Risk Index (0-100) is calculated based on volatility, market cap, liquidity, and other factors. Lower score = lower risk.")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>{t("tokenWatchlist.description", "Track your favorite tokens and assess their risk profiles")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="all">{t("tokenWatchlist.allTokens", "All Tokens")}</TabsTrigger>
                  <TabsTrigger value="watchlist">
                    {t("tokenWatchlist.watchlist", "Watchlist")} 
                    {watchlistTokens.length > 0 && <Badge className="ml-2">{watchlistTokens.length}</Badge>}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Input
                className="w-full sm:w-64"
                placeholder={t("tokenWatchlist.search", "Search by name or symbol")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {loading ? (
              <div className="w-full flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredTokens.length > 0 ? (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => sortTokens('market_cap_rank')}
                      >
                        # {sortField === 'market_cap_rank' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => sortTokens('name')}
                      >
                        {t("tokenWatchlist.token", "Token")} {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer"
                        onClick={() => sortTokens('current_price')}
                      >
                        {t("tokenWatchlist.price", "Price")} {sortField === 'current_price' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer"
                        onClick={() => sortTokens('price_change_percentage_24h')}
                      >
                        {t("tokenWatchlist.24h", "24h")} {sortField === 'price_change_percentage_24h' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer"
                        onClick={() => sortTokens('market_cap')}
                      >
                        {t("tokenWatchlist.marketCap", "Market Cap")} {sortField === 'market_cap' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="text-right cursor-pointer"
                        onClick={() => sortTokens('risk_index')}
                      >
                        {t("tokenWatchlist.riskIndex", "Risk Index")} {riskSortOrder && (riskSortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTokens.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleWatchlist(token.id)}
                            className="h-8 w-8"
                          >
                            {token.on_watchlist ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            ) : (
                              <StarOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>{token.market_cap_rank}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {token.image && (
                              <img 
                                src={token.image} 
                                alt={token.name} 
                                className="w-6 h-6 mr-2 rounded-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }} 
                              />
                            )}
                            <div>
                              <div className="font-medium">{token.name}</div>
                              <div className="text-xs text-muted-foreground">{token.symbol.toUpperCase()}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(token.current_price)}</TableCell>
                        <TableCell className="text-right">
                          <span className={token.price_change_percentage_24h >= 0 ? "text-green-500" : "text-red-500"}>
                            {token.price_change_percentage_24h >= 0 ? "+" : ""}
                            {token.price_change_percentage_24h.toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(token.market_cap)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            className="p-0" 
                            onClick={() => openRiskDetails(token)}
                          >
                            <div className="w-full flex items-center gap-2">
                              <Progress 
                                value={token.risk_index} 
                                className="h-2 flex-grow" 
                                indicatorClassName={getRiskCategory(token.risk_index || 0).color} 
                              />
                              <span className="text-xs">{Math.round(token.risk_index || 0)}</span>
                            </div>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="w-full text-center py-8 text-muted-foreground">
                {activeTab === "watchlist" && watchlistTokens.length === 0 ? (
                  <div className="space-y-2">
                    <Star className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p>{t("tokenWatchlist.emptyWatchlist", "Your watchlist is empty. Add tokens to track them here.")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p>{t("tokenWatchlist.noResults", "No tokens found matching your search.")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Risk Details Dialog */}
      <Dialog open={showRiskDialog} onOpenChange={setShowRiskDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedToken?.image && (
                <img 
                  src={selectedToken.image} 
                  alt={selectedToken?.name} 
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }} 
                />
              )}
              {selectedToken?.name} ({selectedToken?.symbol.toUpperCase()}) {t("tokenWatchlist.riskAnalysis", "Risk Analysis")}
            </DialogTitle>
            <DialogDescription>
              {t("tokenWatchlist.riskDescription", "Detailed risk assessment based on market data and token characteristics")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedToken && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground">{t("tokenWatchlist.overallRisk", "Overall Risk")}</div>
                  <div className="text-xl font-bold flex items-center gap-2">
                    {renderRiskBadge(selectedToken.risk_index || 0)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">{t("tokenWatchlist.riskScore", "Risk Score")}</div>
                  <div className="text-xl font-bold">{Math.round(selectedToken.risk_index || 0)}/100</div>
                </div>
              </div>
              
              <Progress 
                value={selectedToken.risk_index} 
                className="h-2" 
                indicatorClassName={getRiskCategory(selectedToken.risk_index || 0).color} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <h4 className="font-medium mb-2">{t("tokenWatchlist.riskFactors", "Risk Factors")}</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">{t("tokenWatchlist.volatility", "Volatility")}:</span>
                      <span className="font-medium">{selectedToken.risk_factors?.volatility.toFixed(2)}%</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">{t("tokenWatchlist.liquidity", "Liquidity")}:</span>
                      <span className="font-medium">{(selectedToken.risk_factors?.liquidity || 0).toFixed(3)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">{t("tokenWatchlist.marketCap", "Market Cap")}:</span>
                      <span className="font-medium">{formatCurrency(selectedToken.market_cap)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">{t("tokenWatchlist.marketCapRank", "Market Cap Rank")}:</span>
                      <span className="font-medium">#{selectedToken.market_cap_rank}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">{t("tokenWatchlist.marketData", "Market Data")}</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">{t("tokenWatchlist.price", "Price")}:</span>
                      <span className="font-medium">{formatCurrency(selectedToken.current_price)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">{t("tokenWatchlist.24hChange", "24h Change")}:</span>
                      <span className={selectedToken.price_change_percentage_24h >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                        {selectedToken.price_change_percentage_24h >= 0 ? "+" : ""}
                        {selectedToken.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">{t("tokenWatchlist.volume24h", "24h Volume")}:</span>
                      <span className="font-medium">{formatCurrency(selectedToken.total_volume)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">{t("tokenWatchlist.circulatingSupply", "Circulating Supply")}:</span>
                      <span className="font-medium">{formatNumber(selectedToken.circulating_supply || 0)}</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t("tokenWatchlist.disclaimer", "Disclaimer")}</AlertTitle>
                <AlertDescription>
                  {t("tokenWatchlist.disclaimerText", "Risk assessment is for informational purposes only and should not be considered financial advice. Always do your own research before investing.")}
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            {selectedToken && (
              <Button 
                variant={selectedToken.on_watchlist ? "default" : "outline"}
                onClick={() => toggleWatchlist(selectedToken.id)}
                className="flex items-center gap-2"
              >
                {selectedToken.on_watchlist ? (
                  <>
                    <StarOff className="h-4 w-4" />
                    {t("tokenWatchlist.removeFromWatchlist", "Remove from Watchlist")}
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4" />
                    {t("tokenWatchlist.addToWatchlist", "Add to Watchlist")}
                  </>
                )}
              </Button>
            )}
            <Button variant="ghost" onClick={() => setShowRiskDialog(false)}>
              {t("common.close", "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TokenWatchlist;