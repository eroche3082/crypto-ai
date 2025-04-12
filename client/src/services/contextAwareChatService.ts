/**
 * Context-Aware Chat Service
 * 
 * Provides a unified interface for interacting with AI models 
 * while maintaining context awareness across tabs and sessions.
 * Features:
 * 1. Intelligent routing to appropriate AI models
 * 2. Automatic fallback between providers
 * 3. Context persistence across tabs and sessions
 * 4. Memory management and context pruning
 */

import { 
  generateContextAwarePrompt,
  addMessageToContext,
  addMemoryItem,
  ChatMessage,
  MessageRole
} from '@/utils/chatContextManager';

// Import AI provider services
import { apiRequest } from '@/lib/queryClient';

// Message for requesting a response
export interface ChatRequestMessage {
  role: MessageRole;
  content: string;
}

// Chat completion request config
export interface ChatCompletionRequest {
  messages: ChatRequestMessage[];
  maxTokens?: number;
  temperature?: number;
  provider?: 'gemini' | 'anthropic' | 'openai' | 'auto';
  stream?: boolean;
}

// Chat completion response
export interface ChatCompletionResponse {
  id: string;
  content: string;
  provider: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

// Provider status
export type ProviderStatus = 'available' | 'unavailable' | 'unknown';

// Provider status state
interface ProviderStatusState {
  gemini: ProviderStatus;
  anthropic: ProviderStatus;
  openai: ProviderStatus;
  lastUpdated: number;
}

// Global provider status state
let providerStatus: ProviderStatusState = {
  gemini: 'unknown',
  anthropic: 'unknown',
  openai: 'unknown',
  lastUpdated: 0
};

/**
 * Generate a chat completion with context awareness
 */
export async function generateChatCompletion(
  userId: string,
  tabContext: string,
  prompt: string,
  options: {
    provider?: 'gemini' | 'anthropic' | 'openai' | 'auto',
    maxTokens?: number,
    temperature?: number,
    stream?: boolean
  } = {}
): Promise<ChatCompletionResponse> {
  try {
    // Set default provider
    const provider = options.provider || 'auto';
    
    // Generate context-aware prompts
    const promptMessages = await generateContextAwarePrompt(
      userId,
      tabContext,
      prompt
    );
    
    // Convert to chat request format
    const requestMessages: ChatRequestMessage[] = promptMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Create chat completion request
    const request: ChatCompletionRequest = {
      messages: requestMessages,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      provider,
      stream: options.stream
    };
    
    // Get chat completion from appropriate provider
    const response = await getChatCompletionFromProvider(request);
    
    // Save the assistant's response to context
    if (!response.error) {
      await addMessageToContext(
        userId,
        'assistant',
        response.content,
        tabContext,
        { provider: response.provider }
      );
      
      // Add important information to memory
      extractAndStoreMemory(userId, prompt, response.content, tabContext);
    }
    
    return response;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    
    // Return error response
    return {
      id: crypto.randomUUID(),
      content: 'I apologize, but I encountered an error processing your request. Please try again later.',
      provider: 'error',
      error: error.message
    };
  }
}

/**
 * Get chat completion from appropriate provider
 */
async function getChatCompletionFromProvider(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const provider = request.provider || 'auto';
  
  try {
    if (provider === 'auto') {
      // Try providers in order of preference
      return await tryProvidersInOrder(request);
    } else {
      // Use specified provider
      return await requestFromProvider(provider, request);
    }
  } catch (error) {
    console.error(`Error getting chat completion from provider ${provider}:`, error);
    
    // If specific provider fails, try others if auto
    if (provider === 'auto') {
      // Already tried all providers, return error
      return {
        id: crypto.randomUUID(),
        content: 'I apologize, but all AI service providers are currently unavailable. Please try again later.',
        provider: 'error',
        error: 'All providers unavailable'
      };
    } else {
      // Try auto as fallback
      console.log(`Falling back to auto provider selection after ${provider} failed`);
      return await tryProvidersInOrder({
        ...request,
        provider: 'auto'
      });
    }
  }
}

/**
 * Try providers in order of preference
 */
async function tryProvidersInOrder(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  // Get current provider status
  await updateProviderStatus();
  
  // Define provider order based on availability
  const providerOrder = ['gemini', 'anthropic', 'openai']
    .filter(provider => providerStatus[provider] !== 'unavailable')
    .sort((a, b) => {
      // Prioritize known available providers
      if (providerStatus[a] === 'available' && providerStatus[b] !== 'available') {
        return -1;
      }
      if (providerStatus[a] !== 'available' && providerStatus[b] === 'available') {
        return 1;
      }
      return 0;
    });
  
  // If no providers are available, try all
  if (providerOrder.length === 0) {
    providerOrder.push('gemini', 'anthropic', 'openai');
  }
  
  // Try each provider in order
  for (const provider of providerOrder) {
    try {
      const response = await requestFromProvider(provider, request);
      return response;
    } catch (error) {
      console.error(`Provider ${provider} failed:`, error);
      
      // Mark provider as unavailable
      providerStatus[provider] = 'unavailable';
      
      // Try next provider
      continue;
    }
  }
  
  // If all providers fail, return error
  return {
    id: crypto.randomUUID(),
    content: 'I apologize, but all AI service providers are currently unavailable. Please try again later.',
    provider: 'error',
    error: 'All providers unavailable'
  };
}

/**
 * Request from specific provider
 */
async function requestFromProvider(
  provider: string,
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  // Map to appropriate endpoint
  const endpoint = `/api/ai/${provider}/chat`;
  
  // Make request
  const response = await apiRequest('POST', endpoint, {
    messages: request.messages,
    max_tokens: request.maxTokens,
    temperature: request.temperature,
    stream: request.stream
  });
  
  // Parse response
  const data = await response.json();
  
  // Update provider status
  providerStatus[provider] = 'available';
  providerStatus.lastUpdated = Date.now();
  
  // Return mapped response
  return {
    id: data.id || crypto.randomUUID(),
    content: data.content || data.message?.content || data.choices?.[0]?.message?.content || '',
    provider,
    finishReason: data.finish_reason || data.choices?.[0]?.finish_reason || 'stop',
    usage: data.usage
  };
}

/**
 * Update provider status
 */
async function updateProviderStatus(): Promise<void> {
  // Skip if recently updated
  if (Date.now() - providerStatus.lastUpdated < 60000) { // 1 minute
    return;
  }
  
  try {
    // Get status from API
    const response = await apiRequest('GET', '/api/system/status');
    const data = await response.json();
    
    // Update provider status
    if (data.providers) {
      providerStatus = {
        gemini: data.providers.gemini ? 'available' : 'unavailable',
        anthropic: data.providers.anthropic ? 'available' : 'unavailable',
        openai: data.providers.openai ? 'available' : 'unavailable',
        lastUpdated: Date.now()
      };
    }
  } catch (error) {
    console.error('Error updating provider status:', error);
  }
}

/**
 * Extract and store memory from conversations
 */
function extractAndStoreMemory(
  userId: string,
  userMessage: string,
  aiResponse: string,
  tabContext: string
): void {
  // Skip if any parameter is missing
  if (!userId || !userMessage || !aiResponse || !tabContext) {
    return;
  }
  
  // TODO: Implement AI-based memory extraction
  // For now, just store factual responses using a simple heuristic
  
  try {
    // Check if the response contains factual information
    const factualIndicators = [
      'according to',
      'research shows',
      'studies indicate',
      'data suggests',
      'statistics show',
      'as of',
      'in the year',
      'approximately',
      'estimated',
      'percent',
      'bitcoin is',
      'ethereum is',
      'blockchain',
      'crypto',
      'market cap'
    ];
    
    // Check if any indicator is present
    const isFactual = factualIndicators.some(indicator => 
      aiResponse.toLowerCase().includes(indicator.toLowerCase())
    );
    
    // Store facts with higher importance
    if (isFactual) {
      // For fact storage, use the first 100 characters as a summary
      const factSummary = aiResponse.length > 100 
        ? aiResponse.substring(0, 100) + '...' 
        : aiResponse;
      
      addMemoryItem(
        userId,
        factSummary,
        tabContext,
        'fact',
        0.8 // High importance for facts
      );
    }
    
    // Check if the user mentioned preferences
    const preferenceIndicators = [
      'i prefer',
      'i like',
      'i don\'t like',
      'i hate',
      'i love',
      'i want',
      'i need',
      'favorite',
      'interested in',
      'invest in'
    ];
    
    // Check if any preference indicator is present in user message
    const hasPreference = preferenceIndicators.some(indicator => 
      userMessage.toLowerCase().includes(indicator.toLowerCase())
    );
    
    // Store preferences with high importance
    if (hasPreference) {
      addMemoryItem(
        userId,
        userMessage,
        tabContext,
        'preference',
        0.9 // Very high importance for preferences
      );
    }
  } catch (error) {
    console.error('Error extracting and storing memory:', error);
  }
}