import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QrCode, X, Upload, Camera, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';

interface QrScannerProps {
  onQrCodeScanned: (data: string) => void;
  onCancel: () => void;
  language?: string;
}

export default function QrScanner({ onQrCodeScanned, onCancel, language = 'en' }: QrScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  // Start camera for QR scanning
  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        scanQRCode();
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      toast({
        title: language === 'es' ? 'Error de cámara' : 'Camera Error',
        description: language === 'es' 
          ? 'No se pudo acceder a la cámara. Por favor, intenta cargar una imagen con código QR.' 
          : 'Could not access camera. Please try uploading an image with a QR code.',
        variant: 'destructive',
      });
    }
  };

  // Stop scanning and clean up
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setScanning(false);
  };

  // Continuously scan for QR codes
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
      return;
    }
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for QR code detection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Analyze with jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      
      if (code) {
        // QR code found!
        stopScanning();
        setQrData(code.data);
        setSuccess(true);
        
        // Briefly show success state, then send data
        setTimeout(() => {
          onQrCodeScanned(code.data);
        }, 1000);
        
        return;
      }
    }
    
    // Continue scanning if no QR code found
    animationFrameRef.current = requestAnimationFrame(scanQRCode);
  };

  // Handle file upload for QR code scanning
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    
    if (!file) return;
    
    setLoading(true);
    
    try {
      // Load image file
      const imageUrl = URL.createObjectURL(file);
      const image = new Image();
      
      image.onload = () => {
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Could not create canvas context');
        }
        
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
        
        // Get image data for QR code detection
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Analyze with jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        
        if (code) {
          // QR code found!
          setQrData(code.data);
          setSuccess(true);
          
          // Briefly show success state, then send data
          setTimeout(() => {
            onQrCodeScanned(code.data);
          }, 1000);
        } else {
          toast({
            title: language === 'es' ? 'No se encontró código QR' : 'No QR Code Found',
            description: language === 'es'
              ? 'No se pudo detectar un código QR en esta imagen.'
              : 'Could not detect a QR code in this image.',
            variant: 'destructive',
          });
        }
        
        // Cleanup
        URL.revokeObjectURL(imageUrl);
        setLoading(false);
      };
      
      image.onerror = () => {
        toast({
          title: language === 'es' ? 'Error de imagen' : 'Image Error',
          description: language === 'es'
            ? 'No se pudo cargar la imagen.'
            : 'Could not load the image.',
          variant: 'destructive',
        });
        
        URL.revokeObjectURL(imageUrl);
        setLoading(false);
      };
      
      image.src = imageUrl;
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: language === 'es' ? 'Error de procesamiento' : 'Processing Error',
        description: language === 'es'
          ? 'No se pudo procesar la imagen.'
          : 'Could not process the image.',
        variant: 'destructive',
      });
      
      setLoading(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Show success state
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {language === 'es' ? '¡Código QR escaneado!' : 'QR Code Scanned!'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {language === 'es' ? 'Enviando datos al chat...' : 'Sending data to chat...'}
          </p>
        </div>
      </div>
    );
  }

  // Show camera view when scanning
  if (scanning) {
    return (
      <div className="qr-scanner-container p-4">
        <div className="relative">
          <div className="video-container relative rounded-md overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-[300px] object-cover"
              playsInline
            />
            
            <div className="absolute inset-0 border-2 border-primary/50 rounded-md">
              <div className="absolute left-0 top-0 w-16 h-16 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute right-0 top-0 w-16 h-16 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute left-0 bottom-0 w-16 h-16 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute right-0 bottom-0 w-16 h-16 border-b-2 border-r-2 border-primary"></div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 bg-white/70 text-black hover:bg-white/50"
            onClick={stopScanning}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          {language === 'es'
            ? 'Apunta la cámara al código QR para escanearlo automáticamente'
            : 'Point your camera at a QR code to scan it automatically'}
        </p>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Show initial options
  return (
    <div className="qr-scanner-container p-4">
      <div className="text-center mb-6">
        <QrCode className="h-12 w-12 mx-auto mb-2 opacity-60" />
        <h3 className="text-xl font-bold">
          {language === 'es' ? 'Escanear código QR' : 'Scan QR Code'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'es'
            ? 'Escanea cualquier código QR para obtener su información'
            : 'Scan any QR code to get its information'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card
          className="p-4 flex flex-col items-center cursor-pointer hover:bg-secondary/50"
          onClick={startScanning}
        >
          <Camera className="h-8 w-8 mb-2 opacity-70" />
          <p className="font-medium">
            {language === 'es' ? 'Usar cámara' : 'Use Camera'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'es'
              ? 'Escanear un código QR en tiempo real'
              : 'Scan a QR code in real-time'}
          </p>
        </Card>
        
        <Card
          className="p-4 flex flex-col items-center cursor-pointer hover:bg-secondary/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mb-2 opacity-70" />
          <p className="font-medium">
            {language === 'es' ? 'Subir imagen' : 'Upload Image'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {language === 'es'
              ? 'Seleccionar una imagen con código QR'
              : 'Select an image with a QR code'}
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
        </Card>
      </div>
      
      {loading && (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      
      <div className="flex justify-center">
        <Button variant="outline" onClick={onCancel}>
          {language === 'es' ? 'Volver al chat' : 'Return to Chat'}
        </Button>
      </div>
    </div>
  );
}