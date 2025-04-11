import { useState, useEffect } from "react";
import { useCrypto } from "@/contexts/CryptoContext";
import CryptoCard from "@/components/CryptoCard";
import ManageFavoritesDialog from "@/components/ManageFavoritesDialog";
import { Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

export default function Favorites() {
  const { t } = useTranslation();
  const { cryptoData } = useCrypto();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("24h");
  const [manageFavoritesOpen, setManageFavoritesOpen] = useState(false);
  const { toast } = useToast();

  // Fetch favorites from the server
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/favorites");
        if (response.ok) {
          const data = await response.json();
          setFavorites(data.map((item: any) => item.symbol.toLowerCase()));
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your favorite cryptocurrencies"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [toast]);

  // Toggle favorite status
  const toggleFavorite = async (symbol: string) => {
    try {
      const method = favorites.includes(symbol.toLowerCase()) ? "DELETE" : "POST";
      const response = await fetch(`/api/favorites/${symbol}`, { method });
      
      if (response.ok) {
        if (method === "DELETE") {
          setFavorites(favorites.filter(fav => fav !== symbol.toLowerCase()));
          toast({
            title: "Removed from favorites",
            description: `${symbol.toUpperCase()} has been removed from your favorites`
          });
        } else {
          setFavorites([...favorites, symbol.toLowerCase()]);
          toast({
            title: "Added to favorites",
            description: `${symbol.toUpperCase()} has been added to your favorites`
          });
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update favorites"
      });
    }
  };

  const favoritesCryptoData = cryptoData?.filter(crypto => 
    favorites.includes(crypto.symbol.toLowerCase())
  );

  // Change time filter
  const handleTimeFilterChange = (filter: string) => {
    setTimeFilter(filter);
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="text-yellow-500" size={24} />
          {t("favorites.title", "Favorite Cryptocurrencies")}
        </h1>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setManageFavoritesOpen(true)}
          >
            <Star size={16} className="text-yellow-500" />
            {t("favorites.manage", "Manage Favorites")}
          </Button>
          
          <ManageFavoritesDialog
            open={manageFavoritesOpen}
            onOpenChange={setManageFavoritesOpen}
            favorites={favorites}
            onAddFavorite={(symbol: string) => toggleFavorite(symbol)}
            onRemoveFavorite={(symbol: string) => toggleFavorite(symbol)}
          />
          
          <div className="flex bg-card rounded-lg p-1">
            {["24h", "7d", "14d", "30d"].map((filter) => (
              <Button
                key={filter}
                variant={timeFilter === filter ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTimeFilterChange(filter)}
                className="text-xs"
              >
                {filter}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="icon">
            <RefreshCw size={18} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-lg p-4">
              <Skeleton className="h-8 w-2/3 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-24 w-full mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-card/50 rounded-lg p-8 text-center">
          <Star className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-xl font-medium mb-2">{t("favorites.empty", "No favorites yet")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("favorites.empty.description", "Add cryptocurrencies to your favorites to track them easily")}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <a href="/">{t("favorites.browse", "Browse Cryptocurrencies")}</a>
            </Button>
            <TodoFavorites 
              favorites={favorites}
              onAddFavorite={(symbol) => toggleFavorite(symbol)}
              onRemoveFavorite={(symbol) => toggleFavorite(symbol)}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoritesCryptoData?.map((crypto) => (
            <CryptoCard
              key={crypto.id}
              crypto={crypto}
              timeFilter={timeFilter}
              onClick={() => toggleFavorite(crypto.symbol)}
            />
          ))}
        </div>
      )}
    </div>
  );
}