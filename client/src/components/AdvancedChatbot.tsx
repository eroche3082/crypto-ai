import { useState, useEffect, useRef } from "react";
import { useAdvancedChat } from "../contexts/AdvancedChatContext";
import { useTranslation } from "react-i18next";
import { 
  MessageSquare, X, Settings, Mic, Camera, 
  Languages, QrCode, Box, Sparkles, Send,
  RotateCcw, FileText, Lightbulb, History, 
  BrainCircuit, Info, PanelRight, Download,
  ThumbsUp, ThumbsDown, User, Volume2, Volume1, VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SpeechButton } from "@/components/SpeechButton";
import AudioRecorder from "@/components/AudioRecorder";
import CameraCapture from "@/components/CameraCapture";
import QrScanner from "@/components/QrScanner";
import ArViewer from "@/components/ArViewer";
import { auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

// Avatar animation
const AvatarAnimation = () => {
  return (
    <div className="relative flex items-center justify-center h-full">
      <div className="w-32 h-32 rounded-full bg-primary/20 animate-pulse flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white">
            <BrainCircuit className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Typing indicator
const TypingIndicator = () => {
  return (
    <div className="flex space-x-1 items-center p-2">
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "200ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "400ms" }}></div>
    </div>
  );
};

// Main component
export default function AdvancedChatbot() {
  const { 
    messages, 
    addMessage, 
    clearMessages, 
    isLoading, 
    currentModel, 
    setCurrentModel,
    userPreferences,
    updateUserPreferences,
    generateResponse,
    processSpeechInput,
    processImageInput,
    processQrCode,
    summarizeConversation,
    translateMessage,
    sentiment
  } = useAdvancedChat();
  
  // Local state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeToolType, setActiveToolType] = useState<'audio' | 'camera' | 'qr' | 'ar' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState("BTC");
  const [voiceVolume, setVoiceVolume] = useState(80);
  const [isVoiceActive, setIsVoiceActive] = useState(userPreferences.voiceEnabled);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"chat" | "info">("chat");
  const [feedbackRating, setFeedbackRating] = useState<Record<string, "up" | "down" | null>>({});

  // References
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  
  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Toggle voice output
  const toggleVoice = () => {
    setIsVoiceActive(prev => !prev);
    updateUserPreferences({ voiceEnabled: !isVoiceActive });
  };

  // Add welcome message on first open
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      // Get welcome message based on language
      let welcomeText = "👋 Hi! I'm CryptoBot, your AI crypto assistant. How can I help you today?";
      
      if (userPreferences.language === "es") {
        welcomeText = "👋 ¡Hola! Soy CryptoBot, tu asistente de criptomonedas con IA. ¿En qué puedo ayudarte hoy?";
      } else if (userPreferences.language === "fr") {
        welcomeText = "👋 Bonjour! Je suis CryptoBot, votre assistant crypto IA. Comment puis-je vous aider aujourd'hui?";
      } else if (userPreferences.language === "pt") {
        welcomeText = "👋 Olá! Eu sou CryptoBot, seu assistente de criptomoedas com IA. Como posso ajudá-lo hoje?";
      }
      
      addMessage(welcomeText, "bot", "positive", 0.9);
    }
  }, [isChatOpen, messages.length, userPreferences.language, addMessage]);

  // Handle sending a new message
  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;
    
    // Clear the input
    setInputValue("");
    
    // Analyze sentiment
    const sentimentResult = await sentiment.analyze(text);
    
    // Add user message to chat
    addMessage(text, "user", sentimentResult.sentiment, sentimentResult.confidence);
    
    try {
      // Generate AI response
      const response = await generateResponse(text);
      
      // Add bot message to chat
      addMessage(response, "bot");
      
      // Text-to-speech if enabled
      if (isVoiceActive && userPreferences.voiceEnabled) {
        setTimeout(() => {
          const speechButton = document.getElementById('latest-speech') as HTMLButtonElement;
          if (speechButton) {
            speechButton.click();
          }
        }, 300); // Small delay to ensure the component is fully rendered
      }
    } catch (error) {
      console.error("Error generating response:", error);
      
      toast({
        title: "AI Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      });
      
      addMessage(
        "Sorry, I encountered an error processing your request. Please try again.", 
        "bot",
        "negative",
        0.9
      );
    }
    
    // Focus the input again
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Audio recorder handlers
  const handleOpenAudioRecorder = () => {
    setActiveToolType('audio');
  };
  
  const handleAudioCaptured = async (audioBlob: Blob) => {
    try {
      // Process the audio
      const transcribedText = await processSpeechInput(audioBlob);
      
      if (!transcribedText) {
        toast({
          title: "Transcription Error",
          description: "Could not transcribe your audio. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Set the transcribed text to the input
      setInputValue(transcribedText);
      
      // Close the audio recorder
      setActiveToolType(null);
      
      // Auto-send if the text is significant
      if (transcribedText.length > 5) {
        handleSendMessage(transcribedText);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Audio Processing Error",
        description: "An error occurred while processing your audio.",
        variant: "destructive",
      });
      setActiveToolType(null);
    }
  };
  
  // Camera handlers
  const handleOpenCamera = () => {
    setActiveToolType('camera');
  };
  
  const handleImageCaptured = async (imageBlob: Blob, imageUrl: string) => {
    try {
      // Close camera
      setActiveToolType(null);
      
      // Add user message with image preview
      addMessage(
        `📷 [Image captured for analysis]\n\n<img src="${imageUrl}" alt="Image analysis" style="max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px;" />`,
        "user"
      );
      
      // Process the image
      const analysisResult = await processImageInput(imageBlob);
      
      // Add bot response
      addMessage(analysisResult, "bot");
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Image Processing Error",
        description: "An error occurred while analyzing your image.",
        variant: "destructive",
      });
    }
  };
  
  // QR Scanner handlers
  const handleOpenQrScanner = () => {
    setActiveToolType('qr');
  };
  
  const handleQrCodeScanned = async (qrData: string) => {
    try {
      // Close QR scanner
      setActiveToolType(null);
      
      // Add user message with QR data
      addMessage(`🔍 QR Code scanned: ${qrData}`, "user");
      
      // Process the QR code
      const analysisResult = await processQrCode(qrData);
      
      // Add bot response
      addMessage(analysisResult, "bot");
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast({
        title: "QR Code Processing Error",
        description: "An error occurred while analyzing the QR code.",
        variant: "destructive",
      });
    }
  };
  
  // AR Viewer handlers
  const handleOpenArViewer = () => {
    setActiveToolType('ar');
  };
  
  // Handle tool cancellation
  const handleCancelTool = () => {
    setActiveToolType(null);
  };
  
  // Handle summarizing the conversation
  const handleSummarizeConversation = async () => {
    try {
      // Generate summary
      const summary = await summarizeConversation();
      
      // Add bot message with summary
      addMessage(`## Conversation Summary\n\n${summary}`, "bot");
    } catch (error) {
      console.error("Error summarizing conversation:", error);
      toast({
        title: "Summary Error",
        description: "Could not generate a summary of the conversation.",
        variant: "destructive",
      });
    }
  };
  
  // Handle clear conversation
  const handleClearChat = () => {
    clearMessages();
    
    // Add new welcome message
    let clearText = "Chat history cleared. How can I help you today?";
    
    if (userPreferences.language === "es") {
      clearText = "Historial de chat borrado. ¿En qué puedo ayudarte hoy?";
    } else if (userPreferences.language === "fr") {
      clearText = "Historique de chat effacé. Comment puis-je vous aider aujourd'hui?";
    } else if (userPreferences.language === "pt") {
      clearText = "Histórico de chat apagado. Como posso ajudá-lo hoje?";
    }
    
    addMessage(clearText, "bot", "positive", 0.8);
  };
  
  // Handle language change
  const handleLanguageChange = (lang: string) => {
    updateUserPreferences({ language: lang });
    i18n.changeLanguage(lang);
    setShowLanguageDialog(false);
    
    // Add message about language change
    let message = `Language changed to English. How can I help you?`;
    
    if (lang === "es") {
      message = `Idioma cambiado a Español. ¿En qué puedo ayudarte?`;
    } else if (lang === "fr") {
      message = `Langue changée en Français. Comment puis-je vous aider?`;
    } else if (lang === "pt") {
      message = `Idioma alterado para Português. Como posso ajudá-lo?`;
    }
    
    addMessage(message, "bot", "positive", 0.8);
  };
  
  // Handle feedback for a message
  const handleFeedback = (index: number, rating: "up" | "down") => {
    setFeedbackRating(prev => ({
      ...prev,
      [index]: rating
    }));
    
    // You could send this feedback to your server
    console.log(`Feedback for message ${index}: ${rating}`);
    
    toast({
      title: rating === "up" ? "Thanks for the positive feedback!" : "Thanks for the feedback",
      description: rating === "up" 
        ? "We're glad this response was helpful."
        : "We'll use this feedback to improve our responses.",
      variant: rating === "up" ? "default" : "destructive",
    });
  };
  
  // Handle exporting chat history
  const handleExportChat = () => {
    try {
      // Format the chat history
      const chatHistory = messages.map(msg => 
        `${msg.role === "user" ? "You" : "CryptoBot"} (${new Date(msg.timestamp).toLocaleString()}):\n${msg.content}`
      ).join("\n\n---\n\n");
      
      // Create a blob with the chat history
      const blob = new Blob([chatHistory], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      
      // Create a download link
      const a = document.createElement("a");
      a.href = url;
      a.download = `cryptobot-chat-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast({
        title: "Chat Exported",
        description: "Your conversation has been exported to a text file.",
      });
    } catch (error) {
      console.error("Error exporting chat:", error);
      toast({
        title: "Export Failed",
        description: "Could not export the chat history.",
        variant: "destructive",
      });
    }
  };
  
  // Get sentiment color for messages
  const getSentimentColor = (sentiment?: "positive" | "negative" | "neutral") => {
    if (!sentiment) return "";
    
    switch (sentiment) {
      case "positive": return "border-green-500/20 bg-green-500/10";
      case "negative": return "border-red-500/20 bg-red-500/10";
      case "neutral": return "border-gray-500/20 bg-gray-500/10";
      default: return "";
    }
  };
  
  // Get language name
  const getLanguageName = (code: string) => {
    switch (code) {
      case "en": return "English";
      case "es": return "Español";
      case "fr": return "Français";
      case "pt": return "Português";
      default: return code;
    }
  };
  
  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50 z-50"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

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
      <AnimatePresence>
        {isChatOpen && !activeToolType && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`fixed ${isFullscreen ? 'inset-0' : 'bottom-6 right-6 w-[95%] sm:w-[400px] h-[600px] sm:max-w-[90vw] sm:max-h-[80vh]'} 
            z-50 bg-background border border-border shadow-2xl rounded-lg flex flex-col overflow-hidden`}
          >
            {/* Chat header */}
            <div className="border-b py-3 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm sm:text-base">CryptoBot AI</h2>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    <span>{currentModel.includes("gemini") ? "Gemini" : "GPT-4o"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setShowLanguageDialog(true)}
                      >
                        <Languages className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Change language</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={toggleVoice}
                      >
                        {isVoiceActive ? (
                          <Volume2 className="h-4 w-4" />
                        ) : (
                          <VolumeX className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isVoiceActive ? "Disable voice" : "Enable voice"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setShowSettings(true)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                      >
                        {isFullscreen ? (
                          <div className="h-3 w-3 border-2 border-current"></div>
                        ) : (
                          <span className="sr-only">Toggle fullscreen</span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Avatar panel (only visible in fullscreen or on larger screens) */}
              {(isFullscreen || window.innerWidth >= 768) && (
                <div className="hidden md:flex flex-col w-1/3 border-r p-4 items-center justify-center bg-muted/20">
                  <AvatarAnimation />
                  <h3 className="text-lg font-semibold mt-4">CryptoBot AI</h3>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Your personal AI assistant for cryptocurrencies and blockchain technology
                  </p>
                  
                  <div className="mt-6 text-center">
                    <p className="text-xs text-muted-foreground mb-2">Powered by</p>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="outline" className="px-2 py-1">
                        Gemini
                      </Badge>
                      <Badge variant="outline" className="px-2 py-1">
                        GPT-4o
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Chat & Info Tabs */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <Tabs 
                  defaultValue="chat" 
                  className="flex-1 flex flex-col"
                  onValueChange={(value) => setCurrentTab(value as "chat" | "info")}
                >
                  <div className="border-b px-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="chat" className="text-xs">
                        Chat
                      </TabsTrigger>
                      <TabsTrigger value="info" className="text-xs">
                        Info & Tips
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  {/* Chat tab */}
                  <TabsContent value="chat" className="flex-1 flex flex-col pt-0 px-0">
                    {/* Chat messages */}
                    <ScrollArea 
                      ref={chatRef} 
                      className="flex-1 px-4 py-2"
                    >
                      <div className="space-y-4 pb-4">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-lg border p-3 ${
                                message.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : `bg-card text-card-foreground ${getSentimentColor(message.sentiment)}`
                              }`}
                            >
                              {/* Bot message header */}
                              {message.role === 'bot' && (
                                <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
                                  <span className="flex items-center">
                                    <BrainCircuit className="h-3 w-3 mr-1" />
                                    <span>CryptoBot</span>
                                  </span>
                                  
                                  <div className="flex items-center ml-2 space-x-1">
                                    <SpeechButton 
                                      text={message.content.replace(/<[^>]*>?/gm, '')} 
                                      language={userPreferences.language === 'en' ? 'en-US' : userPreferences.language === 'es' ? 'es-ES' : userPreferences.language === 'fr' ? 'fr-FR' : 'pt-BR'} 
                                      compact
                                      id={index === messages.length - 1 && message.role === 'bot' ? "latest-speech" : undefined}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {/* Message content */}
                              <div 
                                className="whitespace-pre-line text-sm"
                                dangerouslySetInnerHTML={{ __html: message.content }}
                              ></div>
                              
                              {/* Feedback buttons (only for bot messages) */}
                              {message.role === 'bot' && (
                                <div className="flex justify-end items-center mt-2">
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-6 w-6 rounded-full ${feedbackRating[index] === 'up' ? 'text-green-500' : 'text-muted-foreground'}`}
                                      onClick={() => handleFeedback(index, "up")}
                                      disabled={feedbackRating[index] !== undefined}
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-6 w-6 rounded-full ${feedbackRating[index] === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}
                                      onClick={() => handleFeedback(index, "down")}
                                      disabled={feedbackRating[index] !== undefined}
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                              
                              {/* User message indicator */}
                              {message.role === 'user' && (
                                <div className="flex justify-end mt-1">
                                  <span className="text-xs text-muted-foreground">You</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Typing indicator */}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-card text-muted-foreground max-w-[85%] rounded-lg p-3 border">
                              <TypingIndicator />
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    
                    {/* Message toolbar */}
                    <div className="border-t px-3 py-2 flex flex-wrap gap-1 justify-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handleOpenAudioRecorder}
                              disabled={isLoading}
                            >
                              <Mic className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Voice input</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handleOpenCamera}
                              disabled={isLoading}
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Camera</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handleOpenQrScanner}
                              disabled={isLoading}
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>QR Code Scanner</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handleOpenArViewer}
                              disabled={isLoading}
                            >
                              <Box className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>AR Viewer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handleSummarizeConversation}
                              disabled={isLoading || messages.length < 4}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Summarize</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handleClearChat}
                              disabled={isLoading || messages.length <= 1}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clear chat</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handleExportChat}
                              disabled={isLoading || messages.length <= 1}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Export chat</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {/* Input area */}
                    <div className="p-3 flex gap-2 border-t">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={
                          userPreferences.language === "es" ? "Escribe un mensaje..." :
                          userPreferences.language === "fr" ? "Tapez un message..." :
                          userPreferences.language === "pt" ? "Digite uma mensagem..." :
                          "Type a message..."
                        }
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => handleSendMessage()} 
                        disabled={!inputValue.trim() || isLoading}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Info tab */}
                  <TabsContent value="info" className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">CryptoBot AI Assistant</h3>
                          <p className="text-sm text-muted-foreground">
                            I'm your personal AI assistant specialized in cryptocurrencies, blockchain technology,
                            and financial markets. I can help you with:
                          </p>
                          <ul className="mt-2 space-y-1 text-sm">
                            <li className="flex items-center">
                              <span className="mr-2 text-primary">•</span>
                              Explaining cryptocurrency concepts and technologies
                            </li>
                            <li className="flex items-center">
                              <span className="mr-2 text-primary">•</span>
                              Providing market insights and analysis
                            </li>
                            <li className="flex items-center">
                              <span className="mr-2 text-primary">•</span>
                              Answering questions about specific cryptocurrencies
                            </li>
                            <li className="flex items-center">
                              <span className="mr-2 text-primary">•</span>
                              Helping with wallet setup and security
                            </li>
                            <li className="flex items-center">
                              <span className="mr-2 text-primary">•</span>
                              Guiding you through blockchain concepts
                            </li>
                          </ul>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-base font-semibold mb-2">Features</h3>
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-start">
                              <Mic className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                              <div>
                                <p className="text-sm font-medium">Voice Input & Output</p>
                                <p className="text-xs text-muted-foreground">
                                  Speak to me and listen to my responses.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <Camera className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                              <div>
                                <p className="text-sm font-medium">Image Analysis</p>
                                <p className="text-xs text-muted-foreground">
                                  Take pictures of crypto-related content for analysis.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <QrCode className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                              <div>
                                <p className="text-sm font-medium">QR Code Scanner</p>
                                <p className="text-xs text-muted-foreground">
                                  Scan QR codes for addresses, websites, or other info.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <Box className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                              <div>
                                <p className="text-sm font-medium">AR Viewer</p>
                                <p className="text-xs text-muted-foreground">
                                  View 3D models of cryptocurrencies in augmented reality.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <Languages className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                              <div>
                                <p className="text-sm font-medium">Multilingual Support</p>
                                <p className="text-xs text-muted-foreground">
                                  Chat in English, Spanish, French, or Portuguese.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-base font-semibold mb-2">Sample Questions</h3>
                          <div className="space-y-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full justify-start text-sm h-auto py-2"
                              onClick={() => {
                                setInputValue("What is Bitcoin and how does it work?");
                                setCurrentTab("chat");
                              }}
                            >
                              What is Bitcoin and how does it work?
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full justify-start text-sm h-auto py-2"
                              onClick={() => {
                                setInputValue("Explain the concept of DeFi in simple terms");
                                setCurrentTab("chat");
                              }}
                            >
                              Explain the concept of DeFi in simple terms
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full justify-start text-sm h-auto py-2"
                              onClick={() => {
                                setInputValue("What are the risks of investing in cryptocurrency?");
                                setCurrentTab("chat");
                              }}
                            >
                              What are the risks of investing in cryptocurrency?
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full justify-start text-sm h-auto py-2"
                              onClick={() => {
                                setInputValue("How do smart contracts work on Ethereum?");
                                setCurrentTab("chat");
                              }}
                            >
                              How do smart contracts work on Ethereum?
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Settings dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chat Settings</DialogTitle>
            <DialogDescription>
              Configure your AI assistant preferences
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>AI Model</Label>
              <Select 
                value={currentModel} 
                onValueChange={setCurrentModel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gpt-4o">OpenAI GPT-4o</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {currentModel.includes("gemini") 
                  ? "Google's Gemini models provide excellent responses for crypto topics." 
                  : "OpenAI's GPT-4o offers strong general knowledge and reasoning."}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Voice Settings</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm">Text-to-Speech</span>
                <Switch 
                  checked={isVoiceActive} 
                  onCheckedChange={toggleVoice} 
                />
              </div>
              {isVoiceActive && (
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Volume</span>
                    <span className="text-sm text-muted-foreground">{voiceVolume}%</span>
                  </div>
                  <Slider
                    value={[voiceVolume]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => setVoiceVolume(value[0])}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Memory & Storage</Label>
              <div className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    <span className="text-sm">Chat History</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      handleClearChat();
                      toast({
                        title: "Chat history cleared",
                        description: "All your previous messages have been removed.",
                      });
                    }}
                  >
                    Clear
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Clearing chat history removes all conversation data from your device.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowSettings(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Language dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Change Language</DialogTitle>
            <DialogDescription>
              Select your preferred language for the chat interface
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-2 py-2">
            <Button 
              variant={userPreferences.language === "en" ? "default" : "outline"}
              className="justify-start"
              onClick={() => handleLanguageChange("en")}
            >
              <User className="mr-2 h-4 w-4" />
              English
            </Button>
            
            <Button 
              variant={userPreferences.language === "es" ? "default" : "outline"}
              className="justify-start"
              onClick={() => handleLanguageChange("es")}
            >
              <User className="mr-2 h-4 w-4" />
              Español (Spanish)
            </Button>
            
            <Button 
              variant={userPreferences.language === "fr" ? "default" : "outline"}
              className="justify-start"
              onClick={() => handleLanguageChange("fr")}
            >
              <User className="mr-2 h-4 w-4" />
              Français (French)
            </Button>
            
            <Button 
              variant={userPreferences.language === "pt" ? "default" : "outline"}
              className="justify-start"
              onClick={() => handleLanguageChange("pt")}
            >
              <User className="mr-2 h-4 w-4" />
              Português (Portuguese)
            </Button>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowLanguageDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}