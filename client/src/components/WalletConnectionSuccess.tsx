import { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import confetti from 'canvas-confetti';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, Wallet, ArrowRight } from "lucide-react";

interface WalletConnectionSuccessProps {
  walletAddress?: string;
  walletType?: string;
  onContinue?: () => void;
  onClose?: () => void;
}

const WalletConnectionSuccess: React.FC<WalletConnectionSuccessProps> = ({
  walletAddress = '0x7a28...1f53',
  walletType = 'MetaMask',
  onContinue,
  onClose
}) => {
  const { t } = useTranslation();
  const [showConfetti, setShowConfetti] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Set dimensions for react-confetti
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Initial animation effect with canvas-confetti
  useEffect(() => {
    // Create a festive burst
    const launchConfetti = () => {
      // First, a colorful burst from the middle
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Then, two side bursts after a small delay (like fireworks)
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    };
    
    launchConfetti();
    
    // Automatically hide the confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle continue button click
  const handleContinue = () => {
    // Launch one more burst of confetti when continuing
    confetti({
      particleCount: 50,
      spread: 90,
      origin: { y: 0.5 }
    });
    
    if (onContinue) {
      onContinue();
    }
  };
  
  return (
    <div className="relative">
      {/* React Confetti in the background for continuous rain effect */}
      {showConfetti && (
        <ReactConfetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={true}
          numberOfPieces={200}
          gravity={0.2}
          colors={['#FFD700', '#32CD32', '#1E90FF', '#FF6347', '#9370DB']}
        />
      )}
      
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {t("wallet.connectionSuccess", "Wallet Connected!")}
          </CardTitle>
          <CardDescription>
            {t("wallet.connectionSuccessDesc", "Your wallet has been successfully connected to CryptoBot.")}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                {t("wallet.walletType", "Wallet Type")}
              </span>
              <Badge variant="outline" className="font-medium">
                {walletType}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t("wallet.address", "Address")}
              </span>
              <span className="font-mono text-sm">
                {walletAddress}
              </span>
            </div>
          </div>
          
          <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
            <div className="flex items-start">
              <Wallet className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">
                  {t("wallet.whatsNext", "What's next?")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("wallet.whatsNextDesc", "You can now explore your portfolio, set up price alerts, and start trading directly from the app.")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={handleContinue}
          >
            {t("wallet.continue", "Continue to Dashboard")}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={onClose}
          >
            {t("common.close", "Close")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WalletConnectionSuccess;