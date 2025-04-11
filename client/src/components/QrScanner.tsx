import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, X, Camera, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QrScannerProps {
  onQrCodeScanned: (qrData: string) => void;
  onCancel: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onQrCodeScanned, onCancel }) => {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Start video stream when component mounts
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        // Connect stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please check permissions and try again.');
        setScanning(false);
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // QR code scanning logic
  useEffect(() => {
    if (!scanning) return;

    let animationFrame: number;
    let jsQRScriptLoaded = false;

    // Function to load the jsQR library if it's not already loaded
    const loadJsQR = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if ((window as any).jsQR) {
          jsQRScriptLoaded = true;
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
        script.async = true;
        script.onload = () => {
          jsQRScriptLoaded = true;
          resolve();
        };
        script.onerror = () => {
          reject(new Error('Failed to load jsQR library'));
        };
        document.body.appendChild(script);
      });
    };

    // Function to scan a video frame for QR codes
    const scanVideoFrame = () => {
      if (!videoRef.current || !canvasRef.current || !scanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Only process if video is playing
      if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data for QR code scanning
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Check if jsQR is loaded
        if ((window as any).jsQR) {
          // Scan image data for QR code
          const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          // If QR code found, process it
          if (code) {
            console.log('QR Code detected:', code.data);
            setScanning(false);
            onQrCodeScanned(code.data);
            toast({
              title: 'QR Code Detected',
              description: 'Successfully scanned the QR code.',
            });
            return;
          }
        }
      }

      // Continue scanning
      animationFrame = requestAnimationFrame(scanVideoFrame);
    };

    // Start the QR scanning process
    const startScanning = async () => {
      try {
        await loadJsQR();
        scanVideoFrame();
      } catch (err) {
        console.error('Error in QR scanning:', err);
        setError('Failed to initialize QR scanner. Please try again.');
        setScanning(false);
      }
    };

    if (videoRef.current && videoRef.current.readyState >= 2) {
      startScanning();
    } else if (videoRef.current) {
      videoRef.current.onloadeddata = () => {
        startScanning();
      };
    }

    // Cleanup on unmount or when scanning stops
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [scanning, onQrCodeScanned, toast]);

  const restartScanning = () => {
    setError(null);
    setScanning(true);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <QrCode className="w-5 h-5 mr-2" />
          <h2 className="text-lg font-semibold">QR Code Scanner</h2>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {error ? (
          <div className="text-center p-4">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={restartScanning}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="relative w-full max-w-md aspect-square border-2 border-primary rounded-lg overflow-hidden mb-4">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Visual scanning overlay */}
              <div className="absolute inset-0 border-2 border-primary z-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary"></div>
              </div>

              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full max-w-[80%] h-1 bg-primary/50 animate-scan"></div>
                </div>
              )}
            </div>
            
            <canvas 
              ref={canvasRef} 
              className="hidden" 
            />

            <p className="text-sm text-muted-foreground text-center max-w-md">
              Position a QR code within the frame to scan. 
              For best results, ensure good lighting and hold the camera steady.
            </p>
          </>
        )}
      </div>

      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          className="mr-2"
          onClick={onCancel}
        >
          Cancel
        </Button>
        
        <Button
          onClick={restartScanning}
          disabled={!error && scanning}
        >
          <Camera className="w-4 h-4 mr-2" />
          {error || !scanning ? 'Restart Scanning' : 'Scanning...'}
        </Button>
      </div>
    </div>
  );
};

export default QrScanner;