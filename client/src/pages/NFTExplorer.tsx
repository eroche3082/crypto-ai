import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Grid3X3, Layers, ListFilter, CheckCircle2, ImageIcon, Wallet, Tag, RefreshCw, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

// Mock NFT data (in a real implementation, this would come from an API)
const mockCollections = [
  {
    id: "bored-ape-yacht-club",
    name: "Bored Ape Yacht Club",
    description: "The Bored Ape Yacht Club is a collection of 10,000 unique Bored Ape NFTs.",
    image: "https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?auto=format&dpr=1&w=1000",
    floorPrice: 18.5,
    currency: "ETH",
    items: 10000,
    owners: 6342,
    volume: 825432,
    volumeChange: 12.3,
    verified: true,
    blockchain: "ethereum"
  },
  {
    id: "cryptopunks",
    name: "CryptoPunks",
    description: "CryptoPunks launched as a fixed set of 10,000 items in mid-2017 and became one of the inspirations for the ERC-721 standard.",
    image: "https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=1000",
    floorPrice: 62.75,
    currency: "ETH",
    items: 10000,
    owners: 3715,
    volume: 1254321,
    volumeChange: -5.2,
    verified: true,
    blockchain: "ethereum"
  },
  {
    id: "azuki",
    name: "Azuki",
    description: "Azuki starts with a collection of 10,000 avatars that give you membership access to The Garden.",
    image: "https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT?auto=format&dpr=1&w=1000",
    floorPrice: 6.85,
    currency: "ETH",
    items: 10000,
    owners: 5284,
    volume: 532000,
    volumeChange: 8.7,
    verified: true,
    blockchain: "ethereum"
  },
  {
    id: "doodles",
    name: "Doodles",
    description: "A community-driven collectibles project featuring art by Burnt Toast.",
    image: "https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ?auto=format&dpr=1&w=1000",
    floorPrice: 2.45,
    currency: "ETH",
    items: 10000,
    owners: 4923,
    volume: 235000,
    volumeChange: -3.1,
    verified: true,
    blockchain: "ethereum"
  },
  {
    id: "cool-cats",
    name: "Cool Cats",
    description: "Cool Cats are a collection of 9,999 randomly generated and stylistically curated NFTs.",
    image: "https://i.seadn.io/gae/LIov33kogXOK4XZd2ESj29sqm_Hww5JSdO7AFn5wjt8xgnJJ0UpNV9yITqxra3s_LMEW1AnnrgOVB_hDpjJRA1uF4skI5Sdi_9rULi8?auto=format&dpr=1&w=1000",
    floorPrice: 1.9,
    currency: "ETH",
    items: 9999,
    owners: 3895,
    volume: 175000,
    volumeChange: 5.4,
    verified: true, 
    blockchain: "ethereum"
  },
  {
    id: "world-of-women",
    name: "World of Women",
    description: "World of Women is a collection of 10,000 unique NFTs that give you access to a diverse and inclusive space.",
    image: "https://i.seadn.io/gae/EFAQpIktMraCo9bvLHvzfRilMyqsU2k1IQY76AGBCMXL91nNvgMrNgYerJ_shfQGLN8JrwwMg01T1ne4ApqdnMSAJ_8d2juf_jSYtw?auto=format&dpr=1&w=1000",
    floorPrice: 0.65,
    currency: "ETH",
    items: 10000,
    owners: 6789,
    volume: 98000,
    volumeChange: 15.2,
    verified: true,
    blockchain: "ethereum"
  },
  {
    id: "pudgy-penguins",
    name: "Pudgy Penguins",
    description: "Pudgy Penguins is a collection of 8,888 penguins on the Ethereum blockchain.",
    image: "https://i.seadn.io/gae/yNi-XdGxsgQCPpqSio4o31ygAV6wURdIdInWRcFIl46UjUQ1eV7BEndGe8L661OoG-clRi7EgInLX4LPu9Jfw4fq0bnVYHqg7RFLYg?auto=format&dpr=1&w=1000",
    floorPrice: 3.25,
    currency: "ETH",
    items: 8888,
    owners: 4532,
    volume: 245000,
    volumeChange: 24.8,
    verified: true,
    blockchain: "ethereum"
  },
  {
    id: "degods",
    name: "DeGods",
    description: "A collection of 10,000 NFTs disrupting the status quo of what an NFT project can be.",
    image: "https://i.seadn.io/gcs/files/c6cb0b1d6f2ab61c0efad9384c4f050d.png?auto=format&dpr=1&w=1000",
    floorPrice: 37.8,
    currency: "SOL",
    items: 10000,
    owners: 5432,
    volume: 1850000,
    volumeChange: 32.5,
    verified: true,
    blockchain: "solana"
  }
];

// Mock NFT items for a collection
const generateMockNFTs = (collectionId: string, count: number = 12) => {
  const collection = mockCollections.find(c => c.id === collectionId);
  if (!collection) return [];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `${collectionId}-${i+1}`,
    name: `${collection.name} #${Math.floor(Math.random() * 9999) + 1}`,
    image: collection.image,
    collectionName: collection.name,
    collectionId: collection.id,
    price: collection.floorPrice * (Math.random() * 3 + 0.8), // Random price around floor price
    currency: collection.currency,
    rank: Math.floor(Math.random() * 9999) + 1,
    rarity: Math.random(),
    lastSale: collection.floorPrice * (Math.random() * 2 + 0.5),
    traits: [
      { type: "Background", value: ["Blue", "Red", "Green", "Yellow", "Purple"][Math.floor(Math.random() * 5)] },
      { type: "Clothes", value: ["Suit", "Hoodie", "Shirt", "Tank Top", "Sweater"][Math.floor(Math.random() * 5)] },
      { type: "Eyes", value: ["Regular", "Laser", "Sleepy", "Angry", "Cute"][Math.floor(Math.random() * 5)] },
      { type: "Mouth", value: ["Smile", "Frown", "Open", "Cigar", "Grin"][Math.floor(Math.random() * 5)] }
    ],
    blockchain: collection.blockchain
  }));
};

interface CollectionCardProps {
  collection: any;
  onClick: () => void;
}

const CollectionCard = ({ collection, onClick }: CollectionCardProps) => {
  const { t } = useTranslation();
  
  return (
    <Card className="overflow-hidden h-full transition-all hover:shadow-md cursor-pointer" onClick={onClick}>
      <div className="aspect-square overflow-hidden">
        <img 
          src={collection.image} 
          alt={collection.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{collection.name}</CardTitle>
          {collection.verified && (
            <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
          )}
        </div>
        <CardDescription className="line-clamp-2">{collection.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-muted-foreground">{t("nftExplorer.floorPrice", "Floor Price")}</div>
            <div className="font-medium">{collection.floorPrice} {collection.currency}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("nftExplorer.items", "Items")}</div>
            <div className="font-medium">{formatNumber(collection.items)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("nftExplorer.owners", "Owners")}</div>
            <div className="font-medium">{formatNumber(collection.owners)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("nftExplorer.volume", "Volume")}</div>
            <div className="flex items-center">
              <span className="font-medium mr-1">{formatNumber(collection.volume)}</span>
              <Badge 
                variant={collection.volumeChange > 0 ? "success" : "destructive"}
                className="text-xs py-0 h-4"
              >
                {collection.volumeChange > 0 ? '+' : ''}{collection.volumeChange.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2">
        <Badge 
          variant="outline" 
          className="w-full justify-center"
        >
          {collection.blockchain}
        </Badge>
      </CardFooter>
    </Card>
  );
};

interface NFTCardProps {
  nft: any;
  onClick: () => void;
}

const NFTCard = ({ nft, onClick }: NFTCardProps) => {
  const { t } = useTranslation();
  
  return (
    <Card className="overflow-hidden h-full transition-all hover:shadow-md cursor-pointer" onClick={onClick}>
      <div className="aspect-square overflow-hidden">
        <img 
          src={nft.image} 
          alt={nft.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">{nft.name}</CardTitle>
        <CardDescription>{nft.collectionName}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 pb-2">
        <div className="flex justify-between items-center py-1">
          <div className="text-xs text-muted-foreground">{t("nftExplorer.price", "Price")}</div>
          <div className="font-medium">{nft.price.toFixed(2)} {nft.currency}</div>
        </div>
        <div className="flex justify-between items-center py-1">
          <div className="text-xs text-muted-foreground">{t("nftExplorer.lastSale", "Last Sale")}</div>
          <div className="font-medium">{nft.lastSale.toFixed(2)} {nft.currency}</div>
        </div>
        <div className="flex justify-between items-center py-1">
          <div className="text-xs text-muted-foreground">{t("nftExplorer.rank", "Rank")}</div>
          <div className="font-medium">#{nft.rank}</div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 gap-2">
        <Badge 
          variant="outline" 
          className="justify-center flex-1"
        >
          {nft.blockchain}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const NFTExplorer = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("collections");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [blockchain, setBlockchain] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  
  // Simulated data loading with React Query
  const { data: collections, isLoading: isLoadingCollections } = useQuery({
    queryKey: ['nft-collections'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      return mockCollections;
    }
  });
  
  const { data: nfts, isLoading: isLoadingNFTs } = useQuery({
    queryKey: ['nft-items', selectedCollection],
    queryFn: async () => {
      if (!selectedCollection) return [];
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      return generateMockNFTs(selectedCollection, 20);
    },
    enabled: !!selectedCollection
  });

  // Filter collections based on search and filters
  const filteredCollections = collections ? collections
    .filter(collection => {
      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return collection.name.toLowerCase().includes(term) || 
               collection.description.toLowerCase().includes(term);
      }
      
      // Apply blockchain filter
      if (blockchain !== 'all' && collection.blockchain !== blockchain) {
        return false;
      }
      
      // Apply verified filter
      if (verifiedOnly && !collection.verified) {
        return false;
      }
      
      return true;
    }) : [];
  
  // Filter NFTs based on search and filters
  const filteredNFTs = nfts ? nfts
    .filter(nft => {
      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return nft.name.toLowerCase().includes(term) || 
               nft.collectionName.toLowerCase().includes(term);
      }
      
      // Apply price range filter
      if (nft.price < priceRange[0] || nft.price > priceRange[1]) {
        return false;
      }
      
      // Apply blockchain filter
      if (blockchain !== 'all' && nft.blockchain !== blockchain) {
        return false;
      }
      
      return true;
    }) : [];
  
  // Handle collection selection
  const handleCollectionClick = (collectionId: string) => {
    setSelectedCollection(collectionId);
    setActiveTab("items");
    
    toast({
      title: t("nftExplorer.collectionSelected", "Collection selected"),
      description: t("nftExplorer.viewingItems", "Viewing NFT items in this collection")
    });
  };
  
  // Handle NFT item click
  const handleNFTClick = (nftId: string) => {
    toast({
      title: t("nftExplorer.nftSelected", "NFT selected"),
      description: t("nftExplorer.viewingDetails", "Viewing details for this NFT")
    });
    
    // In a real app, this would navigate to a detail page
    // window.location.href = `/nft/${nftId}`;
  };
  
  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle returning to collections view
  const handleBackToCollections = () => {
    setSelectedCollection(null);
    setActiveTab("collections");
  };
  
  // Handle refreshing the data
  const handleRefresh = () => {
    // In a real app, this would invalidate the React Query cache
    // queryClient.invalidateQueries('nft-collections');
    
    toast({
      title: t("nftExplorer.refreshing", "Refreshing data"),
      description: t("nftExplorer.latestData", "Getting the latest NFT data")
    });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t("nftExplorer.title", "NFT Explorer")}</h1>
          <p className="text-muted-foreground">{t("nftExplorer.subtitle", "Discover, collect, and trade unique digital assets")}</p>
        </div>
        
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("common.refresh", "Refresh")}
          </Button>
          
          {selectedCollection && (
            <Button variant="outline" size="sm" onClick={handleBackToCollections}>
              {t("nftExplorer.backToCollections", "Back to Collections")}
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>{t("nftExplorer.marketOverview", "NFT Market Overview")}</CardTitle>
            <CardDescription>
              {t("nftExplorer.marketDesc", "Key NFT market indicators and stats")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">{t("nftExplorer.totalVolume", "Total Volume (24h)")}</div>
                <div className="text-lg font-bold">$283.5M</div>
                <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                  +8.3% (24h)
                </div>
              </div>
              
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">{t("nftExplorer.salesCount", "Sales (24h)")}</div>
                <div className="text-lg font-bold">48,721</div>
                <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  -3.7% (24h)
                </div>
              </div>
              
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">{t("nftExplorer.activeTraders", "Active Traders")}</div>
                <div className="text-lg font-bold">182,653</div>
                <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                  +12.5% (24h)
                </div>
              </div>
              
              <div className="bg-card/50 rounded-lg p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">{t("nftExplorer.avgSalePrice", "Avg. Sale Price")}</div>
                <div className="text-lg font-bold">$5,817</div>
                <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                  +15.3% (24h)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("nftExplorer.yourPortfolio", "Your NFT Portfolio")}</CardTitle>
            <CardDescription>
              {t("nftExplorer.portfolioDesc", "Track your digital assets collection")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {t("nftExplorer.connectWallet", "Connect your wallet to view and manage your NFTs")}
              </p>
              <Button>
                {t("nftExplorer.connectWalletCta", "Connect Wallet")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("nftExplorer.searchPlaceholder", "Search collections, NFTs...")}
                    className="pl-8"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center">
                  <Label htmlFor="blockchain" className="mr-2 text-sm whitespace-nowrap">
                    {t("nftExplorer.blockchain", "Blockchain")}:
                  </Label>
                  <Select 
                    value={blockchain} 
                    onValueChange={setBlockchain}
                  >
                    <SelectTrigger id="blockchain" className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("common.all", "All")}</SelectItem>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="solana">Solana</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="avalanche">Avalanche</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="verified-only" className="text-sm whitespace-nowrap cursor-pointer">
                    {t("nftExplorer.verifiedOnly", "Verified Only")}
                  </Label>
                  <Switch 
                    id="verified-only" 
                    checked={verifiedOnly} 
                    onCheckedChange={setVerifiedOnly} 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4 py-2 border-b border-border">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger 
                  value="collections" 
                  disabled={!!selectedCollection}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  {t("nftExplorer.collections", "Collections")}
                </TabsTrigger>
                <TabsTrigger 
                  value="items"
                  disabled={!selectedCollection}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  {t("nftExplorer.items", "Items")}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="collections" className="p-4 m-0">
              {isLoadingCollections ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-[200px] w-full" />
                      <CardHeader className="p-4 pb-2">
                        <Skeleton className="h-6 w-[120px] mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[80%] mt-1" />
                      </CardHeader>
                      <CardContent className="p-4 pt-0 pb-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {filteredCollections.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredCollections.map(collection => (
                        <CollectionCard 
                          key={collection.id} 
                          collection={collection} 
                          onClick={() => handleCollectionClick(collection.id)} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? t("nftExplorer.noCollectionsFound", "No collections found matching '{{searchTerm}}'", { searchTerm })
                          : t("nftExplorer.noCollections", "No collections available")}
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="items" className="p-4 m-0">
              {isLoadingNFTs ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(12)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-[200px] w-full" />
                      <CardHeader className="p-4 pb-2">
                        <Skeleton className="h-6 w-[120px] mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardHeader>
                      <CardContent className="p-4 pt-0 pb-2">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {filteredNFTs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredNFTs.map(nft => (
                        <NFTCard 
                          key={nft.id} 
                          nft={nft} 
                          onClick={() => handleNFTClick(nft.id)} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? t("nftExplorer.noNFTsFound", "No NFTs found matching '{{searchTerm}}'", { searchTerm })
                          : t("nftExplorer.noNFTs", "No NFTs available in this collection")}
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("nftExplorer.trending", "Trending Categories")}</CardTitle>
          <CardDescription>
            {t("nftExplorer.trendingDesc", "Popular NFT categories in the market right now")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center py-6 hover:bg-primary/5">
              <ImageIcon className="h-10 w-10 mb-2 text-primary" />
              <div className="font-medium">{t("nftExplorer.art", "Art")}</div>
              <div className="text-xs text-muted-foreground mt-1">10,483 collections</div>
            </Button>
            
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center py-6 hover:bg-primary/5">
              <Tag className="h-10 w-10 mb-2 text-primary" />
              <div className="font-medium">{t("nftExplorer.collectibles", "Collectibles")}</div>
              <div className="text-xs text-muted-foreground mt-1">8,295 collections</div>
            </Button>
            
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center py-6 hover:bg-primary/5">
              <Layers className="h-10 w-10 mb-2 text-primary" />
              <div className="font-medium">{t("nftExplorer.virtual", "Virtual Worlds")}</div>
              <div className="text-xs text-muted-foreground mt-1">2,148 collections</div>
            </Button>
            
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center py-6 hover:bg-primary/5">
              <Wallet className="h-10 w-10 mb-2 text-primary" />
              <div className="font-medium">{t("nftExplorer.utility", "Utility")}</div>
              <div className="text-xs text-muted-foreground mt-1">5,721 collections</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTExplorer;