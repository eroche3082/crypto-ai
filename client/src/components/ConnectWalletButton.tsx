import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import WalletConnectionSuccess from './WalletConnectionSuccess';

interface ConnectWalletButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  variant = "default",
  size = "default",
  className = ""
}) => {
  const { t } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  
  // Available wallet providers
  const walletProviders = [
    { id: "metamask", name: "MetaMask" },
    { id: "coinbase", name: "Coinbase Wallet" },
    { id: "walletconnect", name: "WalletConnect" },
    { id: "phantom", name: "Phantom (Solana)" },
    { id: "trustwallet", name: "Trust Wallet" },
  ];
  
  // Generate a random wallet address for demo purposes
  const generateWalletAddress = (type: string) => {
    const prefix = type === "phantom" ? "So1an" : "0x";
    let result = prefix;
    const characters = '0123456789abcdef';
    const firstPartLength = type === "phantom" ? 20 : 4; 
    const secondPartLength = type === "phantom" ? 20 : 4;
    
    // First part
    for (let i = 0; i < firstPartLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    result += '...';
    
    // Second part
    for (let i = 0; i < secondPartLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  };
  
  // Handle wallet selection
  const handleWalletSelect = (value: string) => {
    setSelectedWallet(value);
  };
  
  // Handle connect button click
  const handleConnect = () => {
    if (!selectedWallet) return;
    
    // Simulate connection process
    setIsConnecting(true);
    
    setTimeout(() => {
      setIsConnecting(false);
      setConnectionSuccess(true);
      
      // Generate a random wallet address
      const walletProvider = walletProviders.find(w => w.id === selectedWallet);
      setWalletAddress(generateWalletAddress(selectedWallet));
    }, 1500);
  };
  
  // Reset everything when closing the dialog
  const handleCloseDialog = () => {
    setShowDialog(false);
    
    // Reset states with a slight delay to avoid visual jumps
    setTimeout(() => {
      setSelectedWallet("");
      setIsConnecting(false);
      setConnectionSuccess(false);
      setWalletAddress("");
    }, 300);
  };
  
  // Handle continuing after successful connection
  const handleContinue = () => {
    handleCloseDialog();
    // Additional functionality could be added here
  };
  
  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        onClick={() => setShowDialog(true)}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {t("wallet.connect", "Connect Wallet")}
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        {connectionSuccess ? (
          <DialogContent className="sm:max-w-md">
            <WalletConnectionSuccess 
              walletType={walletProviders.find(w => w.id === selectedWallet)?.name}
              walletAddress={walletAddress}
              onContinue={handleContinue}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        ) : (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("wallet.connectWallet", "Connect Wallet")}</DialogTitle>
              <DialogDescription>
                {t("wallet.connectWalletDesc", "Connect your wallet to access all features of CryptoBot")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium leading-none">
                  {t("wallet.selectWallet", "Select your preferred wallet")}
                </p>
                <Select value={selectedWallet} onValueChange={handleWalletSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("wallet.selectWalletPlaceholder", "Select a wallet provider")} />
                  </SelectTrigger>
                  <SelectContent>
                    {walletProviders.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {t("wallet.disclaimer", "By connecting your wallet, you agree to the Terms of Service and Privacy Policy.")}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="ghost" onClick={handleCloseDialog}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button 
                onClick={handleConnect} 
                disabled={!selectedWallet || isConnecting}
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                    {t("wallet.connecting", "Connecting...")}
                  </>
                ) : (
                  t("wallet.connect", "Connect")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default ConnectWalletButton;