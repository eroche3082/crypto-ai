import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Send, FlipHorizontal, SwitchCamera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  onImageCaptured: (imageBlob: Blob, imageUrl: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCaptured, onCancel }) => {
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Initialize camera when component mounts
  useEffect(() => {
    startCamera();
    
    // Clean up on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, [facingMode]);

  // Start the camera
  const startCamera = async () => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      setError(null);
      setCapturedImage(null);
      setIsCameraReady(false);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            setIsCameraReady(true);
          }
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions and try again.');
    }
  };

  // Capture image from video
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    if (context) {
      // For selfie mode, flip horizontally
      if (facingMode === 'user') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL and set as captured image
      const imageUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageUrl);
      
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  // Discard captured image and restart camera
  const retakePhoto = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
    }
    startCamera();
  };

  // Switch between front and back cameras
  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // Send captured image
  const sendImage = async () => {
    if (!capturedImage) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Call callback with image data
      onImageCaptured(blob, capturedImage);
    } catch (err) {
      console.error('Error processing image:', err);
      toast({
        title: "Error",
        description: "Could not process the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Camera className="w-5 h-5 mr-2" />
          <h2 className="text-lg font-semibold">Camera</h2>
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
            <Button onClick={startCamera}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden mb-4">
              {!capturedImage ? (
                // Live camera view
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  muted 
                  className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
              ) : (
                // Captured image
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              )}
              
              {/* Visual camera frame */}
              <div className="absolute inset-0 border-2 border-primary/50 pointer-events-none">
                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary"></div>
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary"></div>
              </div>
              
              {/* Camera switch button (only visible on mobile devices) */}
              {!capturedImage && 'mediaDevices' in navigator && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background/90"
                  onClick={switchCamera}
                >
                  <SwitchCamera className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} className="hidden" />
            
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {capturedImage
                ? "Review your photo and send it, or take another one."
                : "Position your subject in the frame and tap the capture button."}
            </p>
          </>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-center gap-4 py-4">
        {capturedImage ? (
          <>
            <Button 
              variant="outline" 
              onClick={retakePhoto}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button 
              onClick={sendImage}
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              onClick={captureImage}
              disabled={!isCameraReady}
            >
              <Camera className="w-5 h-5 mr-2" />
              {isCameraReady ? "Take Photo" : "Initializing..."}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;