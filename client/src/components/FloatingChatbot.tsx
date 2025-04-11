import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AdvancedChatbot from './AdvancedChatbot';

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

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
      // On mobile, use dialog for fullscreen
      if (window.innerWidth < 768) {
        setIsOpen(true);
      }
    } else {
      setIsMinimized(true);
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

      {/* Mobile dialog version */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0 max-w-[95vw] h-[95vh]">
          <AdvancedChatbot 
            defaultLanguage={defaultLanguage}
            isFullscreen={true}
            onClose={handleClose}
            className="h-full rounded-none"
          />
        </DialogContent>
      </Dialog>

      {/* Desktop fixed chatbot */}
      {!isMinimized && window.innerWidth >= 768 && (
        <div className="fixed bottom-4 right-4 z-40 w-[400px] h-[600px] shadow-lg">
          <AdvancedChatbot 
            defaultLanguage={defaultLanguage}
            onClose={() => setIsMinimized(true)}
            className="h-full"
          />
        </div>
      )}
    </>
  );
}