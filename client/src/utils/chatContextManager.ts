/**
 * Chat Context Manager
 * Provides utilities for managing chatbot context and preferences based on the current tab
 */

// Tab context interface
export interface TabContext {
  tabName: string;
  description: string;
  availableActions: string[];
  fallbackResponses: string[];
}

// Context preference interface for persistent storage
export interface ContextPreference {
  tabName: string;
  preferences: string[];
  lastInteraction: string;
}

/**
 * Get the current tab context based on URL path
 */
export function getCurrentTabContext(): string {
  if (typeof window === 'undefined') return 'dashboard';
  
  const path = window.location.pathname;
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length === 0) return 'dashboard';
  
  // Handle special cases
  if (segments[0].includes('analysis')) return 'analysis';
  if (segments[0].includes('portfolio')) return 'portfolio';
  if (segments[0].includes('tax')) return 'taxsimulator';
  if (segments[0].includes('message') || segments[0].includes('wallet-messaging')) return 'walletmessaging';
  
  return segments[0].toLowerCase();
}

/**
 * Save tab context preference
 */
export function saveTabPreference(tabName: string, preference: string): void {
  try {
    // Get existing preferences
    const prefsKey = `${tabName}_preferences`;
    const existingPrefs = JSON.parse(localStorage.getItem(prefsKey) || '[]');
    
    // Add new preference if it doesn't already exist
    if (!existingPrefs.includes(preference)) {
      const updatedPrefs = [...existingPrefs, preference];
      localStorage.setItem(prefsKey, JSON.stringify(updatedPrefs));
    }
    
    // Update last interaction timestamp
    localStorage.setItem(`${tabName}_last_interaction`, new Date().toISOString());
  } catch (error) {
    console.error('Error saving tab preference:', error);
  }
}

/**
 * Get tab preferences
 */
export function getTabPreferences(tabName: string): string[] {
  try {
    const prefsKey = `${tabName}_preferences`;
    return JSON.parse(localStorage.getItem(prefsKey) || '[]');
  } catch (error) {
    console.error('Error getting tab preferences:', error);
    return [];
  }
}

/**
 * Get recently used tabs based on interaction history
 */
export function getRecentlyUsedTabs(): string[] {
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Find all keys that match the pattern "*_last_interaction"
    const interactionKeys = keys.filter(key => key.endsWith('_last_interaction'));
    
    // Extract tab names and timestamps
    const tabTimestamps = interactionKeys.map(key => {
      const tabName = key.replace('_last_interaction', '');
      const timestamp = localStorage.getItem(key);
      return { tabName, timestamp };
    });
    
    // Sort by timestamp (most recent first) and extract tab names
    return tabTimestamps
      .sort((a, b) => {
        return new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime();
      })
      .map(item => item.tabName);
  } catch (error) {
    console.error('Error getting recently used tabs:', error);
    return [];
  }
}

/**
 * Track tab interaction
 * Call this when the user interacts with a specific tab
 */
export function trackTabInteraction(tabName: string): void {
  try {
    localStorage.setItem(`${tabName}_last_interaction`, new Date().toISOString());
    
    // Also update current tab
    localStorage.setItem('current_tab', tabName);
  } catch (error) {
    console.error('Error tracking tab interaction:', error);
  }
}

/**
 * Get all context data for the API
 * This combines various sources of context for more intelligent responses
 */
export function getContextDataForAPI(tabName: string): any {
  const context: Record<string, any> = {
    tabName,
    preferences: getTabPreferences(tabName),
    recentTabs: getRecentlyUsedTabs().slice(0, 5),
    lastInteraction: localStorage.getItem(`${tabName}_last_interaction`) || null
  };
  
  // Add tab-specific context items
  switch (tabName) {
    case 'portfolio':
    case 'portfolioanalysis':
      context.portfolioData = localStorage.getItem('portfolio_data');
      break;
      
    case 'education':
      context.courses = localStorage.getItem('education_interests');
      context.learningProgress = localStorage.getItem('learning_progress');
      break;
      
    case 'news':
      context.newsPreferences = localStorage.getItem('news_preferences');
      break;
      
    case 'locations':
      context.savedLocations = localStorage.getItem('locations_search_history');
      break;
      
    case 'taxsimulator':
      context.taxCountry = localStorage.getItem('tax_country');
      break;
      
    case 'walletmessaging':
      context.recentContacts = localStorage.getItem('wallet_recent_contacts');
      break;
  }
  
  return context;
}