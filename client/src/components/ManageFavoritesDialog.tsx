import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  image?: string;
}

interface ManageFavoritesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  favorites: string[];
  onAddFavorite: (symbol: string) => void;
  onRemoveFavorite: (symbol: string) => void;
}

export default function ManageFavoritesDialog({
  open,
  onOpenChange,
  favorites,
  onAddFavorite,
  onRemoveFavorite,
}: ManageFavoritesDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [availableCryptos, setAvailableCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCryptos();
    }
  }, [open]);

  const fetchCryptos = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("GET", "/api/crypto/coins/markets", undefined);
      const data = await response.json();
      setAvailableCryptos(data);
    } catch (error) {
      console.error("Error fetching cryptos:", error);
      toast({
        title: t("favorites.fetchError", "Error fetching cryptocurrencies"),
        description: t("favorites.tryAgain", "Please try again later"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCryptos = availableCryptos.filter((crypto) => {
    const matchesSearch = 
      searchQuery === "" ||
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "favorites") return favorites.includes(crypto.symbol.toLowerCase()) && matchesSearch;
    if (activeTab === "others") return !favorites.includes(crypto.symbol.toLowerCase()) && matchesSearch;
    
    return matchesSearch;
  });

  const handleAdd = (symbol: string) => {
    onAddFavorite(symbol.toLowerCase());
  };

  const handleRemove = (symbol: string) => {
    onRemoveFavorite(symbol.toLowerCase());
  };

  // Function to get currency symbol or first letter as fallback
  const getCryptoIcon = (crypto: Crypto) => {
    if (crypto.image) {
      return <img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-full" />;
    }
    
    // Color mapping based on symbol
    const colorMap: Record<string, string> = {
      btc: "bg-orange-500",
      eth: "bg-blue-500",
      usdt: "bg-green-500",
      usdc: "bg-blue-400",
      bnb: "bg-yellow-500",
      xrp: "bg-blue-600",
      ada: "bg-blue-700",
      sol: "bg-purple-500",
      doge: "bg-yellow-400",
      dot: "bg-pink-500",
      default: "bg-gray-500",
    };
    
    const bgColor = colorMap[crypto.symbol.toLowerCase()] || colorMap.default;
    
    return (
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-bold`}>
        {crypto.symbol.substring(0, 1).toUpperCase()}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {t("favorites.manageTitle", "Manage Your Favorite Cryptocurrencies")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder={t("favorites.searchPlaceholder", "Search cryptocurrencies...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <span className="absolute right-3 top-2.5 text-gray-400 material-icons">
              search
            </span>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                {t("favorites.all", "All")}
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1">
                <span className="material-icons text-sm mr-1">star</span>
                {t("favorites.favorites", "Favorites")}
              </TabsTrigger>
              <TabsTrigger value="others" className="flex-1">
                <span className="material-icons text-sm mr-1">more_horiz</span>
                {t("favorites.others", "Others")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="overflow-y-auto max-h-[300px] pr-2 space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredCryptos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {searchQuery 
                  ? t("favorites.noMatchingCryptos", "No matching cryptocurrencies found")
                  : t("favorites.noCryptos", "No cryptocurrencies available")}
              </div>
            ) : (
              filteredCryptos.map((crypto) => {
                const isFavorite = favorites.includes(crypto.symbol.toLowerCase());
                return (
                  <div 
                    key={crypto.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      {getCryptoIcon(crypto)}
                      <div>
                        <div className="font-medium">{crypto.name}</div>
                        <div className="text-sm text-gray-400 uppercase">{crypto.symbol}</div>
                      </div>
                    </div>
                    
                    <Button
                      variant={isFavorite ? "outline" : "default"}
                      onClick={() => isFavorite ? handleRemove(crypto.symbol) : handleAdd(crypto.symbol)}
                      className={isFavorite ? "border-primary text-primary hover:bg-primary/10" : ""}
                    >
                      {isFavorite ? (
                        t("favorites.remove", "Remove")
                      ) : (
                        <>
                          <span className="mr-1">+</span>
                          {t("favorites.add", "Add")}
                        </>
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              {favorites.length} {t("favorites.favoritesCount", "favorites")}
            </div>
            <DialogClose asChild>
              <Button variant="outline">
                {t("common.close", "Close")}
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}