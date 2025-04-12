import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WalletIcon, ArrowLeftIcon, Star, Image } from 'lucide-react';
import { TokenTracker } from '@/components/nft/TokenTracker';
import { NFTGallery } from '@/components/nft/NFTGallery';
import Header from "@/components/Header";
import { useTranslation } from "react-i18next";

/**
 * Unified Digital Assets Page
 * 
 * Combines:
 * - NFT Gallery
 * - Token Tracker
 */
export default function UnifiedDigitalAssets() {
  const { t } = useTranslation();
  const [_, navigate] = useLocation();
  const [activeMainTab, setActiveMainTab] = useState<string>('nft');
  const [tokenTrackerMode, setTokenTrackerMode] = useState<'form' | 'tracker'>('form');
  const [tokenActiveTab, setTokenActiveTab] = useState<string>('wallet');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [inputWallet, setInputWallet] = useState<string>('');
  const isAuthenticated = false; // This would typically come from your auth context
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWalletAddress(inputWallet);
    setTokenTrackerMode('tracker');
  };
  
  return (
    <>
      <Header />
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Image className="h-6 w-6 text-primary" />
            {t("digitalAssets.title", "Digital Assets")}
          </h1>
          <p className="text-muted-foreground max-w-[600px]">
            {t("digitalAssets.description", "Explore, track, and analyze NFTs and digital tokens across multiple blockchains.")}
          </p>
        </div>
        
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-4">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="nft" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              {t("digitalAssets.nftGallery", "NFT Gallery")}
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <WalletIcon className="h-4 w-4" />
              {t("digitalAssets.tokenTracker", "Token Tracker")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="nft" className="space-y-4">
            <NFTGallery />
          </TabsContent>
          
          <TabsContent value="tokens" className="space-y-4">
            {tokenTrackerMode === 'form' ? (
              <div className="max-w-md mx-auto my-6 p-6 bg-card rounded-lg shadow-sm">
                <Tabs defaultValue={tokenActiveTab} onValueChange={setTokenActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="wallet">Wallet Tokens</TabsTrigger>
                    <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="wallet">
                    <h2 className="text-xl font-semibold mb-4 text-center">View Wallet Tokens</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="wallet" className="block text-sm font-medium">
                          Wallet Address
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted">
                            <WalletIcon className="h-4 w-4 text-muted-foreground" />
                          </span>
                          <Input
                            id="wallet"
                            type="text"
                            placeholder="Enter Ethereum address (0x...)"
                            className="rounded-l-none"
                            value={inputWallet}
                            onChange={(e) => setInputWallet(e.target.value)}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter an Ethereum wallet address to view its tokens
                        </p>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={!inputWallet.trim()}
                      >
                        View Wallet Tokens
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="watchlist">
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                      <h2 className="text-xl font-semibold mb-2">Token Watchlist</h2>
                      <p className="text-sm text-muted-foreground mb-6">
                        Keep track of your favorite tokens and cryptocurrencies
                      </p>
                      
                      <Button 
                        onClick={() => {
                          if (isAuthenticated) {
                            setWalletAddress('');
                            setTokenTrackerMode('tracker');
                          } else {
                            navigate('/login?redirect=/tokens/watchlist');
                          }
                        }}
                      >
                        {isAuthenticated ? 'View Watchlist' : 'Login to View Watchlist'}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <TokenTracker 
                defaultWallet={walletAddress} 
                isAuthenticated={isAuthenticated} 
              />
            )}
            
            {tokenTrackerMode === 'tracker' && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setTokenTrackerMode('form')}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Form
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}