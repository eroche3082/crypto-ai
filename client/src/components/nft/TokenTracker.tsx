import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';
import { 
  AlertCircle, 
  Search, 
  Star, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type Token = {
  token_address: string;
  name: string;
  symbol: string;
  logo?: string;
  thumbnail?: string;
  decimals: number;
  balance: string;
  possible_spam: boolean;
  usd_price?: number;
};

type TokenInfo = {
  id: string;
  symbol: string;
  name: string;
  market_data: {
    current_price: {
      usd: number;
    };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    circulating_supply: number;
    total_supply: number;
  };
  description: {
    en: string;
  };
  image: {
    small: string;
  };
};

type TokenWatchlistItem = {
  id: number;
  userId: number;
  tokenId: string;
  symbol: string;
  name: string;
  contractAddress?: string;
  chain: string;
  createdAt: string;
};

type TokenTrackerProps = {
  defaultWallet?: string;
  isAuthenticated?: boolean;
};

export function TokenTracker({ defaultWallet, isAuthenticated = false }: TokenTrackerProps) {
  const [walletAddress, setWalletAddress] = useState<string>(defaultWallet || '');
  const [inputWallet, setInputWallet] = useState<string>(defaultWallet || '');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'wallet' | 'watchlist'>(defaultWallet ? 'wallet' : 'watchlist');
  
  const { toast } = useToast();
  
  // Fetch tokens from wallet
  const walletTokensQuery = useQuery({
    queryKey: ['/api/tokens/wallet', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      
      const response = await fetch(`/api/tokens/wallet/${walletAddress}`);
      if (!response.ok) throw new Error('Failed to fetch tokens');
      
      const data = await response.json();
      return data.data;
    },
    enabled: !!walletAddress,
  });
  
  // Fetch token watchlist
  const watchlistQuery = useQuery({
    queryKey: ['/api/tokens/watchlist'],
    queryFn: async () => {
      const response = await fetch('/api/tokens/watchlist');
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      
      const data = await response.json();
      return data.data;
    },
    enabled: isAuthenticated && activeTab === 'watchlist',
  });
  
  // Fetch token details if a token is selected
  const tokenInfoQuery = useQuery({
    queryKey: ['/api/tokens/info', selectedTokenId],
    queryFn: async () => {
      if (!selectedTokenId) return null;
      
      const response = await fetch(`/api/tokens/info/${selectedTokenId}`);
      if (!response.ok) throw new Error('Failed to fetch token info');
      
      const data = await response.json();
      return data.data;
    },
    enabled: !!selectedTokenId,
  });
  
  // Add token to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: async (token: { tokenId: string, symbol: string, name: string, contractAddress?: string }) => {
      return apiRequest('POST', '/api/tokens/watchlist', token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/watchlist'] });
      toast({
        title: "Token Added",
        description: "Token has been added to your watchlist",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add token to watchlist: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Remove token from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (tokenId: string) => {
      return apiRequest('DELETE', `/api/tokens/watchlist/${tokenId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tokens/watchlist'] });
      toast({
        title: "Token Removed",
        description: "Token has been removed from your watchlist",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove token from watchlist: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission for wallet address
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWalletAddress(inputWallet);
    
    // Reset selected token and switch to wallet tab
    setSelectedToken(null);
    setSelectedTokenId(null);
    setActiveTab('wallet');
  };
  
  // Handle token selection
  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    
    // Try to find a CoinGecko ID for this token
    // This is a simplified approach - in a real app, you'd need a more robust mapping
    const symbol = token.symbol.toLowerCase();
    
    // Common token mappings
    const tokenMappings: Record<string, string> = {
      'eth': 'ethereum',
      'weth': 'weth',
      'usdt': 'tether',
      'usdc': 'usd-coin',
      'dai': 'dai',
      'link': 'chainlink',
      'uni': 'uniswap',
      'aave': 'aave',
      'snx': 'synthetix-network-token',
      'comp': 'compound-governance-token',
      'mkr': 'maker',
      'crv': 'curve-dao-token'
    };
    
    const tokenId = tokenMappings[symbol] || symbol;
    setSelectedTokenId(tokenId);
  };
  
  // Handle watchlist item selection
  const handleWatchlistItemSelect = (item: TokenWatchlistItem) => {
    setSelectedTokenId(item.tokenId);
    setSelectedToken(null); // Reset selected token since we're viewing from watchlist
  };
  
  // Handle adding current token to watchlist
  const handleAddToWatchlist = () => {
    if (!selectedTokenId || !selectedToken) return;
    
    addToWatchlistMutation.mutate({
      tokenId: selectedTokenId,
      symbol: selectedToken.symbol,
      name: selectedToken.name,
      contractAddress: selectedToken.token_address
    });
  };
  
  // Handle removing token from watchlist
  const handleRemoveFromWatchlist = (tokenId: string) => {
    removeFromWatchlistMutation.mutate(tokenId);
  };
  
  // Check if token is in watchlist
  const isInWatchlist = (tokenId: string): boolean => {
    if (!watchlistQuery.data) return false;
    return watchlistQuery.data.some((item: TokenWatchlistItem) => item.tokenId === tokenId);
  };
  
  // Calculate formatted balance
  const formatBalance = (token: Token): string => {
    if (!token) return '0';
    const rawBalance = token.balance;
    const balance = parseFloat(rawBalance) / Math.pow(10, token.decimals);
    return balance.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };
  
  // Calculate USD value if price is available
  const calculateUsdValue = (token: Token): string => {
    if (!token.usd_price) return 'N/A';
    const balance = parseFloat(token.balance) / Math.pow(10, token.decimals);
    const usdValue = balance * token.usd_price;
    return `$${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };
  
  // Load wallet tokens when the component mounts if defaultWallet is provided
  useEffect(() => {
    if (defaultWallet) {
      setWalletAddress(defaultWallet);
      setInputWallet(defaultWallet);
    }
  }, [defaultWallet]);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Token Tracker</h1>
      
      {/* Wallet Input Form */}
      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <Input
          type="text"
          placeholder="Enter wallet address (0x...)"
          value={inputWallet}
          onChange={(e) => setInputWallet(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={!inputWallet.trim() || walletTokensQuery.isFetching}>
          <Search className="mr-2 h-4 w-4" /> View Tokens
        </Button>
      </form>
      
      {/* Tabs for Wallet/Watchlist */}
      <Tabs value={activeTab} onValueChange={(val: string) => setActiveTab(val as 'wallet' | 'watchlist')} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="wallet">Wallet Tokens</TabsTrigger>
          <TabsTrigger value="watchlist" disabled={!isAuthenticated}>Watchlist</TabsTrigger>
        </TabsList>
        
        {/* Wallet Tokens Tab */}
        <TabsContent value="wallet" className="space-y-4">
          {renderWalletTokens(
            walletTokensQuery, 
            handleTokenSelect, 
            selectedToken, 
            formatBalance, 
            calculateUsdValue, 
            walletAddress
          )}
        </TabsContent>
        
        {/* Watchlist Tab */}
        <TabsContent value="watchlist" className="space-y-4">
          {!isAuthenticated ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                Please log in to view and manage your token watchlist.
              </AlertDescription>
            </Alert>
          ) : renderWatchlist(
            watchlistQuery, 
            handleWatchlistItemSelect, 
            handleRemoveFromWatchlist
          )}
        </TabsContent>
      </Tabs>
      
      {/* Token Details Section */}
      {selectedTokenId && (
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Token Details</h2>
            {isAuthenticated && selectedToken && (
              <Button 
                variant={isInWatchlist(selectedTokenId) ? "outline" : "default"}
                onClick={handleAddToWatchlist}
                disabled={isInWatchlist(selectedTokenId) || addToWatchlistMutation.isPending}
              >
                <Star className="mr-2 h-4 w-4" />
                {isInWatchlist(selectedTokenId) ? 'In Watchlist' : 'Add to Watchlist'}
              </Button>
            )}
          </div>
          
          {renderTokenDetails(
            tokenInfoQuery, 
            selectedToken, 
            formatBalance
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to render wallet tokens based on query state
function renderWalletTokens(
  query: any,
  handleTokenSelect: (token: Token) => void,
  selectedToken: Token | null,
  formatBalance: (token: Token) => string,
  calculateUsdValue: (token: Token) => string,
  walletAddress: string
) {
  // If there's an error with the query
  if (query.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load tokens. Please check the wallet address and try again.
        </AlertDescription>
      </Alert>
    );
  }
  
  // If the query is loading
  if (query.isLoading || query.isFetching) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full mr-4" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-3 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // If there's no wallet address entered yet
  if (!walletAddress) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">Enter a wallet address to view tokens</p>
      </div>
    );
  }
  
  // If the query completed but there are no tokens
  const tokens = query.data || [];
  if (tokens.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">No tokens found for this wallet</p>
      </div>
    );
  }
  
  // Render the token list
  return (
    <div className="space-y-4">
      {tokens.map((token: Token) => (
        <Card 
          key={token.token_address} 
          className={`overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
            selectedToken?.token_address === token.token_address ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleTokenSelect(token)}
        >
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              {token.logo ? (
                <img 
                  src={token.logo} 
                  alt={token.symbol} 
                  className="h-8 w-8 rounded-full mr-4"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/32/6366F1/FFFFFF?text=${token.symbol.charAt(0)}`;
                  }}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white mr-4">
                  {token.symbol.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-medium">{token.name}</h3>
                <p className="text-sm text-gray-500">{token.symbol.toUpperCase()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatBalance(token)}</p>
              <p className="text-xs text-gray-500">{calculateUsdValue(token)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Helper function to render watchlist based on query state
function renderWatchlist(
  query: any,
  handleWatchlistItemSelect: (item: TokenWatchlistItem) => void,
  handleRemoveFromWatchlist: (tokenId: string) => void
) {
  // If there's an error with the query
  if (query.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load watchlist. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  // If the query is loading
  if (query.isLoading || query.isFetching) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full mr-4" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // If the query completed but there are no watchlist items
  const watchlistItems = query.data || [];
  if (watchlistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">No tokens in your watchlist</p>
        <p className="text-sm text-gray-400 mt-2">Add tokens from the Wallet Tokens tab to monitor them</p>
      </div>
    );
  }
  
  // Render the watchlist
  return (
    <div className="space-y-4">
      {watchlistItems.map((item: TokenWatchlistItem) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-4 flex justify-between items-center">
            <div 
              className="flex items-center cursor-pointer flex-1"
              onClick={() => handleWatchlistItemSelect(item)}
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white mr-4">
                {item.symbol.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.symbol.toUpperCase()}</p>
              </div>
              {item.chain && item.chain !== 'ethereum' && (
                <Badge variant="outline" className="ml-2">
                  {item.chain}
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFromWatchlist(item.tokenId);
              }}
            >
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Helper function to render token details based on query state
function renderTokenDetails(
  query: any,
  selectedToken: Token | null,
  formatBalance: (token: Token) => string
) {
  // If there's an error with the query
  if (query.isError) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Limited Information</AlertTitle>
        <AlertDescription>
          We couldn't retrieve detailed information for this token. Basic information is displayed.
        </AlertDescription>
      </Alert>
    );
  }
  
  // If the query is loading
  if (query.isLoading || query.isFetching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Skeleton className="h-16 w-16 rounded-full mr-6" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  // Get token info from query
  const tokenInfo: TokenInfo | null = query.data;
  
  // If we have no token info, show basic info only
  if (!tokenInfo) {
    // Only show if we have a selected token (from wallet)
    if (!selectedToken) return null;
    
    return (
      <div>
        <div className="flex items-center mb-6">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white mr-4">
            {selectedToken.symbol.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{selectedToken.name}</h2>
            <p className="text-gray-500">{selectedToken.symbol.toUpperCase()}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-xl font-bold">{formatBalance(selectedToken)}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Contract</p>
              <p className="text-sm font-medium truncate">{selectedToken.token_address}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Decimals</p>
              <p className="text-xl font-bold">{selectedToken.decimals}</p>
            </CardContent>
          </Card>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Limited Information</AlertTitle>
          <AlertDescription>
            Detailed market data is not available for this token.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Calculate price change color and icon
  const priceChange24h = tokenInfo.market_data.price_change_percentage_24h;
  const priceChangeColor = priceChange24h >= 0 ? 'text-green-500' : 'text-red-500';
  const PriceChangeIcon = priceChange24h >= 0 ? TrendingUp : TrendingDown;
  
  // Render full token details
  return (
    <div>
      <div className="flex items-center mb-6">
        {tokenInfo.image?.small ? (
          <img 
            src={tokenInfo.image.small} 
            alt={tokenInfo.name} 
            className="h-12 w-12 rounded-full mr-4"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white mr-4">
            {tokenInfo.symbol.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold mr-2">{tokenInfo.name}</h2>
            <Badge>{tokenInfo.symbol.toUpperCase()}</Badge>
          </div>
          <div className="flex items-center">
            <p className="text-lg font-bold mr-2">
              ${tokenInfo.market_data.current_price.usd.toLocaleString()}
            </p>
            <div className={`flex items-center ${priceChangeColor}`}>
              <PriceChangeIcon className="h-4 w-4 mr-1" />
              <span>{Math.abs(priceChange24h).toFixed(2)}%</span>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => window.open(`https://coingecko.com/en/coins/${tokenInfo.id}`, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" /> View More
        </Button>
      </div>
      
      {/* Display wallet balance if available */}
      {selectedToken && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Your Holdings</h3>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Balance</p>
                <p className="text-xl font-bold">{formatBalance(selectedToken)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Value (USD)</p>
                <p className="text-xl font-bold">
                  ${(parseFloat(selectedToken.balance) / Math.pow(10, selectedToken.decimals) * 
                    tokenInfo.market_data.current_price.usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Market Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Market Cap</p>
            <p className="text-lg font-bold">${tokenInfo.market_data.market_cap.usd.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">24h Volume</p>
            <p className="text-lg font-bold">${tokenInfo.market_data.total_volume.usd.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Circulating Supply</p>
            <p className="text-lg font-bold">{tokenInfo.market_data.circulating_supply.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Supply</p>
            <p className="text-lg font-bold">
              {tokenInfo.market_data.total_supply 
                ? tokenInfo.market_data.total_supply.toLocaleString() 
                : 'Unlimited'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Price Change */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">24h Change</p>
            <p className={`text-lg font-bold ${tokenInfo.market_data.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {tokenInfo.market_data.price_change_percentage_24h.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">7d Change</p>
            <p className={`text-lg font-bold ${tokenInfo.market_data.price_change_percentage_7d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {tokenInfo.market_data.price_change_percentage_7d.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">30d Change</p>
            <p className={`text-lg font-bold ${tokenInfo.market_data.price_change_percentage_30d >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {tokenInfo.market_data.price_change_percentage_30d.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Description */}
      {tokenInfo.description?.en && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">About {tokenInfo.name}</h3>
            <div 
              className="text-sm text-gray-700 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: tokenInfo.description.en.slice(0, 300) + (tokenInfo.description.en.length > 300 ? '...' : '') }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}