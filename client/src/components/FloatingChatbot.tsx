import React, { useState, useEffect, useRef } from 'react';
import { Bot, Share, Volume2, VolumeX, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Tab, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/ui/icons';
import ZoomStyleChat from './chat/ZoomStyleChat';
import QrScanner from './QrScanner';
import QrGenerator from './QrGenerator';
import ArViewer from './ArViewer';

interface FloatingChatbotProps {
  defaultLanguage?: string;
  className?: string;
}

type ActiveToolType = 'chat' | 'qr-scan' | 'qr-generate' | 'ar' | 'vr' | null;

export default function FloatingChatbot({ 
  defaultLanguage = 'en',
  className = ''
}: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeTool, setActiveTool] = useState<ActiveToolType>('chat');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState('BTC');
  const { toast } = useToast();

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
    setIsExpanded(!isExpanded);
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

  // Function to activate different tools
  const activateTool = (tool: ActiveToolType) => {
    setActiveTool(tool);
  };

  // Handle QR code scanning result
  const handleQrCodeScanned = (qrData: string) => {
    // Process the scanned QR data
    toast({
      title: 'QR Code Scanned',
      description: `Data captured: ${qrData.substring(0, 30)}${qrData.length > 30 ? '...' : ''}`,
    });
    
    // Return to chat with the QR data
    setActiveTool('chat');
    
    // Here we would typically send the QR data to the chat
    // This would require modifying the ZoomStyleChat component to accept initial messages
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

  return (
    <>
      {/* Floating button */}
      <div 
        className={`fixed bottom-4 right-4 z-50 safe-area-padding ${className}`}
      >
        <Button 
          onClick={handleToggle}
          size="lg"
          className="rounded-full h-12 w-12 sm:h-14 sm:w-14 shadow-lg"
        >
          <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
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
          className={`p-0 ${isExpanded ? 'fixed inset-0 w-full h-full max-w-none rounded-none' : 'w-[95vw] sm:max-w-[95vw] md:max-w-[90vw] h-[80vh] sm:h-[90vh] md:h-[95vh]'} flex flex-col`}
        >
          {/* Header with controls */}
          <div className="flex items-center justify-between p-2 sm:p-3 bg-primary/10 border-b">
            <div className="flex items-center">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <h2 className="font-semibold text-sm sm:text-lg">CryptoBot Universal Assistant</h2>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Voice toggle - hidden on small mobile */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleVoice} className="hidden sm:flex">
                      {voiceEnabled ? (
                        <Icons.volumeOn className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Icons.volumeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{voiceEnabled ? 'Disable voice' : 'Enable voice'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Fullscreen toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                      {isExpanded ? (
                        <Icons.minimize className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Icons.maximize className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isExpanded ? 'Exit fullscreen' : 'Fullscreen'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Settings button - hidden on small mobile */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                      <Icons.settings className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Close button */}
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <Icons.close className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
          
          {/* Toolbar - scrollable on mobile */}
          <div className="flex items-center justify-between p-1 sm:p-2 border-b bg-card/50 overflow-x-auto scrollbar-hide">
            <div className="flex gap-0.5 sm:gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={activeTool === 'chat' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      onClick={() => activateTool('chat')}
                      className="px-1.5 sm:px-2 h-7 sm:h-8 whitespace-nowrap"
                    >
                      <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs">Chat</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI Chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={activeTool === 'qr-scan' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      onClick={() => activateTool('qr-scan')}
                      className="px-1.5 sm:px-2 h-7 sm:h-8 whitespace-nowrap"
                    >
                      <Icons.qrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs">Scan QR</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Scan QR Code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={activeTool === 'qr-generate' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      onClick={() => activateTool('qr-generate')}
                      className="px-1.5 sm:px-2 h-7 sm:h-8 whitespace-nowrap"
                    >
                      <Icons.qrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs">Create QR</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate QR Code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={activeTool === 'ar' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      onClick={() => activateTool('ar')}
                      className="px-1.5 sm:px-2 h-7 sm:h-8 whitespace-nowrap"
                    >
                      <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs">AR View</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Augmented Reality View</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Only show voice input option on mobile, others only on larger screens */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-8 h-7 sm:h-8 sm:px-2"
                      aria-label="Voice Input"
                    >
                      <Icons.mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Voice Input</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-8 h-7 sm:h-8 sm:px-2 hidden sm:flex"
                      aria-label="Camera Input"
                    >
                      <Icons.camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Camera Input</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-8 h-7 sm:h-8 sm:px-2 hidden sm:flex"
                      aria-label="Upload File"
                    >
                      <Icons.plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload File</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-8 h-7 sm:h-8 sm:px-2"
                      aria-label="Share Conversation"
                    >
                      <Icons.share className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share Conversation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden relative">
            {/* Chat Interface */}
            {activeTool === 'chat' && (
              <ZoomStyleChat 
                initialOpen={true}
                defaultLanguage={defaultLanguage}
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
                language={defaultLanguage} 
              />
            )}
            
            {/* AR Viewer */}
            {activeTool === 'ar' && (
              <ArViewer 
                cryptoSymbol={selectedCryptoSymbol} 
                onCancel={resetToChat} 
              />
            )}
            
            {/* VR Viewer would go here */}
            {activeTool === 'vr' && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="p-8 text-center max-w-md">
                  <Icons.vr className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-xl font-bold mb-2">VR Experience</h3>
                  <p className="mb-4 text-muted-foreground">
                    The VR experience is coming soon. This feature will allow immersive
                    visualization of crypto market data and trends in 3D space.
                  </p>
                  <Button onClick={resetToChat}>
                    Return to Chat
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}