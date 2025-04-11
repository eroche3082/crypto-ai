import { useState, useEffect } from "react";
import { useCrypto } from "@/contexts/CryptoContext";
import { Star, StarOff, Plus, X, Check, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TodoFavoritesProps {
  onAddFavorite?: (symbol: string) => void;
  onRemoveFavorite?: (symbol: string) => void;
  favorites?: string[];
}

export default function TodoFavorites({ onAddFavorite, onRemoveFavorite, favorites = [] }: TodoFavoritesProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { cryptoData } = useCrypto();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSelected, setFilterSelected] = useState<"all" | "favorites" | "others">("all");

  // Filter cryptos based on search and filter selection
  const filteredCryptos = cryptoData?.filter(crypto => {
    const matchesSearch = crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isFavorite = favorites.includes(crypto.symbol.toLowerCase());
    
    if (filterSelected === "favorites" && !isFavorite) return false;
    if (filterSelected === "others" && isFavorite) return false;
    
    return matchesSearch;
  }) || [];

  // Handle adding/removing favorites
  const toggleFavorite = async (symbol: string) => {
    const isFavorite = favorites.includes(symbol.toLowerCase());
    
    try {
      if (isFavorite) {
        onRemoveFavorite?.(symbol);
      } else {
        onAddFavorite?.(symbol);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Star size={16} className="text-yellow-500" />
          {t("favorites.manage", "Manage Favorites")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("favorites.todo.title", "Manage Your Favorite Cryptocurrencies")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            <Input
              placeholder={t("favorites.search", "Search cryptocurrencies...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFilterSelected(filterSelected === "all" ? "favorites" : filterSelected === "favorites" ? "others" : "all")}
              title={
                filterSelected === "all" 
                  ? t("favorites.filter.all", "Showing all")
                  : filterSelected === "favorites" 
                    ? t("favorites.filter.favorites", "Showing favorites")
                    : t("favorites.filter.others", "Showing non-favorites")
              }
            >
              <Filter size={16} className={cn(
                filterSelected === "favorites" && "text-yellow-500",
                filterSelected === "others" && "text-muted-foreground"
              )} />
            </Button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" onClick={() => setFilterSelected("all")} className={cn("cursor-pointer", filterSelected === "all" && "bg-accent")}>
              {t("favorites.filter.all.badge", "All")}
            </Badge>
            <Badge variant="outline" onClick={() => setFilterSelected("favorites")} className={cn("cursor-pointer", filterSelected === "favorites" && "bg-accent")}>
              <Star size={12} className="mr-1 text-yellow-500" />
              {t("favorites.filter.favorites.badge", "Favorites")}
            </Badge>
            <Badge variant="outline" onClick={() => setFilterSelected("others")} className={cn("cursor-pointer", filterSelected === "others" && "bg-accent")}>
              <StarOff size={12} className="mr-1" />
              {t("favorites.filter.others.badge", "Others")}
            </Badge>
          </div>

          <ScrollArea className="h-[300px] pr-3">
            <div className="space-y-1">
              {filteredCryptos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery 
                    ? t("favorites.no.results", "No cryptocurrencies match your search")
                    : t("favorites.loading", "Loading cryptocurrencies...")}
                </div>
              ) : (
                filteredCryptos.map((crypto) => {
                  const isFavorite = favorites.includes(crypto.symbol.toLowerCase());
                  return (
                    <div
                      key={crypto.id}
                      className="flex justify-between items-center p-2 hover:bg-accent/40 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <img 
                          src={crypto.image} 
                          alt={crypto.name} 
                          className="w-6 h-6 rounded-full" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://placehold.co/24x24?text=' + crypto.symbol.toUpperCase()[0];
                          }}
                        />
                        <div>
                          <div className="font-medium">{crypto.name}</div>
                          <div className="text-xs text-muted-foreground">{crypto.symbol.toUpperCase()}</div>
                        </div>
                      </div>
                      <Button
                        variant={isFavorite ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFavorite(crypto.symbol)}
                        className={cn(
                          "gap-1",
                          isFavorite && "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-500"
                        )}
                      >
                        {isFavorite ? (
                          <>
                            <Check size={14} /> 
                            {t("favorites.added", "Added")}
                          </>
                        ) : (
                          <>
                            <Plus size={14} /> 
                            {t("favorites.add", "Add")}
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t("common.close", "Close")}
            </Button>
            <div className="text-sm text-muted-foreground">
              {favorites.length} {t("favorites.count", "favorites")}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}