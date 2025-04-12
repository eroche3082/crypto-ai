/**
 * Context-Aware Chat Service
 * 
 * Client-side service for interacting with the multi-provider chat system,
 * managing chat history, and providing context-enhanced conversations.
 */

import { v4 as uuidv4 } from 'uuid';
import { getFirebaseInstance } from './firebaseSync';

// Chat message type
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// Chat context type
export interface ChatContext {
  tabId?: string;
  tabName?: string;
  currentCoin?: string;
  sourceData?: any;
  previousActivity?: string[];
}

// Chat provider type
export type ChatProvider = 'openai' | 'anthropic' | 'gemini' | 'vertexai';

// Chat providers info type
export interface ChatProvidersInfo {
  providers: ChatProvider[];
  capabilities: {
    text: ChatProvider[];
    image: ChatProvider[];
    audio: ChatProvider[];
  };
  features: {
    contextAwareChat: boolean;
    imageGeneration: boolean;
    imageAnalysis: boolean;
    translation: boolean;
    sentimentAnalysis: boolean;
  };
}

// Available providers cache
let providersCache: ChatProvidersInfo | null = null;
let providersCacheTimestamp: number = 0;

/**
 * Get available chat providers
 */
export async function getAvailableProviders(): Promise<ChatProvider[]> {
  try {
    // Use cache if available and less than 5 minutes old
    if (providersCache && (Date.now() - providersCacheTimestamp < 5 * 60 * 1000)) {
      return providersCache.providers;
    }
    
    // Fetch providers from server
    const response = await fetch('/chat/providers');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch providers: ${response.statusText}`);
    }
    
    const data: ChatProvidersInfo = await response.json();
    
    // Update cache
    providersCache = data;
    providersCacheTimestamp = Date.now();
    
    return data.providers;
  } catch (error) {
    console.error('Error fetching available providers:', error);
    return [];
  }
}

/**
 * Get provider capabilities
 */
export async function getProviderCapabilities(): Promise<ChatProvidersInfo['capabilities']> {
  try {
    // Ensure providers are loaded
    await getAvailableProviders();
    
    return providersCache?.capabilities || {
      text: [],
      image: [],
      audio: []
    };
  } catch (error) {
    console.error('Error fetching provider capabilities:', error);
    return {
      text: [],
      image: [],
      audio: []
    };
  }
}

/**
 * Get available features
 */
export async function getAvailableFeatures(): Promise<ChatProvidersInfo['features']> {
  try {
    // Ensure providers are loaded
    await getAvailableProviders();
    
    return providersCache?.features || {
      contextAwareChat: false,
      imageGeneration: false,
      imageAnalysis: false,
      translation: false,
      sentimentAnalysis: false
    };
  } catch (error) {
    console.error('Error fetching available features:', error);
    return {
      contextAwareChat: false,
      imageGeneration: false,
      imageAnalysis: false,
      translation: false,
      sentimentAnalysis: false
    };
  }
}

/**
 * Send a message to the context-aware chat system
 */
export async function sendChatMessage(
  message: string,
  conversationId: string,
  context?: ChatContext,
  previousMessages: ChatMessage[] = [],
  provider?: ChatProvider
): Promise<{ response: ChatMessage, provider: ChatProvider }> {
  try {
    // Format messages for API
    const formattedMessages = previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add new user message
    formattedMessages.push({
      role: 'user' as const,
      content: message
    });
    
    // Prepare request
    const requestBody = {
      messages: formattedMessages,
      context,
      provider,
      conversationId
    };
    
    // Send request to server
    const response = await fetch('/api/ai/context-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Create response message
    const responseMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: data.message,
      timestamp: Date.now()
    };
    
    return {
      response: responseMessage,
      provider: data.provider
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    
    // Create error response
    const errorMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: `I'm sorry, I encountered an error: ${error.message}. Please try again later.`,
      timestamp: Date.now()
    };
    
    return {
      response: errorMessage,
      provider: 'openai'
    };
  }
}

/**
 * Create a new conversation
 */
export function createNewConversation(
  userId?: string,
  initialContext?: ChatContext
): { conversationId: string, messages: ChatMessage[] } {
  const conversationId = uuidv4();
  const welcomeMessage: ChatMessage = {
    id: uuidv4(),
    role: 'system',
    content: 'Welcome to CryptoBot AI! How can I assist you with cryptocurrency today?',
    timestamp: Date.now()
  };
  
  // Save to Firebase if user is logged in
  if (userId) {
    const firebase = getFirebaseInstance();
    if (firebase) {
      firebase.saveConversation(userId, conversationId, [welcomeMessage], initialContext);
    }
  }
  
  return {
    conversationId,
    messages: [welcomeMessage]
  };
}

/**
 * Load a conversation from storage
 */
export async function loadConversation(
  userId: string,
  conversationId: string
): Promise<{ messages: ChatMessage[], context?: ChatContext } | null> {
  try {
    const firebase = getFirebaseInstance();
    
    if (!firebase) {
      throw new Error('Firebase is not initialized');
    }
    
    return await firebase.loadConversation(userId, conversationId);
  } catch (error) {
    console.error('Error loading conversation:', error);
    return null;
  }
}

/**
 * Save a conversation to storage
 */
export async function saveConversation(
  userId: string,
  conversationId: string,
  messages: ChatMessage[],
  context?: ChatContext
): Promise<boolean> {
  try {
    const firebase = getFirebaseInstance();
    
    if (!firebase) {
      throw new Error('Firebase is not initialized');
    }
    
    await firebase.saveConversation(userId, conversationId, messages, context);
    return true;
  } catch (error) {
    console.error('Error saving conversation:', error);
    return false;
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  userId: string,
  conversationId: string
): Promise<boolean> {
  try {
    const firebase = getFirebaseInstance();
    
    if (!firebase) {
      throw new Error('Firebase is not initialized');
    }
    
    await firebase.deleteConversation(userId, conversationId);
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
}

/**
 * Get recent conversations
 */
export async function getRecentConversations(
  userId: string,
  limit: number = 10
): Promise<{ id: string, preview: string, timestamp: number }[]> {
  try {
    const firebase = getFirebaseInstance();
    
    if (!firebase) {
      throw new Error('Firebase is not initialized');
    }
    
    return await firebase.getRecentConversations(userId, limit);
  } catch (error) {
    console.error('Error fetching recent conversations:', error);
    return [];
  }
}