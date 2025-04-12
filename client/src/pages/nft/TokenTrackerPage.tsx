import { useState } from 'react';
import { TokenTracker } from '@/components/nft/TokenTracker';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WalletIcon, ArrowLeftIcon, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TokenTrackerPage() {
  const [_, navigate] = useLocation();
  const [mode, setMode] = useState<'form' | 'tracker'>('form');
  const [activeTab, setActiveTab] = useState<string>('wallet');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [inputWallet, setInputWallet] = useState<string>('');
  const isAuthenticated = false; // This would typically come from your auth context
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWalletAddress(inputWallet);
    setMode('tracker');
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Token Tracker</h1>
      </div>
      
      {mode === 'form' ? (
        <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50">
                      <WalletIcon className="h-4 w-4 text-gray-400" />
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
                  <p className="text-xs text-gray-500">
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
                <p className="text-sm text-gray-500 mb-6">
                  Keep track of your favorite tokens and cryptocurrencies
                </p>
                
                <Button 
                  onClick={() => {
                    if (isAuthenticated) {
                      setWalletAddress('');
                      setMode('tracker');
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
    </div>
  );
}