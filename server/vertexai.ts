/**
 * Vertex AI Integration Service
 * 
 * Provides functions for interacting with Google Vertex AI and Gemini
 * With multiple authentication methods and fallback mechanisms
 * Supports dynamic API key selection based on API key group management
 */
import { Request, Response } from 'express';
import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import googleApiKeyManager from './services/googleApiKeyManager';

// Configuration flags
export const USE_API_KEY_AUTH = true; // Use API key auth instead of service account
export const USE_GEMINI_FALLBACK = true; // Use Gemini API as fallback if Vertex AI fails
export const ENABLE_VERTEX_DIAGNOSTICS = true; // Enable detailed diagnostic logging

// Get API keys from dynamic API key manager
export const vertexApiKey = googleApiKeyManager.getApiKeyForService('vertex-ai');
export const geminiApiKey = googleApiKeyManager.getApiKeyForService('gemini');

// Use fallback to direct env vars if key manager didn't find anything
export const apiKey = vertexApiKey || 
                     geminiApiKey || 
                     process.env.VERTEX_AI_API_KEY || 
                     process.env.GOOGLE_API_KEY || 
                     process.env.GOOGLE_VERTEX_KEY_ID;

export const isConfigured = !!apiKey;
export const projectId = process.env.GOOGLE_PROJECT_ID || 'erudite-creek-431302-q3';
export const location = process.env.GOOGLE_LOCATION || 'us-central1';
export const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials-global.json';

// Initialize clients
export let vertexAI: VertexAI | null = null;
export let genAI: GoogleGenerativeAI | null = null;

// Initialize Vertex AI with selected API key if configured
if (isConfigured) {
  // Get the selected API key group for Vertex AI
  const vertexApiKeyGroup = googleApiKeyManager.selectApiKeyGroupForService('vertex-ai');
  const vertexGroupId = vertexApiKeyGroup?.id || 'DIRECT_ENV';
  
  try {
    if (USE_API_KEY_AUTH) {
      // Initialize with API key
      console.log(`Initializing Vertex AI with API key from ${vertexGroupId} for project ${projectId}`);
      vertexAI = new VertexAI({
        project: projectId,
        location: location,
        apiEndpoint: "us-central1-aiplatform.googleapis.com",
      });
      
      // Track successful initialization
      googleApiKeyManager.trackServiceInitialization('vertex-ai', vertexGroupId, true);
      
      // Also initialize Gemini for fallback if needed
      if (USE_GEMINI_FALLBACK) {
        const geminiApiKeyGroup = googleApiKeyManager.selectApiKeyGroupForService('gemini');
        const geminiGroupId = geminiApiKeyGroup?.id || 'DIRECT_ENV';
        
        try {
          console.log(`Initializing Gemini API with API key from ${geminiGroupId} for fallback`);
          genAI = new GoogleGenerativeAI(apiKey);
          
          // Track successful initialization
          googleApiKeyManager.trackServiceInitialization('gemini', geminiGroupId, true);
        } catch (geminiError) {
          console.error('Error initializing Gemini API as fallback:', geminiError);
          googleApiKeyManager.trackServiceInitialization('gemini', geminiGroupId, false, geminiError.message);
          genAI = null;
        }
      }
    } else {
      // Initialize with service account
      console.log(`Initializing Vertex AI with service account for project ${projectId}`);
      vertexAI = new VertexAI({
        project: projectId,
        location: location,
        apiEndpoint: "us-central1-aiplatform.googleapis.com",
        googleAuthOptions: {
          scopes: ["https://www.googleapis.com/auth/cloud-platform"],
          keyFile: keyFilePath,
        },
      });
      
      // Track successful initialization with SERVICE_ACCOUNT group
      googleApiKeyManager.trackServiceInitialization('vertex-ai', 'SERVICE_ACCOUNT', true);
    }
    
    console.log('Vertex AI initialized successfully');
  } catch (error) {
    console.error('Error initializing Vertex AI:', error);
    // Track failed initialization
    googleApiKeyManager.trackServiceInitialization('vertex-ai', vertexGroupId, false, error.message);
    vertexAI = null;
    
    // Try to initialize Gemini API as fallback
    if (USE_GEMINI_FALLBACK) {
      const geminiApiKeyGroup = googleApiKeyManager.selectApiKeyGroupForService('gemini');
      const geminiGroupId = geminiApiKeyGroup?.id || 'DIRECT_ENV';
      
      try {
        console.log(`Falling back to Gemini API initialization using key from ${geminiGroupId}`);
        genAI = new GoogleGenerativeAI(apiKey);
        console.log('Gemini API initialized successfully as fallback');
        
        // Track successful initialization
        googleApiKeyManager.trackServiceInitialization('gemini', geminiGroupId, true);
      } catch (geminiError) {
        console.error('Error initializing Gemini API fallback:', geminiError);
        googleApiKeyManager.trackServiceInitialization('gemini', geminiGroupId, false, geminiError.message);
        genAI = null;
      }
    }
  }
  
  // Log initialization summary
  console.log('API Initialization Summary:', googleApiKeyManager.getServiceInitializationSummary());
}

/**
 * Diagnostic data for last request
 */
interface AIRequestDiagnostics {
  method: 'vertex' | 'gemini' | 'none';
  success: boolean;
  error?: string;
  errorCode?: string;
  timestamp: string;
  responseTime?: number;
  modelUsed?: string;
}

// Keep track of the last request diagnostics
export let lastRequestDiagnostics: AIRequestDiagnostics = {
  method: 'none',
  success: false,
  timestamp: new Date().toISOString()
};

/**
 * Get the last request diagnostic data
 */
export function getLastDiagnostics(): AIRequestDiagnostics {
  return lastRequestDiagnostics;
}

/**
 * Generate a response using Vertex AI with fallback to Gemini
 */
export async function generateResponse(
  prompt: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  if (!isConfigured) {
    throw new Error('AI services are not configured. Please provide VERTEX_AI_API_KEY or GOOGLE_API_KEY environment variable.');
  }

  const startTime = Date.now();

  // First try Vertex AI if available
  if (vertexAI) {
    try {
      if (ENABLE_VERTEX_DIAGNOSTICS) {
        console.log(`Attempting to generate content with Vertex AI for prompt: ${prompt.substring(0, 50)}...`);
      }
      
      // Access the generative model
      const generativeModel = vertexAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        apiKey: apiKey,
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
      const responseText = response.candidates[0].content.parts[0].text;
      
      // Record diagnostics
      lastRequestDiagnostics = {
        method: 'vertex',
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        modelUsed: 'gemini-1.5-pro'
      };
      
      if (ENABLE_VERTEX_DIAGNOSTICS) {
        console.log(`Vertex AI response successful in ${lastRequestDiagnostics.responseTime}ms`);
      }
      
      return responseText;
    } catch (error) {
      console.error('Error generating text with Vertex AI, trying fallback:', error);
      
      // Record error diagnostics
      lastRequestDiagnostics = {
        method: 'vertex',
        success: false,
        error: error.message,
        errorCode: error.code || 'UNKNOWN',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        modelUsed: 'gemini-1.5-pro'
      };
      
      // If Gemini fallback is not enabled or not available, rethrow the error
      if (!USE_GEMINI_FALLBACK || !genAI) {
        throw new Error(`Vertex AI error: ${error.message}`);
      }
    }
  }
  
  // Try with Gemini API as fallback
  if (USE_GEMINI_FALLBACK && genAI) {
    try {
      if (ENABLE_VERTEX_DIAGNOSTICS) {
        console.log('Falling back to Gemini API');
      }
      
      const geminiStartTime = Date.now();
      
      // Use Gemini API
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Record fallback diagnostics
      lastRequestDiagnostics = {
        method: 'gemini',
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - geminiStartTime,
        modelUsed: 'gemini-1.5-pro (fallback)'
      };
      
      if (ENABLE_VERTEX_DIAGNOSTICS) {
        console.log(`Gemini API fallback successful in ${lastRequestDiagnostics.responseTime}ms`);
      }
      
      return responseText;
    } catch (geminiError) {
      console.error('Error with Gemini fallback:', geminiError);
      
      // Update diagnostics with gemini error
      lastRequestDiagnostics = {
        ...lastRequestDiagnostics,
        method: 'gemini',
        success: false,
        error: geminiError.message,
        errorCode: geminiError.code || 'UNKNOWN',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      };
      
      throw new Error(`AI generation failed. Vertex AI and Gemini fallback both failed. ${geminiError.message}`);
    }
  }
  
  // If we got here, both methods failed or weren't available
  throw new Error('AI generation failed. No available AI service could process your request.');
}

/**
 * Generate a response with image input using Vertex AI with fallback to Gemini
 */
export async function generateResponseWithImage(
  prompt: string,
  imageData: string,
  mimeType: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  if (!isConfigured) {
    throw new Error('AI services are not configured. Please provide VERTEX_AI_API_KEY or GOOGLE_API_KEY environment variable.');
  }

  const startTime = Date.now();

  // First try Vertex AI if available
  if (vertexAI) {
    try {
      if (ENABLE_VERTEX_DIAGNOSTICS) {
        console.log(`Attempting to generate vision content with Vertex AI for prompt: ${prompt.substring(0, 50)}...`);
      }
      
      // Access the generative model with vision capabilities
      const generativeModel = vertexAI.getGenerativeModel({
        model: 'gemini-1.5-pro-vision',
        apiKey: apiKey,
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
      const responseText = response.candidates[0].content.parts[0].text;
      
      // Record diagnostics
      lastRequestDiagnostics = {
        method: 'vertex',
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        modelUsed: 'gemini-1.5-pro-vision'
      };
      
      if (ENABLE_VERTEX_DIAGNOSTICS) {
        console.log(`Vertex AI vision response successful in ${lastRequestDiagnostics.responseTime}ms`);
      }
      
      return responseText;
    } catch (error) {
      console.error('Error generating vision response with Vertex AI, trying fallback:', error);
      
      // Record error diagnostics
      lastRequestDiagnostics = {
        method: 'vertex',
        success: false,
        error: error.message,
        errorCode: error.code || 'UNKNOWN',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        modelUsed: 'gemini-1.5-pro-vision'
      };
      
      // If Gemini fallback is not enabled or not available, rethrow the error
      if (!USE_GEMINI_FALLBACK || !genAI) {
        throw new Error(`Vertex AI Vision error: ${error.message}`);
      }
    }
  }
  
  // Try with Gemini API as fallback
  if (USE_GEMINI_FALLBACK && genAI) {
    try {
      if (ENABLE_VERTEX_DIAGNOSTICS) {
        console.log('Falling back to Gemini API for vision content');
      }
      
      const geminiStartTime = Date.now();
      
      // Use Gemini API
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' });
      
      // Create the data parts for Gemini API
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: imageData
          }
        }
      ]);
      
      const responseText = result.response.text();
      
      // Record fallback diagnostics
      lastRequestDiagnostics = {
        method: 'gemini',
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - geminiStartTime,
        modelUsed: 'gemini-1.5-pro-vision (fallback)'
      };
      
      if (ENABLE_VERTEX_DIAGNOSTICS) {
        console.log(`Gemini API vision fallback successful in ${lastRequestDiagnostics.responseTime}ms`);
      }
      
      return responseText;
    } catch (geminiError) {
      console.error('Error with Gemini vision fallback:', geminiError);
      
      // Update diagnostics with gemini error
      lastRequestDiagnostics = {
        ...lastRequestDiagnostics,
        method: 'gemini',
        success: false,
        error: geminiError.message,
        errorCode: geminiError.code || 'UNKNOWN',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      };
      
      throw new Error(`AI vision generation failed. Vertex AI and Gemini fallback both failed. ${geminiError.message}`);
    }
  }
  
  // If we got here, both methods failed or weren't available
  throw new Error('AI vision generation failed. No available AI service could process your request.');
}

/**
 * Express route to get diagnostic information about the AI services
 */
export async function getAIDiagnostics(req: Request, res: Response) {
  // Get configuration status
  const diagnosticData = {
    configStatus: {
      isConfigured,
      vertexAIAvailable: !!vertexAI,
      geminiAIAvailable: !!genAI,
      useAPIKeyAuth: USE_API_KEY_AUTH,
      useGeminiFallback: USE_GEMINI_FALLBACK,
      projectId,
      location
    },
    lastRequest: lastRequestDiagnostics,
    apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : null
  };
  
  res.json(diagnosticData);
}

/**
 * Express handler for Vertex AI requests
 */
export async function handleVertexAIResponse(req: Request, res: Response) {
  if (!isConfigured) {
    return res.status(503).json({
      error: 'AI services are not configured. Please provide VERTEX_AI_API_KEY or GOOGLE_API_KEY environment variable.'
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
      model: lastRequestDiagnostics.modelUsed || 'gemini-1.5-pro',
      metadata: {
        provider: lastRequestDiagnostics.method,
        responseTime: lastRequestDiagnostics.responseTime,
        timestamp: lastRequestDiagnostics.timestamp
      }
    });
  } catch (error) {
    console.error('Error calling AI services:', error);
    res.status(500).json({
      error: `AI service error: ${error.message}`,
      provider: lastRequestDiagnostics.method,
      errorDetails: lastRequestDiagnostics.error,
      errorCode: lastRequestDiagnostics.errorCode
    });
  }
}

/**
 * Express handler for vision AI requests
 */
export async function handleVisionAIResponse(req: Request, res: Response) {
  if (!isConfigured) {
    return res.status(503).json({
      error: 'AI services are not configured. Please provide VERTEX_AI_API_KEY or GOOGLE_API_KEY environment variable.'
    });
  }

  const {
    prompt,
    imageData,
    mimeType = 'image/jpeg',
    temperature = 0.7,
    maxTokens = 1000
  } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: 'Prompt is required.'
    });
  }
  
  if (!imageData) {
    return res.status(400).json({
      error: 'Image data is required.'
    });
  }

  try {
    const response = await generateResponseWithImage(prompt, imageData, mimeType, temperature, maxTokens);
    res.json({
      response,
      model: lastRequestDiagnostics.modelUsed || 'gemini-1.5-pro-vision',
      metadata: {
        provider: lastRequestDiagnostics.method,
        responseTime: lastRequestDiagnostics.responseTime,
        timestamp: lastRequestDiagnostics.timestamp
      }
    });
  } catch (error) {
    console.error('Error calling Vision AI services:', error);
    res.status(500).json({
      error: `Vision AI service error: ${error.message}`,
      provider: lastRequestDiagnostics.method,
      errorDetails: lastRequestDiagnostics.error,
      errorCode: lastRequestDiagnostics.errorCode
    });
  }
}

/**
 * Express handler for Vertex AI market analysis
 */
export async function generateMarketAnalysis(req: Request, res: Response) {
  if (!isConfigured) {
    return res.status(503).json({
      error: 'AI services are not configured. Please provide VERTEX_AI_API_KEY or GOOGLE_API_KEY environment variable.'
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
        provider: lastRequestDiagnostics.method,
        model: lastRequestDiagnostics.modelUsed || 'gemini-1.5-pro',
        responseTime: lastRequestDiagnostics.responseTime
      }
    });
  } catch (error) {
    console.error('Error in market analysis:', error);
    res.status(500).json({
      error: 'Failed to analyze market trends',
      details: error instanceof Error ? error.message : 'Unknown error',
      provider: lastRequestDiagnostics.method,
      errorDetails: lastRequestDiagnostics.error
    });
  }
}

// Export was moved to the top of the file