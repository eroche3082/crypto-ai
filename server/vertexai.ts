/**
 * Vertex AI Integration Service
 * 
 * Provides functions for interacting with Google Vertex AI
 */
import { Request, Response } from 'express';
import { VertexAI } from '@google-cloud/vertexai';

// Check if Vertex AI is configured
const isConfigured = !!process.env.VERTEX_AI_API_KEY || !!process.env.GOOGLE_VERTEX_KEY_ID;

let vertexAI: VertexAI | null = null;

// Initialize Vertex AI if configured
if (isConfigured) {
  try {
    vertexAI = new VertexAI({
      project: process.env.GOOGLE_PROJECT_ID || 'cryptobot-ai',
      location: process.env.GOOGLE_LOCATION || 'us-central1',
      apiEndpoint: "us-central1-aiplatform.googleapis.com",
      googleAuthOptions: {
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials-global.json',
      },
    });
    console.log('Vertex AI initialized successfully with API key');
  } catch (error) {
    console.error('Error initializing Vertex AI:', error);
    vertexAI = null;
  }
}

/**
 * Generate a response using Vertex AI
 */
export async function generateResponse(
  prompt: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  if (!isConfigured || !vertexAI) {
    throw new Error('Vertex AI is not configured. Please provide VERTEX_AI_API_KEY environment variable.');
  }

  try {
    // Access the generative model
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generation_config: {
        max_output_tokens: maxTokens,
        temperature,
      },
    });

    // Generate text response
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = result.response;
    return response.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating text with Vertex AI:', error);
    throw new Error(`Vertex AI error: ${error.message}`);
  }
}

/**
 * Generate a response with image input using Vertex AI
 */
export async function generateResponseWithImage(
  prompt: string,
  imageData: string,
  mimeType: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  if (!isConfigured || !vertexAI) {
    throw new Error('Vertex AI is not configured. Please provide VERTEX_AI_API_KEY environment variable.');
  }

  try {
    // Access the generative model with vision capabilities
    const generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro-vision',
      generation_config: {
        max_output_tokens: maxTokens,
        temperature,
      },
    });

    // Generate text response
    const result = await generativeModel.generateContent({
      contents: [{ 
        role: 'user',
        parts: [
          { text: prompt },
          { 
            inline_data: {
              mime_type: mimeType,
              data: imageData
            }
          }
        ]
      }],
    });

    const response = result.response;
    return response.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating text with Vertex AI Vision:', error);
    throw new Error(`Vertex AI error: ${error.message}`);
  }
}

/**
 * Express handler for Vertex AI requests
 */
export async function handleVertexAIResponse(req: Request, res: Response) {
  if (!isConfigured || !vertexAI) {
    return res.status(503).json({
      error: 'Vertex AI is not configured. Please provide VERTEX_AI_API_KEY environment variable.'
    });
  }

  const {
    prompt,
    temperature = 0.7,
    maxTokens = 1000
  } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: 'Prompt is required.'
    });
  }

  try {
    const response = await generateResponse(prompt, temperature, maxTokens);
    res.json({
      response,
      model: 'gemini-1.5-pro'
    });
  } catch (error) {
    console.error('Error calling Vertex AI:', error);
    res.status(500).json({
      error: `Vertex AI error: ${error.message}`
    });
  }
}

/**
 * Express handler for Vertex AI market analysis
 */
export async function generateMarketAnalysis(req: Request, res: Response) {
  if (!isConfigured || !vertexAI) {
    return res.status(503).json({
      error: 'Vertex AI is not configured. Please provide VERTEX_AI_API_KEY environment variable.'
    });
  }

  const {
    coins,
    timeframe = '24h',
    language = 'en',
    temperature = 0.4
  } = req.body;

  if (!coins || !Array.isArray(coins) || coins.length === 0) {
    return res.status(400).json({
      error: 'Invalid request: coins array is required'
    });
  }

  const coinNames = coins.map(c => c.toUpperCase()).join(', ');
  
  const timeframeMap: Record<string, string> = {
    '24h': 'next 24 hours',
    '7d': 'coming week',
    '30d': 'next month',
    '90d': 'next quarter'
  };
  
  const timeText = timeframeMap[timeframe] || timeframe;

  const prompt = `
    Provide a detailed market analysis for the following cryptocurrencies: ${coinNames}.
    Focus on analyzing patterns for the ${timeText}.
    Include technical indicators, market sentiment, trading volume trends, and price predictions.
    Structure your response with these sections:
    1. Overview
    2. Key Insights
    3. Market Sentiment
    4. Technical Analysis
    5. Recommendation
    
    Base your analysis on factual market patterns, not speculation.
    Respond in ${language} language.
  `;

  try {
    const analysis = await generateResponse(prompt, temperature, 2000);
    
    res.json({
      success: true,
      analysis,
      metadata: {
        coins,
        timeframe,
        timestamp: new Date().toISOString(),
        analysisEngine: 'Vertex AI Gemini 1.5'
      }
    });
  } catch (error) {
    console.error('Error in market analysis:', error);
    res.status(500).json({
      error: 'Failed to analyze market trends',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export { isConfigured };