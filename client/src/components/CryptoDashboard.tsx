import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CryptoCard from "./CryptoCard";
import TodoFavorites from "./TodoFavorites";
import ManageFavoritesDialog from "./ManageFavoritesDialog";
import TokenWatchlist from "./TokenWatchlist";
import ConnectWalletButton from "./ConnectWalletButton";
import { useCryptoData } from "../hooks/useCryptoData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Star, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CryptoDashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [timeFilter, setTimeFilter] = useState("24h");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [manageFavoritesOpen, setManageFavoritesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'market' | 'watchlist'>('market');
  const { data, isLoading, error } = useCryptoData({ timeFilter });
  
  // Fetch favorites from the server
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch("/api/favorites");
        if (response.ok) {
          const data = await response.json();
          setFavorites(data.map((item: any) => item.symbol.toLowerCase()));
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, []);
  
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
  
  if (isLoading) {
    return (
      <div className="p-4 flex flex-col gap-4 overflow-auto scrollbar-hide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-secondary rounded-lg p-4 shadow animate-pulse h-52"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-error">
        <span className="material-icons text-4xl">error_outline</span>
        <p className="mt-2">{t("dashboard.error")}</p>
        <p className="text-sm text-gray-400">{String(error)}</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 flex flex-col gap-4 overflow-auto scrollbar-hide">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">{t("dashboard.title")}</h2>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'market' | 'watchlist')}>
            <TabsList>
              <TabsTrigger value="market">{t("dashboard.marketOverview", "Market Overview")}</TabsTrigger>
              <TabsTrigger value="watchlist">{t("dashboard.riskWatchlist", "Risk Watchlist")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <ConnectWalletButton 
            variant="outline"
            size="sm"
          />
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setManageFavoritesOpen(true)}
            size="sm"
          >
            <Star size={16} className="text-yellow-500" />
            {t("favorites.manage", "Manage Favorites")}
          </Button>
          
          <ManageFavoritesDialog
            open={manageFavoritesOpen}
            onOpenChange={setManageFavoritesOpen}
            favorites={favorites}
            onAddFavorite={(symbol) => toggleFavorite(symbol)}
            onRemoveFavorite={(symbol) => toggleFavorite(symbol)}
          />
          
          {activeTab === 'market' && (
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder={t("dashboard.timeFilter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="14d">14d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      {activeTab === 'market' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.map((crypto) => {
            const isFavorite = favorites.includes(crypto.symbol.toLowerCase());
            return (
              <CryptoCard 
                key={crypto.id} 
                crypto={crypto} 
                timeFilter={timeFilter}
                active={isFavorite}
                onClick={() => toggleFavorite(crypto.symbol)}
              />
            );
          })}
        </div>
      )}
      
      {activeTab === 'watchlist' && <TokenWatchlist />}
    </div>
  );
};

export default CryptoDashboard;
