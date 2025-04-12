/**
 * Context-Aware Chat Service
 * 
 * This service handles API calls for the chatbot with proper context
 * based on the current tab and user preferences.
 */

import { getCurrentTabContext, getContextDataForAPI } from '@/utils/chatContextManager';

// Define message interfaces
interface UserMessage {
  content: string;
  metadata?: any;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  metadata?: any;
}

interface ChatResponse {
  message: string;
  action?: any;
  metadata?: any;
}

/**
 * Send a chat message with proper context awareness
 */
export async function sendContextAwareMessage(
  message: UserMessage,
  history: ChatMessage[] = [],
  apiEndpoint: string = '/api/chat'
): Promise<ChatResponse> {
  try {
    // Get current tab context
    const currentTab = getCurrentTabContext();
    
    // Get context data for this tab
    const contextData = getContextDataForAPI(currentTab);
    
    // Send request to API
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message.content,
        history: history.slice(-10), // Send last 10 messages for context
        context: {
          tab: currentTab,
          ...contextData,
          userMetadata: message.metadata
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending context-aware message:', error);
    
    // Return a fallback response
    return {
      message: `I'm having trouble connecting right now. Please try again later. ${error instanceof Error ? error.message : ''}`
    };
  }
}

/**
 * Get fallback response for a specific tab when API call fails
 */
export function getFallbackResponse(tabName: string): string {
  // Tab-specific fallback messages
  const fallbacks: Record<string, string[]> = {
    dashboard: [
      "I'm having trouble loading the latest market data. Let me know what specific cryptocurrency information you're looking for.",
      "The dashboard data is temporarily unavailable. In the meantime, I can answer general questions about cryptocurrencies."
    ],
    portfolio: [
      "I can't access your portfolio data right now. Would you like to discuss investment strategies instead?",
      "Portfolio analysis is currently unavailable. I can still help with general portfolio advice if you'd like."
    ],
    education: [
      "Our educational content is temporarily unavailable. I can still answer your questions about crypto concepts.",
      "The learning materials aren't loading right now, but I can explain any crypto topic you're interested in."
    ],
    news: [
      "I'm having trouble fetching the latest news. Would you like me to summarize recent market trends instead?",
      "News feed is temporarily unavailable. I can still discuss major market events from the past week."
    ],
    locations: [
      "Location services are currently unavailable. Would you like to save your search for later?",
      "I can't access the map data right now. Please try again later or let me know if there's another way I can help."
    ],
    taxsimulator: [
      "The tax calculator is temporarily unavailable. I can still answer general questions about crypto taxation.",
      "Tax simulation is currently offline. Would you like some general information about crypto tax regulations instead?"
    ],
    walletmessaging: [
      "Wallet messaging services are temporarily unavailable. Your message will be saved as a draft.",
      "I can't connect to the messaging service right now. Please try again later."
    ]
  };
  
  // Get fallbacks for the tab, or use a default
  const tabFallbacks = fallbacks[tabName] || [
    "I'm having trouble connecting to our services right now. Please try again later.",
    "This feature is temporarily unavailable. Is there something else I can help you with?"
  ];
  
  // Return a random fallback from the list
  return tabFallbacks[Math.floor(Math.random() * tabFallbacks.length)];
}