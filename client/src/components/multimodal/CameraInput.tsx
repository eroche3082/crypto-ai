import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Send, Image, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CameraInputProps {
  onCapture: (result: string) => void;
  mode?: 'image' | 'qr';
  className?: string;
}

export default function CameraInput({ onCapture, mode = 'image', className = '' }: CameraInputProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const { toast } = useToast();

  // Start the camera when the component becomes active
  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isActive, facingMode]);

  // Start the camera stream
  const startCamera = async () => {
    try {
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Could not access your camera. Please check permissions.',
        variant: 'destructive'
      });
      setIsActive(false);
    }
  };

  // Stop the camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Toggle camera activation
  const toggleCamera = () => {
    setIsActive(!isActive);
  };

  // Switch between front and back cameras
  const switchCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
  };

  // Capture an image from the video stream
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/jpeg', 0.9);
      });
      
      // Create form data
      const formData = new FormData();
      formData.append(mode === 'qr' ? 'qrImage' : 'image', blob, 'capture.jpg');
      
      // Send to appropriate endpoint based on mode
      const endpoint = mode === 'qr' ? '/api/vision/scan-qr' : '/api/vision/analyze-image';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Pass result to parent component
      if (mode === 'qr') {
        onCapture(data.result || 'No QR code detected');
      } else {
        onCapture(data.analysis || 'Image analysis failed');
      }
      
      // Close camera after successful capture
      setIsActive(false);
    } catch (error) {
      console.error('Error capturing image:', error);
      toast({
        title: 'Capture Error',
        description: `Failed to ${mode === 'qr' ? 'scan QR code' : 'analyze image'}: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload from device
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append(mode === 'qr' ? 'qrImage' : 'image', file);
      
      const endpoint = mode === 'qr' ? '/api/vision/scan-qr' : '/api/vision/analyze-image';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (mode === 'qr') {
        onCapture(data.result || 'No QR code detected');
      } else {
        onCapture(data.analysis || 'Image analysis failed');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Processing Error',
        description: `Failed to ${mode === 'qr' ? 'scan QR code' : 'analyze image'}: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`camera-input-container relative ${className}`}>
      {isActive ? (
        <div className="camera-active flex flex-col">
          <div className="relative">
            <video 
              ref={videoRef}
              autoPlay 
              playsInline
              className="w-full h-auto rounded-md"
            />
            
            <div className="absolute top-2 right-2">
              <Button 
                variant="destructive" 
                size="icon" 
                onClick={() => setIsActive(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center p-2 space-x-3">
            <Button 
              onClick={switchCamera} 
              variant="outline"
              disabled={isProcessing}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Switch Camera
            </Button>
            
            <Button 
              onClick={captureImage}
              disabled={isProcessing}
            >
              <Send className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : mode === 'qr' ? 'Scan QR' : 'Capture'}
            </Button>
          </div>
          
          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="camera-inactive grid grid-cols-2 gap-2">
          <Button 
            onClick={toggleCamera}
            className="w-full"
          >
            <Camera className="h-4 w-4 mr-2" />
            {mode === 'qr' ? 'Scan QR Code' : 'Use Camera'}
          </Button>
          
          <div className="relative">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => document.getElementById('fileInput')?.click()}
              disabled={isProcessing}
            >
              <Image className="h-4 w-4 mr-2" />
              Upload {mode === 'qr' ? 'QR Code' : 'Image'}
            </Button>
            <input 
              id="fileInput" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
          </div>
        </div>
      )}
    </div>
  );
}