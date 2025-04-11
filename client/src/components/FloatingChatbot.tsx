import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    
    // Check on load
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
      // On mobile, use dialog for fullscreen
      if (isMobile) {
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
          <ZoomStyleChat 
            initialOpen={true}
            defaultLanguage={defaultLanguage}
          />
        </DialogContent>
      </Dialog>

      {/* Desktop fixed chatbot */}
      {!isMinimized && !isMobile && (
        <div className="fixed bottom-4 right-4 z-40 w-[400px] h-[600px] shadow-lg">
          <ZoomStyleChat 
            initialOpen={true}
            defaultLanguage={defaultLanguage}
          />
        </div>
      )}
    </>
  );
}