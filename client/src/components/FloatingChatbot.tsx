import React, { useState, useEffect } from 'react';
import { Bot, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ZoomStyleChat from './chat/ZoomStyleChat';

interface FloatingChatbotProps {
  defaultLanguage?: string;
  className?: string;
}

export default function FloatingChatbot({ 
  defaultLanguage = 'en',
  className = ''
}: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // Always use fullscreen dialog based on screenshot
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

  return (
    <>
      {/* Floating button */}
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
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0 sm:max-w-[95vw] md:max-w-[90vw] h-[95vh] flex flex-col">
          <div className="flex items-center justify-between p-2 bg-primary/10 border-b">
            <h2 className="font-semibold text-lg ml-2">CryptoBot Assistant</h2>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ZoomStyleChat 
              initialOpen={true}
              defaultLanguage={defaultLanguage}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}