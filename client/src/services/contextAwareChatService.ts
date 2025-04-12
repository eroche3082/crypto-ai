/**
 * Context-Aware Chat Service
 * 
 * Provides communication with the server-side chat API
 * for context-aware AI responses across different providers.
 */

import { apiRequest } from '@/lib/queryClient';
import { ChatMessage, getRecentMessages } from '@/utils/chatContextManager';

// Chat provider type
export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'vertexai' | 'auto';

// Chat request configuration
export interface ChatRequestConfig {
  provider?: AIProvider;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  contextSize?: number;
  tabContext?: string;
}

// Chat response type
export interface ChatResponse {
  text: string;
  provider: string;
}

/**
 * Send a message to the context-aware chat API
 */
export async function sendContextAwareMessage(
  message: string,
  config?: ChatRequestConfig
): Promise<ChatResponse> {
  // Get context messages
  const contextSize = config?.contextSize || 5;
  const tabContext = config?.tabContext;
  const recentMessages = getRecentMessages(contextSize, tabContext);
  
  // Format context for API
  const context = recentMessages.map(msg => `${msg.role}: ${msg.content}`);
  
  try {
    const response = await apiRequest<ChatResponse>(
      'POST',
      '/api/chat/context-aware',
      {
        message,
        context,
        config: {
          provider: config?.provider || 'auto',
          temperature: config?.temperature || 0.7,
          maxTokens: config?.maxTokens || 1000,
          systemPrompt: config?.systemPrompt
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending context-aware message:', error);
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
}

/**
 * Get available AI providers
 */
export async function getAvailableProviders(): Promise<AIProvider[]> {
  try {
    const response = await apiRequest<{ providers: AIProvider[] }>(
      'GET',
      '/api/chat/providers'
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.providers;
  } catch (error) {
    console.error('Error getting available providers:', error);
    return ['auto']; // Fallback to auto provider
  }
}