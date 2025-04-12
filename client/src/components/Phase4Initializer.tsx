import React, { useEffect, useState } from 'react';
import { initializePhase4, Phase4Config } from '@/utils/phase4Automation';
import { useToast } from "@/hooks/use-toast";
import { initializeFirebaseSync } from '@/services/firebaseSync';

interface Phase4InitializerProps {
  children: React.ReactNode;
  config?: Partial<Phase4Config>;
}

/**
 * Component to initialize Phase 4 features
 * This is placed high in the component tree to ensure Phase 4 features
 * are available throughout the application
 */
export const Phase4Initializer: React.FC<Phase4InitializerProps> = ({
  children,
  config = {}
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Initialize Phase 4 features on component mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      
      try {
        console.log('Initializing Phase 4 features...');
        
        // Initialize Firebase sync first if enabled
        if (config.firebaseSync !== false) {
          try {
            await initializeFirebaseSync();
            console.log('Firebase sync initialized');
          } catch (error) {
            console.error('Failed to initialize Firebase sync:', error);
            // Fall back to localStorage only
            config.firebaseSync = false;
          }
        }
        
        // Default configuration
        const defaultConfig: Phase4Config = {
          userContext: true,
          autoScheduling: true,
          firebaseSync: !!config.firebaseSync,
          aiRecommendationEngine: true,
          crossTabAwareness: true,
          voiceCommands: false
        };
        
        // Merge with provided config
        const finalConfig = { ...defaultConfig, ...config };
        
        // Initialize Phase 4
        const success = await initializePhase4(finalConfig);
        
        if (success) {
          console.log('Phase 4 features initialized successfully');
          setIsInitialized(true);
          
          // Show success toast
          toast({
            title: "System Upgraded",
            description: "CryptoBot AI has been enhanced with intelligent automation features",
          });
        } else {
          console.error('Failed to initialize Phase 4 features');
          
          // Show error toast
          toast({
            title: "Partial Upgrade",
            description: "Some CryptoBot AI features couldn't be initialized",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error initializing Phase 4:', error);
        
        // Show error toast
        toast({
          title: "System Upgrade Failed",
          description: "Please contact support if the issue persists",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Check if already initialized
    if (!isInitialized && !isLoading) {
      initialize();
    }
  }, [isInitialized, isLoading, config, toast]);
  
  return <>{children}</>;
};

export default Phase4Initializer;