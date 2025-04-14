import { Request, Response } from 'express';
import fetch from 'node-fetch';
import googleApiKeyManager from './services/googleApiKeyManager';

/**
 * Google Natural Language API - Entity Analysis
 * Analyzes entities (people, places, organizations, etc.) in text
 */
export async function analyzeEntitiesHandler(req: Request, res: Response) {
  try {
    // Get API key from the Google API Key Manager (uses GROUP5)
    const apiKey = googleApiKeyManager.getApiKeyForService('language');
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'No API key available for Natural Language service'
      });
    }

    const {
      text,
      language = '',
      encodingType = 'UTF8'
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Prepare request data
    const requestData = {
      document: {
        type: 'PLAIN_TEXT',
        content: text,
        language
      },
      encodingType
    };

    // Call Google Natural Language API using REST endpoint with API key
    const response = await fetch(
      `https://language.googleapis.com/v1/documents:analyzeEntities?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API returned status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    
    // Track successful initialization
    googleApiKeyManager.trackServiceInitialization(
      'language',
      'GROUP5',
      true
    );

    // Return the analyzed entities
    res.json({
      entities: responseData.entities || [],
      language: responseData.language || language || 'en',
      provider: 'google'
    });
  } catch (error) {
    // Track failed initialization
    googleApiKeyManager.trackServiceInitialization(
      'language',
      'GROUP5',
      false,
      error.message
    );
    
    console.error('Google Natural Language API error:', error);
    res.status(500).json({
      error: `Failed to analyze entities: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

/**
 * Google Natural Language API - Sentiment Analysis
 * Analyzes the sentiment (positive/negative) of text
 */
export async function analyzeSentimentHandler(req: Request, res: Response) {
  try {
    // Get API key from the Google API Key Manager
    const apiKey = googleApiKeyManager.getApiKeyForService('language');
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'No API key available for Natural Language service'
      });
    }

    const {
      text,
      language = '',
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Prepare request data
    const requestData = {
      document: {
        type: 'PLAIN_TEXT',
        content: text,
        language
      }
    };

    // Call Google Natural Language API for sentiment analysis
    const response = await fetch(
      `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API returned status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    
    // Track successful initialization
    googleApiKeyManager.trackServiceInitialization(
      'language',
      'GROUP5',
      true
    );

    // Process and return the sentiment results
    const sentimentResult = {
      documentSentiment: responseData.documentSentiment || { score: 0, magnitude: 0 },
      language: responseData.language || language || 'en',
      sentences: responseData.sentences || [],
      provider: 'google',
      // Add human-readable interpretation
      analysis: {
        sentiment: getSentimentCategory(responseData.documentSentiment?.score),
        confidence: Math.abs(responseData.documentSentiment?.score || 0),
        intensity: responseData.documentSentiment?.magnitude || 0
      }
    };

    res.json(sentimentResult);
  } catch (error) {
    console.error('Google Natural Language Sentiment API error:', error);
    res.status(500).json({
      error: `Failed to analyze sentiment: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

/**
 * Google Natural Language API - Syntax Analysis
 * Analyzes the syntax (parts of speech, etc.) of text
 */
export async function analyzeSyntaxHandler(req: Request, res: Response) {
  try {
    // Get API key from the Google API Key Manager
    const apiKey = googleApiKeyManager.getApiKeyForService('language');
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'No API key available for Natural Language service'
      });
    }

    const {
      text,
      language = '',
      encodingType = 'UTF8'
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Prepare request data
    const requestData = {
      document: {
        type: 'PLAIN_TEXT',
        content: text,
        language
      },
      encodingType
    };

    // Call Google Natural Language API for syntax analysis
    const response = await fetch(
      `https://language.googleapis.com/v1/documents:analyzeSyntax?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API returned status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    
    // Track successful initialization
    googleApiKeyManager.trackServiceInitialization(
      'language',
      'GROUP5',
      true
    );

    res.json({
      tokens: responseData.tokens || [],
      language: responseData.language || language || 'en',
      provider: 'google'
    });
  } catch (error) {
    console.error('Google Natural Language Syntax API error:', error);
    res.status(500).json({
      error: `Failed to analyze syntax: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

/**
 * Maps sentiment score to a human-readable category
 * @param score Sentiment score (-1 to 1)
 * @returns Category label
 */
function getSentimentCategory(score: number): string {
  if (!score && score !== 0) return 'neutral';
  
  if (score < -0.7) return 'very negative';
  if (score < -0.3) return 'negative';
  if (score < 0.3) return 'neutral';
  if (score < 0.7) return 'positive';
  return 'very positive';
}