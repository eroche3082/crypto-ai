import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Package, X, Maximize2, Minimize2 } from 'lucide-react';
import { UniversalChatbot } from './UniversalChatbot';
import { cn } from '@/lib/utils';

interface FloatingChatbotProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  agentType?: string;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  className,
  position = 'bottom-right',
  agentType = 'crypto'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Toggle chatbot open/closed
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };
  
  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <Button
          className={cn(
            'fixed rounded-full p-3 shadow-lg',
            positionClasses[position],
            className
          )}
          onClick={toggleChatbot}
        >
          <Package className="h-6 w-6" />
        </Button>
      )}
      
      {/* Chatbot container */}
      {isOpen && !isFullscreen && (
        <div 
          className={cn(
            'fixed z-50 shadow-xl',
            positionClasses[position]
          )}
        >
          <UniversalChatbot
            agentType={agentType}
            onDismiss={toggleChatbot}
            onFullscreenToggle={toggleFullscreen}
          />
        </div>
      )}
      
      {/* Fullscreen chatbot */}
      {isOpen && isFullscreen && (
        <UniversalChatbot
          fullScreenMode
          agentType={agentType}
          onDismiss={toggleChatbot}
          onFullscreenToggle={toggleFullscreen}
        />
      )}
    </>
  );
};

export default FloatingChatbot;