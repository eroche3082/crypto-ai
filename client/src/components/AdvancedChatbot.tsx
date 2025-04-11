import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Camera, QrCode, Bot, X, Loader2, ChevronDown, ChevronUp, Image, Globe, LineChart, Volume2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MultimodalInput from './multimodal/MultimodalInput';
import CameraInput from './multimodal/CameraInput';
import AudioInput from './multimodal/AudioInput';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
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

interface AdvancedChatbotProps {
  defaultLanguage?: string;
  isFullscreen?: boolean;
  onClose?: () => void;
  className?: string;
}

const aiModels = [
  { id: 'gemini', name: 'Gemini', description: 'Google Gemini AI' },
  { id: 'claude', name: 'Claude', description: 'Anthropic Claude AI' },
  { id: 'openai', name: 'GPT-4', description: 'OpenAI GPT-4' },
];

const languageOptions = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' },
];

export default function AdvancedChatbot({ 
  defaultLanguage = 'en',
  isFullscreen = false,
  onClose,
  className = ''
}: AdvancedChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [language, setLanguage] = useState(defaultLanguage);
  const [showSettings, setShowSettings] = useState(false);
  const [showMultimodal, setShowMultimodal] = useState(false);
  const [multimodalTab, setMultimodalTab] = useState('camera');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: language === 'es' 
            ? '¡Hola! Soy tu asistente de criptomonedas. ¿En qué puedo ayudarte hoy?' 
            : 'Hello! I\'m your cryptocurrency assistant. How can I help you today?',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Send message to API
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Determine which API endpoint to use based on selected model
      let endpoint = '';
      switch (selectedModel) {
        case 'claude':
          endpoint = '/api/ai/claude';
          break;
        case 'openai':
          endpoint = '/api/ai/openai';
          break;
        case 'gemini':
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
          prompt: messageText,
          language,
          model: selectedModel
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || 'Sorry, I couldn\'t generate a response.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Something went wrong. Please try again.'}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Message Error',
        description: 'Failed to get a response. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
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
    
    // Temporarily set the input value to the captured content
    setInput(`${prefix}${content}`);
    
    // Send the message with the captured content
    sendMessage(`${prefix}${content}`);
    
    // Hide the multimodal input after capture
    setShowMultimodal(false);
  };

  // Format message content with markdown
  const formatMessageContent = (content: string) => {
    return { __html: content.replace(/\n/g, '<br />') };
  };

  return (
    <Card className={`chatbot-container ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full'} ${className}`}>
      <CardHeader className="border-b p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5" />
            {language === 'es' ? 'Asistente CryptoBot' : 'CryptoBot Assistant'}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {isFullscreen && onClose && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {showSettings && (
          <div className="settings-panel mt-4 grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {language === 'es' ? 'Modelo de IA' : 'AI Model'}
              </label>
              <Select 
                value={selectedModel} 
                onValueChange={setSelectedModel}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiModels.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">
                {language === 'es' ? 'Idioma' : 'Language'}
              </label>
              <Select 
                value={language} 
                onValueChange={setLanguage}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0 flex-grow">
        <ScrollArea className="h-[400px] md:h-[500px] px-4 py-4">
          <div className="flex flex-col gap-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`
                  ${message.role === 'user' ? 'ml-auto' : 'mr-auto'} 
                  max-w-[80%]
                `}
              >
                <div 
                  className={`
                    p-3 rounded-lg 
                    ${message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                    }
                  `}
                >
                  <div 
                    className="message-content"
                    dangerouslySetInnerHTML={formatMessageContent(message.content)} 
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto max-w-[80%]">
                <div className="p-3 rounded-lg bg-secondary text-secondary-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {language === 'es' ? 'Pensando...' : 'Thinking...'}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      {showMultimodal && (
        <div className="multimodal-container p-4 border-t">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">
              {language === 'es' ? 'Entrada multimodal' : 'Multimodal Input'}
            </h3>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowMultimodal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs value={multimodalTab} onValueChange={setMultimodalTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="camera" className="flex flex-col items-center gap-1 py-2">
                <Camera className="h-4 w-4" />
                <span className="text-xs">{language === 'es' ? 'Cámara' : 'Camera'}</span>
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex flex-col items-center gap-1 py-2">
                <QrCode className="h-4 w-4" />
                <span className="text-xs">{language === 'es' ? 'QR' : 'QR Code'}</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex flex-col items-center gap-1 py-2">
                <Mic className="h-4 w-4" />
                <span className="text-xs">{language === 'es' ? 'Audio' : 'Audio'}</span>
              </TabsTrigger>
              <TabsTrigger value="chart" className="flex flex-col items-center gap-1 py-2">
                <LineChart className="h-4 w-4" />
                <span className="text-xs">{language === 'es' ? 'Gráfico' : 'Chart'}</span>
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
                <QrCode className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  {language === 'es' 
                    ? 'Cargar código QR para escanear' 
                    : 'Upload QR code to scan'}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => toast({
                    title: 'QR Scanner',
                    description: 'This feature is coming soon',
                  })}
                >
                  {language === 'es' ? 'Cargar imagen' : 'Upload Image'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="audio">
              <AudioInput 
                onTranscription={(text) => handleMultimodalCapture(text, 'audio')} 
                language={language} 
              />
            </TabsContent>
            
            <TabsContent value="chart">
              <div className="text-center p-4 border rounded-md">
                <LineChart className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  {language === 'es' 
                    ? 'Cargar imagen de gráfico para análisis' 
                    : 'Upload chart image for analysis'}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => toast({
                    title: 'Chart Analysis',
                    description: 'This feature is coming soon',
                  })}
                >
                  {language === 'es' ? 'Cargar gráfico' : 'Upload Chart'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'es' ? 'Escribe un mensaje...' : 'Type a message...'}
              className="flex-grow min-h-[60px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          
          <div className="flex justify-between">
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        setShowMultimodal(!showMultimodal);
                        setMultimodalTab('camera');
                      }}
                      className={showMultimodal && multimodalTab === 'camera' ? 'bg-secondary' : ''}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{language === 'es' ? 'Cámara' : 'Camera'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        setShowMultimodal(!showMultimodal);
                        setMultimodalTab('audio');
                      }}
                      className={showMultimodal && multimodalTab === 'audio' ? 'bg-secondary' : ''}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{language === 'es' ? 'Audio' : 'Audio'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        setShowMultimodal(!showMultimodal);
                        setMultimodalTab('qr');
                      }}
                      className={showMultimodal && multimodalTab === 'qr' ? 'bg-secondary' : ''}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{language === 'es' ? 'Código QR' : 'QR Code'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {language === 'es' ? 'Enviar' : 'Send'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}