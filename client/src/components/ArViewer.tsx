import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, RotateCw, Plus, Minus, Box } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ArViewerProps {
  onCancel: () => void;
  cryptoSymbol: string;
}

interface CryptoModel {
  symbol: string;
  name: string;
  model: string;
  description: string;
}

const ArViewer: React.FC<ArViewerProps> = ({ 
  onCancel, 
  cryptoSymbol = 'BTC'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoSymbol);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 5 });
  const [isAugmentedMode, setIsAugmentedMode] = useState(false);
  const [arSupported, setArSupported] = useState(false);
  
  const { toast } = useToast();
  
  // List of available 3D crypto models
  const availableCryptos: CryptoModel[] = [
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      model: '/models/bitcoin.glb', 
      description: 'Bitcoin is the first and most well-known cryptocurrency, created in 2009.'
    },
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      model: '/models/ethereum.glb',
      description: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality.'
    },
    { 
      symbol: 'SOL', 
      name: 'Solana', 
      model: '/models/solana.glb',
      description: 'Solana is a high-performance blockchain supporting builders around the world.'
    },
  ];
  
  // Find the selected crypto model data
  const selectedCryptoData = availableCryptos.find(c => c.symbol === selectedCrypto) || availableCryptos[0];
  
  // Check if WebXR is supported on mount
  useEffect(() => {
    const checkArSupport = async () => {
      try {
        setLoading(true);
        
        // Check if WebXR is supported
        if ('xr' in navigator) {
          // @ts-ignore - TypeScript doesn't recognize the WebXR API fully
          const isSupported = await navigator.xr?.isSessionSupported('immersive-ar');
          setArSupported(!!isSupported);
          
          if (!isSupported) {
            console.log('AR not supported on this device');
          }
        } else {
          setArSupported(false);
          console.log('WebXR not supported on this browser');
        }
        
        // Simulate loading assets
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      } catch (err) {
        console.error('Error checking AR support:', err);
        setArSupported(false);
        setError('Error initializing AR. Your device may not support AR features.');
        setLoading(false);
      }
    };
    
    checkArSupport();
  }, []);
  
  // Handle crypto selection change
  const handleCryptoChange = (value: string) => {
    setSelectedCrypto(value);
    
    // Feedback for changing models
    toast({
      title: 'Model Changed',
      description: `Switched to ${value} 3D model`,
    });
  };
  
  // Handle rotation speed change
  const handleRotationChange = (change: number) => {
    setRotationSpeed(prev => {
      const newValue = prev + change;
      return Math.max(0, Math.min(5, newValue)); // Clamp between 0 and 5
    });
  };
  
  // Handle camera zoom
  const handleZoom = (zoomIn: boolean) => {
    setCameraPosition(prev => {
      const newZ = prev.z + (zoomIn ? -0.5 : 0.5);
      return { ...prev, z: Math.max(2, Math.min(10, newZ)) }; // Clamp between 2 and 10
    });
  };
  
  // Toggle AR mode
  const toggleArMode = () => {
    if (arSupported) {
      setIsAugmentedMode(!isAugmentedMode);
      
      if (!isAugmentedMode) {
        // Entering AR mode
        toast({
          title: 'AR Mode Activated',
          description: 'Point your camera at a flat surface to place the 3D model.',
        });
      }
    } else {
      toast({
        title: 'AR Not Supported',
        description: 'Your device does not support Augmented Reality features.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center">
          <Box className="w-5 h-5 mr-2" />
          <h2 className="text-lg font-semibold">Crypto AR Viewer</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row flex-1">
        {/* Controls Panel */}
        <div className="p-4 border-r md:w-64 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Cryptocurrency</label>
            <Select value={selectedCrypto} onValueChange={handleCryptoChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableCryptos.map(crypto => (
                  <SelectItem key={crypto.symbol} value={crypto.symbol}>
                    {crypto.name} ({crypto.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Rotation Speed</label>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleRotationChange(-0.5)}
                disabled={rotationSpeed <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 mx-2 h-2 bg-muted rounded overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all" 
                  style={{ width: `${(rotationSpeed / 5) * 100}%` }}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleRotationChange(0.5)}
                disabled={rotationSpeed >= 5}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleZoom(true)}
                disabled={cameraPosition.z <= 2}
              >
                <Plus className="h-4 w-4 mr-1" />
                Zoom In
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleZoom(false)}
                disabled={cameraPosition.z >= 10}
              >
                <Minus className="h-4 w-4 mr-1" />
                Zoom Out
              </Button>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              className="w-full" 
              variant={isAugmentedMode ? "default" : "secondary"}
              onClick={toggleArMode}
              disabled={!arSupported}
            >
              {isAugmentedMode ? 'Exit AR Mode' : 'View in AR'}
            </Button>
            
            {!arSupported && (
              <p className="text-xs text-muted-foreground mt-2">
                AR is not supported on your device or browser
              </p>
            )}
          </div>
        </div>
        
        {/* 3D Viewer */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-black/5 relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <RotateCw className="animate-spin h-10 w-10 text-primary mb-4" />
              <p>Loading 3D model...</p>
            </div>
          ) : error ? (
            <div className="text-center max-w-md">
              <p className="text-red-500 mb-2">{error}</p>
              <Button onClick={onCancel}>Return to Chat</Button>
            </div>
          ) : (
            <>
              {/* This would be a real 3D viewer using Three.js or similar */}
              <div className="w-full max-w-2xl aspect-square relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src={`/crypto-3d-preview-${selectedCrypto.toLowerCase()}.png`}
                    alt={`${selectedCryptoData.name} 3D Model`}
                    className="max-w-full max-h-full object-contain"
                    // This would be replaced with an actual 3D model viewer
                  />
                </div>
                
                {/* Simulated 3D viewer overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="border-2 border-dashed border-primary/30 rounded-full w-4/5 h-4/5 animate-[spin_8s_linear_infinite]" style={{ animationDuration: `${10 / rotationSpeed}s` }} />
                </div>
              </div>
              
              <Card className="mt-4 max-w-2xl w-full">
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg">{selectedCryptoData.name} ({selectedCryptoData.symbol})</h3>
                  <p className="text-sm text-muted-foreground">{selectedCryptoData.description}</p>
                </CardContent>
              </Card>
            </>
          )}
          
          {isAugmentedMode && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center p-8 max-w-md">
                <Box className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2 text-white">AR Experience Simulation</h3>
                <p className="mb-4 text-gray-300">
                  In a real implementation, this would use WebXR to place the 3D crypto model in your physical environment.
                </p>
                <Button onClick={() => setIsAugmentedMode(false)}>
                  Exit AR Mode
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArViewer;