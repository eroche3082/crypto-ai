import { Request, Response } from 'express';
import fetch from 'node-fetch';

// API base URL
const COINMARKETCAL_API_BASE = 'https://developers.coinmarketcal.com/v1';

// Cache to store recent responses
const apiCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache TTL

/**
 * Get upcoming cryptocurrency events
 */
export async function getUpcomingEvents(req: Request, res: Response) {
  try {
    const { 
      page = 1, 
      max = 10, 
      dateRangeStart = '', 
      dateRangeEnd = '',
      coins = '' 
    } = req.query;
    
    const apiKey = process.env.COINMARKETCAL_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing CoinMarketCal API key',
        message: 'Please set the COINMARKETCAL_API_KEY environment variable'
      });
    }
    
    // Create cache key based on parameters
    const cacheKey = `events-${page}-${max}-${dateRangeStart}-${dateRangeEnd}-${coins}`;
    
    // Check cache first
    const now = Date.now();
    if (apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        ...apiCache[cacheKey].data,
        source: 'cache'
      });
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('page', page as string);
    queryParams.append('max', max as string);
    
    if (dateRangeStart) {
      queryParams.append('dateRangeStart', dateRangeStart as string);
    }
    
    if (dateRangeEnd) {
      queryParams.append('dateRangeEnd', dateRangeEnd as string);
    }
    
    if (coins) {
      queryParams.append('coins', coins as string);
    }
    
    // Make request to CoinMarketCal API
    const response = await fetch(
      `${COINMARKETCAL_API_BASE}/events?${queryParams.toString()}`,
      {
        headers: {
          'x-api-key': apiKey,
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format the events
    const formattedEvents = {
      totalCount: data.totalCount || 0,
      page: data.page || 1,
      maxEventsPerPage: data.maxEventsPerPage || 10,
      events: data.body?.map((event: any) => ({
        id: event.id,
        title: event.title,
        categories: event.categories.map((cat: any) => cat.name),
        description: event.description,
        dateStart: event.dateStart,
        dateEnd: event.dateEnd || event.dateStart,
        createdAt: event.createdAt,
        coins: event.coins?.map((coin: any) => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          slug: coin.slug
        })) || [],
        source: event.source,
        isHot: event.isHot,
        votesCount: event.votesCount,
        positiveVotesCount: event.positiveVotesCount,
        percentage: event.percentage,
        eventImageUrl: event.eventImageUrl
      })) || []
    };
    
    // Update cache
    apiCache[cacheKey] = {
      data: formattedEvents,
      timestamp: now
    };
    
    res.json({
      ...formattedEvents,
      source: 'api'
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    
    // Provide informative error for API key issues
    if (error.message?.includes('401')) {
      return res.status(401).json({
        error: 'Invalid CoinMarketCal API key',
        message: 'Please check your API key and make sure it is valid'
      });
    }
    
    res.status(500).json({
      error: 'Error fetching upcoming events',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get available categories for filtering events
 */
export async function getEventCategories(req: Request, res: Response) {
  try {
    const apiKey = process.env.COINMARKETCAL_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing CoinMarketCal API key',
        message: 'Please set the COINMARKETCAL_API_KEY environment variable'
      });
    }
    
    // Check cache first
    const cacheKey = 'event-categories';
    const now = Date.now();
    if (apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        ...apiCache[cacheKey].data,
        source: 'cache'
      });
    }
    
    // Make request to CoinMarketCal API
    const response = await fetch(
      `${COINMARKETCAL_API_BASE}/categories`,
      {
        headers: {
          'x-api-key': apiKey,
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format the categories
    const formattedCategories = {
      categories: data.body?.map((category: any) => ({
        id: category.id,
        name: category.name
      })) || []
    };
    
    // Update cache
    apiCache[cacheKey] = {
      data: formattedCategories,
      timestamp: now
    };
    
    res.json({
      ...formattedCategories,
      source: 'api'
    });
  } catch (error) {
    console.error('Error fetching event categories:', error);
    res.status(500).json({
      error: 'Error fetching event categories',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Search for events by coin
 */
export async function searchEventsByCoin(req: Request, res: Response) {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({
        error: 'Missing coin symbol',
        message: 'Please provide a coin symbol to search events'
      });
    }
    
    // Calculate date range for upcoming events (next 60 days)
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 60);
    
    const dateRangeStart = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const dateRangeEnd = endDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Forward to the regular endpoint with specific parameters
    req.query = {
      ...req.query,
      coins: symbol,
      dateRangeStart: dateRangeStart,
      dateRangeEnd: dateRangeEnd,
      max: '15'
    };
    
    return await getUpcomingEvents(req, res);
  } catch (error) {
    console.error('Error searching events by coin:', error);
    res.status(500).json({
      error: 'Error searching events by coin',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}