import { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  categories: string[];
}

// Popular search tags based on the screenshot
const POPULAR_TAGS = ["Bitcoin", "Ethereum", "Blockchain", "NFT", "DeFi", "Regulation"];

export default function News() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch news data
  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", "/api/news");
      const data = await response.json();
      setNewsItems(data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      toast({
        title: "Error",
        description: "Failed to load news. Please try again.",
        variant: "destructive",
      });
      
      // Set some fallback news items if API fails
      setNewsItems([
        {
          id: "1",
          title: "Bitcoin Price Surges Past $80,000 as Institutional Adoption Continues",
          summary: "Bitcoin hits new all-time high as major institutions announce investments in cryptocurrency.",
          url: "#",
          source: "CryptoNews",
          publishedAt: new Date().toISOString(),
          categories: ["Bitcoin", "Markets"],
        },
        {
          id: "2",
          title: "New DeFi Protocol Launches with $100M in Total Value Locked",
          summary: "Revolutionary decentralized finance platform attracts massive liquidity on day one.",
          url: "#",
          source: "DeFi Daily",
          publishedAt: new Date().toISOString(),
          categories: ["DeFi", "Ethereum"],
        },
        {
          id: "3",
          title: "SEC Approves New Cryptocurrency Regulations",
          summary: "Regulatory clarity emerges as SEC announces framework for digital asset securities.",
          url: "#",
          source: "Regulation Today",
          publishedAt: new Date().toISOString(),
          categories: ["Regulation", "Government"],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNews();
  }, []);

  // Handle search
  const handleSearch = () => {
    // Filter news based on search term
    if (!searchTerm.trim()) {
      fetchNews();
      return;
    }
    
    const filtered = newsItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categories.some(category => 
          category.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    
    if (filtered.length === 0) {
      toast({
        title: "No Results",
        description: `No news found for "${searchTerm}"`,
      });
    } else {
      toast({
        title: "Search Results",
        description: `Found ${filtered.length} articles for "${searchTerm}"`,
      });
      setNewsItems(filtered);
    }
  };

  return (
    <div className="container mx-auto p-6 h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Crypto News</h1>
        <p className="text-muted-foreground">Latest updates from the cryptocurrency world</p>
      </div>

      {/* Search bar and tags */}
      <div className="bg-card rounded-lg p-6 mb-6">
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search for crypto news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>
        
        <div>
          <p className="text-sm mb-2">Popular Searches:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm(tag);
                  // Auto-search after tag selection
                  setTimeout(() => handleSearch(), 100);
                }}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* News list */}
      <div className="bg-card rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Latest Articles</h2>
          <Button variant="outline" size="sm" onClick={fetchNews} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex animate-pulse gap-4">
                <div className="bg-muted rounded w-24 h-24"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : newsItems.length > 0 ? (
          <div className="space-y-6 divide-y divide-border">
            {newsItems.map((item) => (
              <div key={item.id} className="pt-6 first:pt-0">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded bg-muted shrink-0 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-3xl font-bold text-muted-foreground">
                        {item.source.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1 hover:text-primary">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {item.source} · {new Date(item.publishedAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        {item.categories.slice(0, 2).map((category) => (
                          <span
                            key={category}
                            className="text-xs bg-secondary px-2 py-1 rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No news articles found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
