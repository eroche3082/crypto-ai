import { useState, useEffect, useRef } from "react";
import { useGemini } from "@/contexts/GeminiContext";
// Using language directly from GeminiContext
import { MessageSquare, X, Settings, Mic, Camera, Languages, QrCode, Smile, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MessageInput from "@/components/MessageInput";
import QuickPrompts from "@/components/QuickPrompts";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 ${isChatOpen ? 'hidden' : 'flex'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat overlay */}
      {isChatOpen && (
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
                        <div className="flex items-center mb-1 text-xs font-medium text-muted-foreground">
                          <span className="mr-1">Gemini AI</span>
                        </div>
                      )}
                      <div className="whitespace-pre-line">{message.content}</div>
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
                <MessageInput onSendMessage={handleSendMessage} disabled={inputDisabled || isLoading} />
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

                <TabsContent value="tools" className="p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="flex flex-col h-auto py-3">
                      <Mic className="h-5 w-5 mb-1" />
                      <span className="text-xs">Audio</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex flex-col h-auto py-3">
                      <Camera className="h-5 w-5 mb-1" />
                      <span className="text-xs">Camera</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex flex-col h-auto py-3">
                      <QrCode className="h-5 w-5 mb-1" />
                      <span className="text-xs">QR</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex flex-col h-auto py-3">
                      <Smile className="h-5 w-5 mb-1" />
                      <span className="text-xs">AR</span>
                    </Button>
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