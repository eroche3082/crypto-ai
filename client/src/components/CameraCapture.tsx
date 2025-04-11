import { useState, useRef, useEffect } from "react";
import { Camera, ImageIcon, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onImageCaptured: (imageBlob: Blob, imageUrl: string) => void;
  onCancel: () => void;
}

const CameraCapture = ({ onImageCaptured, onCancel }: CameraCaptureProps) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up function to stop the camera stream
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
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
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Error accessing your camera. Please check permissions and try again.");
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame on the canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL and blob
        const imageUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageUrl);
        
        // Stop the camera stream after capturing
        stopStream();
        setIsCameraActive(false);
        
        // Convert to blob for upload
        canvas.toBlob((blob) => {
          if (blob) {
            // Don't send immediately, wait for user confirmation
            // onImageCaptured(blob, imageUrl);
          }
        }, "image/jpeg", 0.8);
      }
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    startCamera();
  };

  const sendImage = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          onImageCaptured(blob, capturedImage);
        }
      }, "image/jpeg", 0.8);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <h3 className="text-lg font-medium mb-4">Camera</h3>
      
      <div className="w-full relative overflow-hidden rounded-lg bg-black mb-4" style={{ height: "300px" }}>
        {!isCameraActive && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-2" />
            <p>Press start to access camera</p>
          </div>
        )}
        
        {isCameraActive && (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        
        {capturedImage && (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-contain"
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="flex space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        
        {!isCameraActive && !capturedImage && (
          <Button onClick={startCamera}>
            <Camera className="h-4 w-4 mr-2" />
            Start Camera
          </Button>
        )}
        
        {isCameraActive && (
          <Button onClick={captureImage}>
            <Camera className="h-4 w-4 mr-2" />
            Capture
          </Button>
        )}
        
        {capturedImage && (
          <>
            <Button variant="outline" onClick={retakeImage}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake
            </Button>
            
            <Button onClick={sendImage}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;