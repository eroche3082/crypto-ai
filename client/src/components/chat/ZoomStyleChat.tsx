import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TranslatableText } from "@/components/language/TranslatableText";
import { Icons } from "@/components/ui/icons";
import { v4 as uuidv4 } from 'uuid';
import CameraInput from '../multimodal/CameraInput';
import AudioInput from '../multimodal/AudioInput';

// Define message types
interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  aiProvider?: 'Gemini' | 'OpenAI' | 'Claude';
  contentType?: 'text' | 'image' | 'qr' | 'audio' | 'chart' | 'market_analysis';
  metadata?: {
    source?: string;
    sentiment?: {
      score: number;
      sentiment: 'positive' | 'negative' | 'neutral';
      confidence: number;
    };
    imageUrl?: string;
    audioUrl?: string;
    [key: string]: any;
  };
}

interface ZoomStyleChatProps {
  initialOpen?: boolean;
  defaultLanguage?: string;
}

// Define the ref interface with exposed methods
export interface ZoomStyleChatRef {
  handleMultimodalInput: (content: string) => void;
}

// The avatar SVG path is dynamic based on where the file was created earlier
const DEFAULT_HUMAN_AVATAR = '/assets/default-human-avatar.svg';
const DEFAULT_BOT_AVATAR = '/assets/default-bot-avatar.svg';

const ZoomStyleChat = forwardRef<ZoomStyleChatRef, ZoomStyleChatProps>(
  ({ initialOpen = false, defaultLanguage = 'en' }, ref) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [aiProvider, setAiProvider] = useState<'Gemini' | 'OpenAI' | 'Claude'>('Gemini');
    const [isMicActive, setIsMicActive] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [language, setLanguage] = useState(defaultLanguage);
    const [showMultimodal, setShowMultimodal] = useState(false);
    const [multimodalTab, setMultimodalTab] = useState('camera');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      handleMultimodalInput: (content: string) => {
        // Set the message text and trigger send
        setMessage(content);
        // Use setTimeout to ensure state update before sending
        setTimeout(() => {
          handleSendMessage(content);
        }, 100);
      }
    }));

    useEffect(() => {
      if (isOpen && messages.length === 0) {
        // Add initial greeting message
        setTimeout(() => {
          const botMessage: Message = {
            id: uuidv4(),
            sender: 'bot',
            text: language === 'es' 
              ? '¡Hola! Soy CryptoBot, tu asistente de IA para información de criptomonedas. ¿En qué puedo ayudarte hoy?' 
              : 'Hello! I am CryptoBot, your AI assistant for cryptocurrency information. How can I help you today?',
            timestamp: new Date(),
            aiProvider: 'Gemini'
          };
          setMessages([botMessage]);
        }, 500);
      }
    }, [isOpen, messages.length, language]);

    useEffect(() => {
      // Scroll to the end whenever messages change
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [messages]);

    const handleToggleChatbot = () => {
      setIsOpen(!isOpen);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    const handleSendMessage = async (customMessage?: string) => {
      const messageToSend = customMessage || message;
      if (!messageToSend.trim()) return;

      // Create a new user message
      const userMessage: Message = {
        id: uuidv4(),
        sender: 'user',
        text: messageToSend,
        timestamp: new Date()
      };

      // Add user message to chat
      setMessages(prev => [...prev, userMessage]);
      
      // Clear input
      setMessage('');
      
      // Show typing indicator
      setIsTyping(true);
      
      try {
        // Determine which API endpoint to use based on selected provider
        let endpoint = '';
        switch (aiProvider) {
          case 'Claude':
            endpoint = '/api/ai/claude';
            break;
          case 'OpenAI':
            endpoint = '/api/ai/openai';
            break;
          case 'Gemini':
          default:
            endpoint = '/api/ai/gemini';
            break;
        }
        
        // Send request to API
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: messageToSend,
            language,
            model: aiProvider.toLowerCase()
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide typing indicator
        setIsTyping(false);
        
        // Create AI response message
        const botMessage: Message = {
          id: uuidv4(),
          sender: 'bot',
          text: data.response || 'Sorry, I couldn\'t generate a response.',
          timestamp: new Date(),
          aiProvider
        };
        
        // Add bot message to chat
        setMessages(prev => [...prev, botMessage]);
        
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Hide typing indicator
        setIsTyping(false);
        
        // Show error message
        const errorMessage: Message = {
          id: uuidv4(),
          sender: 'bot',
          text: `Error: ${error instanceof Error ? error.message : 'Something went wrong. Please try again.'}`,
          timestamp: new Date(),
          aiProvider
        };
        
        setMessages(prev => [...prev, errorMessage]);
        
        toast({
          title: 'Message Error',
          description: 'Failed to get a response. Please try again later.',
          variant: 'destructive',
        });
      }
    };

    const handleMicToggle = () => {
      setIsMicActive(!isMicActive);
      // If turning on microphone, show the multimodal panel with audio tab
      if (!isMicActive) {
        setShowMultimodal(true);
        setMultimodalTab('audio');
      }
    };

    // Handle multimodal content capture
    const handleMultimodalCapture = (content: string, type: 'text' | 'image' | 'qr' | 'audio') => {
      let prefix = '';
      
      switch (type) {
        case 'image':
          prefix = 'Image analysis: ';
          break;
        case 'qr':
          prefix = 'QR code scanned: ';
          break;
        case 'audio':
          prefix = 'Transcription: ';
          break;
        default:
          prefix = '';
      }
      
      // Set the message with the captured content
      setMessage(`${prefix}${content}`);
      
      // Hide the multimodal input after capture
      setShowMultimodal(false);
    };

    const handleToggleFullscreen = () => {
      setIsFullscreen(!isFullscreen);
    };

    const renderSenderBadge = (sender: 'bot' | 'user', aiProvider?: 'Gemini' | 'OpenAI' | 'Claude') => {
      if (sender === 'bot') {
        return (
          <Badge variant="outline" className="text-xs px-2 py-0 h-5">
            {aiProvider || 'AI'}
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="text-xs px-2 py-0 h-5">
          <TranslatableText text="You" spanish="Tú" language={language} />
        </Badge>
      );
    };

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex flex-col"
        >
          <div 
            className="bg-card text-card-foreground rounded-lg overflow-hidden flex flex-col h-full w-full"
          >
            {/* Chat header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center">
                <Icons.logo className="h-6 w-6 mr-2" />
                <h3 className="font-semibold">
                  <TranslatableText text="CryptoBot Assistant" spanish="Asistente CryptoBot" language={language} />
                </h3>
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleToggleFullscreen}
                      >
                        {isFullscreen ? <Icons.minimize className="h-4 w-4" /> : <Icons.maximize className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        <TranslatableText 
                          text={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} 
                          spanish={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"} 
                          language={language}
                        />
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icons.close className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        <TranslatableText text="Close" spanish="Cerrar" language={language} />
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] flex ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div 
                        className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ${msg.sender === 'user' ? 'ml-2' : 'mr-2'}`}
                      >
                        <img 
                          src={msg.sender === 'user' ? DEFAULT_HUMAN_AVATAR : DEFAULT_BOT_AVATAR} 
                          alt={msg.sender === 'user' ? 'User' : 'Bot'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className={`flex items-center mb-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {renderSenderBadge(msg.sender, msg.aiProvider)}
                          <span className="text-xs text-muted-foreground ml-2">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div 
                          className={`
                            rounded-lg p-3 
                            ${msg.sender === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                            }
                          `}
                        >
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] flex flex-row">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2">
                        <img 
                          src={DEFAULT_BOT_AVATAR} 
                          alt="Bot" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center mb-1 justify-start">
                          <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                            {aiProvider}
                          </Badge>
                        </div>
                        <div className="rounded-lg p-3 bg-muted">
                          <div className="flex items-center">
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messageEndRef} />
              </div>
            </div>
            
            {/* Multimodal inputs */}
            {showMultimodal && (
              <div className="multimodal-container p-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">
                    <TranslatableText text="Multimodal Input" spanish="Entrada multimodal" language={language} />
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowMultimodal(false)}
                  >
                    <Icons.close className="h-4 w-4" />
                  </Button>
                </div>
                
                <Tabs value={multimodalTab} onValueChange={setMultimodalTab} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="camera" className="flex flex-col items-center gap-1 py-2">
                      <Icons.camera className="h-4 w-4" />
                      <span className="text-xs">
                        <TranslatableText text="Camera" spanish="Cámara" language={language} />
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="qr" className="flex flex-col items-center gap-1 py-2">
                      <Icons.qrCode className="h-4 w-4" />
                      <span className="text-xs">
                        <TranslatableText text="QR Code" spanish="Código QR" language={language} />
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="flex flex-col items-center gap-1 py-2">
                      <Icons.mic className="h-4 w-4" />
                      <span className="text-xs">
                        <TranslatableText text="Audio" spanish="Audio" language={language} />
                      </span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="camera">
                    <CameraInput 
                      onCapture={(imageData) => handleMultimodalCapture(imageData, 'image')} 
                      language={language} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="qr">
                    <div className="text-center p-4 border rounded-md">
                      <Icons.qrCode className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        <TranslatableText 
                          text="Upload QR code to scan" 
                          spanish="Cargar código QR para escanear" 
                          language={language}
                        />
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => {
                          toast({
                            title: 'QR Scanner',
                            description: 'Use the dedicated QR Scanner from the toolbar for better scanning experience.',
                          });
                          setShowMultimodal(false);
                        }}
                      >
                        <TranslatableText text="Open QR Scanner" spanish="Abrir escáner QR" language={language} />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="audio">
                    <AudioInput 
                      onTranscription={(transcription) => handleMultimodalCapture(transcription, 'audio')} 
                      language={language}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
            
            {/* Chat input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Textarea 
                    placeholder={
                      language === 'es' 
                        ? 'Escribe tu mensaje aquí...' 
                        : 'Type your message here...'
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => setShowMultimodal(prev => !prev)}
                              className={showMultimodal ? 'bg-secondary' : ''}
                            >
                              <Icons.camera className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              <TranslatableText text="Camera/Image" spanish="Cámara/Imagen" language={language} />
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={handleMicToggle}
                              className={isMicActive ? 'bg-secondary' : ''}
                            >
                              <Icons.mic className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              <TranslatableText text="Voice Input" spanish="Entrada de voz" language={language} />
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Icons.qrCode className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              <TranslatableText text="QR Code" spanish="Código QR" language={language} />
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <div>
                      <Tabs defaultValue={aiProvider.toLowerCase()} onValueChange={(value) => setAiProvider(value as 'Gemini' | 'OpenAI' | 'Claude')}>
                        <TabsList className="h-8 p-1">
                          <TabsTrigger value="Gemini" className="text-xs px-2 h-6">Gemini</TabsTrigger>
                          <TabsTrigger value="OpenAI" className="text-xs px-2 h-6">GPT</TabsTrigger>
                          <TabsTrigger value="Claude" className="text-xs px-2 h-6">Claude</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="self-end h-10"
                  disabled={!message.trim()}
                  onClick={() => handleSendMessage()}
                >
                  <Icons.send className="h-4 w-4 mr-2" />
                  <TranslatableText text="Send" spanish="Enviar" language={language} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
);

ZoomStyleChat.displayName = 'ZoomStyleChat';

export default ZoomStyleChat;