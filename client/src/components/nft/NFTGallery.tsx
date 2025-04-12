import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Search, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type NFT = {
  identifier: string;
  collection: string;
  contract: string;
  token_standard: string;
  name: string;
  description: string;
  image_url: string;
  metadata: {
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
};

type NFTGalleryProps = {
  defaultWallet?: string;
};

export function NFTGallery({ defaultWallet }: NFTGalleryProps) {
  const [walletAddress, setWalletAddress] = useState<string>(defaultWallet || '');
  const [inputWallet, setInputWallet] = useState<string>(defaultWallet || '');
  const [selectedTab, setSelectedTab] = useState<string>('opensea');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  
  // Fetch NFTs from OpenSea API
  const openseaQuery = useQuery({
    queryKey: ['/api/nft/wallet', walletAddress, selectedTab],
    queryFn: async () => {
      if (!walletAddress) return { nfts: [] };
      
      const response = await fetch(`/api/nft/wallet/${walletAddress}`);
      if (!response.ok) throw new Error('Failed to fetch NFTs');
      
      const data = await response.json();
      return data.data;
    },
    enabled: !!walletAddress && selectedTab === 'opensea',
  });
  
  // Fetch NFTs from Moralis API
  const moralisQuery = useQuery({
    queryKey: ['/api/nft/moralis/wallet', walletAddress, selectedTab],
    queryFn: async () => {
      if (!walletAddress) return { nfts: [] };
      
      const response = await fetch(`/api/nft/moralis/wallet/${walletAddress}`);
      if (!response.ok) throw new Error('Failed to fetch NFTs');
      
      const data = await response.json();
      return data.data;
    },
    enabled: !!walletAddress && selectedTab === 'moralis',
  });
  
  // Get the current query based on the selected tab
  const currentQuery = selectedTab === 'opensea' ? openseaQuery : moralisQuery;
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWalletAddress(inputWallet);
    
    // If there was a previously selected NFT, reset it
    setSelectedNFT(null);
  };
  
  // Handle clicking on an NFT card
  const handleNFTClick = (nft: NFT) => {
    setSelectedNFT(nft);
  };
  
  // Load NFTs when the component mounts if defaultWallet is provided
  useEffect(() => {
    if (defaultWallet) {
      setWalletAddress(defaultWallet);
      setInputWallet(defaultWallet);
    }
  }, [defaultWallet]);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">NFT Gallery</h1>
      
      {/* Wallet Input Form */}
      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <Input
          type="text"
          placeholder="Enter wallet address (0x...)"
          value={inputWallet}
          onChange={(e) => setInputWallet(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={!inputWallet.trim() || currentQuery.isFetching}>
          <Search className="mr-2 h-4 w-4" /> View NFTs
        </Button>
      </form>
      
      {/* API Selection Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="opensea">OpenSea</TabsTrigger>
          <TabsTrigger value="moralis">Moralis</TabsTrigger>
        </TabsList>
        
        {/* Tab Content */}
        <TabsContent value="opensea" className="space-y-4">
          {renderNFTContent(openseaQuery, handleNFTClick, selectedNFT, walletAddress)}
        </TabsContent>
        
        <TabsContent value="moralis" className="space-y-4">
          {renderNFTContent(moralisQuery, handleNFTClick, selectedNFT, walletAddress)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to render the NFT content based on query state
function renderNFTContent(
  query: any,
  handleNFTClick: (nft: NFT) => void,
  selectedNFT: NFT | null,
  walletAddress: string
) {
  // If there's an error with the query
  if (query.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load NFTs. Please check the wallet address and try again.
        </AlertDescription>
      </Alert>
    );
  }
  
  // If the query is loading
  if (query.isLoading || query.isFetching) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
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
        <p className="text-lg text-gray-500">Enter a wallet address to view NFTs</p>
      </div>
    );
  }
  
  // If the query completed but there are no NFTs
  const nfts = query.data?.nfts || [];
  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">No NFTs found for this wallet</p>
      </div>
    );
  }
  
  // If there are NFTs and one is selected, show detailed view
  if (selectedNFT) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Button variant="outline" className="mb-4" onClick={() => handleNFTClick(null)}>
            ← Back to Gallery
          </Button>
          <div className="rounded-lg overflow-hidden mb-4">
            <img 
              src={selectedNFT.image_url} 
              alt={selectedNFT.name} 
              className="w-full h-auto object-cover" 
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400?text=No+Image';
              }}
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-2">{selectedNFT.name}</h2>
          <p className="text-sm text-gray-500 mb-4">Collection: {selectedNFT.collection}</p>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{selectedNFT.description || 'No description available'}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Details</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-gray-500">Token ID</div>
              <div className="text-sm font-medium">{selectedNFT.identifier}</div>
              
              <div className="text-sm text-gray-500">Standard</div>
              <div className="text-sm font-medium">{selectedNFT.token_standard}</div>
              
              <div className="text-sm text-gray-500">Contract</div>
              <div className="text-sm font-medium truncate">{selectedNFT.contract}</div>
            </div>
          </div>
          
          {selectedNFT.metadata?.attributes && selectedNFT.metadata.attributes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Attributes</h3>
              <div className="grid grid-cols-2 gap-2">
                {selectedNFT.metadata.attributes.map((attr, index) => (
                  <div key={index} className="bg-gray-100 rounded p-2">
                    <div className="text-xs text-gray-500">{attr.trait_type}</div>
                    <div className="text-sm font-medium">{attr.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="mt-6 flex items-center"
            onClick={() => window.open(`https://etherscan.io/token/${selectedNFT.contract}`, '_blank')}
          >
            View on Etherscan <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  // Otherwise, render the NFT grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {nfts.map((nft: NFT, index: number) => (
        <Card 
          key={`${nft.contract}-${nft.identifier}-${index}`} 
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleNFTClick(nft)}
        >
          <div className="h-48 overflow-hidden">
            <img 
              src={nft.image_url} 
              alt={nft.name} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400?text=No+Image';
              }}
            />
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1 truncate">{nft.name}</h3>
            <p className="text-sm text-gray-500 truncate">{nft.collection}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}