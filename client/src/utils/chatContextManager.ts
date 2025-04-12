/**
 * Chat Context Manager
 * 
 * Utility for managing chat contexts across tabs, preserving conversation
 * context, and tracking user activities for context-enhanced AI responses.
 */

import { ChatContext } from '../services/contextAwareChatService';
import { getFirebaseInstance } from '../services/firebaseSync';

// Maximum number of recent activities to track
const MAX_RECENT_ACTIVITIES = 5;

// Global context state
let globalContext: ChatContext = {};

// Tab contexts map
const tabContexts: Map<string, ChatContext> = new Map();

// Recent user activities
const recentActivities: string[] = [];

/**
 * Add a user activity to the recent activities list
 */
export function addUserActivity(activity: string): void {
  // Add to the beginning of the array
  recentActivities.unshift(activity);
  
  // Keep only the most recent activities
  if (recentActivities.length > MAX_RECENT_ACTIVITIES) {
    recentActivities.pop();
  }
  
  // Update global context
  globalContext.previousActivity = [...recentActivities];
}

/**
 * Set the global context
 */
export function setGlobalContext(context: Partial<ChatContext>): void {
  globalContext = {
    ...globalContext,
    ...context
  };
  
  // Sync with Firebase if user is logged in
  const firebase = getFirebaseInstance();
  if (firebase) {
    const currentUser = firebase.getCurrentUser();
    if (currentUser) {
      firebase.saveUserContext(currentUser.uid, globalContext);
    }
  }
}

/**
 * Get the global context
 */
export function getGlobalContext(): ChatContext {
  return {
    ...globalContext,
    previousActivity: [...recentActivities]
  };
}

/**
 * Set tab-specific context
 */
export function setTabContext(tabId: string, context: Partial<ChatContext>): void {
  // Get existing context or create new one
  const existingContext = tabContexts.get(tabId) || {};
  
  // Merge contexts
  const newContext = {
    ...existingContext,
    ...context,
    tabId
  };
  
  // Store context
  tabContexts.set(tabId, newContext);
}

/**
 * Get tab-specific context
 */
export function getTabContext(tabId: string): ChatContext | undefined {
  return tabContexts.get(tabId);
}

/**
 * Get the combined context for a tab
 */
export function getCombinedContextForTab(tabId: string): ChatContext {
  // Get tab-specific context
  const tabContext = tabContexts.get(tabId) || {};
  
  // Combine with global context
  return {
    ...globalContext,
    ...tabContext,
    tabId,
    previousActivity: [...recentActivities]
  };
}

/**
 * Clear tab context
 */
export function clearTabContext(tabId: string): void {
  tabContexts.delete(tabId);
}

/**
 * Clear all contexts
 */
export function clearAllContexts(): void {
  globalContext = {};
  tabContexts.clear();
  recentActivities.length = 0;
}

/**
 * Load user context from storage
 */
export async function loadUserContext(userId: string): Promise<void> {
  try {
    const firebase = getFirebaseInstance();
    
    if (!firebase) {
      throw new Error('Firebase is not initialized');
    }
    
    const context = await firebase.loadUserContext(userId);
    
    if (context) {
      globalContext = context;
      
      // Load recent activities if available
      if (context.previousActivity && Array.isArray(context.previousActivity)) {
        recentActivities.length = 0;
        recentActivities.push(...context.previousActivity.slice(0, MAX_RECENT_ACTIVITIES));
      }
    }
  } catch (error) {
    console.error('Error loading user context:', error);
  }
}

/**
 * Track tab change
 */
export function trackTabChange(tabId: string, tabName: string): void {
  // Add activity
  addUserActivity(`Viewed ${tabName} tab`);
  
  // Set tab context
  setTabContext(tabId, { tabName });
}

/**
 * Track coin view
 */
export function trackCoinView(coinId: string, coinName: string, tabId?: string): void {
  // Add activity
  addUserActivity(`Viewed ${coinName} (${coinId})`);
  
  // Set global context
  setGlobalContext({ currentCoin: coinName });
  
  // Set tab context if tabId provided
  if (tabId) {
    setTabContext(tabId, { currentCoin: coinName });
  }
}

/**
 * Track chart interaction
 */
export function trackChartInteraction(
  chartType: string, 
  period: string,
  coinId?: string,
  tabId?: string
): void {
  // Add activity
  addUserActivity(`Viewed ${chartType} chart (${period})${coinId ? ` for ${coinId}` : ''}`);
  
  // Update tab context if tabId provided
  if (tabId) {
    const tabContext = getTabContext(tabId) || {};
    setTabContext(tabId, { 
      ...tabContext,
      sourceData: {
        ...tabContext.sourceData,
        chartType,
        period
      }
    });
  }
}

/**
 * Track search query
 */
export function trackSearchQuery(query: string, tabId?: string): void {
  // Add activity
  addUserActivity(`Searched for "${query}"`);
  
  // Update tab context if tabId provided
  if (tabId) {
    const tabContext = getTabContext(tabId) || {};
    setTabContext(tabId, { 
      ...tabContext,
      sourceData: {
        ...tabContext.sourceData,
        searchQuery: query
      }
    });
  }
}