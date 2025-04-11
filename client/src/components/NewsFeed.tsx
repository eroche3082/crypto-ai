import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

const NewsFeed = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState("all");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // In a real application, we would call a real crypto news API
        // For now, we'll simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This is where we would make the API call
        // const response = await fetch(`/api/news?category=${category}`);
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockResponse = [
          {
            id: "1",
            title: "Bitcoin Breaks $60,000 Barrier After ETF Approval",
            summary: "Bitcoin has surged past $60,000 following the SEC's approval of spot Bitcoin ETFs, marking a significant milestone for cryptocurrency adoption.",
            url: "#",
            source: "CryptoNews",
            publishedAt: new Date().toISOString(),
            categories: ["bitcoin", "market", "regulation"],
          },
          {
            id: "2",
            title: "Ethereum Completes Major Network Upgrade",
            summary: "Ethereum has successfully implemented its latest network upgrade, improving scalability and reducing gas fees for transactions.",
            url: "#",
            source: "BlockchainInsider",
            publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            categories: ["ethereum", "technology", "upgrade"],
          },
          {
            id: "3",
            title: "DeFi Protocol Launches New Governance Token",
            summary: "A leading DeFi protocol has launched a new governance token, giving users more control over the future development of the platform.",
            url: "#",
            source: "DeFiDaily",
            publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            categories: ["defi", "tokens", "governance"],
          },
          {
            id: "4",
            title: "NFT Market Shows Signs of Recovery After Slump",
            summary: "The NFT market is showing signs of recovery with increasing trading volumes after months of declining activity and prices.",
            url: "#",
            source: "NFTWorld",
            publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            categories: ["nft", "market", "trends"],
          },
          {
            id: "5",
            title: "Central Banks Accelerate CBDC Development",
            summary: "Several central banks worldwide are accelerating their central bank digital currency (CBDC) development efforts in response to the growing popularity of cryptocurrencies.",
            url: "#",
            source: "GlobalCryptoNews",
            publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
            categories: ["cbdc", "regulation", "government"],
          },
        ];
        
        if (category !== "all") {
          const filtered = mockResponse.filter(item => 
            item.categories.includes(category)
          );
          setNews(filtered);
        } else {
          setNews(mockResponse);
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch news. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchNews();
  }, [category]);
  
  const categories = [
    { id: "all", label: t("news.categories.all") },
    { id: "bitcoin", label: t("news.categories.bitcoin") },
    { id: "ethereum", label: t("news.categories.ethereum") },
    { id: "defi", label: t("news.categories.defi") },
    { id: "nft", label: t("news.categories.nft") },
    { id: "regulation", label: t("news.categories.regulation") },
    { id: "market", label: t("news.categories.market") },
  ];
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (err) {
      return dateString;
    }
  };
  
  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{t("news.title")}</h2>
        <p className="text-sm text-gray-400">{t("news.subtitle")}</p>
      </div>
      
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="mb-6 overflow-x-auto flex w-full">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-secondary rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-error p-8">
            <span className="material-icons text-4xl">error_outline</span>
            <p className="mt-2">{error}</p>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center text-gray-400 p-8">
            <span className="material-icons text-4xl">search_off</span>
            <p className="mt-2">{t("news.noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map((item) => (
              <Card key={item.id} className="bg-secondary border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="text-gray-400 text-xs mt-1">
                        {item.source} • {formatDate(item.publishedAt)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">{item.summary}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t border-gray-700 pt-4">
                  <div className="flex flex-wrap gap-1">
                    {item.categories.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline"
                  >
                    {t("news.readMore")}
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default NewsFeed;
