import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Twitter,
  Search,
  TrendingUp,
  BarChart,
  User,
  Hash,
  MessageCircle,
  RefreshCw,
  ArrowUpRight,
  Calendar 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Types for Twitter API responses
type Tweet = {
  text: string;
  id: string;
  created_at: string;
  user: {
    name: string;
    screen_name: string;
    profile_image_url_https: string;
    verified: boolean;
  };
  entities?: {
    hashtags?: { text: string }[];
    urls?: { url: string, expanded_url: string }[];
  };
  favorite_count?: number;
  retweet_count?: number;
  reply_count?: number;
};

type Trend = {
  name: string;
  url: string;
  query: string;
  tweet_volume: number;
};

type SentimentAnalysis = {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  tweetCount: number;
  positive: number;
  negative: number;
  neutral: number;
};

type TwitterFeedProps = {
  defaultSymbol?: string;
  defaultUsername?: string;
};

export function TwitterFeed({ defaultSymbol = 'BTC', defaultUsername = 'CoinGecko' }: TwitterFeedProps) {
  const [activeTab, setActiveTab] = useState<string>('trends');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [symbol, setSymbol] = useState<string>(defaultSymbol);
  const [username, setUsername] = useState<string>(defaultUsername);
  
  const { toast } = useToast();
  
  // Trends query
  const trendsQuery = useQuery({
    queryKey: ['/api/twitter/trends'],
    queryFn: async () => {
      const response = await fetch('/api/twitter/trends');
      if (!response.ok) throw new Error('Failed to fetch trends');
      
      const data = await response.json();
      return data.data;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
  
  // User tweets query
  const userTweetsQuery = useQuery({
    queryKey: ['/api/twitter/user', username],
    queryFn: async () => {
      if (!username) return { data: [] };
      
      const response = await fetch(`/api/twitter/user/${username}/tweets/10`);
      if (!response.ok) throw new Error('Failed to fetch user tweets');
      
      const data = await response.json();
      return data;
    },
    enabled: activeTab === 'user' && !!username,
  });
  
  // Search tweets query
  const searchTweetsQuery = useQuery({
    queryKey: ['/api/twitter/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return { data: [] };
      
      const response = await fetch(`/api/twitter/search/${encodeURIComponent(searchQuery)}/20`);
      if (!response.ok) throw new Error('Failed to search tweets');
      
      const data = await response.json();
      return data;
    },
    enabled: activeTab === 'search' && !!searchQuery,
  });
  
  // Sentiment analysis query
  const sentimentQuery = useQuery({
    queryKey: ['/api/twitter/sentiment', symbol],
    queryFn: async () => {
      if (!symbol) return null;
      
      const response = await fetch(`/api/twitter/sentiment/${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch sentiment analysis');
      
      const data = await response.json();
      return data.data;
    },
    enabled: activeTab === 'sentiment' && !!symbol,
  });
  
  // Handle form submissions
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };
  
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsername(searchTerm);
  };
  
  const handleSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSymbol(searchTerm);
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Twitter className="h-6 w-6 text-blue-500 mr-2" />
        <h1 className="text-2xl font-bold">Twitter Crypto Integration</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4 grid grid-cols-4">
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="user">
            <User className="h-4 w-4 mr-2" />
            User
          </TabsTrigger>
          <TabsTrigger value="sentiment">
            <BarChart className="h-4 w-4 mr-2" />
            Sentiment
          </TabsTrigger>
        </TabsList>
        
        {/* Trends Tab */}
        <TabsContent value="trends">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Crypto Trending Topics</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => trendsQuery.refetch()}
              disabled={trendsQuery.isFetching}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${trendsQuery.isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {renderTrends(trendsQuery)}
        </TabsContent>
        
        {/* Search Tab */}
        <TabsContent value="search">
          <div className="mb-6">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for crypto tweets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!searchTerm.trim() || searchTweetsQuery.isFetching}>
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </form>
          </div>
          
          {searchQuery ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Search Results for "{searchQuery}"</h2>
              {renderTweets(searchTweetsQuery)}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Enter a search term to find crypto-related tweets</p>
            </div>
          )}
        </TabsContent>
        
        {/* User Tab */}
        <TabsContent value="user">
          <div className="mb-6">
            <form onSubmit={handleUserSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Twitter username (without @)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!searchTerm.trim() || userTweetsQuery.isFetching}>
                <User className="mr-2 h-4 w-4" /> View Tweets
              </Button>
            </form>
          </div>
          
          {username ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Tweets from @{username}</h2>
              {renderTweets(userTweetsQuery)}
            </div>
          ) : (
            <div className="text-center py-16">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Enter a Twitter username to view their tweets</p>
            </div>
          )}
        </TabsContent>
        
        {/* Sentiment Tab */}
        <TabsContent value="sentiment">
          <div className="mb-6">
            <form onSubmit={handleSymbolSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Crypto symbol (e.g., BTC, ETH)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!searchTerm.trim() || sentimentQuery.isFetching}>
                <BarChart className="mr-2 h-4 w-4" /> Analyze
              </Button>
            </form>
          </div>
          
          {symbol ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Sentiment Analysis for {symbol.toUpperCase()}</h2>
              {renderSentiment(sentimentQuery, symbol)}
            </div>
          ) : (
            <div className="text-center py-16">
              <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Enter a crypto symbol to analyze Twitter sentiment</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to render trends
function renderTrends(query: any) {
  if (query.isError) {
    return (
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load trends. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (query.isLoading || query.isFetching) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const trends = query.data?.trends || [];
  
  if (trends.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500">No trending topics found</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {trends.slice(0, 15).map((trend: Trend, i: number) => (
        <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Hash className="h-4 w-4 mr-1 text-blue-500" />
                {trend.name}
              </div>
              <span className="text-xs text-gray-500">#{i + 1}</span>
            </CardTitle>
            {trend.tweet_volume && (
              <CardDescription>
                {trend.tweet_volume.toLocaleString()} tweets
              </CardDescription>
            )}
          </CardHeader>
          <CardFooter className="pt-2 flex justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              asChild
            >
              <a href={`https://twitter.com/search?q=${encodeURIComponent(trend.query)}`} target="_blank" rel="noopener noreferrer">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                View on Twitter
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Helper function to render tweets
function renderTweets(query: any) {
  if (query.isError) {
    return (
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load tweets. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (query.isLoading || query.isFetching) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const tweets: Tweet[] = query.data?.data?.timeline?.instructions?.[0]?.addEntries?.entries
    ?.filter((entry: any) => entry.content?.item?.content?.tweet)
    ?.map((entry: any) => {
      const tweet = entry.content.item.content.tweet;
      const user = tweet.core.user_results.result;
      
      return {
        id: tweet.legacy.id_str,
        text: tweet.legacy.full_text,
        created_at: tweet.legacy.created_at,
        user: {
          name: user.legacy.name,
          screen_name: user.legacy.screen_name,
          profile_image_url_https: user.legacy.profile_image_url_https,
          verified: user.is_blue_verified
        },
        entities: tweet.legacy.entities,
        favorite_count: tweet.legacy.favorite_count,
        retweet_count: tweet.legacy.retweet_count
      };
    }) || [];
  
  if (!tweets || tweets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500">No tweets found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {tweets.map((tweet: Tweet) => (
        <Card key={tweet.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage src={tweet.user.profile_image_url_https} />
                <AvatarFallback>{tweet.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="flex items-center">
                  <span className="font-semibold">{tweet.user.name}</span>
                  {tweet.user.verified && (
                    <Badge variant="outline" className="ml-1 px-1">
                      <Twitter className="h-3 w-3 text-blue-500" />
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">@{tweet.user.screen_name}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="mb-2 whitespace-pre-wrap">{tweet.text}</div>
            
            {tweet.entities?.hashtags && tweet.entities.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tweet.entities.hashtags.map((tag, i) => (
                  <Badge key={i} variant="secondary">#{tag.text}</Badge>
                ))}
              </div>
            )}
            
            <div className="text-sm text-gray-500 mt-2 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(tweet.created_at).toLocaleString()}
            </div>
          </CardContent>
          <CardFooter className="pt-2 flex justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <MessageCircle className="h-4 w-4 mr-1" />
              {tweet.reply_count || 0}
            </div>
            <div className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-1" />
              {tweet.retweet_count || 0}
            </div>
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {tweet.favorite_count || 0}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              asChild
            >
              <a href={`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id}`} target="_blank" rel="noopener noreferrer">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                View on Twitter
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Helper function to render sentiment analysis
function renderSentiment(query: any, symbol: string) {
  if (query.isError) {
    return (
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load sentiment analysis. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (query.isLoading || query.isFetching) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const sentiment: SentimentAnalysis = query.data;
  
  if (!sentiment) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500">No sentiment data available for {symbol.toUpperCase()}</p>
      </div>
    );
  }
  
  // Get colors and emojis based on sentiment
  let sentimentColor = 'bg-gray-200';
  let sentimentText = 'text-gray-700';
  let sentimentEmoji = '😐';
  
  if (sentiment.sentiment === 'positive') {
    sentimentColor = 'bg-green-100';
    sentimentText = 'text-green-700';
    sentimentEmoji = '😃';
  } else if (sentiment.sentiment === 'negative') {
    sentimentColor = 'bg-red-100';
    sentimentText = 'text-red-700';
    sentimentEmoji = '😟';
  }
  
  // Calculate confidence scale (0-100%)
  const confidencePercentage = Math.round(sentiment.confidence * 100);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Twitter Sentiment for {symbol.toUpperCase()}</CardTitle>
        <CardDescription>
          Based on analysis of {sentiment.tweetCount} tweets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <div className={`rounded-lg p-6 ${sentimentColor} flex items-center justify-between`}>
            <div>
              <h3 className={`text-lg font-semibold ${sentimentText} capitalize`}>
                {sentiment.sentiment} Sentiment
              </h3>
              <p className="text-sm text-gray-600">
                Confidence: {confidencePercentage}%
              </p>
            </div>
            <div className="text-5xl">
              {sentimentEmoji}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {sentiment.positive}
                </div>
                <div className="text-sm text-gray-500">Positive Tweets</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-500 mb-2">
                  {sentiment.neutral}
                </div>
                <div className="text-sm text-gray-500">Neutral Tweets</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">
                  {sentiment.negative}
                </div>
                <div className="text-sm text-gray-500">Negative Tweets</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}