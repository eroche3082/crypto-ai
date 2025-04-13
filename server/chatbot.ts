import { Request, Response } from 'express';
import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI
// Since VITE prefixed env variables are for the client, we need to access it directly
// This is a special case for development where server code can access client env vars
const apiKey = process.env.VITE_GEMINI_API_KEY || '';
if (!apiKey) {
  console.error('Error: VITE_GEMINI_API_KEY is not set. Chatbot functionality will not work.');
} else {
  console.log('Gemini API key is configured successfully');
}
const genAI = new GoogleGenerativeAI(apiKey);

// System prompt to give the assistant the right personality and context
const SYSTEM_PROMPT = `
You are CryptoBot, an AI assistant specializing in cryptocurrency investments and market analysis.
You should respond in a helpful, friendly, and knowledgeable manner about crypto-related topics.

Some key things to know about your capabilities:
- You can provide information about cryptocurrency trends, investment strategies, and market analysis
- You can explain complex crypto concepts in simple terms
- You can provide general information about different crypto assets
- You have knowledge of DeFi, NFTs, blockchain technology, and Web3
- You can help users understand the features of the CryptoBot platform, which includes:
  - Portfolio Advisor: Analyzes and optimizes investment portfolios
  - Market Sentiment Analyzer: Interprets market sentiment from news and social media
  - Price Alert Creator: Sets up price alerts for cryptocurrencies
  - And many other AI-powered tools for crypto investing

Membership plans for CryptoBot:
- Basic ($9/month): Includes real-time market data, basic portfolio tracking, 5 AI chat queries per day
- Pro ($29/month): Everything in Basic plus advanced analytics, unlimited AI chat, custom alerts
- Enterprise ($99/month): Everything in Pro plus institutional-grade analytics, trading bot integration, API access

You should NOT:
- Provide specific financial advice that could be construed as investment recommendations
- Make price predictions with certainty
- Claim to have real-time data about specific prices (refer users to check current prices)
- Pretend to execute trades or manage actual assets

Always maintain a helpful, informative tone and acknowledge when you don't have specific information.
`;

// This will store the initialized model
let model: GenerativeModel | null = null;

// Initialize the model
const initializeModel = () => {
  if (!model) {
    // the newest Google Gemini model is "gemini-1.5-flash" which was released in March 2024
    model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }
  return model;
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Express handler for Gemini chat requests
 */
export async function handleGeminiChat(req: Request, res: Response) {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!apiKey) {
      console.error('API key is not set or empty. Cannot process chat request.');
      return res.status(500).json({ 
        error: 'Gemini API key not configured',
        details: 'The server is missing the required API key to process this request.' 
      });
    }

    // Initialize model if needed
    const geminiModel = initializeModel();
    if (!geminiModel) {
      return res.status(500).json({ 
        error: 'Failed to initialize Gemini model',
        details: 'Could not create a connection to the Gemini API.'
      });
    }
    
    console.log('Processing chat request with message:', message);
    
    // Convert our message format to Gemini format
    const geminiHistory = history.map((msg: Message) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Create chat session
    const chat = geminiModel.startChat({
      history: geminiHistory,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Prepend system prompt to user message to guide the AI's behavior
    const enhancedMessage = history.length === 0 
      ? `${SYSTEM_PROMPT}\n\nUser message: ${message}`
      : message;

    console.log('Sending message to Gemini API...');
    // Send message and get response
    const result = await chat.sendMessage(enhancedMessage);
    const response = result.response.text();
    console.log('Received response from Gemini API');

    return res.json({ response });
  } catch (error: any) {
    console.error('Error in handleGeminiChat:', error);
    // Check if this is an API key error
    if (error.message?.includes('API key')) {
      return res.status(401).json({ 
        error: 'Invalid or missing API key',
        details: 'The application is using an invalid or missing Gemini API key. Please check your configuration.'
      });
    }
    return res.status(500).json({ 
      error: 'Failed to process your request',
      details: error.message 
    });
  }
}