import type { Request, Response } from "express";
import { LanguageServiceClient } from '@google-cloud/language';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  confidence: number;
  source?: string;
}

/**
 * Initialize clients
 */
let languageClient: LanguageServiceClient | null = null;
let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

// Initialize Google NLP client if credentials are available
try {
  languageClient = new LanguageServiceClient();
} catch (error) {
  console.warn("Unable to initialize Google Language client. Sentiment analysis with Google NLP will not be available.", error);
}

// Initialize OpenAI client if API key is available
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.warn("OPENAI_API_KEY not set. Sentiment analysis with OpenAI will not be available.");
}

// Initialize Anthropic client if API key is available
if (process.env.ANTHROPIC_API_KEY) {
  anthropicClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });
} else {
  console.warn("ANTHROPIC_API_KEY not set. Sentiment analysis with Anthropic will not be available.");
}

/**
 * Simple rule-based sentiment analyzer for chat messages
 * Used as a fallback when API services are not available
 */
function analyzeTextSentimentLocal(text: string): SentimentResult {
  // Normalize text
  const normalizedText = text.toLowerCase();
  
  // Define keyword lists
  const positiveKeywords = [
    'thank', 'thanks', 'good', 'great', 'excellent', 'amazing', 
    'awesome', 'love', 'happy', 'helpful', 'useful', 'appreciate',
    'bull', 'bullish', 'gain', 'profit', 'up', 'moon', 'rise', 'growth',
    'opportunity', 'success', 'win', 'winning', 'green', 'promising',
    'secure', 'security', 'safe', 'reliable', 'trust', 'better', 'best',
    'improvement', 'improve', 'improved', 'strong', 'strength', 'advantage'
  ];

  const negativeKeywords = [
    'bad', 'terrible', 'awful', 'poor', 'useless', 'hate', 'dislike',
    'disappointed', 'disappointing', 'bear', 'bearish', 'loss', 'crash',
    'down', 'dump', 'scam', 'fraud', 'fake', 'risky', 'risk', 'danger',
    'dangerous', 'insecure', 'unreliable', 'distrust', 'worse', 'worst',
    'weak', 'weakness', 'problem', 'issue', 'fail', 'failure', 'red',
    'decrease', 'decline', 'falling', 'fell', 'drop', 'dropping', 'dropped',
    'difficult', 'hard', 'complicated', 'complex', 'confusing', 'confused'
  ];
  
  // Count matches
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveKeywords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = normalizedText.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  }
  
  for (const word of negativeKeywords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = normalizedText.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  }
  
  // Calculate sentiment score (range: -1 to 1)
  const total = positiveCount + negativeCount;
  const score = total > 0 
    ? (positiveCount - negativeCount) / total 
    : 0;
  
  // Define thresholds
  const NEUTRAL_THRESHOLD = 0.2;
  
  // Determine sentiment
  let sentiment: "positive" | "negative" | "neutral";
  if (score > NEUTRAL_THRESHOLD) {
    sentiment = "positive";
  } else if (score < -NEUTRAL_THRESHOLD) {
    sentiment = "negative";
  } else {
    sentiment = "neutral";
  }
  
  // Calculate confidence (higher when there are more matches)
  const confidence = Math.min(1, (total / 10) * Math.abs(score) + 0.5);
  
  return {
    sentiment,
    score,
    confidence,
    source: 'local-rules'
  };
}

/**
 * Analyze sentiment using Google Cloud Natural Language API
 */
async function analyzeTextSentimentWithGoogleNLP(text: string): Promise<SentimentResult> {
  if (!languageClient) {
    throw new Error('Google Language client is not initialized');
  }

  const document = {
    content: text,
    type: 'PLAIN_TEXT' as const,
  };

  const [result] = await languageClient.analyzeSentiment({ document });
  const sentiment = result.documentSentiment;

  if (!sentiment) {
    throw new Error('No sentiment result returned from Google NLP');
  }

  // Google NLP returns score from -1 to 1 (negative to positive)
  // Convert to our format
  const score = sentiment.score || 0;
  const magnitude = sentiment.magnitude || 0;
  
  // Determine sentiment category based on score
  let sentimentCategory: "positive" | "negative" | "neutral";
  if (score > 0.2) {
    sentimentCategory = "positive";
  } else if (score < -0.2) {
    sentimentCategory = "negative";
  } else {
    sentimentCategory = "neutral";
  }

  // Calculate confidence based on magnitude (Google's measure of strength)
  // Normalize to 0-1 range (magnitude is typically 0-10)
  const confidence = Math.min(1, magnitude / 5);

  return {
    sentiment: sentimentCategory,
    score,
    confidence,
    source: 'google-nlp'
  };
}

/**
 * Analyze sentiment using OpenAI API
 */
async function analyzeTextSentimentWithOpenAI(text: string): Promise<SentimentResult> {
  if (!openaiClient) {
    throw new Error('OpenAI client is not initialized');
  }

  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from -1 to 1 where -1 is very negative, 0 is neutral, and 1 is very positive. Also include a confidence score between 0 and 1. Respond with JSON in this format: { 'sentiment': 'positive'|'negative'|'neutral', 'score': number, 'confidence': number }"
      },
      {
        role: "user",
        content: text
      }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content);

  return {
    sentiment: result.sentiment,
    score: result.score,
    confidence: result.confidence,
    source: 'openai'
  };
}

/**
 * Analyze sentiment using Anthropic API
 */
async function analyzeTextSentimentWithAnthropic(text: string): Promise<SentimentResult> {
  if (!anthropicClient) {
    throw new Error('Anthropic client is not initialized');
  }

  const response = await anthropicClient.messages.create({
    model: "claude-3-7-sonnet-20250219",
    max_tokens: 150,
    system: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from -1 to 1 where -1 is very negative, 0 is neutral, and 1 is very positive. Also include a confidence score between 0 and 1. Return only valid JSON in this format: { 'sentiment': 'positive'|'negative'|'neutral', 'score': number, 'confidence': number }",
    messages: [
      { role: "user", content: text }
    ]
  });

  // Extract the JSON response from the content
  const responseText = response.content[0].text;
  const result = JSON.parse(responseText);

  return {
    sentiment: result.sentiment,
    score: result.score,
    confidence: result.confidence,
    source: 'anthropic'
  };
}

/**
 * Express handler for sentiment analysis with fallback options
 */
export async function analyzeSentiment(req: Request, res: Response) {
  try {
    const { text, preferred_provider } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    let result: SentimentResult;
    let errors = [];
    
    // Try the preferred provider first if specified
    if (preferred_provider) {
      try {
        switch (preferred_provider) {
          case 'google':
            if (languageClient) {
              result = await analyzeTextSentimentWithGoogleNLP(text);
              return res.json({
                text,
                ...result
              });
            } else {
              errors.push('Google NLP not available');
            }
            break;
          case 'openai':
            if (openaiClient) {
              result = await analyzeTextSentimentWithOpenAI(text);
              return res.json({
                text,
                ...result
              });
            } else {
              errors.push('OpenAI not available');
            }
            break;
          case 'anthropic':
            if (anthropicClient) {
              result = await analyzeTextSentimentWithAnthropic(text);
              return res.json({
                text,
                ...result
              });
            } else {
              errors.push('Anthropic not available');
            }
            break;
          default:
            // No specific preference or invalid preference, fall through to automatic selection
            break;
        }
      } catch (err) {
        console.error(`Error with preferred provider ${preferred_provider}:`, err);
        errors.push(`${preferred_provider} failed: ${err.message}`);
        // Fall through to try other providers
      }
    }
    
    // Try Google NLP first
    if (languageClient) {
      try {
        result = await analyzeTextSentimentWithGoogleNLP(text);
        return res.json({
          text,
          ...result
        });
      } catch (err) {
        console.error('Google NLP error:', err);
        errors.push(`Google NLP failed: ${err.message}`);
        // Fall through to next option
      }
    }
    
    // Try OpenAI next
    if (openaiClient) {
      try {
        result = await analyzeTextSentimentWithOpenAI(text);
        return res.json({
          text,
          ...result
        });
      } catch (err) {
        console.error('OpenAI error:', err);
        errors.push(`OpenAI failed: ${err.message}`);
        // Fall through to next option
      }
    }
    
    // Try Anthropic next
    if (anthropicClient) {
      try {
        result = await analyzeTextSentimentWithAnthropic(text);
        return res.json({
          text,
          ...result
        });
      } catch (err) {
        console.error('Anthropic error:', err);
        errors.push(`Anthropic failed: ${err.message}`);
        // Fall through to local fallback
      }
    }
    
    // If all external services fail or are unavailable, use local fallback
    result = analyzeTextSentimentLocal(text);
    
    // Include errors in debug mode
    const debug = req.query.debug === 'true';
    
    return res.json({
      text,
      ...result,
      ...(debug ? { errors } : {})
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze sentiment',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}