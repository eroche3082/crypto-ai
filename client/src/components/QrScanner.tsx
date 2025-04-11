import { useState, useRef, useEffect } from "react";
import { QrCode, Camera, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrScannerProps {
  onQrCodeScanned: (qrData: string) => void;
  onCancel: () => void;
}

const QrScanner = ({ onQrCodeScanned, onCancel }: QrScannerProps) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<any>(null);
  
  // Clean up function to stop the camera stream
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (scannerRef.current) {
      clearInterval(scannerRef.current);
      scannerRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        
        // Wait for video to start playing
        videoRef.current.onloadedmetadata = () => {
          startScanning();
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Error accessing your camera. Please check permissions and try again.");
    }
  };

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) return;
    
    // Set appropriate canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Create scanning interval
    scannerRef.current = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Here we would normally use a QR code library like jsQR
        // For this demo, we'll simulate finding a QR code after some time
        if (Math.random() < 0.01) {  // 1% chance of success on each frame
          simulateQrDetection();
        }
      }
    }, 100);  // Check frames every 100ms
  };
  
  // Simulate QR code detection
  const simulateQrDetection = () => {
    stopStream();
    setIsCameraActive(false);
    
    // Create a fake crypto address as an example
    const fakeQrData = "0x" + Math.random().toString(16).substring(2, 42);
    setScannedData(fakeQrData);
    
    // Don't automatically send the data
    // onQrCodeScanned(fakeQrData);
  };

  const resetScanner = () => {
    setScannedData(null);
    startCamera();
  };

  const confirmQrCode = () => {
    if (scannedData) {
      onQrCodeScanned(scannedData);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <h3 className="text-lg font-medium mb-4">QR Code Scanner</h3>
      
      <div className="w-full relative overflow-hidden rounded-lg bg-black mb-4" style={{ height: "300px" }}>
        {!isCameraActive && !scannedData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <QrCode className="h-12 w-12 mb-2" />
            <p>Press start to scan a QR code</p>
          </div>
        )}
        
        {isCameraActive && (
          <>
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-4 border-primary/50 rounded-lg"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-2/3 border-2 border-primary rounded-lg"></div>
          </>
        )}
        
        {scannedData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4">
            <QrCode className="h-12 w-12 mb-2 text-primary" />
            <h3 className="text-lg font-medium mb-2">QR Code Detected</h3>
            <div className="bg-secondary p-3 rounded w-full overflow-hidden text-ellipsis text-sm mb-4">
              {scannedData}
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              This appears to be a crypto wallet address. Would you like to analyze it?
            </p>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="flex space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        
        {!isCameraActive && !scannedData && (
          <Button onClick={startCamera}>
            <Camera className="h-4 w-4 mr-2" />
            Start Scanning
          </Button>
        )}
        
        {scannedData && (
          <>
            <Button variant="outline" onClick={resetScanner}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Scan Again
            </Button>
            
            <Button onClick={confirmQrCode}>
              Analyze Address
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default QrScanner;