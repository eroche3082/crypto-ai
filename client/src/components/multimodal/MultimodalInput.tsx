import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Camera, Mic, QrCode, Image, LineChart } from 'lucide-react';
import CameraInput from './CameraInput';
import AudioInput from './AudioInput';

interface MultimodalInputProps {
  onContentCapture: (content: string, type: 'text' | 'image' | 'qr' | 'audio') => void;
  language?: string;
}

export default function MultimodalInput({ 
  onContentCapture,
  language = 'en'
}: MultimodalInputProps) {
  const [activeTab, setActiveTab] = useState('camera');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4">
        <TabsTrigger value="camera" className="flex flex-col items-center gap-1 py-2">
          <Camera className="h-4 w-4" />
          <span className="text-xs">{language === 'es' ? 'Cámara' : 'Camera'}</span>
        </TabsTrigger>
        <TabsTrigger value="audio" className="flex flex-col items-center gap-1 py-2">
          <Mic className="h-4 w-4" />
          <span className="text-xs">{language === 'es' ? 'Audio' : 'Audio'}</span>
        </TabsTrigger>
        <TabsTrigger value="qr" className="flex flex-col items-center gap-1 py-2">
          <QrCode className="h-4 w-4" />
          <span className="text-xs">{language === 'es' ? 'QR' : 'QR Code'}</span>
        </TabsTrigger>
        <TabsTrigger value="chart" className="flex flex-col items-center gap-1 py-2">
          <LineChart className="h-4 w-4" />
          <span className="text-xs">{language === 'es' ? 'Gráfico' : 'Chart'}</span>
        </TabsTrigger>
      </TabsList>
      
      <div className="mt-4">
        <TabsContent value="camera">
          <CameraInput 
            onCapture={(imageData) => onContentCapture(imageData, 'image')} 
            language={language}
          />
        </TabsContent>
        
        <TabsContent value="audio">
          <AudioInput 
            onTranscription={(text) => onContentCapture(text, 'audio')} 
            language={language} 
          />
        </TabsContent>
        
        <TabsContent value="qr">
          <div className="qr-placeholder p-6 text-center">
            <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              {language === 'es' 
                ? 'Escaneo de código QR próximamente' 
                : 'QR code scanning coming soon'}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="chart">
          <div className="chart-placeholder p-6 text-center">
            <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              {language === 'es' 
                ? 'Análisis de gráficos próximamente' 
                : 'Chart analysis coming soon'}
            </p>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}