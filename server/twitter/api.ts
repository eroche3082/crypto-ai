import { Request, Response } from 'express';
import axios from 'axios';

// RapidAPI Twitter endpoints
const TWITTER_AIO_API_URL = 'https://twitter-aio.p.rapidapi.com';
const TWITTER_V2_API_URL = 'https://twitter135.p.rapidapi.com/v2';

// RapidAPI key from environment variable
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '766287856cmsh45f7f21cf7e35e6p147c48jsne63517542aa0';

/**
 * Get user tweets by username
 */
export async function getUserTweets(req: Request, res: Response) {
  try {
    const { username, count = 10 } = req.params;
    
    if (!username) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Username is required' 
      });
    }

    try {
      // Call Twitter API to get tweets
      const response = await axios.get(
        `${TWITTER_AIO_API_URL}/user/-1/tweets`,
        {
          params: {
            username,
            count
          },
          headers: {
            'x-rapidapi-host': 'twitter-aio.p.rapidapi.com',
            'x-rapidapi-key': RAPIDAPI_KEY
          }
        }
      );

      return res.status(200).json({
        status: 'success',
        data: response.data
      });
    } catch (apiError) {
      console.error('Twitter API error:', apiError);
      
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch tweets',
        error: apiError.message
      });
    }
  } catch (error) {
    console.error('Tweet fetching error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process tweets request',
      error: error.message
    });
  }
}

/**
 * Get Twitter timeline by topic or list ID
 */
export async function getTopicTimeline(req: Request, res: Response) {
  try {
    const { listId, count = 20 } = req.params;
    
    if (!listId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'List ID is required' 
      });
    }

    try {
      // Call Twitter API to get timeline
      const response = await axios.get(
        `${TWITTER_V2_API_URL}/ListTimeline/`,
        {
          params: {
            list_id: listId,
            count
          },
          headers: {
            'x-rapidapi-host': 'twitter135.p.rapidapi.com',
            'x-rapidapi-key': RAPIDAPI_KEY
          }
        }
      );

      return res.status(200).json({
        status: 'success',
        data: response.data
      });
    } catch (apiError) {
      console.error('Twitter API error:', apiError);
      
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch timeline',
        error: apiError.message
      });
    }
  } catch (error) {
    console.error('Timeline fetching error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process timeline request',
      error: error.message
    });
  }
}

/**
 * Search tweets by cryptocurrency ticker or keyword
 */
export async function searchTweets(req: Request, res: Response) {
  try {
    const { query, count = 20 } = req.params;
    
    if (!query) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Search query is required' 
      });
    }

    try {
      // Call Twitter API to search tweets
      // Updated to use a valid endpoint from the Twitter AIO collection
      const response = await axios.get(
        `${TWITTER_AIO_API_URL}/search/home`,
        {
          params: {
            q: query,
            count: count,
            result_type: 'recent'
          },
          headers: {
            'x-rapidapi-host': 'twitter-aio.p.rapidapi.com',
            'x-rapidapi-key': RAPIDAPI_KEY
          }
        }
      );

      return res.status(200).json({
        status: 'success',
        data: response.data
      });
    } catch (apiError) {
      console.error('Twitter API error:', apiError);
      
      return res.status(500).json({
        status: 'error',
        message: 'Failed to search tweets',
        error: apiError.message
      });
    }
  } catch (error) {
    console.error('Tweet search error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process tweet search request',
      error: error.message
    });
  }
}

/**
 * Get trending topics related to cryptocurrency
 */
export async function getTrendingTopics(req: Request, res: Response) {
  try {
    const { woeid = 1 } = req.params; // Default to worldwide trends
    
    try {
      // Call Twitter API to get trending topics
      const response = await axios.get(
        'https://twitter-api45.p.rapidapi.com/trends.php',
        {
          params: {
            woeid
          },
          headers: {
            'x-rapidapi-host': 'twitter-api45.p.rapidapi.com',
            'x-rapidapi-key': RAPIDAPI_KEY
          }
        }
      );

      // Filter trends to only include crypto-related topics
      const cryptoKeywords = ['crypto', 'bitcoin', 'btc', 'eth', 'ethereum', 'blockchain', 'defi', 'nft', 'altcoin', 'token'];
      
      const allTrends = response.data?.trends || [];
      const cryptoTrends = allTrends.filter(trend => {
        const name = trend.name.toLowerCase();
        return cryptoKeywords.some(keyword => name.includes(keyword));
      });
      
      // If no crypto trends found, return all trends
      const trendsToReturn = cryptoTrends.length > 0 ? cryptoTrends : allTrends;

      return res.status(200).json({
        status: 'success',
        data: {
          trends: trendsToReturn,
          as_of: response.data?.as_of || new Date().toISOString(),
          location: response.data?.locations?.[0] || { name: 'Worldwide' }
        }
      });
    } catch (apiError) {
      console.error('Twitter API error:', apiError);
      
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch trending topics',
        error: apiError.message
      });
    }
  } catch (error) {
    console.error('Trending topics error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process trending topics request',
      error: error.message
    });
  }
}

/**
 * Get user profile information
 */
export async function getUserProfile(req: Request, res: Response) {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Username is required' 
      });
    }

    try {
      // Call Twitter API to get user profile
      const response = await axios.get(
        'https://twitter-api45.p.rapidapi.com/screenname.php',
        {
          params: {
            screenname: username
          },
          headers: {
            'x-rapidapi-host': 'twitter-api45.p.rapidapi.com',
            'x-rapidapi-key': RAPIDAPI_KEY
          }
        }
      );

      return res.status(200).json({
        status: 'success',
        data: response.data
      });
    } catch (apiError) {
      console.error('Twitter API error:', apiError);
      
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user profile',
        error: apiError.message
      });
    }
  } catch (error) {
    console.error('User profile error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process user profile request',
      error: error.message
    });
  }
}

/**
 * Analyze sentiment of tweets about a specific crypto
 */
export async function analyzeCryptoSentiment(req: Request, res: Response) {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Crypto symbol is required' 
      });
    }

    try {
      // First, get tweets about this cryptocurrency using a valid endpoint
      const searchResponse = await axios.get(
        `${TWITTER_AIO_API_URL}/search/home`,
        {
          params: {
            q: `#${symbol.toLowerCase()} OR ${symbol.toUpperCase()} crypto`,
            count: 100,
            result_type: 'recent'
          },
          headers: {
            'x-rapidapi-host': 'twitter-aio.p.rapidapi.com',
            'x-rapidapi-key': RAPIDAPI_KEY
          }
        }
      );

      // Extraer tweets de la respuesta (ajustado para el formato de respuesta de Twitter AIO)
      const tweets = searchResponse.data?.statuses || [];
      
      if (tweets.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            sentiment: 'neutral',
            confidence: 0.5,
            tweetCount: 0,
            positive: 0,
            negative: 0,
            neutral: 0
          }
        });
      }
      
      // Simple sentiment analysis based on keywords
      // In a real application, you'd want to use a more sophisticated sentiment analysis service
      const positiveKeywords = ['bullish', 'moon', 'pump', 'gain', 'profit', 'buy', 'up', 'rising', 'higher', 'soar', 'growth'];
      const negativeKeywords = ['bearish', 'dump', 'crash', 'lose', 'loss', 'sell', 'down', 'falling', 'lower', 'plummet', 'drop'];
      
      let positiveCount = 0;
      let negativeCount = 0;
      let neutralCount = 0;
      
      tweets.forEach(tweet => {
        const text = tweet.text.toLowerCase();
        
        const positiveMatches = positiveKeywords.filter(word => text.includes(word)).length;
        const negativeMatches = negativeKeywords.filter(word => text.includes(word)).length;
        
        if (positiveMatches > negativeMatches) {
          positiveCount++;
        } else if (negativeMatches > positiveMatches) {
          negativeCount++;
        } else {
          neutralCount++;
        }
      });
      
      const totalTweets = positiveCount + negativeCount + neutralCount;
      const sentimentScore = (positiveCount - negativeCount) / totalTweets;
      
      let sentiment = 'neutral';
      if (sentimentScore > 0.1) sentiment = 'positive';
      if (sentimentScore < -0.1) sentiment = 'negative';
      
      const confidence = Math.min(1, Math.abs(sentimentScore) * 2);

      return res.status(200).json({
        status: 'success',
        data: {
          sentiment,
          confidence,
          tweetCount: totalTweets,
          positive: positiveCount,
          negative: negativeCount,
          neutral: neutralCount
        }
      });
    } catch (apiError) {
      console.error('Twitter API error:', apiError);
      
      return res.status(500).json({
        status: 'error',
        message: 'Failed to analyze sentiment',
        error: apiError.message
      });
    }
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process sentiment analysis request',
      error: error.message
    });
  }
}