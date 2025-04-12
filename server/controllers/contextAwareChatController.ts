/**
 * Context-Aware Chat Controller
 * 
 * Server-side controller for managing AI chat requests with context awareness
 * and intelligent routing between different AI providers.
 */

import { Request, Response } from 'express';
import * as openai from '../openai';
import * as anthropic from '../anthropic';
import * as gemini from '../gemini';
import * as vertexai from '../vertexai';

// AI provider type
type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'vertexai' | 'auto';

// Chat request config
interface ChatConfig {
  provider?: AIProvider;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * Get available providers based on API keys
 */
function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  
  if (openai.isConfigured) providers.push('openai');
  if (anthropic.isConfigured) providers.push('anthropic');
  if (gemini.isConfigured) providers.push('gemini');
  if (vertexai.isConfigured) providers.push('vertexai');
  
  return providers;
}

/**
 * Select the best provider based on context, availability, and request type
 */
function selectProvider(
  message: string,
  context: string[],
  requestedProvider: AIProvider = 'auto'
): AIProvider {
  // If a specific provider is requested and available, use it
  const availableProviders = getAvailableProviders();
  
  if (requestedProvider !== 'auto' && availableProviders.includes(requestedProvider)) {
    return requestedProvider;
  }
  
  // If no providers available, throw error
  if (availableProviders.length === 0) {
    throw new Error('No AI providers configured. Please configure at least one provider.');
  }
  
  // Auto-select based on context and message
  
  // Check message length and complexity
  const messageLength = message.length;
  const contextSize = context.join(' ').length;
  const totalInputSize = messageLength + contextSize;
  
  // Check for code-related content
  const codeRelated = /function|class|const|let|var|import|export|return|if|else|for|while|switch/i.test(message);
  
  // Check for visual content request
  const visualRequest = /image|picture|photo|visualization|chart|graph|diagram/i.test(message);
  
  // Provider selection heuristics
  
  // For code-heavy interactions
  if (codeRelated && availableProviders.includes('openai')) {
    return 'openai'; // OpenAI generally handles code well
  }
  
  // For large context windows
  if (totalInputSize > 20000) {
    if (availableProviders.includes('anthropic')) {
      return 'anthropic'; // Claude handles large contexts well
    } else if (availableProviders.includes('vertexai')) {
      return 'vertexai'; // Vertex AI as second choice for large contexts
    }
  }
  
  // For visual content interpretation
  if (visualRequest) {
    if (availableProviders.includes('gemini')) {
      return 'gemini'; // Gemini is good with visual content
    } else if (availableProviders.includes('vertexai')) {
      return 'vertexai'; // Vertex AI also handles visuals well
    }
  }
  
  // Default provider selection strategy
  if (availableProviders.includes('openai')) {
    return 'openai'; // OpenAI as default if available
  } else if (availableProviders.includes('anthropic')) {
    return 'anthropic'; // Anthropic as second default
  } else {
    // Return first available provider
    return availableProviders[0];
  }
}

/**
 * Generate a chat response using the selected provider
 */
async function generateResponse(
  provider: AIProvider,
  message: string,
  context: string[],
  config: ChatConfig = {}
): Promise<{ text: string; provider: string }> {
  // Create system prompt with context
  const contextText = context.length > 0 
    ? `Previous conversation context:\n${context.join('\n')}`
    : '';
    
  const baseSystemPrompt = config.systemPrompt || 
    'You are CryptoBot, an AI assistant specializing in cryptocurrency and blockchain technology. ' +
    'Provide helpful, accurate, and educational responses about crypto markets, trading, blockchain technology, NFTs, and DeFi.';
  
  const systemPrompt = contextText 
    ? `${baseSystemPrompt}\n\n${contextText}`
    : baseSystemPrompt;
  
  // Set default parameters
  const temperature = config.temperature || 0.7;
  const maxTokens = config.maxTokens || 1000;
  
  try {
    let responseText: string;
    
    // Route to appropriate provider
    switch (provider) {
      case 'openai':
        responseText = await openai.generateChatResponse(
          systemPrompt,
          message,
          temperature,
          maxTokens
        );
        break;
        
      case 'anthropic':
        responseText = await anthropic.generateChatResponse(
          systemPrompt,
          message,
          temperature,
          maxTokens
        );
        break;
        
      case 'gemini':
        // For Gemini, we combine system prompt and user message
        const geminiPrompt = `${systemPrompt}\n\nUser: ${message}`;
        responseText = await gemini.generateResponse(
          geminiPrompt,
          temperature,
          maxTokens
        );
        break;
        
      case 'vertexai':
        // For Vertex AI, we also combine system prompt and user message
        const vertexPrompt = `${systemPrompt}\n\nUser: ${message}`;
        responseText = await vertexai.generateResponse(
          vertexPrompt,
          temperature,
          maxTokens
        );
        break;
        
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
    
    return {
      text: responseText,
      provider: provider
    };
  } catch (error) {
    console.error(`Error with provider ${provider}:`, error);
    
    // Try fallback providers if main provider fails
    const availableProviders = getAvailableProviders();
    const fallbackProviders = availableProviders.filter(p => p !== provider);
    
    if (fallbackProviders.length > 0) {
      console.log(`Attempting fallback to ${fallbackProviders[0]}`);
      return generateResponse(fallbackProviders[0], message, context, config);
    }
    
    throw error; // Re-throw if no fallbacks available
  }
}

/**
 * Express handler for context-aware chat
 */
export async function handleContextAwareChat(req: Request, res: Response) {
  try {
    const {
      message,
      context = [],
      config = {}
    } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required.'
      });
    }
    
    // Select provider based on request
    const provider = selectProvider(message, context, config.provider);
    console.log(`Selected AI provider: ${provider}`);
    
    // Generate response
    const response = await generateResponse(provider, message, context, config);
    
    res.json({
      text: response.text,
      provider: response.provider
    });
  } catch (error) {
    console.error('Error in context-aware chat:', error);
    res.status(500).json({
      error: `AI error: ${error.message}`
    });
  }
}

export {
  type AIProvider,
  type ChatConfig,
  getAvailableProviders
};