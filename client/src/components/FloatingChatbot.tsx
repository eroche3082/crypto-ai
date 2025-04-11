import { useState, useEffect, useRef } from "react";
import { useGemini } from "@/contexts/GeminiContext";
// Using language directly from GeminiContext
import { 
  MessageSquare, X, Settings, Mic, Camera, 
  Languages, QrCode, Box, Sparkles, Send 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MessageInput from "@/components/MessageInput";
import QuickPrompts from "@/components/QuickPrompts";
import { SpeechButton } from "@/components/SpeechButton";
import { useToast } from "@/hooks/use-toast";
import AudioRecorder from "@/components/AudioRecorder";
import CameraCapture from "@/components/CameraCapture";
import QrScanner from "@/components/QrScanner";
import ArViewer from "@/components/ArViewer";

// Define message type
interface Message {
  role: "user" | "bot";
  content: string;
}

export default function FloatingChatbot() {
  const { generateResponse, isLoading, model, setModel, language, setLanguage } = useGemini();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Tool states
  const [activeToolType, setActiveToolType] = useState<'audio' | 'camera' | 'qr' | 'ar' | null>(null);
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState("BTC");

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Add welcome message on first open
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      // Get welcome message based on language
      let welcomeText = "Hi! I'm CryptoBot, your AI crypto assistant. How can I help you today?";
      
      if (language === "es") {
        welcomeText = "¡Hola! Soy CryptoBot, tu asistente de criptomonedas con IA. ¿En qué puedo ayudarte hoy?";
      } else if (language === "fr") {
        welcomeText = "Bonjour! Je suis CryptoBot, votre assistant crypto IA. Comment puis-je vous aider aujourd'hui?";
      } else if (language === "pt") {
        welcomeText = "Olá! Eu sou CryptoBot, seu assistente de criptomoedas com IA. Como posso ajudá-lo hoje?";
      }
      
      const welcomeMessage = {
        role: "bot" as const,
        content: welcomeText
      };
      setMessages([welcomeMessage]);
    }
  }, [isChatOpen, messages.length, language]);

  // Handle sending a new message
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message to chat
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputDisabled(true);

    try {
      // Generate AI response
      const response = await generateResponse(text, messages);
      
      // Add bot message to chat
      const botMessage: Message = { role: "bot", content: response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      
      // Add error message to chat
      const errorMessage: Message = { 
        role: "bot", 
        content: "Sorry, I encountered an error processing your request. Please try again."
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "AI Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInputDisabled(false);
    }
  };

  // Handle selecting a quick prompt
  const handleSelectPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    
    // Get welcome message based on language
    let clearText = "Chat history cleared. How can I help you today?";
    
    if (language === "es") {
      clearText = "Historial de chat borrado. ¿En qué puedo ayudarte hoy?";
    } else if (language === "fr") {
      clearText = "Historique de chat effacé. Comment puis-je vous aider aujourd'hui?";
    } else if (language === "pt") {
      clearText = "Histórico de chat apagado. Como posso ajudá-lo hoje?";
    }
    
    // Add welcome message
    const welcomeMessage = {
      role: "bot" as const,
      content: clearText
    };
    setMessages([welcomeMessage]);
  };
  
  // Audio recorder handlers
  const handleOpenAudioRecorder = () => {
    setActiveToolType('audio');
  };
  
  const handleAudioCaptured = (audioBlob: Blob) => {
    // In a real implementation, you would process the audio by sending to an API
    // For now, we'll just add a message indicating audio was captured
    const audioMessage: Message = { 
      role: "user", 
      content: "🎤 [Audio message submitted for analysis]" 
    };
    setMessages((prev) => [...prev, audioMessage]);
    
    // Close audio recorder
    setActiveToolType(null);
    
    // Simulate AI response with delay
    setInputDisabled(true);
    setTimeout(() => {
      const botMessage: Message = { 
        role: "bot", 
        content: "I've analyzed your audio message. It sounds like you're asking about recent market trends. Bitcoin has shown some volatility lately with a 5% fluctuation in the past 24 hours." 
      };
      setMessages((prev) => [...prev, botMessage]);
      setInputDisabled(false);
    }, 2000);
  };
  
  // Camera handlers
  const handleOpenCamera = () => {
    setActiveToolType('camera');
  };
  
  const handleImageCaptured = async (imageBlob: Blob, imageUrl: string) => {
    // Add user message with image preview
    const imageMessage: Message = { 
      role: "user", 
      content: `📷 [Image captured for analysis]\n\n<img src="${imageUrl}" alt="Image analysis" style="max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px;" />` 
    };
    setMessages((prev) => [...prev, imageMessage]);
    
    // Close camera
    setActiveToolType(null);
    
    // Show loading state
    setInputDisabled(true);
    
    try {
      // Create a FormData object to send the image
      const formData = new FormData();
      formData.append('image', imageBlob, 'image.jpg');
      
      // Send the image to the server for Vision API analysis
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }
      
      // Get the analysis results
      const analysisResults = await response.json();
      
      // Format the response based on the analysis results
      let responseMessage = "I've analyzed your image using Google Vision AI. ";
      
      // Add text detection results if available
      if (analysisResults.text) {
        responseMessage += `\n\n**Text detected:** "${analysisResults.text}"`;
      }
      
      // Add logo detection results if available
      if (analysisResults.logos && analysisResults.logos.length > 0) {
        responseMessage += "\n\n**Logos detected:** ";
        analysisResults.logos.forEach((logo: any, index: number) => {
          responseMessage += `${logo.description}${index < analysisResults.logos.length - 1 ? ', ' : ''}`;
        });
      }
      
      // Add label detection results if available
      if (analysisResults.labels && analysisResults.labels.length > 0) {
        responseMessage += "\n\n**Content labels:** ";
        analysisResults.labels.forEach((label: any, index: number) => {
          responseMessage += `${label.description}${index < analysisResults.labels.length - 1 ? ', ' : ''}`;
        });
      }
      
      // Add landmark detection results if available
      if (analysisResults.landmarks && analysisResults.landmarks.length > 0) {
        responseMessage += "\n\n**Landmarks recognized:** ";
        analysisResults.landmarks.forEach((landmark: any, index: number) => {
          responseMessage += `${landmark.description}${index < analysisResults.landmarks.length - 1 ? ', ' : ''}`;
        });
      }
      
      // Add face detection results if available
      if (analysisResults.faces) {
        responseMessage += `\n\n**Faces detected:** ${analysisResults.faces.count} face(s)`;
      }
      
      // Add cryptocurrency-specific analysis if relevant terms are detected
      const cryptoTerms = ['bitcoin', 'ethereum', 'cryptocurrency', 'chart', 'blockchain', 'token', 'mining'];
      const detectedCryptoTerms = cryptoTerms.filter(term => 
        analysisResults.text?.toLowerCase().includes(term) || 
        analysisResults.labels?.some((label: any) => label.description.toLowerCase().includes(term))
      );
      
      if (detectedCryptoTerms.length > 0) {
        responseMessage += "\n\n**Crypto relevance:** This image appears to be related to cryptocurrency. I can provide more information about specific cryptocurrencies if you'd like.";
      }
      
      const botMessage: Message = { 
        role: "bot", 
        content: responseMessage 
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      const errorMessage: Message = { 
        role: "bot", 
        content: "Sorry, I encountered an error while analyzing your image. Please try again or upload a different image." 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setInputDisabled(false);
    }
  };
  
  // QR Scanner handlers
  const handleOpenQrScanner = () => {
    setActiveToolType('qr');
  };
  
  const handleQrCodeScanned = (qrData: string) => {
    // In a real implementation, you would process the QR data
    // For now, we'll just add the QR data to the chat
    const qrMessage: Message = { 
      role: "user", 
      content: `QR Code scanned: ${qrData}` 
    };
    setMessages((prev) => [...prev, qrMessage]);
    
    // Close QR scanner
    setActiveToolType(null);
    
    // Simulate AI response with delay
    setInputDisabled(true);
    setTimeout(() => {
      const botMessage: Message = { 
        role: "bot", 
        content: `I've analyzed the wallet address from your QR code (${qrData.substring(0, 10)}...). This appears to be a valid Ethereum address. Would you like me to check the balance or recent transactions for this address?` 
      };
      setMessages((prev) => [...prev, botMessage]);
      setInputDisabled(false);
    }, 2000);
  };
  
  // AR Viewer handlers
  const handleOpenArViewer = () => {
    setActiveToolType('ar');
  };
  
  const handleCancelTool = () => {
    setActiveToolType(null);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 ${isChatOpen ? 'hidden' : 'flex'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Active tool overlay */}
      {isChatOpen && activeToolType === 'audio' && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <AudioRecorder onAudioCaptured={handleAudioCaptured} onCancel={handleCancelTool} />
        </div>
      )}
      
      {isChatOpen && activeToolType === 'camera' && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <CameraCapture onImageCaptured={handleImageCaptured} onCancel={handleCancelTool} />
        </div>
      )}
      
      {isChatOpen && activeToolType === 'qr' && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <QrScanner onQrCodeScanned={handleQrCodeScanned} onCancel={handleCancelTool} />
        </div>
      )}
      
      {isChatOpen && activeToolType === 'ar' && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <ArViewer cryptoSymbol={selectedCryptoSymbol} onCancel={handleCancelTool} />
        </div>
      )}
      
      {/* Chat overlay */}
      {isChatOpen && !activeToolType && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          {/* Chat header */}
          <div className="border-b py-4 px-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-3">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold">CryptoBot Assistant</h2>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                  Gemini AI
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground"
                onClick={clearChat}
              >
                Clear
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsChatOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Chat messages */}
            <div className="flex-1 flex flex-col min-h-0">
              <div 
                ref={chatRef}
                className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {message.role === 'bot' && (
                        <div className="flex items-center justify-between mb-1 text-xs font-medium text-muted-foreground">
                          <span className="mr-1">Gemini AI</span>
                          <SpeechButton 
                            text={message.content} 
                            language={language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'pt-BR'} 
                            compact 
                          />
                        </div>
                      )}
                      <div 
                        className="whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: message.content }}
                      ></div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground max-w-[80%] rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300"></div>
                        <span className="text-sm text-muted-foreground ml-1">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick prompts */}
              <div className="px-6 py-2 border-t">
                <QuickPrompts onSelectPrompt={handleSelectPrompt} />
              </div>

              {/* Input area */}
              <div className="p-4 border-t">
                <MessageInput 
                  onSendMessage={handleSendMessage} 
                  disabled={inputDisabled || isLoading} 
                  onToolClick={(toolType) => setActiveToolType(toolType)}
                />
              </div>
            </div>

            {/* Side panel (on larger screens) */}
            <div className="hidden md:block w-80 border-l overflow-y-auto">
              <Tabs defaultValue="settings">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Language</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={language === 'en' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setLanguage('en')}
                        className="justify-start"
                      >
                        <Languages className="mr-2 h-4 w-4" />
                        English
                      </Button>
                      <Button 
                        variant={language === 'es' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setLanguage('es')}
                        className="justify-start"
                      >
                        <Languages className="mr-2 h-4 w-4" />
                        Español
                      </Button>
                      <Button 
                        variant={language === 'fr' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setLanguage('fr')}
                        className="justify-start"
                      >
                        <Languages className="mr-2 h-4 w-4" />
                        Français
                      </Button>
                      <Button 
                        variant={language === 'pt' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setLanguage('pt')}
                        className="justify-start"
                      >
                        <Languages className="mr-2 h-4 w-4" />
                        Português
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">AI Model</h3>
                    <div className="space-y-2">
                      <Button 
                        variant={model === 'gemini-1.5-pro' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setModel('gemini-1.5-pro')}
                        className="w-full justify-start"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gemini 1.5 Pro
                      </Button>
                      <Button 
                        variant={model === 'gemini-1.5-flash' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setModel('gemini-1.5-flash')}
                        className="w-full justify-start"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gemini 1.5 Flash
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tools" className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex flex-col h-auto py-3"
                      onClick={handleOpenAudioRecorder}
                    >
                      <Mic className="h-5 w-5 mb-1" />
                      <span className="text-xs">Audio</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex flex-col h-auto py-3"
                      onClick={handleOpenCamera}
                    >
                      <Camera className="h-5 w-5 mb-1" />
                      <span className="text-xs">Camera</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex flex-col h-auto py-3"
                      onClick={handleOpenQrScanner}
                    >
                      <QrCode className="h-5 w-5 mb-1" />
                      <span className="text-xs">QR</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex flex-col h-auto py-3"
                      onClick={handleOpenArViewer}
                    >
                      <Box className="h-5 w-5 mb-1" />
                      <span className="text-xs">AR</span>
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Tool Information</h3>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>
                        <strong>Audio:</strong> Record voice messages or analyze audio files.
                      </p>
                      <p>
                        <strong>Camera:</strong> Take pictures or analyze images with AI.
                      </p>
                      <p>
                        <strong>QR:</strong> Scan QR codes to quickly access crypto addresses.
                      </p>
                      <p>
                        <strong>AR:</strong> View crypto assets in augmented reality.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Your conversation history will be displayed here.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </>
  );
}