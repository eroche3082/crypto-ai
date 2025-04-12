import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { AIRecommendation } from './AIRecommendation';
import { getRecommendationsForTab, AIRecommendation as AIRecommendationType } from '@/utils/phase4Automation';
import { getCurrentTabContext } from '@/utils/chatContextManager';
import { useToast } from "@/hooks/use-toast";

interface AIRecommendationContainerProps {
  className?: string;
}

/**
 * Container for showing AI recommendations based on the current tab
 * Listens for new recommendations and displays them
 */
export const AIRecommendationContainer: React.FC<AIRecommendationContainerProps> = ({
  className = '',
}) => {
  const [location] = useLocation();
  const [currentTab, setCurrentTab] = useState<string>('');
  const [recommendations, setRecommendations] = useState<AIRecommendationType[]>([]);
  const { toast } = useToast();
  
  // Update the current tab when location changes
  useEffect(() => {
    const tab = getCurrentTabContext();
    setCurrentTab(tab);
  }, [location]);
  
  // Get recommendations for the current tab
  useEffect(() => {
    if (currentTab) {
      // Get pending recommendations for the current tab
      const tabRecommendations = getRecommendationsForTab(currentTab);
      setRecommendations(tabRecommendations);
    }
  }, [currentTab]);
  
  // Listen for new recommendations
  useEffect(() => {
    const handleNewRecommendation = (event: CustomEvent) => {
      const newRecommendation = event.detail as AIRecommendationType;
      
      // Check if it's for the current tab
      if (newRecommendation.tab === currentTab) {
        // Add to the recommendations list
        setRecommendations(prev => [...prev, newRecommendation]);
      }
    };
    
    // Add event listener
    document.addEventListener('ai-recommendation', handleNewRecommendation as EventListener);
    
    // Cleanup
    return () => {
      document.removeEventListener('ai-recommendation', handleNewRecommendation as EventListener);
    };
  }, [currentTab]);
  
  // Limit to the most recent recommendation to avoid cluttering the UI
  const visibleRecommendations = recommendations.slice(0, 1);
  
  // Handle recommendation actions
  const handleAction = (recommendationId: string, actionType: string, params?: any) => {
    console.log(`Action taken on recommendation ${recommendationId}: ${actionType}`, params);
    
    // Execute the action based on the action type
    executeAction(actionType, params);
    
    // Remove the recommendation from the list
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
  };
  
  // Handle recommendation close
  const handleClose = (recommendationId: string) => {
    // Remove the recommendation from the list
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
  };
  
  // Execute an action based on the action type
  const executeAction = (actionType: string, params?: any) => {
    switch (actionType) {
      case 'create_alert':
        // Navigate to the alerts tab with pre-filled values
        window.location.href = `/alerts/new?asset=${params?.asset || ''}&type=${params?.type || ''}`;
        break;
        
      case 'customize_dashboard':
        // Navigate to dashboard settings
        window.location.href = '/dashboard/customize';
        break;
        
      case 'show_rebalance_options':
        // Navigate to portfolio rebalance view
        window.location.href = '/portfolio/rebalance';
        break;
        
      case 'dismiss':
        // No action needed, just dismiss
        break;
        
      default:
        // Show a toast for custom actions
        toast({
          title: "Action",
          description: `Executing action: ${actionType}`,
        });
    }
  };
  
  if (visibleRecommendations.length === 0) {
    return null;
  }
  
  return (
    <div className={`fixed bottom-20 right-4 z-40 w-80 ${className}`}>
      <AnimatePresence>
        {visibleRecommendations.map((recommendation) => (
          <motion.div
            key={recommendation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-2"
          >
            <AIRecommendation
              recommendation={recommendation}
              onAction={(actionType, params) => handleAction(recommendation.id, actionType, params)}
              onClose={() => handleClose(recommendation.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AIRecommendationContainer;