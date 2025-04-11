import { useState, useEffect } from "react";
import { useCrypto } from "@/contexts/CryptoContext";
import CryptoCard from "@/components/CryptoCard";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Favorites() {
  const { cryptoData } = useCrypto();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("24h");
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await apiRequest("GET", "/api/favorites");
        const data = await response.json();
        const symbols = data.map((fav: any) => fav.symbol);
        setFavorites(symbols);
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
        toast({
          title: "Error",
          description: "Failed to load your favorite cryptocurrencies",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFavorites();
  }, [toast]);
  
  const toggleFavorite = async (symbol: string) => {
    try {
      if (favorites.includes(symbol)) {
        await apiRequest("DELETE", `/api/favorites/${symbol}`);
        setFavorites(favorites.filter(fav => fav !== symbol));
        toast({
          title: "Removed from favorites",
          description: `${symbol.toUpperCase()} has been removed from your favorites`,
        });
      } else {
        await apiRequest("POST", "/api/favorites", { symbol });
        setFavorites([...favorites, symbol]);
        toast({
          title: "Added to favorites",
          description: `${symbol.toUpperCase()} has been added to your favorites`,
        });
      }
    } catch (error) {
      console.error("Failed to update favorites:", error);
      toast({
        title: "Error",
        description: "Failed to update your favorites",
        variant: "destructive",
      });
    }
  };
  
  // Filter cryptoData to only show favorites
  const favoriteCryptos = cryptoData?.filter(crypto => 
    favorites.includes(crypto.symbol.toLowerCase())
  ) || [];
  
  return (
    <div className="container mx-auto p-6 h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Favorite Cryptocurrencies</h1>
        <p className="text-muted-foreground">Track and manage your favorite crypto assets</p>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant={timeFilter === "24h" ? "default" : "outline"}
            onClick={() => setTimeFilter("24h")}
            size="sm"
          >
            24h
          </Button>
          <Button
            variant={timeFilter === "7d" ? "default" : "outline"}
            onClick={() => setTimeFilter("7d")}
            size="sm"
          >
            7d
          </Button>
          <Button
            variant={timeFilter === "30d" ? "default" : "outline"}
            onClick={() => setTimeFilter("30d")}
            size="sm"
          >
            30d
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : favoriteCryptos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favoriteCryptos.map(crypto => (
            <CryptoCard
              key={crypto.id}
              crypto={crypto}
              timeFilter={timeFilter}
              onClick={() => toggleFavorite(crypto.symbol.toLowerCase())}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium mb-2">No favorites yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't added any cryptocurrencies to your favorites list yet.
          </p>
          <Button asChild>
            <a href="/">Browse Cryptocurrencies</a>
          </Button>
        </div>
      )}
    </div>
  );
}