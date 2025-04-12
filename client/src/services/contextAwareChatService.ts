/**
 * Context-Aware Chat Service
 * 
 * Provides an interface for interacting with various AI providers
 * with context awareness across tabs and sessions
 */

import { getFormattedContextForAI, getFullTabContext } from '@/utils/chatContextManager';
import { apiRequest } from '@/lib/queryClient';

// Supported AI providers
type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'vertex' | 'auto';

// Configuration for the chat request
interface ChatRequestConfig {
  provider?: AIProvider;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  includeContext?: boolean;
  fallbackProviders?: AIProvider[];
}

// Default configuration
const defaultConfig: ChatRequestConfig = {
  provider: 'auto',
  temperature: 0.7,
  maxTokens: 1000,
  includeContext: true,
  fallbackProviders: ['gemini', 'openai', 'anthropic']
};

/**
 * Send a message to the AI with context awareness
 */
export async function sendContextAwareMessage(
  message: string,
  config: ChatRequestConfig = {}
): Promise<{ text: string; provider: string }> {
  // Merge with default config
  const finalConfig = { ...defaultConfig, ...config };
  
  // Determine the provider to use
  const provider = finalConfig.provider === 'auto' 
    ? determineOptimalProvider(message)
    : finalConfig.provider;
    
  // Get context if needed
  const context = finalConfig.includeContext 
    ? getFormattedContextForAI() 
    : '';
  
  try {
    // Send to the selected provider
    return await sendToProvider(provider, message, context, finalConfig);
  } catch (error) {
    console.error(`Error with provider ${provider}:`, error);
    
    // Try fallback providers if available
    if (finalConfig.fallbackProviders && finalConfig.fallbackProviders.length > 0) {
      console.log(`Trying fallback providers: ${finalConfig.fallbackProviders.join(', ')}`);
      
      // Filter out the failed provider
      const availableFallbacks = finalConfig.fallbackProviders.filter(p => p !== provider);
      
      // Try each fallback in order
      for (const fallbackProvider of availableFallbacks) {
        try {
          console.log(`Trying fallback provider: ${fallbackProvider}`);
          return await sendToProvider(fallbackProvider, message, context, finalConfig);
        } catch (fallbackError) {
          console.error(`Error with fallback provider ${fallbackProvider}:`, fallbackError);
        }
      }
    }
    
    // All providers failed
    throw new Error(`All AI providers failed to process the request: ${error.message}`);
  }
}

/**
 * Determine the optimal provider based on message content
 */
function determineOptimalProvider(message: string): AIProvider {
  // This function would use heuristics to determine the best provider
  // For now, we'll use a simple strategy:
  
  // For code-related questions, prefer OpenAI
  if (
    message.includes('code') || 
    message.includes('programming') || 
    message.includes('function') ||
    message.includes('```')
  ) {
    return 'openai';
  }
  
  // For complex reasoning or multimodal content, prefer Anthropic
  if (
    message.includes('explain') || 
    message.includes('analyze') ||
    message.includes('evaluation') ||
    message.includes('image')
  ) {
    return 'anthropic';
  }
  
  // For general questions, prefer Gemini for speed/cost
  return 'gemini';
}

/**
 * Send a message to a specific provider
 */
async function sendToProvider(
  provider: AIProvider,
  message: string,
  context: string,
  config: ChatRequestConfig
): Promise<{ text: string; provider: string }> {
  switch (provider) {
    case 'openai':
      return sendToOpenAI(message, context, config);
    case 'anthropic':
      return sendToAnthropic(message, context, config);
    case 'gemini':
      return sendToGemini(message, context, config);
    case 'vertex':
      return sendToVertex(message, context, config);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Send a message to OpenAI
 */
async function sendToOpenAI(
  message: string,
  context: string,
  config: ChatRequestConfig
): Promise<{ text: string; provider: string }> {
  try {
    const systemPrompt = config.systemPrompt || 
      `You are a helpful crypto assistant that provides accurate information and guidance. 
      You have context about the current tab and recent interactions.`;
    
    const fullPrompt = context 
      ? `${systemPrompt}\n\nContext:\n${context}\n\nUser Question: ${message}`
      : `${systemPrompt}\n\nUser Question: ${message}`;
    
    const response = await apiRequest('POST', '/api/openai/chat', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: context ? `Context:\n${context}\n\nQuestion: ${message}` : message }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    });
    
    const data = await response.json();
    
    if (!data.text) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    return {
      text: data.text,
      provider: 'openai'
    };
  } catch (error) {
    console.error('Error with OpenAI:', error);
    throw error;
  }
}

/**
 * Send a message to Anthropic
 */
async function sendToAnthropic(
  message: string,
  context: string,
  config: ChatRequestConfig
): Promise<{ text: string; provider: string }> {
  try {
    const systemPrompt = config.systemPrompt || 
      `You are a helpful crypto assistant that provides accurate information and guidance. 
      You have context about the current tab and recent interactions.`;
    
    const response = await apiRequest('POST', '/api/anthropic/chat', {
      system: systemPrompt,
      messages: [
        { role: 'user', content: context ? `Context:\n${context}\n\nQuestion: ${message}` : message }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    });
    
    const data = await response.json();
    
    if (!data.text) {
      throw new Error('Invalid response from Anthropic API');
    }
    
    return {
      text: data.text,
      provider: 'anthropic'
    };
  } catch (error) {
    console.error('Error with Anthropic:', error);
    throw error;
  }
}

/**
 * Send a message to Gemini
 */
async function sendToGemini(
  message: string,
  context: string,
  config: ChatRequestConfig
): Promise<{ text: string; provider: string }> {
  try {
    const response = await apiRequest('POST', '/api/generate-ai-response', {
      prompt: context 
        ? `Context:\n${context}\n\nQuestion: ${message}` 
        : message,
      temperature: config.temperature,
      maxTokens: config.maxTokens
    });
    
    const data = await response.json();
    
    if (!data.response) {
      throw new Error('Invalid response from Gemini API');
    }
    
    return {
      text: data.response,
      provider: 'gemini'
    };
  } catch (error) {
    console.error('Error with Gemini:', error);
    throw error;
  }
}

/**
 * Send a message to Google Vertex AI
 */
async function sendToVertex(
  message: string,
  context: string,
  config: ChatRequestConfig
): Promise<{ text: string; provider: string }> {
  try {
    const response = await apiRequest('POST', '/api/vertex-ai-response', {
      prompt: context 
        ? `Context:\n${context}\n\nQuestion: ${message}` 
        : message,
      temperature: config.temperature,
      maxTokens: config.maxTokens
    });
    
    const data = await response.json();
    
    if (!data.response) {
      throw new Error('Invalid response from Vertex AI API');
    }
    
    return {
      text: data.response,
      provider: 'vertex'
    };
  } catch (error) {
    console.error('Error with Vertex AI:', error);
    throw error;
  }
}

/**
 * Get context-specific recommendations based on tab and user behavior
 */
export async function getContextSpecificRecommendations(
  tab: string,
  config: ChatRequestConfig = {}
): Promise<string> {
  try {
    // Get full context for the tab
    const tabContext = getFullTabContext();
    
    if (!tabContext) {
      return 'No context available for generating recommendations.';
    }
    
    // Prepare a prompt focused on recommendations
    const recommendationPrompt = 
      `Based on the user's activity in the ${tab} tab, provide 2-3 helpful recommendations or insights.
       Keep your response concise and actionable (under 200 words total).
       Format as bullet points with emoji icons.`;
    
    // Get recommendations from the AI
    const { text } = await sendContextAwareMessage(recommendationPrompt, {
      ...config,
      includeContext: true,
      temperature: 0.7 // Slightly creative
    });
    
    return text;
  } catch (error) {
    console.error('Error getting context-specific recommendations:', error);
    return 'Unable to generate recommendations at this time.';
  }
}

export type { AIProvider, ChatRequestConfig };