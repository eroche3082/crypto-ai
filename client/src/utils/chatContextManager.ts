/**
 * Chat Context Manager
 * 
 * Provides utilities for managing and maintaining chat context across tabs,
 * with fallback to localStorage when Firebase is not available.
 */

import { syncToFirebase, listenForChanges } from "@/services/firebaseSync";

// Current tab context
let currentTab: string = '';

// Context data object
interface ChatContext {
  tab: string;
  recentMessages: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
  entities: Record<string, any>;
  preferences: Record<string, any>;
  metrics: Record<string, any>;
}

// Default context structure
const defaultContext: ChatContext = {
  tab: '',
  recentMessages: [],
  entities: {},
  preferences: {},
  metrics: {}
};

// Mapping of tab names to context data
const tabContexts: Record<string, ChatContext> = {};

// Maximum number of recent messages to keep per tab
const MAX_RECENT_MESSAGES = 10;

// Track if Firebase sync is initialized
let isFirebaseSyncInitialized = false;

/**
 * Initialize the chat context manager
 */
export function initializeChatContextManager(useFirebase: boolean = false): void {
  console.log('Initializing Chat Context Manager...');
  
  // Load existing context from localStorage
  loadContextFromLocalStorage();
  
  // Set up Firebase sync if enabled
  isFirebaseSyncInitialized = useFirebase;
  
  if (useFirebase) {
    // Listen for changes to the context in Firebase
    listenForChanges('context', {
      onSync: (data) => {
        if (data) {
          // Merge received context with local context
          mergeFirebaseContext(data);
        }
      },
      onError: (error) => {
        console.error('Error syncing context from Firebase:', error);
      }
    });
  }
  
  console.log('Chat Context Manager initialized');
}

/**
 * Load context from localStorage
 */
function loadContextFromLocalStorage(): void {
  const storedContexts = localStorage.getItem('chat_contexts');
  
  if (storedContexts) {
    try {
      const parsedContexts = JSON.parse(storedContexts);
      Object.assign(tabContexts, parsedContexts);
    } catch (error) {
      console.error('Error parsing stored chat contexts:', error);
    }
  }
  
  // Also load current tab
  const storedCurrentTab = localStorage.getItem('current_tab');
  if (storedCurrentTab) {
    currentTab = storedCurrentTab;
  }
}

/**
 * Merge context received from Firebase with local context
 */
function mergeFirebaseContext(firebaseContext: Record<string, ChatContext>): void {
  // For each tab in the Firebase context
  Object.entries(firebaseContext).forEach(([tab, context]) => {
    if (!tabContexts[tab]) {
      // If this tab doesn't exist locally, create it
      tabContexts[tab] = { ...defaultContext, tab };
    }
    
    // Merge recent messages (keeping the most recent ones)
    const combinedMessages = [
      ...tabContexts[tab].recentMessages,
      ...context.recentMessages
    ];
    
    // Sort by timestamp and take the latest MAX_RECENT_MESSAGES
    const sortedMessages = combinedMessages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .filter((msg, index, self) => 
        // Remove duplicates based on content and role
        index === self.findIndex(m => 
          m.content === msg.content && m.role === msg.role
        )
      )
      .slice(0, MAX_RECENT_MESSAGES);
    
    // Update the tab context
    tabContexts[tab] = {
      ...tabContexts[tab],
      recentMessages: sortedMessages,
      // Merge other properties, preferring the Firebase version for conflicts
      entities: { ...tabContexts[tab].entities, ...context.entities },
      preferences: { ...tabContexts[tab].preferences, ...context.preferences },
      metrics: { ...tabContexts[tab].metrics, ...context.metrics }
    };
  });
  
  // Save the updated contexts to localStorage
  saveContextsToLocalStorage();
}

/**
 * Save contexts to localStorage
 */
function saveContextsToLocalStorage(): void {
  localStorage.setItem('chat_contexts', JSON.stringify(tabContexts));
}

/**
 * Set the current tab context
 */
export function setCurrentTabContext(tab: string): void {
  currentTab = tab;
  localStorage.setItem('current_tab', tab);
  
  // Create the tab context if it doesn't exist
  if (!tabContexts[tab]) {
    tabContexts[tab] = { ...defaultContext, tab };
    saveContextsToLocalStorage();
  }
}

/**
 * Get the current tab context
 */
export function getCurrentTabContext(): string {
  return currentTab;
}

/**
 * Add a message to the current tab's context
 */
export function addMessageToContext(role: string, content: string): void {
  if (!currentTab) return;
  
  // Ensure the tab context exists
  if (!tabContexts[currentTab]) {
    tabContexts[currentTab] = { ...defaultContext, tab: currentTab };
  }
  
  // Add the message
  const message = {
    role,
    content,
    timestamp: new Date().toISOString()
  };
  
  tabContexts[currentTab].recentMessages.unshift(message);
  
  // Limit the number of recent messages
  if (tabContexts[currentTab].recentMessages.length > MAX_RECENT_MESSAGES) {
    tabContexts[currentTab].recentMessages = tabContexts[currentTab].recentMessages.slice(0, MAX_RECENT_MESSAGES);
  }
  
  // Save to localStorage
  saveContextsToLocalStorage();
  
  // Sync to Firebase if initialized
  if (isFirebaseSyncInitialized) {
    syncToFirebase(`context/${currentTab}`, tabContexts[currentTab])
      .catch((error) => {
        console.error('Error syncing message to Firebase:', error);
      });
  }
}

/**
 * Get recent messages for the current tab
 */
export function getRecentMessages(): Array<{ role: string; content: string; timestamp: string }> {
  if (!currentTab || !tabContexts[currentTab]) {
    return [];
  }
  
  return tabContexts[currentTab].recentMessages;
}

/**
 * Add an entity to the current tab's context
 */
export function addEntityToContext(entityType: string, entityData: any): void {
  if (!currentTab) return;
  
  // Ensure the tab context exists
  if (!tabContexts[currentTab]) {
    tabContexts[currentTab] = { ...defaultContext, tab: currentTab };
  }
  
  // Add the entity
  if (!tabContexts[currentTab].entities[entityType]) {
    tabContexts[currentTab].entities[entityType] = [];
  }
  
  // If it's an array, append to it
  if (Array.isArray(tabContexts[currentTab].entities[entityType])) {
    tabContexts[currentTab].entities[entityType].push(entityData);
  } else {
    // Otherwise, just set it
    tabContexts[currentTab].entities[entityType] = entityData;
  }
  
  // Save to localStorage
  saveContextsToLocalStorage();
  
  // Sync to Firebase if initialized
  if (isFirebaseSyncInitialized) {
    syncToFirebase(`context/${currentTab}/entities/${entityType}`, tabContexts[currentTab].entities[entityType])
      .catch((error) => {
        console.error('Error syncing entity to Firebase:', error);
      });
  }
}

/**
 * Get entities of a specific type from the current tab's context
 */
export function getEntitiesFromContext(entityType: string): any {
  if (!currentTab || !tabContexts[currentTab]) {
    return null;
  }
  
  return tabContexts[currentTab].entities[entityType];
}

/**
 * Set a preference for the current tab
 */
export function setTabPreference(key: string, value: any): void {
  if (!currentTab) return;
  
  // Ensure the tab context exists
  if (!tabContexts[currentTab]) {
    tabContexts[currentTab] = { ...defaultContext, tab: currentTab };
  }
  
  // Set the preference
  tabContexts[currentTab].preferences[key] = value;
  
  // Save to localStorage
  saveContextsToLocalStorage();
  
  // Sync to Firebase if initialized
  if (isFirebaseSyncInitialized) {
    syncToFirebase(`context/${currentTab}/preferences/${key}`, value)
      .catch((error) => {
        console.error('Error syncing preference to Firebase:', error);
      });
  }
}

/**
 * Get a preference from the current tab
 */
export function getTabPreference(key: string): any {
  if (!currentTab || !tabContexts[currentTab]) {
    return null;
  }
  
  return tabContexts[currentTab].preferences[key];
}

/**
 * Update a metric for the current tab
 */
export function updateTabMetric(key: string, value: any): void {
  if (!currentTab) return;
  
  // Ensure the tab context exists
  if (!tabContexts[currentTab]) {
    tabContexts[currentTab] = { ...defaultContext, tab: currentTab };
  }
  
  // Update the metric
  tabContexts[currentTab].metrics[key] = value;
  
  // Save to localStorage
  saveContextsToLocalStorage();
  
  // Sync to Firebase if initialized
  if (isFirebaseSyncInitialized) {
    syncToFirebase(`context/${currentTab}/metrics/${key}`, value)
      .catch((error) => {
        console.error('Error syncing metric to Firebase:', error);
      });
  }
}

/**
 * Get a metric from the current tab
 */
export function getTabMetric(key: string): any {
  if (!currentTab || !tabContexts[currentTab]) {
    return null;
  }
  
  return tabContexts[currentTab].metrics[key];
}

/**
 * Get the full context for the current tab
 */
export function getFullTabContext(): ChatContext | null {
  if (!currentTab || !tabContexts[currentTab]) {
    return null;
  }
  
  return tabContexts[currentTab];
}

/**
 * Clear the context for a specific tab
 */
export function clearTabContext(tab: string): void {
  if (tabContexts[tab]) {
    tabContexts[tab] = { ...defaultContext, tab };
    saveContextsToLocalStorage();
    
    // Sync to Firebase if initialized
    if (isFirebaseSyncInitialized) {
      syncToFirebase(`context/${tab}`, tabContexts[tab])
        .catch((error) => {
          console.error('Error syncing cleared context to Firebase:', error);
        });
    }
  }
}

/**
 * Get a formatted context string for AI prompts
 */
export function getFormattedContextForAI(): string {
  if (!currentTab || !tabContexts[currentTab]) {
    return 'No context available.';
  }
  
  const context = tabContexts[currentTab];
  
  // Format recent messages
  const messagesStr = context.recentMessages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');
  
  // Format entities
  const entitiesStr = Object.entries(context.entities)
    .map(([type, data]) => {
      if (Array.isArray(data)) {
        return `${type}: ${data.map(item => JSON.stringify(item)).join(', ')}`;
      }
      return `${type}: ${JSON.stringify(data)}`;
    })
    .join('\n');
  
  // Format preferences
  const preferencesStr = Object.entries(context.preferences)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');
  
  // Format metrics
  const metricsStr = Object.entries(context.metrics)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');
  
  // Combine all context elements
  return `
Tab: ${context.tab}

Recent conversation:
${messagesStr || 'No recent messages.'}

Entities:
${entitiesStr || 'No entities.'}

User preferences:
${preferencesStr || 'No preferences set.'}

Metrics:
${metricsStr || 'No metrics recorded.'}
  `.trim();
}

// Export types
export type { ChatContext };