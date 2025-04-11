import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import { aiplatform } from '@google-cloud/aiplatform';

interface MarketAnalysisRequest {
  coins: string[];
  timeframe: string;
  language: string;
}

// Initialize Vertex AI with project and location
const projectId = process.env.VERTEX_PROJECT_ID || 'your-project-id';
const location = process.env.VERTEX_LOCATION || 'us-central1';
let vertexAi: VertexAI;

try {
  vertexAi = new VertexAI({
    project: projectId,
    location: location,
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  });
  console.log('Vertex AI initialized successfully');
} catch (error) {
  console.error('Error initializing Vertex AI:', error);
}

/**
 * Analyze market trends using Vertex AI Gemini
 */
export async function analyzeMarketTrends(req: Request, res: Response) {
  try {
    const { coins, timeframe, language = 'en' } = req.body as MarketAnalysisRequest;
    
    if (!coins || !Array.isArray(coins) || coins.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: coins array is required'
      });
    }

    // Try to get real market data
    const marketData = await fetchCryptoMarketData(coins);
    
    try {
      // Use Vertex AI if available
      if (vertexAi && process.env.GOOGLE_API_KEY) {
        const generativeModel = vertexAi.getGenerativeModel({
          model: 'gemini-1.5-flash',
          apiKey: process.env.GOOGLE_API_KEY,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
          ],
        });

        const prompt = generateAnalysisPrompt(coins, timeframe, marketData, language);
        const result = await generativeModel.generateContent(prompt);
        const response = await result.response;
        const analysis = response.text();

        return res.json({
          success: true,
          analysis,
          metadata: {
            coins,
            timeframe,
            timestamp: new Date().toISOString(),
            analysisEngine: 'Vertex AI Gemini 1.5',
            dataSource: marketData ? 'Real market data' : 'Limited market data available',
          }
        });
      } else {
        // Fallback to template-based analysis when Vertex AI is not available
        const analysis = generateMarketAnalysis(coins, timeframe, language);
        
        return res.json({
          success: true,
          analysis,
          metadata: {
            coins,
            timeframe,
            timestamp: new Date().toISOString(),
            analysisEngine: 'Template-based Analysis (Vertex AI not available)',
          }
        });
      }
    } catch (aiError) {
      console.error('Error with Vertex AI, falling back to template:', aiError);
      
      // Fallback to template-based analysis
      const analysis = generateMarketAnalysis(coins, timeframe, language);
      
      return res.json({
        success: true,
        analysis,
        metadata: {
          coins,
          timeframe,
          timestamp: new Date().toISOString(),
          analysisEngine: 'Template-based Analysis (Fallback)',
          error: aiError instanceof Error ? aiError.message : 'Unknown AI error',
        }
      });
    }
    
  } catch (error) {
    console.error('Error in market analysis:', error);
    res.status(500).json({
      error: 'Failed to analyze market trends', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Make price predictions using Vertex AI
 */
export async function predictPrices(req: Request, res: Response) {
  try {
    const { symbol, timeframes = ['24h', '7d', '30d'], confidence = true } = req.body;
    
    if (!symbol) {
      return res.status(400).json({
        error: 'Invalid request: symbol is required'
      });
    }

    // Fetch current price and historical data
    const currentPrice = await fetchCurrentPrice(symbol);
    const historicalData = await fetchHistoricalData(symbol);
    
    try {
      // Use Vertex AI if available
      if (vertexAi && process.env.GOOGLE_API_KEY) {
        const generativeModel = vertexAi.getGenerativeModel({
          model: 'gemini-1.5-flash',
          apiKey: process.env.GOOGLE_API_KEY,
        });
        
        // Create prompt with historical data
        const prompt = generatePredictionPrompt(symbol, timeframes, currentPrice, historicalData);
        
        // Get AI prediction
        const result = await generativeModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json'
          }
        });
        
        const response = await result.response;
        const aiText = response.text();
        
        try {
          // Try to parse AI response as JSON
          const aiPredictions = JSON.parse(aiText);
          
          // Validate AI predictions
          if (Array.isArray(aiPredictions) && aiPredictions.length > 0) {
            return res.json({
              success: true,
              symbol: symbol.toUpperCase(),
              currentPrice,
              predictions: aiPredictions,
              timestamp: new Date().toISOString(),
              predictionEngine: 'Vertex AI Gemini 1.5',
            });
          } else {
            throw new Error('Invalid AI prediction format');
          }
        } catch (jsonError) {
          console.error('Error parsing AI prediction as JSON:', jsonError);
          // Fall back to template-based predictions when JSON parsing fails
          throw new Error('Could not parse AI prediction');
        }
      } else {
        throw new Error('Vertex AI not available');
      }
    } catch (aiError) {
      console.warn('Using template-based prediction fallback:', aiError);
      
      // Generate simple template-based predictions as fallback
      const predictions = timeframes.map(timeframe => {
        let volatility;
        
        switch(timeframe) {
          case '24h':
            volatility = 0.03; // 3% volatility for 24h
            break;
          case '7d':
            volatility = 0.08; // 8% for 7 days
            break;
          case '30d':
          default:
            volatility = 0.15; // 15% for 30 days
            break;
        }
        
        return {
          timeframe,
          min: (currentPrice * (1 - volatility)).toFixed(2),
          max: (currentPrice * (1 + volatility)).toFixed(2),
          ...(confidence && { 
            confidence: confidenceForTimeframe(timeframe) 
          })
        };
      });

      res.json({
        success: true,
        symbol: symbol.toUpperCase(),
        currentPrice,
        predictions,
        timestamp: new Date().toISOString(),
        predictionEngine: 'Template-based Prediction (Fallback)',
      });
    }
    
  } catch (error) {
    console.error('Error in price prediction:', error);
    res.status(500).json({
      error: 'Failed to predict prices', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Helper function to fetch current price - in production this would use CoinGecko
 */
async function fetchCurrentPrice(symbol: string): Promise<number> {
  try {
    // Would normally call CoinGecko API here
    // In this demo, we return a mock price based on the crypto
    const mockPrices: Record<string, number> = {
      'btc': 67500,
      'eth': 3250,
      'sol': 148.5,
      'xrp': 0.58,
      'ada': 0.45,
      'doge': 0.12,
    };
    
    const key = symbol.toLowerCase();
    if (mockPrices[key]) {
      return mockPrices[key];
    }
    
    // Default fallback price
    return 100;
  } catch (error) {
    console.error('Error fetching current price:', error);
    return 100; // Default fallback price
  }
}

/**
 * Helper function to fetch historical data
 */
async function fetchHistoricalData(symbol: string): Promise<{ date: string; price: number }[]> {
  try {
    // In a production environment, this would fetch real data from CoinGecko
    // For demo purposes, we'll generate some realistic looking historical data
    const currentPrice = await fetchCurrentPrice(symbol);
    const daysBack = 30;
    const volatility = 0.02; // 2% daily volatility
    
    const data: { date: string; price: number }[] = [];
    const today = new Date();
    
    let price = currentPrice;
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Add some random movement to simulate real price movements
      const change = (Math.random() * 2 - 1) * volatility;
      if (i > 0) {
        price = price * (1 + change);
      }
      
      data.unshift({
        date: date.toISOString().split('T')[0],
        price: parseFloat(price.toFixed(2))
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
}

/**
 * Generate prompt for Vertex AI analysis
 */
function generateAnalysisPrompt(
  coins: string[], 
  timeframe: string, 
  marketData: any = null,
  language: string = 'en'
): string {
  const coinsList = coins.map(c => c.toUpperCase()).join(', ');
  
  const timeframeMap: Record<string, string> = {
    '24h': 'next 24 hours',
    '7d': 'coming week',
    '30d': 'next month',
    '90d': 'next quarter'
  };
  
  const timeframeText = timeframeMap[timeframe] || timeframe;
  
  // Base prompt with market information
  const prompt = `
You are a professional cryptocurrency market analyst. Generate a comprehensive market analysis for the following cryptocurrencies: ${coinsList}. 

Your analysis should cover the ${timeframeText} and be organized into these sections:
1. Overview
2. Key Insights (specific to each requested cryptocurrency)
3. Market Sentiment
4. Technical Analysis
5. Recommendations

Focus on providing factual, data-driven insights about price trends, momentum indicators, support/resistance levels, and trading volumes. Use Markdown formatting for the output.

Provide a balanced perspective that acknowledges both bullish and bearish indicators where appropriate. Be specific about price levels and technical indicators.
`;

  // Add market data context if available
  const dataContext = marketData ? `\n\nHere is current market data to inform your analysis:\n${JSON.stringify(marketData, null, 2)}` : '';
  
  // Add language instruction if not English
  const languageInstruction = language !== 'en' ? `\n\nPlease provide your response in ${language}.` : '';
  
  return prompt + dataContext + languageInstruction;
}

/**
 * Generate prompt for price prediction
 */
function generatePredictionPrompt(
  symbol: string,
  timeframes: string[],
  currentPrice: number,
  historicalData: { date: string; price: number }[]
): string {
  const timeframeDescriptions: Record<string, string> = {
    '24h': 'next 24 hours',
    '7d': 'next 7 days',
    '30d': 'next 30 days'
  };
  
  const timeframeText = timeframes.map(tf => timeframeDescriptions[tf] || tf).join(', ');
  
  return `
You are a cryptocurrency price prediction AI. Analyze the historical price data for ${symbol.toUpperCase()} and predict price ranges for the ${timeframeText}.

Current price: $${currentPrice}

Historical price data (last ${historicalData.length} days):
${JSON.stringify(historicalData, null, 2)}

For each timeframe, predict the minimum and maximum price, and provide a confidence level between 0 and 1.

Your response should be a JSON array with the following structure:
[
  {
    "timeframe": "24h",
    "min": 67200,
    "max": 68500,
    "confidence": 0.85
  },
  ...
]

Make your predictions based on:
1. Technical analysis of the historical data
2. Current price momentum
3. Typical volatility for this asset
4. Past patterns of price movement

Only return a valid JSON array. Do not include any other text.
`;
}

/**
 * Helper to generate confidence levels
 */
function confidenceForTimeframe(timeframe: string): number {
  switch(timeframe) {
    case '24h':
      return 0.85; // High confidence for short term
    case '7d':
      return 0.65; // Medium for medium term
    case '30d':
    default:
      return 0.40; // Low for long term
  }
}

/**
 * Helper to generate market analysis text - as fallback when Vertex AI is unavailable
 */
function generateMarketAnalysis(coins: string[], timeframe: string, language: string): string {
  const coinNames = coins.map(c => c.toUpperCase()).join(', ');
  
  const timeframeTexts: Record<string, string> = {
    '24h': 'next 24 hours',
    '7d': 'coming week',
    '30d': 'next month', 
    '90d': 'next quarter'
  };
  
  const timeText = timeframeTexts[timeframe] || timeframe;
  
  // For fallback when Vertex AI is not available
  
  return `
# Market Analysis for ${coinNames}

## Overview
Based on technical indicators, market sentiment analysis, and trading volume patterns, this analysis provides insights for the ${timeText}.

## Key Insights
- BTC shows strong support at current levels with positive momentum indicators
- ETH is consolidating after recent gains, with increasing developer activity
- SOL exhibits higher volatility but remains in a positive trend channel
- XRP faces regulatory uncertainty but maintains stable trading volumes

## Market Sentiment
Overall market sentiment appears cautiously optimistic with institutional interest growing.
Trading volumes suggest continued accumulation by large holders, particularly for Bitcoin and Ethereum.

## Technical Analysis
RSI indicators show ${coins[0]} approaching overbought territory (68) while ${coins.length > 1 ? coins[1] : 'other altcoins'} remain in neutral range.
Moving averages confirm upward trend but suggest potential resistance at key price levels.

## Recommendation
Consider diversified position across these assets with appropriate risk management.
Watch for increased volatility around upcoming economic announcements.
`;
}