import type { Request, Response } from "express";

interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  confidence: number;
}

/**
 * Simple rule-based sentiment analyzer for chat messages
 */
function analyzeTextSentiment(text: string): SentimentResult {
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
    confidence
  };
}

/**
 * Express handler for sentiment analysis
 */
export async function analyzeSentiment(req: Request, res: Response) {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // For real implementation, you would integrate with an AI provider like Google NLP or similar
    // For now, using a simple rule-based analyzer
    const result = analyzeTextSentiment(text);
    
    return res.json({
      text,
      sentiment: result.sentiment,
      score: result.score,
      confidence: result.confidence
    });
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
}