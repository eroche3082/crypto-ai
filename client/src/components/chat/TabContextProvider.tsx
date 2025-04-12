import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { getCurrentTabContext, trackTabInteraction } from '@/utils/chatContextManager';

/**
 * TabContextProvider
 * 
 * This component tracks the current tab and updates the chatbot context accordingly.
 * It monitors URL changes and automatically updates localStorage with context information.
 */
export const TabContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location] = useLocation();
  
  // Update tab context whenever the location changes
  useEffect(() => {
    const updateContext = () => {
      try {
        // Get current tab from URL
        const currentTab = getCurrentTabContext();
        
        // Track interaction with this tab
        trackTabInteraction(currentTab);
        
        console.log(`TabContextProvider: Updated context to "${currentTab}"`);
      } catch (error) {
        console.error('Error updating tab context:', error);
      }
    };
    
    // Call immediately
    updateContext();
    
    // This will track page navigation events directly
    window.addEventListener('popstate', updateContext);
    
    return () => {
      // Clean up
      window.removeEventListener('popstate', updateContext);
    };
  }, [location]);
  
  // This component doesn't render anything visible
  return <>{children}</>;
};

export default TabContextProvider;