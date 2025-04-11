import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CameraInputProps {
  onCapture: (imageData: string) => void;
  language?: string;
}

export default function CameraInput({ onCapture, language = 'en' }: CameraInputProps) {
  const [capturing, setCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  // Initialize camera when capturing state changes
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 } 
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          title: language === 'es' ? 'Error de cámara' : 'Camera Error',
          description: language === 'es' 
            ? 'No se pudo acceder a la cámara. Por favor, intenta cargar una imagen en su lugar.' 
            : 'Could not access camera. Please try uploading an image instead.',
          variant: 'destructive',
        });
        setCapturing(false);
      }
    }
    
    if (capturing) {
      setupCamera();
    } else {
      // Cleanup function to stop camera when component unmounts or capturing state changes
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturing, toast, language]);

  // Capture image from camera
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setImagePreview(imageData);
        setCapturing(false);
      }
    }
  };

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setImagePreview(e.target.result);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Handle image analysis
  const analyzeImage = async () => {
    if (!imagePreview) return;
    
    setLoading(true);
    
    try {
      // Send image to API for analysis
      const response = await fetch('/api/vision/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imagePreview.split(',')[1], // Remove data URL prefix
          language,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      onCapture(data.description || data.caption || data.text || 'Image analyzed successfully');
      
      // Reset state after successful analysis
      setImagePreview(null);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: language === 'es' ? 'Error de análisis' : 'Analysis Error',
        description: language === 'es'
          ? 'No se pudo analizar la imagen. Por favor, intenta de nuevo.'
          : 'Could not analyze the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Render camera view when capturing
  if (capturing) {
    return (
      <div className="camera-container">
        <div className="video-container relative rounded-md overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-[300px] object-cover"
          />
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              className="bg-white/80 text-black"
              onClick={() => setCapturing(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <Button 
              size="icon"
              className="bg-white/80 text-black hover:bg-white/60"
              onClick={captureImage}
            >
              <Camera className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Render image preview if available
  if (imagePreview) {
    return (
      <div className="image-preview-container">
        <div className="relative mb-3">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="w-full h-[240px] object-contain rounded-md border"
          />
          
          <Button 
            variant="outline" 
            size="icon"
            className="absolute top-2 right-2 bg-white/80 text-black"
            onClick={() => setImagePreview(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={analyzeImage}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === 'es' ? 'Analizando...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                {language === 'es' ? 'Analizar imagen' : 'Analyze Image'}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Render input options when not capturing or previewing
  return (
    <div className="camera-input-container">
      <div className="grid grid-cols-2 gap-3">
        <Card 
          className="p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50"
          onClick={() => setCapturing(true)}
        >
          <Camera className="h-8 w-8 mb-2 opacity-70" />
          <p className="text-sm font-medium">
            {language === 'es' ? 'Usar cámara' : 'Use Camera'}
          </p>
        </Card>
        
        <Card 
          className="p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mb-2 opacity-70" />
          <p className="text-sm font-medium">
            {language === 'es' ? 'Cargar imagen' : 'Upload Image'}
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </Card>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {language === 'es' 
          ? 'Captura o carga una imagen para analizarla con IA'
          : 'Capture or upload an image to analyze with AI'}
      </p>
    </div>
  );
}