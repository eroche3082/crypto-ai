/**
 * Context-Aware Chat Controller
 * 
 * Manages the multi-provider chat system with intelligent routing,
 * context management, and automatic fallback mechanisms.
 */

import { Request, Response } from 'express';
import * as openai from '../openai';
import * as anthropic from '../anthropic';
import * as gemini from '../gemini';
import * as vertexai from '../vertexai';

// Chat provider type
type ChatProvider = 'openai' | 'anthropic' | 'gemini' | 'vertexai';

// Chat message type
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Chat request
interface ChatRequest {
  messages: ChatMessage[];
  context?: {
    tabId?: string;
    tabName?: string;
    currentCoin?: string;
    sourceData?: any;
    previousActivity?: string[];
  };
  provider?: ChatProvider;
  userId?: string;
  conversationId?: string;
}

// Chat response
interface ChatResponse {
  message: string;
  provider: ChatProvider;
  conversationId?: string;
}

// Cached provider availability
let availableProviders: ChatProvider[] | null = null;
let providerLastChecked: number = 0;

/**
 * Get available chat providers
 */
export function getAvailableProviders(): ChatProvider[] {
  // Return cached providers if available and checked within last 5 minutes
  if (availableProviders && (Date.now() - providerLastChecked < 5 * 60 * 1000)) {
    return availableProviders;
  }
  
  const providers: ChatProvider[] = [];
  
  // Check for OpenAI
  if (process.env.OPENAI_API_KEY) {
    providers.push('openai');
  }
  
  // Check for Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push('anthropic');
  }
  
  // Check for Gemini
  if (process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    providers.push('gemini');
  }
  
  // Check for Vertex AI
  if (process.env.GOOGLE_VERTEX_KEY_ID) {
    providers.push('vertexai');
  }
  
  // Update cache
  availableProviders = providers;
  providerLastChecked = Date.now();
  
  return providers;
}

/**
 * Get best provider for request
 */
function getBestProvider(req: ChatRequest): ChatProvider {
  const providers = getAvailableProviders();
  
  // Return requested provider if it's available
  if (req.provider && providers.includes(req.provider)) {
    return req.provider;
  }
  
  // Return first available provider
  if (providers.length > 0) {
    return providers[0];
  }
  
  // Default fallback to OpenAI
  return 'openai';
}

/**
 * Enhance messages with context
 */
function enhanceWithContext(messages: ChatMessage[], context?: any): ChatMessage[] {
  if (!context) {
    return messages;
  }
  
  const enhancedMessages = [...messages];
  
  // Add system message with context if there isn't already a system message
  const hasSystemMessage = messages.some(m => m.role === 'system');
  
  if (!hasSystemMessage) {
    let systemMessage = 'You are a helpful cryptocurrency assistant. ';
    
    if (context.tabName) {
      systemMessage += `The user is currently in the ${context.tabName} tab. `;
    }
    
    if (context.currentCoin) {
      systemMessage += `They are viewing information about ${context.currentCoin}. `;
    }
    
    if (context.previousActivity && context.previousActivity.length > 0) {
      systemMessage += `Their recent activities include: ${context.previousActivity.join(', ')}. `;
    }
    
    systemMessage += 'Provide concise, accurate information and consider the context when responding.';
    
    // Insert system message at beginning
    enhancedMessages.unshift({
      role: 'system',
      content: systemMessage
    });
  }
  
  return enhancedMessages;
}

/**
 * Handle chat with any provider
 */
async function handleChatWithProvider(
  provider: ChatProvider, 
  messages: ChatMessage[]
): Promise<string> {
  try {
    switch (provider) {
      case 'openai':
        return await openai.generateChatResponse(messages);
      
      case 'anthropic':
        return await anthropic.generateChatResponse(messages);
      
      case 'gemini':
        return await gemini.generateResponse(messages);
      
      case 'vertexai':
        return await vertexai.generateResponse(messages);
      
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error with ${provider}:`, error);
    throw error;
  }
}

/**
 * Handle chat with fallback
 */
async function handleChatWithFallback(req: ChatRequest): Promise<ChatResponse> {
  const providers = getAvailableProviders();
  
  // Get requested or best provider
  const primaryProvider = getBestProvider(req);
  
  // Add context to messages
  const enhancedMessages = enhanceWithContext(req.messages, req.context);
  
  try {
    // Try with primary provider
    const message = await handleChatWithProvider(primaryProvider, enhancedMessages);
    
    return {
      message,
      provider: primaryProvider,
      conversationId: req.conversationId
    };
  } catch (primaryError) {
    console.error(`Primary provider ${primaryProvider} failed:`, primaryError);
    
    // Try fallback providers
    for (const provider of providers) {
      if (provider === primaryProvider) continue;
      
      try {
        console.log(`Trying fallback provider: ${provider}`);
        const message = await handleChatWithProvider(provider, enhancedMessages);
        
        return {
          message,
          provider,
          conversationId: req.conversationId
        };
      } catch (fallbackError) {
        console.error(`Fallback provider ${provider} failed:`, fallbackError);
      }
    }
    
    // All providers failed
    throw new Error(`All AI providers failed to process the request`);
  }
}

/**
 * Express handler for context-aware chat
 */
export async function handleContextAwareChat(req: Request, res: Response) {
  try {
    const chatRequest: ChatRequest = req.body;
    
    // Validate request
    if (!chatRequest.messages || !Array.isArray(chatRequest.messages) || chatRequest.messages.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: messages array is required'
      });
    }
    
    // Handle chat with fallback
    const response = await handleChatWithFallback(chatRequest);
    
    res.json(response);
  } catch (error) {
    console.error('Error in context-aware chat:', error);
    
    res.status(500).json({
      error: `Error processing chat request: ${error.message}`,
      provider: null,
      message: 'Sorry, I encountered an error processing your request. Please try again later.'
    });
  }
}