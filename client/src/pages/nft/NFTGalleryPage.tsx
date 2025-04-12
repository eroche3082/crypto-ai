import { useState } from 'react';
import { NFTGallery } from '@/components/nft/NFTGallery';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WalletIcon, ArrowLeftIcon } from 'lucide-react';

export default function NFTGalleryPage() {
  const [location, setLocation] = useState<string | null>(null);
  const [_, navigate] = useLocation();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [inputWallet, setInputWallet] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWalletAddress(inputWallet);
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
        <h1 className="text-3xl font-bold">NFT Gallery</h1>
      </div>
      
      {!walletAddress ? (
        <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-center">Connect to view your NFTs</h2>
          
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
                Enter an Ethereum wallet address to view its NFTs
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={!inputWallet.trim()}
            >
              View NFT Collection
            </Button>
          </form>
        </div>
      ) : (
        <NFTGallery defaultWallet={walletAddress} />
      )}
    </div>
  );
}