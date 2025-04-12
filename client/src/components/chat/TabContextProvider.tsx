import React, { useEffect, useState, createContext, useContext } from 'react';
import { useLocation } from 'wouter';
import { setCurrentTabContext, getCurrentTabContext, initializeChatContextManager } from '@/utils/chatContextManager';

// Context for tab awareness
interface TabContextType {
  currentTab: string;
  previousTab: string;
  setTab: (tab: string) => void;
}

const TabContext = createContext<TabContextType>({
  currentTab: '',
  previousTab: '',
  setTab: () => {}
});

// Map of URL paths to tab names
const pathToTabMap: Record<string, string> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/portfolio': 'portfolio',
  '/wallet': 'wallet',
  '/analytics': 'analytics',
  '/alerts': 'alerts',
  '/news': 'news',
  '/locations': 'locations',
  '/converter': 'converter',
  '/settings': 'settings',
  '/education': 'education',
  '/tax': 'tax',
  '/messages': 'messages',
  '/admin': 'admin'
};

// Get tab name from path
const getTabFromPath = (path: string): string => {
  // Check for exact match
  if (pathToTabMap[path]) {
    return pathToTabMap[path];
  }
  
  // Check for partial matches (e.g. /portfolio/asset/123 should map to portfolio)
  for (const [pathPrefix, tabName] of Object.entries(pathToTabMap)) {
    if (path.startsWith(pathPrefix + '/')) {
      return tabName;
    }
  }
  
  // Default to dashboard if no match
  return 'dashboard';
};

interface TabContextProviderProps {
  children: React.ReactNode;
  useFirebaseSync?: boolean;
}

export const TabContextProvider: React.FC<TabContextProviderProps> = ({ 
  children,
  useFirebaseSync = false
}) => {
  const [location] = useLocation();
  const [currentTab, setCurrentTab] = useState<string>('');
  const [previousTab, setPreviousTab] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize chat context manager
  useEffect(() => {
    if (!isInitialized) {
      initializeChatContextManager(useFirebaseSync);
      setIsInitialized(true);
    }
  }, [useFirebaseSync, isInitialized]);
  
  // Update current tab when location changes
  useEffect(() => {
    const tabName = getTabFromPath(location);
    
    if (tabName !== currentTab) {
      // Save previous tab
      setPreviousTab(currentTab);
      
      // Update current tab
      setCurrentTab(tabName);
      
      // Update in chat context manager
      setCurrentTabContext(tabName);
      
      console.log(`Tab changed: ${currentTab || 'none'} → ${tabName}`);
      
      // Dispatch custom event for navigation tracking
      const event = new CustomEvent('route-change', {
        detail: {
          path: location,
          previousPath: window.location.pathname,
          tab: tabName,
          previousTab: currentTab
        }
      });
      
      document.dispatchEvent(event);
    }
  }, [location, currentTab]);
  
  // Set tab manually (can be used for sub-tabs within a main tab)
  const setTab = (tab: string) => {
    setPreviousTab(currentTab);
    setCurrentTab(tab);
    setCurrentTabContext(tab);
    
    console.log(`Tab manually set: ${currentTab || 'none'} → ${tab}`);
  };
  
  return (
    <TabContext.Provider value={{ currentTab, previousTab, setTab }}>
      {children}
    </TabContext.Provider>
  );
};

// Hook to use tab context
export const useTabContext = () => useContext(TabContext);

export default TabContextProvider;