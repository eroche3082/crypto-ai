import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Package, Loader2, RotateCcw, Camera, Save, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/ui/icons';

interface ArViewerProps {
  cryptoSymbol?: string;
  onCancel: () => void;
}

interface CryptoModel {
  id: string;
  name: string;
  symbol: string;
  modelUrl: string;
  description: string;
}

// Sample crypto models data
const CRYPTO_MODELS: CryptoModel[] = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    modelUrl: 'https://models.readyplayer.me/649fbe8ef1afae1fb8a98629.glb',
    description: 'The original cryptocurrency, created by Satoshi Nakamoto in 2009.'
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    modelUrl: 'https://models.readyplayer.me/64a3185ba33c31a669e341fb.glb',
    description: 'A decentralized platform that enables smart contracts and decentralized applications.'
  },
  {
    id: '3',
    name: 'Cardano',
    symbol: 'ADA',
    modelUrl: 'https://models.readyplayer.me/64d8f56ab5fcf69fb67c9c4a.glb',
    description: 'A proof-of-stake blockchain platform that aims to enable "changemakers, innovators and visionaries".'
  },
  {
    id: '4',
    name: 'Solana',
    symbol: 'SOL',
    modelUrl: 'https://models.readyplayer.me/64d8f531ecba72d20b3d2b87.glb',
    description: 'A high-performance blockchain supporting builders around the world creating crypto apps.'
  },
  {
    id: '5',
    name: 'Polkadot',
    symbol: 'DOT',
    modelUrl: 'https://models.readyplayer.me/64d8f4e8ecba72d20b3d2b75.glb',
    description: 'An open-source sharded multichain protocol connecting and securing different blockchains.'
  },
];

export default function ArViewer({ cryptoSymbol = 'BTC', onCancel }: ArViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isArSupported, setIsArSupported] = useState(false);
  const [modelIndex, setModelIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelContainerRef = useRef<HTMLDivElement>(null);
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Find the initial model index based on the provided cryptoSymbol
  useEffect(() => {
    const index = CRYPTO_MODELS.findIndex(model => model.symbol === cryptoSymbol);
    setModelIndex(index !== -1 ? index : 0);
  }, [cryptoSymbol]);

  // Check if WebXR is supported
  useEffect(() => {
    const checkArSupport = async () => {
      if ('xr' in navigator) {
        try {
          const isSupported = await (navigator as any).xr.isSessionSupported('immersive-ar');
          setIsArSupported(isSupported);
        } catch (error) {
          console.error('Error checking AR support:', error);
          setIsArSupported(false);
        }
      } else {
        setIsArSupported(false);
      }
    };

    checkArSupport();
  }, []);

  // Simulated loading of 3D model
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [modelIndex]);

  const handlePreviousModel = () => {
    setModelIndex((prev) => (prev > 0 ? prev - 1 : CRYPTO_MODELS.length - 1));
  };

  const handleNextModel = () => {
    setModelIndex((prev) => (prev < CRYPTO_MODELS.length - 1 ? prev + 1 : 0));
  };

  const handleAutoRotate = () => {
    if (rotationIntervalRef.current) {
      // Stop rotation
      clearInterval(rotationIntervalRef.current);
      rotationIntervalRef.current = null;
    } else {
      // Start rotation
      rotationIntervalRef.current = setInterval(() => {
        setRotation((prev) => (prev + 1) % 360);
      }, 50);
    }
  };

  const handleRotationChange = (value: number[]) => {
    // Stop auto-rotation if it's active
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
      rotationIntervalRef.current = null;
    }
    setRotation(value[0]);
  };

  const handleViewInAr = () => {
    if (!isArSupported) {
      toast({
        title: "AR Not Supported",
        description: "Your device does not support AR experiences.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "AR Mode",
      description: "Launching AR experience...",
    });

    // This would normally launch an AR session
    // For now, we just show a toast
    setTimeout(() => {
      toast({
        title: "AR Experience",
        description: `Viewing ${CRYPTO_MODELS[modelIndex].name} in augmented reality.`,
      });
    }, 1000);
  };

  const handleScreenshot = () => {
    if (!canvasRef.current) return;

    try {
      // In a real implementation, this would capture the current WebGL canvas
      const dataUrl = canvasRef.current.toDataURL('image/png');
      
      // Create temporary link element to download the image
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${CRYPTO_MODELS[modelIndex].symbol}-3D-Model-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Screenshot Captured",
        description: "Image saved to your downloads.",
      });
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      toast({
        title: "Screenshot Failed",
        description: "Could not capture screenshot.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFullscreen = () => {
    if (!modelContainerRef.current) return;

    if (!document.fullscreenElement) {
      modelContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        toast({
          title: "Fullscreen Error",
          description: `Error attempting to enable fullscreen: ${err.message}`,
          variant: "destructive",
        });
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const currentModel = CRYPTO_MODELS[modelIndex];

  return (
    <div className="ar-viewer-container p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center">
            <Package className="mr-2 h-5 w-5" />
            3D Crypto Viewer
          </h3>
          <p className="text-sm text-muted-foreground">
            Explore cryptocurrency tokens in 3D
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowInfo(!showInfo)}
            className={showInfo ? 'bg-secondary' : ''}
          >
            <Info className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon" onClick={handleToggleFullscreen}>
            {isFullscreen ? <Icons.minimize className="h-4 w-4" /> : <Icons.maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <Button variant="outline" size="sm" onClick={handlePreviousModel}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="text-center px-4">
          <span className="font-semibold">{currentModel.name}</span>
          <span className="text-muted-foreground ml-2">({currentModel.symbol})</span>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleNextModel}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div 
        ref={modelContainerRef}
        className="relative bg-black/5 rounded-lg overflow-hidden h-[350px] flex items-center justify-center mb-4"
        style={{
          perspective: '1000px',
        }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm">Loading 3D model...</p>
          </div>
        ) : (
          <>
            {/* This would be a WebGL canvas in a real implementation */}
            <canvas 
              ref={canvasRef}
              className="w-full h-full"
              style={{ display: 'none' }} // Hide canvas, just for screenshot functionality
            />
            
            {/* Placeholder 3D model representation */}
            <div 
              className="w-40 h-40 relative"
              style={{
                transform: `rotateY(${rotation}deg)`,
                transition: rotationIntervalRef.current ? 'none' : 'transform 0.3s ease',
              }}
            >
              <div className="absolute inset-0 bg-primary rounded-md opacity-20"></div>
              <div className="absolute inset-2 bg-primary rounded-md opacity-30"></div>
              <div className="absolute inset-4 bg-primary rounded-md opacity-40"></div>
              <div className="absolute inset-6 bg-primary rounded-md opacity-50 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{currentModel.symbol}</span>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Model information panel */}
      {showInfo && (
        <div className="bg-card p-4 rounded-lg border mb-4">
          <h4 className="font-semibold mb-2">{currentModel.name} ({currentModel.symbol})</h4>
          <p className="text-sm text-muted-foreground mb-4">
            {currentModel.description}
          </p>
          <div className="text-xs text-muted-foreground">
            <p>Model ID: {currentModel.id}</p>
            <p className="truncate">Source: {currentModel.modelUrl}</p>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="space-y-4 mb-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Rotation</label>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleAutoRotate}
              className={rotationIntervalRef.current ? 'bg-secondary' : ''}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Slider 
              value={[rotation]} 
              min={0} 
              max={359} 
              step={1}
              onValueChange={handleRotationChange}
              className="flex-1"
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline"
          onClick={handleViewInAr}
          disabled={!isArSupported || isLoading}
          className="flex-1"
        >
          <Package className="mr-2 h-4 w-4" />
          View in AR
        </Button>
        
        <Button 
          variant="outline"
          onClick={handleScreenshot}
          disabled={isLoading}
          className="flex-1"
        >
          <Camera className="mr-2 h-4 w-4" />
          Screenshot
        </Button>
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button variant="outline" onClick={onCancel}>
          Return to Chat
        </Button>
      </div>
    </div>
  );
}