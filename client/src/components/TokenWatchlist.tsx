import { useState, useEffect } from "react";
import { 
  PlusCircle, 
  AlertTriangle, 
  BarChart3, 
  ArrowUpDown, 
  Trash2,
  Info,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

// Interface for a token in the watchlist
interface WatchlistToken {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  tags: string[];
}

// Helper function to generate risk score based on market cap, volatility, and volume
const calculateRiskScore = (
  marketCap: number, 
  priceChange24h: number,
): number => {
  // Convert market cap to billions for easier calculation
  const marketCapBillions = marketCap / 1_000_000_000;
  
  // Calculate risk score based on market cap (higher market cap = lower risk)
  let riskScore = 100 - Math.min(Math.log10(marketCapBillions + 1) * 20, 60);
  
  // Adjust for price volatility
  const volatilityFactor = Math.abs(priceChange24h) * 2;
  riskScore += volatilityFactor;
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(riskScore)));
};

// Helper function to determine risk level based on score
const getRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'extreme' => {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'extreme';
};

// Helper function to get color based on risk level
const getRiskColor = (level: 'low' | 'medium' | 'high' | 'extreme'): string => {
  switch (level) {
    case 'low': return 'bg-green-500';
    case 'medium': return 'bg-yellow-500';
    case 'high': return 'bg-orange-500';
    case 'extreme': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

// Component for the token watchlist
const TokenWatchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistToken[]>([]);
  const [availableTokens, setAvailableTokens] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change' | 'risk'>('risk');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedToken, setSelectedToken] = useState<string>("");
  const { toast } = useToast();

  // Fetch available tokens from CoinGecko
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/crypto/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false');
        if (!response.ok) throw new Error('Failed to fetch tokens');
        const data = await response.json();
        setAvailableTokens(data);
      } catch (error) {
        console.error('Error fetching tokens:', error);
        toast({
          title: "Error",
          description: "Failed to load available tokens",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [toast]);

  // Load watchlist from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('tokenWatchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (error) {
        console.error('Error parsing saved watchlist:', error);
      }
    }
  }, []);

  // Save watchlist to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('tokenWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Add token to watchlist
  const addToWatchlist = () => {
    if (!selectedToken) return;

    // Check if token is already in watchlist
    if (watchlist.some(token => token.id === selectedToken)) {
      toast({
        title: "Already Added",
        description: "This token is already in your watchlist",
        variant: "default"
      });
      return;
    }

    // Find token details from available tokens
    const tokenDetails = availableTokens.find(token => token.id === selectedToken);
    if (!tokenDetails) return;

    // Calculate risk score
    const riskScore = calculateRiskScore(
      tokenDetails.market_cap,
      tokenDetails.price_change_percentage_24h
    );
    const riskLevel = getRiskLevel(riskScore);

    // Generate tags based on token properties
    const tags: string[] = [];
    if (tokenDetails.market_cap > 10_000_000_000) tags.push('large-cap');
    else if (tokenDetails.market_cap < 1_000_000_000) tags.push('small-cap');
    else tags.push('mid-cap');

    if (Math.abs(tokenDetails.price_change_percentage_24h) > 10) tags.push('volatile');
    if (tokenDetails.price_change_percentage_24h > 0) tags.push('gaining');
    else tags.push('declining');

    // Create new token object
    const newToken: WatchlistToken = {
      id: tokenDetails.id,
      symbol: tokenDetails.symbol.toUpperCase(),
      name: tokenDetails.name,
      currentPrice: tokenDetails.current_price,
      priceChange24h: tokenDetails.price_change_percentage_24h,
      marketCap: tokenDetails.market_cap,
      riskScore,
      riskLevel,
      tags
    };

    // Add to watchlist
    setWatchlist(prev => [...prev, newToken]);
    
    // Close dialog and reset selected token
    setIsAddDialogOpen(false);
    setSelectedToken("");

    toast({
      title: "Token Added",
      description: `${newToken.name} has been added to your watchlist`,
      variant: "default"
    });
  };

  // Remove token from watchlist
  const removeFromWatchlist = (id: string) => {
    setWatchlist(prev => prev.filter(token => token.id !== id));
    toast({
      title: "Token Removed",
      description: "Token has been removed from your watchlist",
      variant: "default"
    });
  };

  // Sort watchlist tokens
  const sortedWatchlist = [...watchlist].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.currentPrice - b.currentPrice;
        break;
      case 'change':
        comparison = a.priceChange24h - b.priceChange24h;
        break;
      case 'risk':
        comparison = a.riskScore - b.riskScore;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Toggle sort direction
  const toggleSort = (field: 'name' | 'price' | 'change' | 'risk') => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2
    }).format(value);
  };

  // Format market cap
  const formatMarketCap = (value: number) => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    } else {
      return `$${value.toLocaleString()}`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Token Watchlist with Risk Index</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Token
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Token to Watchlist</DialogTitle>
              <DialogDescription>
                Select a token to add to your watchlist. Risk scores are calculated based on market capitalization and price volatility.
              </DialogDescription>
            </DialogHeader>
            <div className="my-4">
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a token" />
                </SelectTrigger>
                <SelectContent>
                  {availableTokens.map(token => (
                    <SelectItem key={token.id} value={token.id}>
                      {token.name} ({token.symbol.toUpperCase()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addToWatchlist} disabled={!selectedToken}>
                Add to Watchlist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Risk Level Key */}
      <div className="mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Risk Level Key</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>Low Risk (0-24)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span>Medium Risk (25-49)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                <span>High Risk (50-74)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span>Extreme Risk (75-100)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Watchlist Table */}
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleSort('name')}
                  className="flex items-center"
                >
                  Token
                  {sortBy === 'name' && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead className="w-[150px]">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleSort('price')}
                  className="flex items-center"
                >
                  Price
                  {sortBy === 'price' && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead className="w-[150px]">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleSort('change')}
                  className="flex items-center"
                >
                  24h Change
                  {sortBy === 'change' && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>Market Cap</TableHead>
              <TableHead className="w-[250px]">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleSort('risk')}
                  className="flex items-center"
                >
                  Risk Score
                  {sortBy === 'risk' && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedWatchlist.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Your watchlist is empty. Add tokens to track their risk and performance.
                </TableCell>
              </TableRow>
            ) : (
              sortedWatchlist.map(token => (
                <TableRow key={token.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{token.name}</span>
                      <span className="text-muted-foreground text-sm">{token.symbol}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(token.currentPrice)}</TableCell>
                  <TableCell>
                    <span className={token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell>{formatMarketCap(token.marketCap)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={`w-4 h-4 rounded-full ${getRiskColor(token.riskLevel)}`}></div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{token.riskLevel.charAt(0).toUpperCase() + token.riskLevel.slice(1)} Risk</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Progress 
                        value={token.riskScore} 
                        className="h-2" 
                        indicatorClassName={getRiskColor(token.riskLevel)}
                      />
                      <span>{token.riskScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {token.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFromWatchlist(token.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Risk Analysis Summary Card */}
      {watchlist.length > 0 && (
        <div className="mt-8">
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle>Portfolio Risk Analysis</CardTitle>
              <CardDescription>
                Summary of risk across your watchlist tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg bg-background p-4">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                    Highest Risk
                  </h3>
                  {watchlist.length > 0 ? (
                    <div>
                      {[...watchlist].sort((a, b) => b.riskScore - a.riskScore)[0].name}
                      <p className="text-muted-foreground text-sm">
                        Risk Score: {[...watchlist].sort((a, b) => b.riskScore - a.riskScore)[0].riskScore}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No tokens in watchlist</p>
                  )}
                </div>
                <div className="rounded-lg bg-background p-4">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                    Average Risk
                  </h3>
                  {watchlist.length > 0 ? (
                    <div>
                      <p className="font-medium">
                        {Math.round(watchlist.reduce((acc, token) => acc + token.riskScore, 0) / watchlist.length)}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {getRiskLevel(Math.round(watchlist.reduce((acc, token) => acc + token.riskScore, 0) / watchlist.length))} risk level
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No tokens in watchlist</p>
                  )}
                </div>
                <div className="rounded-lg bg-background p-4">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-green-500" />
                    Risk Distribution
                  </h3>
                  {watchlist.length > 0 ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 flex-1 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-green-500 h-full" 
                          style={{ 
                            width: `${(watchlist.filter(t => t.riskLevel === 'low').length / watchlist.length) * 100}%` 
                          }}
                        ></div>
                        <div 
                          className="bg-yellow-500 h-full" 
                          style={{ 
                            width: `${(watchlist.filter(t => t.riskLevel === 'medium').length / watchlist.length) * 100}%` 
                          }}
                        ></div>
                        <div 
                          className="bg-orange-500 h-full" 
                          style={{ 
                            width: `${(watchlist.filter(t => t.riskLevel === 'high').length / watchlist.length) * 100}%` 
                          }}
                        ></div>
                        <div 
                          className="bg-red-500 h-full" 
                          style={{ 
                            width: `${(watchlist.filter(t => t.riskLevel === 'extreme').length / watchlist.length) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No tokens in watchlist</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5" />
                <p>
                  Risk scores are calculated based on market capitalization and price volatility.
                  Lower market cap and higher volatility increase risk. This is not financial advice.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TokenWatchlist;