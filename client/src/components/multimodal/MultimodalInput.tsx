import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Mic, QrCode } from 'lucide-react';
import CameraInput from './CameraInput';
import AudioInput from './AudioInput';
import { Card, CardContent } from '@/components/ui/card';

interface MultimodalInputProps {
  onContentCapture: (content: string, type: 'text' | 'image' | 'qr' | 'audio') => void;
  className?: string;
}

export default function MultimodalInput({ onContentCapture, className = '' }: MultimodalInputProps) {
  const [activeTab, setActiveTab] = useState<string>('camera');

  // Handle image analysis result
  const handleImageCapture = (analysis: string) => {
    onContentCapture(analysis, 'image');
  };

  // Handle QR code scan result
  const handleQRCapture = (result: string) => {
    onContentCapture(result, 'qr');
  };

  // Handle audio transcription result
  const handleTranscription = (transcription: string) => {
    onContentCapture(transcription, 'audio');
  };

  return (
    <Card className={`multimodal-input-container ${className}`}>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="camera">
              <Camera className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Imagen</span>
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">QR</span>
            </TabsTrigger>
            <TabsTrigger value="audio">
              <Mic className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="pt-4">
            <CameraInput 
              onCapture={handleImageCapture} 
              mode="image"
            />
          </TabsContent>
          
          <TabsContent value="qr" className="pt-4">
            <CameraInput 
              onCapture={handleQRCapture} 
              mode="qr"
            />
          </TabsContent>
          
          <TabsContent value="audio" className="pt-4">
            <AudioInput 
              onTranscription={handleTranscription}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}