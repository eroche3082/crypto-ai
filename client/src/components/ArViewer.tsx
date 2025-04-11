import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, RotateCw, ZoomIn, ZoomOut, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ArViewerProps {
  cryptoSymbol: string;
  onCancel: () => void;
}

const ArViewer: React.FC<ArViewerProps> = ({ cryptoSymbol, onCancel }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Cryptocurrency data mapping
  const cryptoData: Record<string, { name: string, color: string, model?: string }> = {
    'BTC': { name: 'Bitcoin', color: '#F7931A', model: 'bitcoin' },
    'ETH': { name: 'Ethereum', color: '#627EEA', model: 'ethereum' },
    'XRP': { name: 'Ripple', color: '#0085C0', model: 'ripple' },
    'USDT': { name: 'Tether', color: '#26A17B', model: 'tether' },
    'SOL': { name: 'Solana', color: '#14F195', model: 'solana' },
    'ADA': { name: 'Cardano', color: '#0033AD', model: 'cardano' },
    'DOGE': { name: 'Dogecoin', color: '#C3A634', model: 'dogecoin' },
  };

  // Simulate loading the AR content
  useEffect(() => {
    // In a real implementation, we would load WebXR or Model-Viewer components
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Show toast notification
      toast({
        title: "AR Prototype Only",
        description: "This is a simulated AR view. In a production app, this would use WebXR.",
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [toast]);

  // Handle zoom in
  const handleZoomIn = () => {
    if (scale < 2) {
      setScale(prev => prev + 0.1);
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (scale > 0.5) {
      setScale(prev => prev - 0.1);
    }
  };

  // Get crypto details
  const getCryptoDetails = () => {
    return cryptoData[cryptoSymbol] || { name: cryptoSymbol, color: '#888888' };
  };
  
  const crypto = getCryptoDetails();

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div 
            className="w-6 h-6 rounded-full mr-2" 
            style={{ backgroundColor: crypto.color }}
          />
          <h2 className="text-lg font-semibold">{crypto.name} AR View</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div 
        className="flex-1 flex flex-col items-center justify-center bg-black/10 rounded-lg overflow-hidden relative"
        ref={containerRef}
      >
        {error ? (
          <div className="text-center p-6 bg-background rounded-lg">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => setError(null)}>
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">Loading AR experience...</p>
          </div>
        ) : (
          <>
            <div 
              className="flex items-center justify-center w-full h-full transition-transform duration-300"
              style={{ 
                transform: `scale(${scale})`,
              }}
            >
              {/* 3D model would be rendered here using WebXR or Model-Viewer */}
              <div className="relative w-64 h-64 animate-float">
                {/* Simulated 3D model */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    backgroundColor: crypto.color,
                    boxShadow: `0 0 60px ${crypto.color}80`,
                    animation: 'pulse 3s infinite ease-in-out'
                  }}
                />
                <div 
                  className="absolute inset-[15%] rounded-full bg-background flex items-center justify-center text-4xl font-bold"
                  style={{ color: crypto.color }}
                >
                  {cryptoSymbol}
                </div>
              </div>
            </div>
            
            {/* Overlay info panel */}
            {showInfo && (
              <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">{crypto.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  This AR experience lets you visualize {crypto.name} in 3D space. 
                  In a real app, you could see the token's structure, network connections, 
                  and live market data represented visually.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowInfo(false)}
                >
                  Close
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls toolbar */}
      <div className="flex justify-center gap-2 py-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={isLoading || error !== null || scale <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale(1)}
          disabled={isLoading || error !== null}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={isLoading || error !== null || scale >= 2}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowInfo(!showInfo)}
          disabled={isLoading || error !== null}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        `
      }} />
    </div>
  );
};

export default ArViewer;