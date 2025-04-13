import { Request, Response } from 'express';
import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';

// Initialize the Google Generative AI
// For server-side code, we can access the VITE env variable directly because of how Replit configures environment
// In a production environment, this would need a proper backend API key
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
if (!apiKey) {
  console.error('Error: Neither VITE_GEMINI_API_KEY nor GEMINI_API_KEY is set. Chatbot functionality will not work.');
} else {
  console.log('Vertex API key is configured successfully');
}

// Initialize VertexAI for Flash model
const projectId = process.env.VITE_GOOGLE_PROJECT_ID || 'generative-ai-project';
const location = 'us-central1';
const vertex = new VertexAI({project: projectId, location: location});
const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 1024,
};

// Also initialize GoogleGenerativeAI as a fallback
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

// Get VertexAI Flash model
const getVertexFlashModel = () => {
  try {
    // Vertex Flash model
    const model = vertex.preview.getGenerativeModel({
      model: "gemini-flash",
      generation_config: generationConfig,
    });
    console.log('Using Vertex Flash model');
    return model;
  } catch (error) {
    console.error('Error initializing Vertex Flash model:', error);
    return null;
  }
};

// Initialize the model
const initializeModel = () => {
  if (!model) {
    try {
      // Try to get Vertex Flash model first
      const vertexModel = getVertexFlashModel();
      if (vertexModel) {
        console.log('Successfully initialized Vertex Flash model');
        return vertexModel;
      }
      
      // Fallback to Gemini API if Vertex fails
      console.log('Falling back to Gemini API');
      model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",  // Using Flash model as requested
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
    } catch (error) {
      console.error('Error initializing AI models:', error);
      return null;
    }
  }
  return model;
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Express handler for Vertex Flash chat requests
 */
export async function handleVertexChat(req: Request, res: Response) {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!apiKey) {
      console.error('API key is not set or empty. Cannot process chat request.');
      return res.status(500).json({ 
        error: 'API key not configured',
        details: 'The server is missing the required API key to process this request.' 
      });
    }

    console.log('Processing chat request with message:', message);
    
    try {
      // Try to use VertexAI Flash model first
      const vertexModel = vertex.preview.getGenerativeModel({
        model: "gemini-flash",
        generation_config: generationConfig,
      });
      
      // Prepend system prompt to user message to guide the AI's behavior
      const enhancedMessage = history.length === 0 
        ? `${SYSTEM_PROMPT}\n\nUser message: ${message}`
        : message;
      
      // Format history for Vertex AI
      let formattedHistory = [];
      
      if (history.length > 0) {
        formattedHistory = history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));
      }
      
      // Prepare chat session
      console.log('Sending message to Vertex Flash model...');
      
      const vertexChatSession = vertexModel.startChat({
        history: formattedHistory,
      });
      
      const vertexResult = await vertexChatSession.sendMessage({
        contents: [{ role: 'user', parts: [{ text: enhancedMessage }] }],
      });
      
      const response = vertexResult.response.text();
      console.log('Received response from Vertex Flash model');
      
      return res.json({ 
        response, 
        model: 'vertex-flash' 
      });
      
    } catch (vertexError) {
      console.error('Error with Vertex Flash model, falling back to Gemini API:', vertexError);
      
      // Fallback to Gemini API
      const geminiModel = genAI.getGenerativeModel({
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
      });

      // Prepend system prompt to user message to guide the AI's behavior
      const enhancedMessage = history.length === 0 
        ? `${SYSTEM_PROMPT}\n\nUser message: ${message}`
        : message;

      console.log('Sending message to Gemini Flash API...');
      // Send message and get response
      const result = await chat.sendMessage(enhancedMessage);
      const response = result.response.text();
      console.log('Received response from Gemini Flash API');

      return res.json({ 
        response, 
        model: 'gemini-1.5-flash' 
      });
    }
    
  } catch (error: any) {
    console.error('Error in handleVertexChat:', error);
    // Check if this is an API key error
    if (error.message?.includes('API key')) {
      return res.status(401).json({ 
        error: 'Invalid or missing API key',
        details: 'The application is using an invalid or missing API key. Please check your configuration.'
      });
    }
    return res.status(500).json({ 
      error: 'Failed to process your request',
      details: error.message 
    });
  }
}