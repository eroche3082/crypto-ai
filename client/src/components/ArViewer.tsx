import { useState } from "react";
import { Box, ArrowLeft, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArViewerProps {
  cryptoSymbol?: string;
  onCancel: () => void;
}

const ArViewer = ({ cryptoSymbol = "BTC", onCancel }: ArViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);

  // Simulate AR initialization
  const initializeAR = () => {
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
      setIsModelLoaded(true);
    }, 2000);
  };

  // Rotate the 3D model
  const rotateModel = () => {
    setRotationAngle((prev) => (prev + 45) % 360);
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <h3 className="text-lg font-medium mb-4">Augmented Reality Viewer</h3>
      
      <div 
        className="w-full relative overflow-hidden rounded-lg bg-gradient-to-b from-black to-secondary mb-4" 
        style={{ height: "300px" }}
      >
        {!isModelLoaded && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <Box className="h-12 w-12 mb-2" />
            <p>View {cryptoSymbol} in augmented reality</p>
            <Button 
              onClick={initializeAR}
              className="mt-4" 
              variant="outline"
            >
              Initialize AR
            </Button>
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-muted-foreground">Initializing AR environment...</p>
          </div>
        )}
        
        {isModelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Simulated AR view - in a real app, this would be a WebXR component */}
            <div 
              className="relative w-40 h-40 flex items-center justify-center"
              style={{ transform: `rotateY(${rotationAngle}deg)`, transition: 'transform 0.5s ease' }}
            >
              <div className="absolute w-32 h-32 bg-primary rounded-full opacity-20 animate-pulse"></div>
              <div className="relative z-10 flex items-center justify-center w-28 h-28 bg-black rounded-full border-4 border-primary">
                <span className="text-2xl font-bold tracking-wider">
                  {cryptoSymbol}
                </span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={rotateModel}
                className="bg-background/50 backdrop-blur-sm"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="absolute top-0 left-0 right-0 p-2 text-center text-xs bg-background/50 backdrop-blur-sm">
              Point your camera at a flat surface
            </div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Chat
        </Button>
      </div>
    </div>
  );
};

export default ArViewer;