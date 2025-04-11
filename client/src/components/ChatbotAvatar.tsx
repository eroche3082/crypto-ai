import React, { useState, useEffect } from 'react';
import { useAdvancedChat } from '../contexts/AdvancedChatContext';
import { Bot, User } from 'lucide-react';

interface ChatbotAvatarProps {
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const ChatbotAvatar: React.FC<ChatbotAvatarProps> = ({ 
  pulse = false, 
  size = 'md', 
  animated = true 
}) => {
  const { isLoading } = useAdvancedChat();
  const [animationFrame, setAnimationFrame] = useState(0);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  // Static avatar URL - in a production app, this would be loaded from a configuration
  const staticAvatarUrl = '/assets/crypto-bot-avatar.png';
  
  // Size mapping
  const sizeMap = {
    'sm': 'w-8 h-8',
    'md': 'w-12 h-12',
    'lg': 'w-16 h-16',
    'xl': 'w-24 h-24'
  };
  
  // Animation effect for speaking/thinking
  useEffect(() => {
    if (animated && isLoading) {
      const interval = setInterval(() => {
        setAnimationFrame(prev => (prev + 1) % 3);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoading, animated]);
  
  // Load avatar
  useEffect(() => {
    const img = new Image();
    img.onload = () => setAvatarLoaded(true);
    img.onerror = () => setAvatarError(true);
    img.src = staticAvatarUrl;
  }, []);
  
  // Animation indicators based on current frame
  const getAnimationIndicator = () => {
    if (!isLoading) return null;
    
    return (
      <div className="absolute bottom-0 right-0 flex items-center justify-center bg-primary/90 rounded-full p-1">
        {'.'.repeat(animationFrame + 1)}
      </div>
    );
  };
  
  // Fallback avatar when image fails to load
  const renderFallbackAvatar = () => (
    <div className={`${sizeMap[size]} bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary`}>
      <Bot className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} />
    </div>
  );
  
  return (
    <div className={`relative ${pulse && isLoading ? 'animate-pulse' : ''}`}>
      {avatarLoaded && !avatarError ? (
        <div className={`${sizeMap[size]} rounded-full overflow-hidden relative`}>
          <img 
            src={staticAvatarUrl} 
            alt="CryptoBot AI Assistant" 
            className="w-full h-full object-cover"
          />
          {animated && getAnimationIndicator()}
        </div>
      ) : renderFallbackAvatar()}
    </div>
  );
};

export const UserAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const sizeMap = {
    'sm': 'w-8 h-8',
    'md': 'w-12 h-12',
    'lg': 'w-16 h-16',
    'xl': 'w-24 h-24'
  };
  
  return (
    <div className={`${sizeMap[size]} bg-secondary/10 border border-secondary/30 rounded-full flex items-center justify-center text-secondary`}>
      <User className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} />
    </div>
  );
};

export default ChatbotAvatar;