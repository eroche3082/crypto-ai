import { VertexAI } from "@google-cloud/vertexai";
import { Request, Response } from 'express';

// Create client options
const options = {
  project: process.env.GOOGLE_PROJECT_ID || "erudite-creek-431302-q3",
  location: process.env.GOOGLE_LOCATION || "us-central1",
  apiEndpoint: process.env.GOOGLE_API_ENDPOINT,
};

// Create the VertexAI client
const vertexAi = new VertexAI(options);

// Get the generative model
const getGenerativeModel = (modelName: string = "gemini-1.5-flash-latest") => {
  return vertexAi.getGenerativeModel({ model: modelName });
};

/**
 * Market Analysis using Vertex AI
 * Analyzes market trends and provides predictions
 */
export async function analyzeMarketTrends(req: Request, res: Response) {
  try {
    const { 
      coins, 
      timeframe = '7d', 
      modelName = 'gemini-1.5-flash-latest', 
      language = 'en' 
    } = req.body;
    
    if (!coins || !Array.isArray(coins) || coins.length === 0) {
      return res.status(400).json({ error: 'Valid coins array is required' });
    }
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Gemini API key not found. Please set GEMINI_API_KEY environment variable.'
      });
    }
    
    // Create a language-specific instruction based on the user's preference
    let languageInstruction = "";
    if (language === 'es') {
      languageInstruction = "Responde en español. ";
    } else if (language === 'fr') {
      languageInstruction = "Réponds en français. ";
    } else if (language === 'pt') {
      languageInstruction = "Responda em português. ";
    }
    
    // Create the analysis prompt
    const prompt = `${languageInstruction}Analyze the current market trends for the following cryptocurrencies: ${coins.join(', ')}. 
    Consider the ${timeframe} timeframe. Provide insights on:
    1. Price action and key support/resistance levels
    2. Market sentiment and momentum
    3. Potential catalysts for price movement
    4. Technical indicator analysis
    5. Risk assessment
    
    Format your response with clear sections and actionable insights. Include a summary prediction at the end.`;
    
    // Get the generative model
    const generativeModel = getGenerativeModel(modelName);
    
    // Generate content
    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    // Extract the response text safely
    let responseText = "No analysis generated";
    
    // Access the response content through the appropriate structure
    if (result.response && result.response.candidates && result.response.candidates.length > 0) {
      const candidate = result.response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const part = candidate.content.parts[0];
        if (part.text) {
          responseText = part.text;
        }
      }
    }
    
    // Return response to client
    res.json({ 
      analysis: responseText,
      model: modelName,
      timeframe: timeframe,
      language: language,
      coins: coins
    });
  } catch (error) {
    console.error('Vertex AI Market Analysis error:', error);
    res.status(500).json({ 
      error: `Failed to generate market analysis: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

/**
 * Price Prediction using Vertex AI
 * Provides predictions for specific cryptocurrencies
 */
export async function predictPrices(req: Request, res: Response) {
  try {
    const { 
      symbol, 
      timeframes = ['24h', '7d', '30d'], 
      modelName = 'gemini-1.5-flash-latest',
      language = 'en'
    } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Cryptocurrency symbol is required' });
    }
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Gemini API key not found. Please set GEMINI_API_KEY environment variable.'
      });
    }
    
    // Create a language-specific instruction based on the user's preference
    let languageInstruction = "";
    if (language === 'es') {
      languageInstruction = "Responde en español. ";
    } else if (language === 'fr') {
      languageInstruction = "Réponds en français. ";
    } else if (language === 'pt') {
      languageInstruction = "Responda em português. ";
    }
    
    // Create the prediction prompt
    const prompt = `${languageInstruction}Given the current market conditions and historical data, predict the price movement for ${symbol} over the following timeframes: ${timeframes.join(', ')}.

    For each timeframe, provide:
    1. A price range prediction (minimum and maximum)
    2. Confidence level (percentage)
    3. Key factors that might influence the price
    4. Risk level assessment (Low, Medium, High)
    
    Format your response as a structured analysis with clear predictions and reasoning.`;
    
    // Get the generative model
    const generativeModel = getGenerativeModel(modelName);
    
    // Generate content
    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    // Extract the response text safely
    let responseText = "No prediction generated";
    
    // Access the response content through the appropriate structure
    if (result.response && result.response.candidates && result.response.candidates.length > 0) {
      const candidate = result.response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const part = candidate.content.parts[0];
        if (part.text) {
          responseText = part.text;
        }
      }
    }
    
    // Return response to client
    res.json({ 
      prediction: responseText,
      model: modelName,
      symbol: symbol,
      timeframes: timeframes,
      language: language,
      disclaimer: "These predictions are for educational purposes only and should not be considered financial advice."
    });
  } catch (error) {
    console.error('Vertex AI Price Prediction error:', error);
    res.status(500).json({ 
      error: `Failed to generate price prediction: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}