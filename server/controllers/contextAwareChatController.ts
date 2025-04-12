/**
 * Context-Aware Chat Controller
 * 
 * Handles API requests for context-aware chat responses
 * by routing to the appropriate AI provider with context.
 */

import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Initialize AI clients
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

/**
 * Handle context-aware chat request
 */
export const handleContextAwareChat = async (req: Request, res: Response) => {
  const { message, history = [], context = {} } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    // Default to Gemini if AI provider preference not specified
    const preferredProvider = req.query.provider || 'gemini';
    
    let response: any;
    
    // Route to appropriate AI provider
    switch (preferredProvider) {
      case 'claude':
      case 'anthropic':
        response = await getClaudeResponse(message, history, context);
        break;
        
      case 'openai':
      case 'gpt':
        response = await getOpenAIResponse(message, history, context);
        break;
        
      case 'gemini':
      default:
        response = await getGeminiResponse(message, history, context);
        break;
    }
    
    return res.json(response);
  } catch (error) {
    console.error('Error in context-aware chat controller:', error);
    return res.status(500).json({ 
      error: 'Failed to generate response',
      message: 'I encountered an error processing your request. Please try again.',
    });
  }
};

/**
 * Get response from Claude with context
 */
async function getClaudeResponse(message: string, history: any[], context: any) {
  try {
    // Build system prompt with context
    const systemPrompt = buildSystemPromptWithContext(context);
    
    // Build conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: messages,
    });
    
    return {
      message: response.content[0].text,
      metadata: {
        provider: 'claude',
        context: context.tab,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

/**
 * Get response from OpenAI with context
 */
async function getOpenAIResponse(message: string, history: any[], context: any) {
  try {
    // Build system prompt with context
    const systemPrompt = buildSystemPromptWithContext(context);
    
    // Build conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 1024,
    });
    
    return {
      message: response.choices[0].message.content || '',
      metadata: {
        provider: 'openai',
        context: context.tab,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

/**
 * Get response from Gemini with context
 */
async function getGeminiResponse(message: string, history: any[], context: any) {
  try {
    // Build system prompt with context
    const systemPrompt = buildSystemPromptWithContext(context);
    
    // Generate chat history
    const formattedHistory = [
      { role: 'user', parts: [{ text: 'System instructions: ' + systemPrompt }] },
      { role: 'model', parts: [{ text: 'I understand and will act according to these instructions.' }] },
      ...history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];
    
    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Start chat
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1024,
      },
    });
    
    // Get response
    const result = await chat.sendMessage(message);
    const response = result.response;
    
    return {
      message: response.text(),
      metadata: {
        provider: 'gemini',
        context: context.tab,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

/**
 * Build system prompt with tab context
 */
function buildSystemPromptWithContext(context: any): string {
  const { tab, preferences = [], recentTabs = [] } = context;
  
  // Base system prompt
  let systemPrompt = `You are CryptoBot, an AI assistant for cryptocurrency information and assistance. 
The user is currently viewing the "${tab}" tab in the CryptoBot application.
`;

  // Add tab-specific instructions
  switch (tab) {
    case 'dashboard':
      systemPrompt += `
In the Dashboard tab, users can view market overviews, price charts, and trending cryptocurrencies.
Help the user understand market trends, interpret price movements, and provide high-level insights.
You can reference the current market data and suggest actions like setting up alerts for specific prices.
`;
      break;
      
    case 'portfolio':
    case 'portfolioanalysis':
      systemPrompt += `
In the Portfolio tab, users can track their cryptocurrency holdings, view performance, and analyze their investments.
Offer insights about portfolio diversification, risk management, and potential optimizations.
If the user mentions specific assets, provide relevant analysis and suggestions.
`;
      break;
      
    case 'education':
      systemPrompt += `
In the Education tab, users can access learning materials about cryptocurrency and blockchain technology.
Provide educational content on crypto topics, explain complex concepts in simple terms, and recommend resources.
Remember to tailor explanations based on the user's experience level and previous interactions.
`;
      break;
      
    case 'news':
      systemPrompt += `
In the News tab, users can read the latest cryptocurrency news and market updates.
Help interpret news events, explain their potential impact on the market, and identify significant developments.
If asked about specific news, provide context and analysis rather than just facts.
`;
      break;
      
    case 'locations':
      systemPrompt += `
In the Locations tab, users can find crypto-friendly businesses, ATMs, and events near them.
Help users find relevant locations, understand the services offered, and navigate to these places.
`;
      break;
      
    case 'taxsimulator':
      systemPrompt += `
In the Tax Simulator tab, users can calculate tax obligations for their crypto transactions.
Help explain tax concepts, guide users through calculations, and offer general tax optimization strategies.
Always include a disclaimer that you're not providing professional tax advice.
`;
      break;
      
    case 'walletmessaging':
      systemPrompt += `
In the Wallet Messaging tab, users can securely communicate with other wallet addresses.
Help users compose messages, understand security features, and troubleshoot any issues.
`;
      break;
      
    // Add other tab contexts as needed
  }
  
  // Add user preferences if available
  if (preferences && preferences.length > 0) {
    systemPrompt += `
The user has shown interest in: ${preferences.join(', ')}.
`;
  }
  
  // Add recent tab history if available
  if (recentTabs && recentTabs.length > 0) {
    systemPrompt += `
The user has recently visited these tabs: ${recentTabs.join(', ')}.
`;
  }
  
  // Add general guidance
  systemPrompt += `
Always respond in a helpful, accurate, and concise manner. If the user asks about features outside the current tab,
you can still provide information but suggest navigating to the relevant tab for full functionality.

The system time is ${new Date().toISOString()}.
`;

  return systemPrompt;
}