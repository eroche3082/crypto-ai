/**
 * Phase 4 Initializer Component
 * 
 * This component initializes Phase 4 automation features including:
 * 1. User behavior tracking
 * 2. Cross-device synchronization
 * 3. AI recommendation system
 * 4. Self-optimization features
 */

import { useEffect, useState } from 'react';
import { getFirebaseInstance } from '@/services/firebaseSync';
import { initializePhase4Automation, detectBehaviorPatterns, updateInterfacePreferences } from '@/utils/phase4Automation';
import { AIRecommendation } from '@/components/ai/AIRecommendation';
import { useToast } from '@/hooks/use-toast';

// Props interface
interface Phase4InitializerProps {
  userId?: string;
}

/**
 * Phase 4 Initializer Component
 */
export function Phase4Initializer({ userId }: Phase4InitializerProps) {
  // Initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  // Recommendations state
  const [recommendations, setRecommendations] = useState<any[]>([]);
  // Toast for notifications
  const { toast } = useToast();
  
  // Initialize Phase 4 automation
  useEffect(() => {
    const initialize = async () => {
      // Skip if already initialized or no user ID
      if (isInitialized || !userId) return;
      
      // Check if Phase 4 is already initialized in local storage
      const isAlreadyInitialized = localStorage.getItem('phase4_initialized') === 'true';
      
      if (isAlreadyInitialized) {
        console.log('Phase 4 automation already initialized');
        setIsInitialized(true);
        return;
      }
      
      try {
        // Initialize Phase 4 automation
        const success = await initializePhase4Automation(userId);
        
        if (success) {
          console.log('Phase 4 automation initialized successfully');
          setIsInitialized(true);
          
          // Show toast notification
          toast({
            title: 'Enhanced Features Activated',
            description: 'AI-driven personalization and cross-device sync are now active.',
          });
          
          // Schedule first behavior analysis
          setTimeout(() => {
            analyzeUserBehavior(userId);
          }, 60000); // After 1 minute
        } else {
          console.error('Failed to initialize Phase 4 automation');
        }
      } catch (error) {
        console.error('Error initializing Phase 4 automation:', error);
      }
    };
    
    initialize();
  }, [userId, isInitialized, toast]);
  
  // Setup periodic behavior analysis
  useEffect(() => {
    if (!isInitialized || !userId) return;
    
    // Analyze user behavior periodically
    const intervalId = setInterval(() => {
      analyzeUserBehavior(userId);
    }, 300000); // Every 5 minutes
    
    // Set up device sync
    const syncIntervalId = setInterval(() => {
      syncAcrossDevices(userId);
    }, 600000); // Every 10 minutes
    
    // Cleanup intervals on unmount
    return () => {
      clearInterval(intervalId);
      clearInterval(syncIntervalId);
    };
  }, [isInitialized, userId]);
  
  // Load recommendations on initialization
  useEffect(() => {
    if (!isInitialized || !userId) return;
    
    loadRecommendations(userId);
  }, [isInitialized, userId]);
  
  /**
   * Analyze user behavior
   */
  const analyzeUserBehavior = async (userId: string) => {
    try {
      // Get firebase instance
      const firebase = getFirebaseInstance();
      if (!firebase) return;
      
      // Get recent behaviors
      const recentBehaviors = await firebase.getRecentBehaviors(userId, 100);
      
      // Skip if not enough behaviors
      if (recentBehaviors.length < 5) return;
      
      // Detect behavior patterns
      const patterns = await detectBehaviorPatterns(userId, recentBehaviors);
      
      // Skip if no patterns detected
      if (patterns.length === 0) return;
      
      // Update interface preferences based on behavior
      await updateInterfacePreferences(userId, patterns);
      
      // Generate recommendations if needed
      setTimeout(() => {
        loadRecommendations(userId);
      }, 5000);
      
      console.log('User behavior analyzed:', patterns.length, 'patterns detected');
    } catch (error) {
      console.error('Error analyzing user behavior:', error);
    }
  };
  
  /**
   * Sync across devices
   */
  const syncAcrossDevices = async (userId: string) => {
    try {
      // Get firebase instance
      const firebase = getFirebaseInstance();
      if (!firebase) return;
      
      // Sync data between devices
      const success = await firebase.syncDataBetweenDevices(userId);
      
      if (success) {
        console.log('Data synced across devices');
      }
    } catch (error) {
      console.error('Error syncing across devices:', error);
    }
  };
  
  /**
   * Load recommendations
   */
  const loadRecommendations = async (userId: string) => {
    try {
      // Get firebase instance
      const firebase = getFirebaseInstance();
      if (!firebase) return;
      
      // Get user recommendations
      const userRecommendations = await firebase.getUserRecommendations(userId);
      
      // Set recommendations state
      setRecommendations(userRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };
  
  /**
   * Handle recommendation action
   */
  const handleRecommendationAction = (recommendation: any) => {
    // Track the action (already handled in AIRecommendation component)
    console.log('Recommendation action:', recommendation.title);
    
    // Remove from UI
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendation.id));
  };
  
  /**
   * Handle recommendation dismiss
   */
  const handleRecommendationDismiss = (recommendation: any) => {
    // Track the dismiss (already handled in AIRecommendation component)
    console.log('Recommendation dismissed:', recommendation.title);
    
    // Remove from UI
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendation.id));
  };
  
  // Early return if not initialized or no recommendations
  if (!isInitialized || recommendations.length === 0) {
    return null;
  }
  
  // Return recommendations
  return (
    <div className="fixed bottom-4 right-4 max-w-xs z-50 space-y-2">
      {recommendations.slice(0, 1).map(recommendation => (
        <AIRecommendation
          key={recommendation.id}
          recommendation={recommendation}
          userId={userId}
          onAction={handleRecommendationAction}
          onDismiss={handleRecommendationDismiss}
          compact={true}
        />
      ))}
    </div>
  );
}

export default Phase4Initializer;