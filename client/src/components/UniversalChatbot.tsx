import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Maximize2, Minimize2, Volume2, VolumeX, Mic, Camera, QrCode, Package, Share2, Languages, ChevronRight, ChevronLeft, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/ui/icons';
import ZoomStyleChat from './chat/ZoomStyleChat';
import QrScanner from './QrScanner';
import QrGenerator from './QrGenerator';
import ArViewer from './ArViewer';
import AudioInput from './multimodal/AudioInput';
import CameraInput from './multimodal/CameraInput';
import { TranslatableText } from './language/TranslatableText';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UniversalChatbotProps {
  defaultLanguage?: string;
  className?: string;
}

type ActiveToolType = 'chat' | 'qr-scan' | 'qr-generate' | 'ar' | 'vr' | 'camera' | 'audio' | null;

export default function UniversalChatbot({ 
  defaultLanguage = 'en',
  className = ''
}: UniversalChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeTool, setActiveTool] = useState<ActiveToolType>('chat');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState('BTC');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [language, setLanguage] = useState(defaultLanguage);
  const [multimodalCapture, setMultimodalCapture] = useState<string | null>(null);
  const { toast } = useToast();
  const chatRef = useRef<any>(null);

  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'pt', name: 'Português' },
  ];

  // Function to handle chat toggles and controls
  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsMinimized(true);
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  // Function to toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Function to toggle voice features
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    toast({
      title: voiceEnabled ? 'Voice disabled' : 'Voice enabled',
      description: voiceEnabled 
        ? 'Text-to-speech has been turned off' 
        : 'Text-to-speech is now active',
    });
  };

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to activate different tools
  const activateTool = (tool: ActiveToolType) => {
    setActiveTool(tool);
    if (tool !== 'chat') {
      // Reset multimodal capture when switching tools
      setMultimodalCapture(null);
    }
  };

  // Handle QR code scanning result
  const handleQrCodeScanned = (qrData: string) => {
    toast({
      title: 'QR Code Scanned',
      description: `Data captured: ${qrData.substring(0, 30)}${qrData.length > 30 ? '...' : ''}`,
    });
    
    // Set captured data for the chat to use
    setMultimodalCapture(`QR Code data: ${qrData}`);
    
    // Return to chat with the QR data
    setActiveTool('chat');
  };

  // Handle camera capture
  const handleImageCapture = (imageData: string) => {
    // Process the captured image data
    setMultimodalCapture(`Image analysis: ${imageData}`);
    
    // Return to chat with the image data
    setActiveTool('chat');
  };

  // Handle audio transcription
  const handleAudioTranscription = (transcription: string) => {
    // Process the transcription
    setMultimodalCapture(`Transcription: ${transcription}`);
    
    // Return to chat with the transcription
    setActiveTool('chat');
  };

  // Handle AR tool actions
  const handleArAction = (action: string) => {
    // Process AR interactions
    toast({
      title: 'AR Interaction',
      description: `${action} action performed`,
    });
  };

  // Reset to chat mode
  const resetToChat = () => {
    setActiveTool('chat');
  };

  // Change language
  const changeLanguage = (code: string) => {
    setLanguage(code);
    toast({
      title: 'Language Changed',
      description: `Interface language set to ${languages.find(l => l.code === code)?.name}`,
    });
  };

  // Effect to handle multimodal capture feedback to chat
  useEffect(() => {
    if (multimodalCapture && chatRef.current && typeof chatRef.current.handleMultimodalInput === 'function') {
      chatRef.current.handleMultimodalInput(multimodalCapture);
      setMultimodalCapture(null);
    }
  }, [multimodalCapture, activeTool]);

  return (
    <>
      {/* Floating button - always visible */}
      <div 
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <Button 
          onClick={handleToggle}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>

      {/* Fullscreen chatbot dialog */}
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setIsMinimized(true);
        }}
      >
        <DialogContent 
          className={`p-0 ${isFullscreen ? 'fixed inset-0 w-full h-full max-w-none rounded-none' : 'sm:max-w-[95vw] md:max-w-[90vw] h-[95vh]'} flex flex-col`}
        >
          {/* Header with controls */}
          <div className="flex items-center justify-between p-3 bg-primary/10 border-b">
            <div className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              <h2 className="font-semibold text-lg">
                <TranslatableText text="CryptoBot Universal Assistant" spanish="Asistente Universal CryptoBot" language={language} />
              </h2>
            </div>
            <div className="flex items-center gap-1">
              {/* Voice toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleVoice}>
                      {voiceEnabled ? (
                        <Icons.volumeOn className="h-5 w-5" />
                      ) : (
                        <Icons.volumeOff className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      <TranslatableText text={voiceEnabled ? 'Disable voice' : 'Enable voice'} spanish={voiceEnabled ? 'Desactivar voz' : 'Activar voz'} language={language} />
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Fullscreen toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                      {isFullscreen ? (
                        <Minimize2 className="h-5 w-5" />
                      ) : (
                        <Maximize2 className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      <TranslatableText text={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} spanish={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'} language={language} />
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Close button */}
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Main content area with sidebar and chat */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left sidebar menu */}
            <div 
              className={`bg-card border-r transition-all duration-200 ${
                sidebarOpen 
                  ? 'w-64 opacity-100' 
                  : 'w-0 opacity-0 hidden md:block md:opacity-100 md:w-0'
              }`}
            >
              {sidebarOpen && (
                <div className="h-full flex flex-col">
                  {/* User profile section */}
                  <div className="p-4 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src="/assets/default-human-avatar.svg" />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          <TranslatableText text="Guest User" spanish="Usuario Invitado" language={language} />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <TranslatableText text="CryptoBot User" spanish="Usuario de CryptoBot" language={language} />
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Navigation section */}
                  <div className="flex-1 overflow-y-auto py-2">
                    <div className="px-3 py-2">
                      <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                        <TranslatableText text="TOOLS" spanish="HERRAMIENTAS" language={language} />
                      </h3>
                      <div className="space-y-1">
                        <Button 
                          variant={activeTool === 'chat' ? 'secondary' : 'ghost'} 
                          className="w-full justify-start" 
                          size="sm"
                          onClick={() => activateTool('chat')}
                        >
                          <Bot className="h-4 w-4 mr-2" />
                          <TranslatableText text="Chat" spanish="Chat" language={language} />
                        </Button>
                        <Button 
                          variant={activeTool === 'qr-scan' ? 'secondary' : 'ghost'} 
                          className="w-full justify-start" 
                          size="sm"
                          onClick={() => activateTool('qr-scan')}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          <TranslatableText text="Scan QR" spanish="Escanear QR" language={language} />
                        </Button>
                        <Button 
                          variant={activeTool === 'qr-generate' ? 'secondary' : 'ghost'} 
                          className="w-full justify-start" 
                          size="sm"
                          onClick={() => activateTool('qr-generate')}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          <TranslatableText text="Generate QR" spanish="Generar QR" language={language} />
                        </Button>
                        <Button 
                          variant={activeTool === 'ar' ? 'secondary' : 'ghost'} 
                          className="w-full justify-start" 
                          size="sm"
                          onClick={() => activateTool('ar')}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          <TranslatableText text="AR Viewer" spanish="Visor AR" language={language} />
                        </Button>
                        <Button 
                          variant={activeTool === 'vr' ? 'secondary' : 'ghost'} 
                          className="w-full justify-start" 
                          size="sm"
                          onClick={() => activateTool('vr')}
                        >
                          <Icons.vr className="h-4 w-4 mr-2" />
                          <TranslatableText text="VR Experience" spanish="Experiencia VR" language={language} />
                        </Button>
                        <Button 
                          variant={activeTool === 'camera' ? 'secondary' : 'ghost'} 
                          className="w-full justify-start" 
                          size="sm"
                          onClick={() => activateTool('camera')}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          <TranslatableText text="Camera" spanish="Cámara" language={language} />
                        </Button>
                        <Button 
                          variant={activeTool === 'audio' ? 'secondary' : 'ghost'} 
                          className="w-full justify-start" 
                          size="sm"
                          onClick={() => activateTool('audio')}
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          <TranslatableText text="Voice Input" spanish="Entrada de Voz" language={language} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Language section */}
                    <div className="px-3 py-2 mt-4">
                      <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                        <TranslatableText text="LANGUAGE" spanish="IDIOMA" language={language} />
                      </h3>
                      <div className="space-y-1">
                        {languages.map((lang) => (
                          <Button 
                            key={lang.code}
                            variant={language === lang.code ? 'secondary' : 'ghost'} 
                            className="w-full justify-start" 
                            size="sm"
                            onClick={() => changeLanguage(lang.code)}
                          >
                            <Languages className="h-4 w-4 mr-2" />
                            {lang.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Toolbar with toggle sidebar */}
              <div className="flex items-center p-2 border-b bg-card/50">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2"
                  onClick={toggleSidebar}
                >
                  {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                
                <div className="flex-1 flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                  <Button 
                    variant={activeTool === 'chat' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => activateTool('chat')}
                    className="px-2 h-8 whitespace-nowrap"
                  >
                    <Bot className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      <TranslatableText text="Chat" spanish="Chat" language={language} />
                    </span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => activateTool('audio')}
                    className="px-2 h-8 whitespace-nowrap"
                  >
                    <Mic className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      <TranslatableText text="Voice" spanish="Voz" language={language} />
                    </span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => activateTool('camera')}
                    className="px-2 h-8 whitespace-nowrap"
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      <TranslatableText text="Camera" spanish="Cámara" language={language} />
                    </span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => activateTool('qr-scan')}
                    className="px-2 h-8 whitespace-nowrap"
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      <TranslatableText text="Scan QR" spanish="Escanear QR" language={language} />
                    </span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => activateTool('qr-generate')}
                    className="px-2 h-8 whitespace-nowrap"
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      <TranslatableText text="Create QR" spanish="Crear QR" language={language} />
                    </span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => activateTool('ar')}
                    className="px-2 h-8 whitespace-nowrap"
                  >
                    <Package className="h-4 w-4 mr-1" />
                    <span className="text-xs">
                      <TranslatableText text="AR View" spanish="Vista AR" language={language} />
                    </span>
                  </Button>
                </div>
                
                {/* Language selector for mobile */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-1">
                      <Languages className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-auto max-h-[40vh]">
                    <div className="grid grid-cols-2 gap-2 mt-6">
                      {languages.map((lang) => (
                        <SheetClose asChild key={lang.code}>
                          <Button 
                            variant={language === lang.code ? 'default' : 'outline'} 
                            className="w-full justify-start" 
                            onClick={() => changeLanguage(lang.code)}
                          >
                            <Languages className="h-4 w-4 mr-2" />
                            {lang.name}
                          </Button>
                        </SheetClose>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              
              {/* Dynamic content area */}
              <div className="flex-1 overflow-hidden relative">
                {/* Chat Interface */}
                {activeTool === 'chat' && (
                  <ZoomStyleChat 
                    ref={chatRef}
                    initialOpen={true}
                    defaultLanguage={language}
                  />
                )}
                
                {/* QR Scanner */}
                {activeTool === 'qr-scan' && (
                  <QrScanner 
                    onQrCodeScanned={handleQrCodeScanned} 
                    onCancel={resetToChat} 
                  />
                )}
                
                {/* QR Generator */}
                {activeTool === 'qr-generate' && (
                  <QrGenerator 
                    onCancel={resetToChat} 
                    language={language} 
                  />
                )}
                
                {/* AR Viewer */}
                {activeTool === 'ar' && (
                  <ArViewer 
                    cryptoSymbol={selectedCryptoSymbol} 
                    onCancel={resetToChat} 
                  />
                )}
                
                {/* VR Viewer */}
                {activeTool === 'vr' && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="p-8 text-center max-w-md">
                      <Icons.vr className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-xl font-bold mb-2">
                        <TranslatableText text="VR Experience" spanish="Experiencia VR" language={language} />
                      </h3>
                      <p className="mb-4 text-muted-foreground">
                        <TranslatableText 
                          text="The VR experience is coming soon. This feature will allow immersive visualization of crypto market data and trends in 3D space."
                          spanish="La experiencia VR estará disponible próximamente. Esta función permitirá una visualización inmersiva de datos del mercado de criptomonedas y tendencias en espacio 3D."
                          language={language}
                        />
                      </p>
                      <Button onClick={resetToChat}>
                        <TranslatableText text="Return to Chat" spanish="Volver al Chat" language={language} />
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Camera Input */}
                {activeTool === 'camera' && (
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">
                        <TranslatableText text="Image Analysis" spanish="Análisis de Imagen" language={language} />
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        <TranslatableText 
                          text="Capture or upload an image to analyze crypto charts, QR codes, or other visuals."
                          spanish="Capture o suba una imagen para analizar gráficos de criptomonedas, códigos QR u otros elementos visuales."
                          language={language}
                        />
                      </p>
                    </div>
                    <CameraInput 
                      onCapture={handleImageCapture}
                      language={language}
                    />
                  </div>
                )}
                
                {/* Audio Input */}
                {activeTool === 'audio' && (
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">
                        <TranslatableText text="Voice Input" spanish="Entrada de Voz" language={language} />
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        <TranslatableText 
                          text="Record or upload audio to transcribe and send to the chatbot."
                          spanish="Grabe o suba un audio para transcribir y enviar al chatbot."
                          language={language}
                        />
                      </p>
                    </div>
                    <AudioInput 
                      onTranscription={handleAudioTranscription}
                      language={language}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}