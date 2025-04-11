import React, { useState, useRef, useEffect } from 'react';
import { AdvancedChatProvider } from "../contexts/AdvancedChatContext";
import AdvancedChatbot from "./AdvancedChatbot";
import ChatbotAvatar from "./ChatbotAvatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Settings } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface FloatingChatbotProps {
  defaultOpen?: boolean;
}

const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle ESC key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent scrolling on body when chat is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Listen for tool events from child components
  const handleAudioClick = () => {
    // Set active tool in AdvancedChatbot
    setActiveTool('audio');
    const audioEvent = new CustomEvent('chatbot:audio');
    document.dispatchEvent(audioEvent);
  };
  
  const handleCameraClick = () => {
    setActiveTool('camera');
    const cameraEvent = new CustomEvent('chatbot:camera');
    document.dispatchEvent(cameraEvent);
  };
  
  const handleQrClick = () => {
    setActiveTool('qr');
    const qrEvent = new CustomEvent('chatbot:qr');
    document.dispatchEvent(qrEvent);
  };
  
  const handleArClick = () => {
    setActiveTool('ar');
    const arEvent = new CustomEvent('chatbot:ar');
    document.dispatchEvent(arEvent);
  };
  
  // For direct commands to the chatbot
  useEffect(() => {
    // Listen for event notifications from the AdvancedChatbot component
    const toolHandler = (e: Event) => {
      if (e instanceof CustomEvent) {
        setActiveTool(e.detail?.tool || null);
      }
    };
    
    document.addEventListener('chatbot:toolchange', toolHandler);
    
    return () => {
      document.removeEventListener('chatbot:toolchange', toolHandler);
    };
  }, []);

  return (
    <AdvancedChatProvider>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={chatContainerRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-background flex"
            >
              <div className="w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b bg-background">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                      <ChatbotAvatar size="sm" />
                    </div>
                    <div>
                      <h3 className="font-medium">CryptoBot Assistant</h3>
                      <div className="text-xs text-emerald-500 flex items-center">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block mr-1"></span>
                        Gemini AI (Flash Latest)
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <Settings className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* AI Configuration Info */}
                <div className="px-3 py-2 border-b bg-muted/20">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <div className="text-muted-foreground">Current AI configuration:</div>
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      <span className="whitespace-nowrap">Model: <span className="font-mono text-xs">gemini-1.5-flash-latest</span></span>
                      <span className="whitespace-nowrap">Language: <span className="font-mono text-xs">English</span></span>
                      <Button size="sm" variant="outline" className="h-6 text-xs ml-auto">
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Sidebar with Tools + Chat */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Left sidebar with buttons */}
                  <div className="w-16 border-r flex flex-col items-center py-4 bg-muted/20">
                    <div className="flex flex-col items-center space-y-7 mt-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-10 w-10" 
                        title="Language Settings"
                        onClick={() => {
                          // Show language settings popup or toggle between languages
                          const event = new CustomEvent('chatbot:language');
                          document.dispatchEvent(event);
                          
                          // Show language change notification
                          const toast = document.createEvent('CustomEvent');
                          toast.initCustomEvent('chatbot:toast', true, true, {
                            title: 'Language',
                            message: 'Language settings dialog will open here'
                          });
                          document.dispatchEvent(toast);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m12 2a15 15 0 0 0 0 20"/><path d="M2 12h20"/></svg>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-10 w-10" 
                        title="Audio Input"
                        onClick={handleAudioClick}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-10 w-10" 
                        title="Camera Input"
                        onClick={handleCameraClick}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-10 w-10" 
                        title="QR Scanner"
                        onClick={handleQrClick}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-10 w-10" 
                        title="AR View"
                        onClick={handleArClick}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 9V6a2 2 0 0 0-2-2H9"/><path d="M3 16v3a2 2 0 0 0 2 2h10"/><path d="M12 8l5 3-5 3Z"/></svg>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-10 w-10 mt-auto" 
                        title="Portfolio"
                        onClick={() => {
                          // Navigate to portfolio page or show portfolio dialog
                          const event = new CustomEvent('chatbot:portfolio');
                          document.dispatchEvent(event);
                          
                          // Add a message to the chat about portfolio
                          const chatEvent = new CustomEvent('chatbot:command', {
                            detail: {
                              command: 'portfolio'
                            }
                          });
                          document.dispatchEvent(chatEvent);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Main chat content */}
                  <div className="flex-1 overflow-hidden">
                    <AdvancedChatbot />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="rounded-full w-14 h-14 shadow-lg bg-primary text-primary-foreground"
              aria-label="Open chatbot"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
          </motion.div>
        )}
      </div>
    </AdvancedChatProvider>
  );
};

export default FloatingChatbot;