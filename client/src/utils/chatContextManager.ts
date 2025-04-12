/**
 * Chat Context Manager
 * 
 * Manages chat message history, context retention, and persistence
 * with Firebase synchronization for cross-device access.
 */

import { getFirebaseInstance } from '../services/firebaseSync';

// Message structure
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tabContext?: string;
}

const DEFAULT_CONTEXT_SIZE = 10;

// In-memory cache of messages
let messageCache: ChatMessage[] = [];
let isInitialized = false;

/**
 * Initialize the chat context manager and load messages from storage
 */
export async function initChatContextManager(userId?: string): Promise<void> {
  if (isInitialized) return;
  
  try {
    // Try to load from Firebase if available
    const firebase = getFirebaseInstance();
    
    if (firebase && userId) {
      const messages = await firebase.loadChatContext(userId);
      if (messages && Array.isArray(messages)) {
        messageCache = messages;
        console.log(`Loaded ${messages.length} messages from Firebase for user ${userId}`);
      }
    } else {
      // Fallback to localStorage
      const storedMessages = localStorage.getItem('chatMessages');
      if (storedMessages) {
        messageCache = JSON.parse(storedMessages);
        console.log(`Loaded ${messageCache.length} messages from localStorage`);
      }
    }
    
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing chat context manager:', error);
    // Initialize with empty cache if loading fails
    messageCache = [];
    isInitialized = true;
  }
}

/**
 * Add a new message to the context
 */
export function addMessageToContext(
  role: 'user' | 'assistant' | 'system',
  content: string,
  tabContext?: string
): void {
  const message: ChatMessage = {
    role,
    content,
    timestamp: new Date().toISOString(),
    tabContext
  };
  
  // Add to cache
  messageCache.push(message);
  
  // Trim cache if it gets too large
  if (messageCache.length > 100) {
    messageCache = messageCache.slice(-100);
  }
  
  // Persist to storage
  persistMessages();
}

/**
 * Get recent messages for context
 */
export function getRecentMessages(
  count: number = DEFAULT_CONTEXT_SIZE,
  tabContext?: string
): ChatMessage[] {
  // Filter by tab context if provided
  const filteredMessages = tabContext 
    ? messageCache.filter(m => !m.tabContext || m.tabContext === tabContext)
    : messageCache;
  
  // Return most recent N messages
  return filteredMessages.slice(-count);
}

/**
 * Clear all messages from context
 */
export function clearChatContext(): void {
  messageCache = [];
  persistMessages();
}

/**
 * Persist messages to storage
 */
async function persistMessages(): Promise<void> {
  try {
    // Try to save to Firebase if available
    const firebase = getFirebaseInstance();
    const userId = firebase?.getCurrentUserId();
    
    if (firebase && userId) {
      await firebase.saveChatContext(userId, messageCache);
    }
    
    // Always save to localStorage as fallback
    localStorage.setItem('chatMessages', JSON.stringify(messageCache));
  } catch (error) {
    console.error('Error persisting chat messages:', error);
    // Fallback to localStorage
    localStorage.setItem('chatMessages', JSON.stringify(messageCache));
  }
}

/**
 * Export message cache for debugging
 */
export function exportChatContext(): ChatMessage[] {
  return [...messageCache];
}