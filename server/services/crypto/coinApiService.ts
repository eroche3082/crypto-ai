import fetch from 'node-fetch';

// Cache TTL in milliseconds
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes for CoinAPI data (more conservative due to stricter rate limits)

// Cache structure
interface CacheItem<T> {
  data: T;
  timestamp: number;
  source: 'api' | 'cache' | 'fallback';
}

// In-memory cache stores
const assetsCache: Record<string, CacheItem<any[]>> = {};
const assetHistoryCache: Record<string, CacheItem<any>> = {};
const exchangeRatesCache: Record<string, CacheItem<any>> = {};

/**
 * CoinAPI Service - Alternative to CoinGecko
 * Used as a fallback when CoinGecko rate limits are hit
 */
export class CoinApiService {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    // Use the environment variable if available, otherwise use the provided key
    this.apiKey = process.env.COINAPI_KEY || '3ce51981-a99b-4daa-b4f9-bfdd5c0e297f';
    this.baseUrl = 'https://rest.coinapi.io/v1';
    
    console.log('CoinAPI service initialized with API key');
  }
  
  /**
   * Get list of all assets
   */
  async getAllAssets(): Promise<{
    data: any[];
    source: 'api' | 'cache' | 'fallback';
  }> {
    const now = Date.now();
    const cacheKey = 'all-assets';
    
    // Check cache first
    if (assetsCache[cacheKey] && (now - assetsCache[cacheKey].timestamp < CACHE_TTL)) {
      console.log(`Using cached CoinAPI assets data from ${Math.round((now - assetsCache[cacheKey].timestamp) / 1000)}s ago`);
      return {
        data: assetsCache[cacheKey].data,
        source: 'cache'
      };
    }
    
    const url = `${this.baseUrl}/assets`;
    
    try {
      console.log('Fetching all assets from CoinAPI');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-CoinAPI-Key': this.apiKey,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`CoinAPI assets error: ${response.status} ${response.statusText} - ${errorText}`);
        
        // If we have stale cache, use it rather than failing
        if (assetsCache[cacheKey]) {
          console.log(`Returning stale CoinAPI assets cache from ${Math.round((now - assetsCache[cacheKey].timestamp) / 1000)}s ago`);
          return {
            data: assetsCache[cacheKey].data,
            source: 'fallback'
          };
        }
        
        throw new Error(`CoinAPI request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Filter to only get cryptocurrency assets (not forex, stocks, etc)
      const cryptoAssets = data.filter(asset => asset.type_is_crypto === 1);
      
      // Update cache
      assetsCache[cacheKey] = {
        data: cryptoAssets,
        timestamp: now,
        source: 'api'
      };
      
      return {
        data: cryptoAssets,
        source: 'api'
      };
    } catch (error) {
      console.error('Error fetching assets from CoinAPI:', error);
      
      // Return stale cache if available
      if (assetsCache[cacheKey]) {
        console.log(`Returning stale CoinAPI assets cache due to error`);
        return {
          data: assetsCache[cacheKey].data,
          source: 'fallback'
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Convert CoinAPI data to CoinGecko format for compatibility
   */
  async getMarketsCompatible(params: Record<string, any> = {}): Promise<{
    data: any[];
    source: 'api' | 'cache' | 'fallback';
  }> {
    try {
      // Get base assets data
      const { data: assets, source } = await this.getAllAssets();
      
      // Get exchange rates for USD conversion
      const { data: exchangeRates, source: ratesSource } = await this.getExchangeRates();
      
      // Filter to top assets by market cap
      let topAssets = assets
        .filter(asset => 
          asset.price_usd && 
          asset.volume_1day_usd && 
          asset.type_is_crypto === 1 && 
          asset.volume_1day_usd > 10000 // Filter out very low volume assets
        )
        .sort((a, b) => {
          const marketCapA = (a.volume_1day_usd || 0) * (a.price_usd || 0);
          const marketCapB = (b.volume_1day_usd || 0) * (b.price_usd || 0);
          return marketCapB - marketCapA;
        });
      
      // Apply pagination
      const perPage = params.per_page ? parseInt(params.per_page.toString(), 10) : 20;
      const page = params.page ? parseInt(params.page.toString(), 10) : 1;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      
      topAssets = topAssets.slice(start, end);
      
      // Transform to CoinGecko format for compatibility
      const formattedAssets = topAssets.map((asset, index) => {
        return {
          id: asset.asset_id.toLowerCase(),
          symbol: asset.asset_id.toLowerCase(),
          name: asset.name,
          current_price: asset.price_usd,
          market_cap: (asset.volume_1day_usd || 0) * (asset.price_usd || 0),
          market_cap_rank: index + 1 + start,
          total_volume: asset.volume_1day_usd,
          price_change_24h: 0, // CoinAPI doesn't provide this directly
          price_change_percentage_24h: 0, // CoinAPI doesn't provide this directly
          circulating_supply: asset.volume_1day_usd / (asset.price_usd || 1), // Estimate
          total_supply: null,
          max_supply: null,
          last_updated: new Date().toISOString()
        };
      });
      
      return {
        data: formattedAssets,
        source: source === 'api' && ratesSource === 'api' ? 'api' : 'fallback'
      };
    } catch (error) {
      console.error('Error converting CoinAPI data to CoinGecko format:', error);
      throw error;
    }
  }
  
  /**
   * Get exchange rates for conversion
   */
  async getExchangeRates(): Promise<{
    data: any;
    source: 'api' | 'cache' | 'fallback';
  }> {
    const now = Date.now();
    const cacheKey = 'exchange-rates';
    
    // Check cache first
    if (exchangeRatesCache[cacheKey] && (now - exchangeRatesCache[cacheKey].timestamp < CACHE_TTL)) {
      console.log(`Using cached CoinAPI exchange rates from ${Math.round((now - exchangeRatesCache[cacheKey].timestamp) / 1000)}s ago`);
      return {
        data: exchangeRatesCache[cacheKey].data,
        source: 'cache'
      };
    }
    
    const url = `${this.baseUrl}/exchangerate/USD`;
    
    try {
      console.log('Fetching exchange rates from CoinAPI');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-CoinAPI-Key': this.apiKey,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`CoinAPI exchange rates error: ${response.status} ${response.statusText} - ${errorText}`);
        
        // If we have stale cache, use it rather than failing
        if (exchangeRatesCache[cacheKey]) {
          console.log(`Returning stale CoinAPI exchange rates cache from ${Math.round((now - exchangeRatesCache[cacheKey].timestamp) / 1000)}s ago`);
          return {
            data: exchangeRatesCache[cacheKey].data,
            source: 'fallback'
          };
        }
        
        throw new Error(`CoinAPI exchange rates request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update cache
      exchangeRatesCache[cacheKey] = {
        data: data,
        timestamp: now,
        source: 'api'
      };
      
      return {
        data: data,
        source: 'api'
      };
    } catch (error) {
      console.error('Error fetching exchange rates from CoinAPI:', error);
      
      // Return stale cache if available
      if (exchangeRatesCache[cacheKey]) {
        console.log(`Returning stale CoinAPI exchange rates cache due to error`);
        return {
          data: exchangeRatesCache[cacheKey].data,
          source: 'fallback'
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Get historical data for a specific asset
   */
  async getAssetHistory(assetId: string, period: string = '1DAY', limit: number = 7): Promise<{
    data: any;
    source: 'api' | 'cache' | 'fallback';
  }> {
    const now = Date.now();
    const cacheKey = `${assetId}-${period}-${limit}`;
    
    // Check cache first
    if (assetHistoryCache[cacheKey] && (now - assetHistoryCache[cacheKey].timestamp < CACHE_TTL)) {
      console.log(`Using cached CoinAPI asset history for ${assetId} from ${Math.round((now - assetHistoryCache[cacheKey].timestamp) / 1000)}s ago`);
      return {
        data: assetHistoryCache[cacheKey].data,
        source: 'cache'
      };
    }
    
    // Map from common period strings to CoinAPI time periods
    const periodMap: Record<string, string> = {
      '1h': '1HRS',
      '1d': '1DAY',
      '7d': '7DAY',
      '30d': '30DAY'
    };
    
    const apiPeriod = periodMap[period.toLowerCase()] || period;
    const url = `${this.baseUrl}/ohlcv/${assetId}/USD/latest?period_id=${apiPeriod}&limit=${limit}`;
    
    try {
      console.log(`Fetching ${assetId} history from CoinAPI for period ${apiPeriod}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-CoinAPI-Key': this.apiKey,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`CoinAPI asset history error: ${response.status} ${response.statusText} - ${errorText}`);
        
        // If we have stale cache, use it rather than failing
        if (assetHistoryCache[cacheKey]) {
          console.log(`Returning stale CoinAPI asset history cache for ${assetId} from ${Math.round((now - assetHistoryCache[cacheKey].timestamp) / 1000)}s ago`);
          return {
            data: assetHistoryCache[cacheKey].data,
            source: 'fallback'
          };
        }
        
        throw new Error(`CoinAPI asset history request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update cache
      assetHistoryCache[cacheKey] = {
        data: data,
        timestamp: now,
        source: 'api'
      };
      
      return {
        data: data,
        source: 'api'
      };
    } catch (error) {
      console.error(`Error fetching ${assetId} history from CoinAPI:`, error);
      
      // Return stale cache if available
      if (assetHistoryCache[cacheKey]) {
        console.log(`Returning stale CoinAPI asset history cache for ${assetId} due to error`);
        return {
          data: assetHistoryCache[cacheKey].data,
          source: 'fallback'
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Function to manually invalidate a specific cache entry
   */
  invalidateCache(type: 'assets' | 'history' | 'exchange-rates', key?: string) {
    if (type === 'assets') {
      if (key) {
        delete assetsCache[key];
        console.log(`Invalidated assets cache for key: ${key}`);
      } else {
        // Clear all assets cache
        for (const cacheKey of Object.keys(assetsCache)) {
          delete assetsCache[cacheKey];
        }
        console.log("Invalidated all assets cache");
      }
    } else if (type === 'history') {
      if (key) {
        // Find and delete matching history cache entries
        for (const cacheKey of Object.keys(assetHistoryCache)) {
          if (cacheKey.startsWith(`${key}-`)) {
            delete assetHistoryCache[cacheKey];
          }
        }
        console.log(`Invalidated history cache for: ${key}`);
      } else {
        // Clear all history cache
        for (const cacheKey of Object.keys(assetHistoryCache)) {
          delete assetHistoryCache[cacheKey];
        }
        console.log("Invalidated all asset history cache");
      }
    } else if (type === 'exchange-rates') {
      delete exchangeRatesCache['exchange-rates'];
      console.log("Invalidated exchange rates cache");
    }
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      assetsCache: {
        entries: Object.keys(assetsCache).length,
        size: Object.keys(assetsCache).reduce((size, key) => {
          return size + JSON.stringify(assetsCache[key]).length;
        }, 0),
        keys: Object.keys(assetsCache)
      },
      assetHistoryCache: {
        entries: Object.keys(assetHistoryCache).length,
        size: Object.keys(assetHistoryCache).reduce((size, key) => {
          return size + JSON.stringify(assetHistoryCache[key]).length;
        }, 0),
        keys: Object.keys(assetHistoryCache)
      },
      exchangeRatesCache: {
        entries: Object.keys(exchangeRatesCache).length,
        size: Object.keys(exchangeRatesCache).reduce((size, key) => {
          return size + JSON.stringify(exchangeRatesCache[key]).length;
        }, 0),
        keys: Object.keys(exchangeRatesCache)
      }
    };
  }
}

// Create a singleton instance
export const coinApiService = new CoinApiService();