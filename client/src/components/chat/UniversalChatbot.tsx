import React, { useState, useEffect } from 'react';
import { ZoomStyleChat } from './ZoomStyleChat';
import { ChatbotOnboarding } from './ChatbotOnboarding';
import { getOnboardingQuestions } from '@/lib/onboardingFlow';
import { SubscriberProfile } from '@/lib/subscriberSchema';
import { 
  getCurrentUserProfile, 
  hasCompletedOnboarding, 
  getCurrentUserId 
} from '@/services/subscriberService';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UniversalChatbotProps {
  className?: string;
  fullScreenMode?: boolean;
  agentType?: string;
  onDismiss?: () => void;
  onFullscreenToggle?: () => void;
}

export const UniversalChatbot: React.FC<UniversalChatbotProps> = ({
  className,
  fullScreenMode = false,
  agentType = 'crypto',
  onDismiss,
  onFullscreenToggle
}) => {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<Partial<SubscriberProfile> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load user profile and determine if onboarding is needed
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const userId = getCurrentUserId();
        
        if (userId) {
          // Check if user has completed onboarding
          const onboardingCompleted = await hasCompletedOnboarding(userId);
          
          if (!onboardingCompleted) {
            // Show onboarding if not completed
            setShowOnboarding(true);
          }
          
          // Load user profile
          const profile = await getCurrentUserProfile();
          setUserProfile(profile);
        } else {
          // No user ID, check local profile
          const profile = await getCurrentUserProfile();
          
          if (!profile || !profile.completedOnboarding) {
            setShowOnboarding(true);
          }
          
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  // Handle onboarding completion
  const handleOnboardingComplete = (profile: Partial<SubscriberProfile>) => {
    setUserProfile(profile);
    setShowOnboarding(false);
  };
  
  // Handle onboarding skip
  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };
  
  // Restart onboarding
  const handleRestartOnboarding = () => {
    setShowOnboarding(true);
  };
  
  return (
    <div 
      className={cn(
        'flex flex-col bg-background rounded-lg shadow-lg overflow-hidden',
        fullScreenMode ? 'fixed inset-0 z-50' : 'h-[500px] w-[400px]',
        className
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-primary text-primary-foreground">
        <h2 className="font-semibold">CryptoBot AI Assistant</h2>
        <div className="flex gap-1">
          {onFullscreenToggle && (
            <button 
              onClick={onFullscreenToggle} 
              className="p-1 rounded-full hover:bg-primary-foreground/20"
            >
              {fullScreenMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          )}
          {onDismiss && (
            <button 
              onClick={onDismiss} 
              className="p-1 rounded-full hover:bg-primary-foreground/20"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-grow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : showOnboarding ? (
          <ChatbotOnboarding
            questions={getOnboardingQuestions(agentType)}
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        ) : (
          <ZoomStyleChat
            userProfile={userProfile}
            onRestartOnboarding={handleRestartOnboarding}
          />
        )}
      </div>
    </div>
  );
};

export default UniversalChatbot;