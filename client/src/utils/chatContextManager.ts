/**
 * Chat Context Manager
 * 
 * Manages chat context across tabs, sessions, and devices.
 * Provides functionality for:
 * 1. Storing and retrieving conversation history
 * 2. Maintaining context awareness across tabs
 * 3. Synchronizing context between devices via Firebase
 * 4. Managing memory, summaries, and context pruning
 */

import { getFirebaseInstance } from '@/services/firebaseSync';

// Message roles
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool' | 'function';

// Chat message interface
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  tabContext?: string;
  metadata?: Record<string, any>;
}

// Memory item interface
export interface MemoryItem {
  id: string;
  text: string;
  source: string;
  timestamp: number;
  category?: string;
  importance: number;
}

// Chat context interface
export interface ChatContext {
  userId: string;
  messages: ChatMessage[];
  memory: MemoryItem[];
  currentTabContext?: string;
  lastUpdated: number;
  summarizedContext?: string;
}

// Default system message
const DEFAULT_SYSTEM_MESSAGE = `You are CryptoBot, a helpful AI assistant specializing in cryptocurrency and blockchain technology. You provide information about cryptocurrencies, market trends, investment strategies, and blockchain technology. You are knowledgeable, professional, and user-friendly.`;

// Global cache
let contextCache: Record<string, ChatContext> = {};

/**
 * Initialize chat context for a user
 */
export async function initializeChatContext(userId: string): Promise<ChatContext> {
  // Check cache first
  if (contextCache[userId]) {
    return contextCache[userId];
  }
  
  try {
    // Try to get context from Firebase
    const firebase = getFirebaseInstance();
    if (firebase) {
      const existingContext = await firebase.getChatContext(userId);
      
      if (existingContext) {
        // Cache and return existing context
        contextCache[userId] = existingContext;
        return existingContext;
      }
    }
    
    // Create new context if none exists
    const newContext: ChatContext = {
      userId,
      messages: [
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: DEFAULT_SYSTEM_MESSAGE,
          timestamp: Date.now()
        }
      ],
      memory: [],
      lastUpdated: Date.now()
    };
    
    // Save new context to Firebase
    if (firebase) {
      await firebase.saveChatContext(userId, newContext);
    }
    
    // Cache and return new context
    contextCache[userId] = newContext;
    return newContext;
  } catch (error) {
    console.error('Error initializing chat context:', error);
    
    // Return a default context if all else fails
    const defaultContext: ChatContext = {
      userId,
      messages: [
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: DEFAULT_SYSTEM_MESSAGE,
          timestamp: Date.now()
        }
      ],
      memory: [],
      lastUpdated: Date.now()
    };
    
    contextCache[userId] = defaultContext;
    return defaultContext;
  }
}

/**
 * Get chat context for a user
 */
export async function getChatContext(userId: string): Promise<ChatContext> {
  // Initialize context if needed
  if (!contextCache[userId]) {
    return await initializeChatContext(userId);
  }
  
  return contextCache[userId];
}

/**
 * Add message to chat context
 */
export async function addMessageToContext(
  userId: string,
  role: MessageRole,
  content: string,
  tabContext?: string,
  metadata?: Record<string, any>
): Promise<ChatContext> {
  try {
    // Get current context
    const context = await getChatContext(userId);
    
    // Create new message
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: Date.now(),
      tabContext,
      metadata
    };
    
    // Add message to context
    context.messages.push(newMessage);
    context.lastUpdated = Date.now();
    context.currentTabContext = tabContext;
    
    // Save updated context
    await saveChatContext(userId, context);
    
    // Return updated context
    return context;
  } catch (error) {
    console.error('Error adding message to context:', error);
    throw error;
  }
}

/**
 * Add memory item to chat context
 */
export async function addMemoryItem(
  userId: string,
  text: string,
  source: string,
  category?: string,
  importance: number = 0.5
): Promise<ChatContext> {
  try {
    // Get current context
    const context = await getChatContext(userId);
    
    // Create new memory item
    const newItem: MemoryItem = {
      id: crypto.randomUUID(),
      text,
      source,
      timestamp: Date.now(),
      category,
      importance
    };
    
    // Add item to memory
    context.memory.push(newItem);
    context.lastUpdated = Date.now();
    
    // Limit memory size (keep only most important items)
    if (context.memory.length > 50) {
      context.memory.sort((a, b) => b.importance - a.importance);
      context.memory = context.memory.slice(0, 50);
    }
    
    // Save updated context
    await saveChatContext(userId, context);
    
    // Return updated context
    return context;
  } catch (error) {
    console.error('Error adding memory item:', error);
    throw error;
  }
}

/**
 * Save chat context
 */
export async function saveChatContext(userId: string, context: ChatContext): Promise<void> {
  try {
    // Update cache
    contextCache[userId] = context;
    
    // Save to local storage as backup
    localStorage.setItem(`chat_context_${userId}`, JSON.stringify(context));
    
    // Save to Firebase
    const firebase = getFirebaseInstance();
    if (firebase) {
      await firebase.saveChatContext(userId, context);
    }
  } catch (error) {
    console.error('Error saving chat context:', error);
    throw error;
  }
}

/**
 * Clear user chat history
 */
export async function clearChatHistory(userId: string): Promise<ChatContext> {
  try {
    // Get current context
    const context = await getChatContext(userId);
    
    // Keep system message but clear other messages
    const systemMessages = context.messages.filter(msg => msg.role === 'system');
    
    // Create reset context
    const resetContext: ChatContext = {
      userId,
      messages: systemMessages.length > 0 
        ? systemMessages 
        : [
            {
              id: crypto.randomUUID(),
              role: 'system',
              content: DEFAULT_SYSTEM_MESSAGE,
              timestamp: Date.now()
            }
          ],
      memory: context.memory, // Keep memory for personalization
      lastUpdated: Date.now()
    };
    
    // Save reset context
    await saveChatContext(userId, resetContext);
    
    // Return reset context
    return resetContext;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
}

/**
 * Get messages for a specific tab context
 */
export async function getTabContextMessages(
  userId: string,
  tabContext: string,
  limit: number = 10
): Promise<ChatMessage[]> {
  try {
    // Get current context
    const context = await getChatContext(userId);
    
    // Filter messages by tab context
    const tabMessages = context.messages.filter(
      msg => msg.tabContext === tabContext || msg.role === 'system'
    );
    
    // Return limited number of messages (most recent first)
    return tabMessages
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error getting tab context messages:', error);
    return [];
  }
}

/**
 * Generate context-aware prompt for AI
 */
export async function generateContextAwarePrompt(
  userId: string,
  tabContext: string,
  prompt: string,
  includeMemory: boolean = true
): Promise<ChatMessage[]> {
  try {
    // Get current context
    const context = await getChatContext(userId);
    
    // Build prompt messages array
    const promptMessages: ChatMessage[] = [];
    
    // Add system message
    const systemMessage = context.messages.find(msg => msg.role === 'system');
    if (systemMessage) {
      promptMessages.push(systemMessage);
    } else {
      promptMessages.push({
        id: crypto.randomUUID(),
        role: 'system',
        content: DEFAULT_SYSTEM_MESSAGE,
        timestamp: Date.now()
      });
    }
    
    // Add tab-specific context
    if (tabContext) {
      // Get recent messages from this tab
      const tabMessages = await getTabContextMessages(userId, tabContext, 6);
      promptMessages.push(...tabMessages);
      
      // Add tab context as system message if not already present
      if (!systemMessage?.content.includes(tabContext)) {
        promptMessages.push({
          id: crypto.randomUUID(),
          role: 'system',
          content: `The user is currently on the ${tabContext} tab. Tailor your responses to be relevant to this context.`,
          timestamp: Date.now()
        });
      }
    }
    
    // Add memory context if requested
    if (includeMemory && context.memory.length > 0) {
      // Sort memory by importance
      const relevantMemory = context.memory
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 5);
      
      if (relevantMemory.length > 0) {
        const memoryText = relevantMemory
          .map(item => `- ${item.text} (${item.source})`)
          .join('\n');
        
        promptMessages.push({
          id: crypto.randomUUID(),
          role: 'system',
          content: `Relevant user context:\n${memoryText}`,
          timestamp: Date.now()
        });
      }
    }
    
    // Add the user's prompt
    promptMessages.push({
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
      tabContext
    });
    
    return promptMessages;
  } catch (error) {
    console.error('Error generating context-aware prompt:', error);
    
    // Return basic prompt if error
    return [
      {
        id: crypto.randomUUID(),
        role: 'system',
        content: DEFAULT_SYSTEM_MESSAGE,
        timestamp: Date.now()
      },
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
        tabContext
      }
    ];
  }
}

/**
 * Summarize context for long-term memory
 */
export async function summarizeContext(userId: string): Promise<string> {
  try {
    // Get current context
    const context = await getChatContext(userId);
    
    // Return existing summary if it exists and is recent
    if (
      context.summarizedContext && 
      Date.now() - context.lastUpdated < 24 * 60 * 60 * 1000 // 24 hours
    ) {
      return context.summarizedContext;
    }
    
    // TODO: Implement summarization with AI
    // For now, just return a count of messages and memory items
    const summary = `User ${userId} has ${context.messages.length} messages and ${context.memory.length} memory items.`;
    
    // Save summary to context
    context.summarizedContext = summary;
    await saveChatContext(userId, context);
    
    return summary;
  } catch (error) {
    console.error('Error summarizing context:', error);
    return '';
  }
}

/**
 * Sync chat context between devices
 */
export async function syncChatContextBetweenDevices(userId: string): Promise<boolean> {
  try {
    // Get firebase instance
    const firebase = getFirebaseInstance();
    if (!firebase) return false;
    
    // Clear cache to force refresh from server
    delete contextCache[userId];
    
    // Get context from Firebase
    const serverContext = await firebase.getChatContext(userId);
    
    if (serverContext) {
      // Update local cache
      contextCache[userId] = serverContext;
      
      // Update local storage
      localStorage.setItem(`chat_context_${userId}`, JSON.stringify(serverContext));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error syncing chat context between devices:', error);
    return false;
  }
}