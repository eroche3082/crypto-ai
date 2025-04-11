import React, { useState, useRef, useEffect } from 'react';
import { AdvancedChatProvider } from "../contexts/AdvancedChatContext";
import AdvancedChatbot from "./AdvancedChatbot";
import ChatbotAvatar from "./ChatbotAvatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface FloatingChatbotProps {
  defaultOpen?: boolean;
}

const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <AdvancedChatProvider>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={chatContainerRef}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-4 bg-background border rounded-lg shadow-lg w-full max-w-[90vw] md:max-w-[450px] lg:max-w-[500px] h-[600px] max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center space-x-3">
                  <ChatbotAvatar size="md" />
                  <div>
                    <h3 className="font-medium">CryptoBot AI</h3>
                    <p className="text-xs text-muted-foreground">Powered by Gemini</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <AdvancedChatbot />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-full w-14 h-14 shadow-lg transition-all ${isOpen ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'}`}
          aria-label="Toggle chatbot"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <MessageSquare className="h-6 w-6" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
            </>
          )}
        </Button>
      </div>
    </AdvancedChatProvider>
  );
};

export default FloatingChatbot;