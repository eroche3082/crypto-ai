import { Request, Response } from "express";
import fetch from "node-fetch";
import axios from "axios";

// Interface for the Twitter API response
interface TwitterAPIResponse {
  data?: {
    text: string;
    id: string;
    created_at: string;
  }[];
  meta?: {
    result_count: number;
    newest_id: string;
    oldest_id: string;
    next_token?: string;
  };
}

// Interface for a Twitter sentiment analysis result
interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  confidence: number;
  source?: string;
}

// Combined tweet with sentiment
interface TweetWithSentiment {
  id: string;
  text: string;
  created_at: string;
  sentiment: SentimentResult;
}

// Sentiment analysis results by token
interface TokenSentiment {
  symbol: string;
  name: string;
  overallSentiment: {
    score: number;
    sentiment: "positive" | "negative" | "neutral";
    confidence: number;
    source?: string;
  };
  breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentTweets: TweetWithSentiment[];
  tweetCount: number;
  trend: "up" | "down" | "stable";
  volume24h: number;
  lastUpdated: string;
}

/**
 * Analyze sentiment using our enhanced service
 * This will try multiple AI providers with fallback to local rules
 */
async function analyzeTextSentiment(text: string): Promise<SentimentResult> {
  try {
    // Call our sentiment analysis service
    const response = await axios.post('http://localhost:5000/api/sentiment/analyze', {
      text,
      // Twitter data tends to be better analyzed with certain models
      preferred_provider: 'anthropic' // Try Anthropic first, then fall back to others
    });
    
    if (response.status === 200 && response.data) {
      return {
        sentiment: response.data.sentiment,
        score: response.data.score,
        confidence: response.data.confidence,
        source: response.data.source || 'service'
      };
    } else {
      throw new Error('Invalid response from sentiment analysis service');
    }
  } catch (error) {
    console.warn('Error calling sentiment service, falling back to local implementation:', error);
    // Fall back to a simple local implementation if the service fails
    return analyzeTextSentimentLocal(text);
  }
}

/**
 * Simple rule-based sentiment analyzer for Twitter content
 * Used as a fallback when API services are not available
 */
function analyzeTextSentimentLocal(text: string): SentimentResult {
  // Convert to lowercase for case-insensitive matching
  const lowercaseText = text.toLowerCase();
  
  // Very simple positive and negative word lists
  const positiveWords = [
    "bullish", "moon", "mooning", "to the moon", "buy", "buying", "hold", "holding", 
    "green", "up", "uptrend", "breakout", "breakthrough", "gain", "gains", "profit", 
    "profits", "winner", "winning", "win", "growth", "growing", "grow", "opportunity",
    "opportunities", "potential", "good", "great", "excellent", "amazing", "awesome",
    "exciting", "excited", "success", "successful", "succeed", "succeeding", "surge",
    "surging", "rally", "rallying", "soar", "soaring", "rise", "rising", "pump", "pumping",
    "hodl", "bullrun", "bull run", "strong", "strength", "stronger", "rocket", "gem",
    "undervalued", "underrated", "adoption", "pump"
  ];
  
  const negativeWords = [
    "bearish", "crash", "crashing", "crashed", "dump", "dumping", "sell", "selling", 
    "red", "down", "downtrend", "drop", "dropping", "loss", "losses", "lose", "losing",
    "loser", "bear", "bearish", "fall", "falling", "fell", "decline", "declining",
    "decrease", "decreasing", "weak", "weaker", "weakness", "poor", "bad", "worse",
    "worst", "terrible", "horrible", "fail", "failing", "failed", "failure", "fear",
    "fearful", "scared", "scary", "panic", "panicking", "worry", "worrying", "worried",
    "concern", "concerning", "concerned", "trouble", "troubling", "troubled", "problem",
    "problematic", "issue", "risk", "risky", "danger", "dangerous", "warning", "warn",
    "scam", "fraud", "fraudulent", "ponzi", "rugpull", "rug pull", "hack", "hacked",
    "hacking", "stolen", "theft", "overvalued", "overpriced", "bubble", "correction"
  ];
  
  // Count occurrences of positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowercaseText.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowercaseText.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  });
  
  // Calculate basic sentiment score (-1 to 1)
  let score = 0;
  let sentiment: "positive" | "negative" | "neutral" = "neutral";
  let confidence = 0.5; // Default confidence
  
  const total = positiveCount + negativeCount;
  
  if (total > 0) {
    score = (positiveCount - negativeCount) / total;
    confidence = Math.min(0.5 + Math.abs(score) * 0.5, 0.95); // Scale confidence
    
    if (score > 0.1) {
      sentiment = "positive";
    } else if (score < -0.1) {
      sentiment = "negative";
    } else {
      sentiment = "neutral";
    }
  }
  
  return {
    sentiment,
    score: parseFloat(score.toFixed(2)),
    confidence: parseFloat(confidence.toFixed(2)),
    source: 'local-twitter-rules'
  };
}

// Sample tweets generation based on token and sentiment bias
// In a real implementation, this would be replaced with actual Twitter API calls
function generateSampleTweets(token: string, sentimentBias: number): TweetWithSentiment[] {
  const currentDate = new Date();
  const tweetTemplates = [
    // Positive templates
    `${token} is looking very strong today! The fundamentals are great and the chart is bullish. #crypto #${token.toLowerCase()}`,
    `Just bought more ${token} for my portfolio. I believe this coin has huge potential! 🚀 #${token.toLowerCase()} #investing`,
    `${token} team just announced a major partnership! This is going to be huge for adoption. #bullish #${token.toLowerCase()}`,
    `The ${token} ecosystem is growing faster than expected. Feeling really good about my investment! #${token.toLowerCase()} #hodl`,
    `Technical analysis suggests ${token} is about to break out! Watch this space 📈 #crypto #${token.toLowerCase()} #TA`,
    
    // Neutral templates
    `What do you all think about ${token} at current prices? Considering adding some to my portfolio. #crypto #${token.toLowerCase()}`,
    `${token} seems to be moving sideways for now. Waiting for a clear signal before making a move. #crypto #${token.toLowerCase()}`,
    `Interesting developments in the ${token} community today. Still researching what this means long-term. #${token.toLowerCase()}`,
    `Looking at both sides of the ${token} debate. There are valid arguments from bulls and bears. #${token.toLowerCase()} #research`,
    `${token} volatility has decreased recently. Market seems undecided about direction. #crypto #${token.toLowerCase()}`,
    
    // Negative templates
    `${token} doesn't look good right now. The chart is forming a clear bear pattern. Might sell soon. #crypto #${token.toLowerCase()}`,
    `Disappointed with the recent ${token} news. Expected more from the team. #${token.toLowerCase()} #crypto`,
    `Selling my ${token} position. I see better opportunities elsewhere in the market. #${token.toLowerCase()} #trading`,
    `${token} volumes are decreasing while competition is heating up. Worrying trend. #crypto #${token.toLowerCase()}`,
    `Not convinced by ${token}'s roadmap anymore. Too many delays and vague promises. #${token.toLowerCase()} #bearish`,
  ];
  
  // Generate 5-10 tweets
  const tweetCount = Math.floor(Math.random() * 6) + 5;
  const tweets: TweetWithSentiment[] = [];
  
  for (let i = 0; i < tweetCount; i++) {
    // Select template based on sentiment bias (higher bias = more positive tweets)
    let templateIndex: number;
    const rand = Math.random();
    
    if (rand < (0.4 + sentimentBias * 0.2)) {
      // Positive tweet (0-4)
      templateIndex = Math.floor(Math.random() * 5);
    } else if (rand < (0.7 + sentimentBias * 0.1)) {
      // Neutral tweet (5-9)
      templateIndex = Math.floor(Math.random() * 5) + 5;
    } else {
      // Negative tweet (10-14)
      templateIndex = Math.floor(Math.random() * 5) + 10;
    }
    
    const text = tweetTemplates[templateIndex];
    
    // Create a random date within the last 24 hours
    const tweetDate = new Date(currentDate);
    tweetDate.setHours(tweetDate.getHours() - Math.floor(Math.random() * 24));
    tweetDate.setMinutes(tweetDate.getMinutes() - Math.floor(Math.random() * 60));
    
    // Analyze sentiment (use local version for now, will be replaced with async version later)
    const sentiment = analyzeTextSentimentLocal(text);
    
    tweets.push({
      id: `${Date.now()}-${i}`,
      text,
      created_at: tweetDate.toISOString(),
      sentiment
    });
  }
  
  // Sort by date (newest first)
  return tweets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// Get Twitter sentiment for a crypto token
export async function getTwitterSentiment(req: Request, res: Response) {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ error: "Symbol parameter is required" });
    }
    
    // Normalize symbol to uppercase
    const normalizedSymbol = symbol.toUpperCase();
    
    // In a real implementation, we would call the Twitter API here using the TWITTER_API_KEY
    // But for this demo, we'll simulate the data based on the token
    
    // Generate a stable but seemingly random sentiment bias for each token
    // This ensures the same token always gets similar sentiment results
    const tokenSeed = normalizedSymbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sentimentBias = Math.sin(tokenSeed) * 0.5; // Range between -0.5 and 0.5
    
    // Generate sample tweets with sentiment analysis
    const tweets = generateSampleTweets(normalizedSymbol, sentimentBias);
    
    // Calculate overall sentiment
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    let totalScore = 0;
    
    tweets.forEach(tweet => {
      if (tweet.sentiment.sentiment === "positive") positiveCount++;
      else if (tweet.sentiment.sentiment === "neutral") neutralCount++;
      else negativeCount++;
      
      totalScore += tweet.sentiment.score;
    });
    
    const averageScore = totalScore / tweets.length;
    
    // Determine overall sentiment
    let overallSentiment: "positive" | "negative" | "neutral" = "neutral";
    if (averageScore > 0.1) overallSentiment = "positive";
    else if (averageScore < -0.1) overallSentiment = "negative";
    
    // Calculate confidence in overall sentiment
    const confidence = Math.min(0.5 + Math.abs(averageScore) * 0.5, 0.95);
    
    // Generate sentiment trend ("up", "down", "stable")
    // In a real implementation, this would be based on historical data
    const trend: "up" | "down" | "stable" = 
      sentimentBias > 0.2 ? "up" : 
      sentimentBias < -0.2 ? "down" : "stable";
    
    // Generate a reasonable tweet volume based on token popularity
    // Higher market cap tokens would have more tweets
    const volume24h = Math.floor(Math.random() * 10000) + 500;
    
    // Construct the response object
    const result: TokenSentiment = {
      symbol: normalizedSymbol,
      name: getCryptoName(normalizedSymbol),
      overallSentiment: {
        score: parseFloat(averageScore.toFixed(2)),
        sentiment: overallSentiment,
        confidence: parseFloat(confidence.toFixed(2))
      },
      breakdown: {
        positive: positiveCount,
        neutral: neutralCount,
        negative: negativeCount
      },
      recentTweets: tweets.slice(0, 5), // Just return the 5 most recent tweets
      tweetCount: volume24h,
      trend,
      volume24h,
      lastUpdated: new Date().toISOString()
    };
    
    return res.json(result);
  } catch (error: any) {
    console.error("Error fetching Twitter sentiment:", error);
    return res.status(500).json({ 
      error: "Error fetching Twitter sentiment", 
      message: error.message 
    });
  }
}

// Helper function to get a crypto name from symbol
function getCryptoName(symbol: string): string {
  const cryptoNames: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'BNB': 'Binance Coin',
    'SOL': 'Solana',
    'XRP': 'Ripple',
    'ADA': 'Cardano',
    'AVAX': 'Avalanche',
    'DOT': 'Polkadot',
    'MATIC': 'Polygon',
    'DOGE': 'Dogecoin',
    'SHIB': 'Shiba Inu',
    'UNI': 'Uniswap',
    'LINK': 'Chainlink',
    'ATOM': 'Cosmos',
    'LTC': 'Litecoin',
    'TRX': 'Tron',
    'XLM': 'Stellar',
    'NEAR': 'Near Protocol',
    'FTM': 'Fantom',
    'ALGO': 'Algorand',
    'OP': 'Optimism',
    'ARB': 'Arbitrum'
  };
  
  return cryptoNames[symbol] || `${symbol} Token`;
}

// Get Twitter sentiment for multiple tokens
export async function getMarketSentiment(req: Request, res: Response) {
  try {
    // Get the list of tokens to analyze from the query
    const { symbols } = req.query;
    
    if (!symbols) {
      return res.status(400).json({ error: "Symbols parameter is required" });
    }
    
    let tokenList: string[];
    
    if (typeof symbols === 'string') {
      // Split by comma if it's a comma-separated list
      tokenList = symbols.split(',').map(s => s.trim().toUpperCase());
    } else if (Array.isArray(symbols)) {
      // If it's already an array, process each element
      tokenList = symbols.map(s => s.toString().trim().toUpperCase());
    } else {
      return res.status(400).json({ error: "Invalid symbols format" });
    }
    
    // Limit the number of tokens to process
    const limitedTokenList = tokenList.slice(0, 10); // Process max 10 tokens at once
    
    // Process each token and get sentiment data
    const results: Record<string, any> = {};
    
    for (const symbol of limitedTokenList) {
      const tokenSeed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const sentimentBias = Math.sin(tokenSeed) * 0.5;
      
      // Generate a simplified sentiment object for each token
      let sentimentScore = parseFloat((sentimentBias + (Math.random() * 0.4 - 0.2)).toFixed(2));
      sentimentScore = Math.max(-1, Math.min(1, sentimentScore)); // Clamp between -1 and 1
      
      let sentiment: "positive" | "negative" | "neutral" = "neutral";
      if (sentimentScore > 0.1) sentiment = "positive";
      else if (sentimentScore < -0.1) sentiment = "negative";
      
      const trend: "up" | "down" | "stable" = 
        sentimentBias > 0.2 ? "up" : 
        sentimentBias < -0.2 ? "down" : "stable";
      
      const tweetVolume = Math.floor(Math.random() * 10000) + 100;
      
      results[symbol] = {
        symbol,
        name: getCryptoName(symbol),
        sentiment: {
          score: sentimentScore,
          sentiment,
          confidence: Math.min(0.5 + Math.abs(sentimentScore) * 0.5, 0.95)
        },
        trend,
        volume24h: tweetVolume,
        lastUpdated: new Date().toISOString()
      };
    }
    
    return res.json({
      tokens: results,
      count: limitedTokenList.length,
      last_updated: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error fetching market sentiment:", error);
    return res.status(500).json({ 
      error: "Error fetching market sentiment", 
      message: error.message 
    });
  }
}