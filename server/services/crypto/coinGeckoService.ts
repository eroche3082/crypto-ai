import fetch from 'node-fetch';

// Cache TTL in milliseconds
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for general data
const GLOBAL_CACHE_TTL = 15 * 60 * 1000; // 15 minutes for less volatile data
const DETAIL_CACHE_TTL = 2 * 60 * 1000; // 2 minutes for coin detail data

// Cache structure
interface CacheItem<T> {
  data: T;
  timestamp: number;
  source: 'api' | 'cache' | 'fallback';
}

// Function to create a cache key from parameters
function createCacheKey(base: string, params: Record<string, any>): string {
  return `${base}:${Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('&')}`;
}

// In-memory cache stores
const marketsCache: Record<string, CacheItem<any[]>> = {};
const coinDetailsCache: Record<string, CacheItem<any>> = {};
const globalDataCache: Record<string, CacheItem<any>> = {};

/**
 * CoinGecko API Service with caching and fallback support
 */
export class CoinGeckoService {
  private baseUrl: string;
  private headers: Record<string, string>;
  
  constructor() {
    this.baseUrl = "https://api.coingecko.com/api/v3";
    this.headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    
    // If we have a Pro API key, we would use it here
    const apiKey = process.env.VITE_COINGECKO_API_KEY;
    if (apiKey) {
      this.headers["x-cg-pro-api-key"] = apiKey;
      this.baseUrl = "https://pro-api.coingecko.com/api/v3";
      console.log("Using CoinGecko Pro API with key");
    } else {
      console.log("Using CoinGecko free API tier");
    }
  }
  
  /**
   * Get cryptocurrency markets data with caching
   */
  async getMarkets(params: Record<string, any> = {}): Promise<{
    data: any[];
    source: 'api' | 'cache' | 'fallback';
  }> {
    const now = Date.now();
    const cacheKey = createCacheKey('markets', params);
    
    // Check cache first
    if (marketsCache[cacheKey] && (now - marketsCache[cacheKey].timestamp < CACHE_TTL)) {
      console.log(`Using cached CoinGecko markets data from ${Math.round((now - marketsCache[cacheKey].timestamp) / 1000)}s ago`);
      return {
        data: marketsCache[cacheKey].data,
        source: marketsCache[cacheKey].source
      };
    }
    
    // Build URL with parameters
    const url = new URL(`${this.baseUrl}/coins/markets`);
    url.searchParams.append("vs_currency", params.vs_currency || "usd");
    
    if (params.order) url.searchParams.append("order", params.order);
    
    // CoinGecko free API limits this to 250 as maximum
    if (params.per_page) {
      const perPageValue = parseInt(params.per_page.toString(), 10);
      const finalPerPage = Math.min(perPageValue, 250).toString();
      url.searchParams.append("per_page", finalPerPage);
    } else {
      url.searchParams.append("per_page", "20");
    }
    
    if (params.page) url.searchParams.append("page", params.page.toString());
    if (params.sparkline) url.searchParams.append("sparkline", params.sparkline.toString());
    if (params.price_change_percentage) {
      url.searchParams.append("price_change_percentage", params.price_change_percentage.toString());
    }
    
    try {
      // Implement retry logic
      const maxRetries = 3;
      let retries = 0;
      let success = false;
      let data;
      
      while (retries < maxRetries && !success) {
        try {
          console.log(`CoinGecko API attempt ${retries + 1}/${maxRetries}: ${url.toString()}`);
          
          // Make the request to CoinGecko
          const response = await fetch(url.toString(), { 
            headers: this.headers,
            method: 'GET',
          });
          
          // Handle rate limits and errors
          if (response.status === 429) {
            // Rate limit hit, wait before retrying
            const retryAfter = response.headers.get('retry-after') || '30';
            const waitTime = Math.min(parseInt(retryAfter, 10) * 1000, 60000); // Max 60s wait
            console.log(`CoinGecko API rate limit hit. Waiting ${waitTime}ms before retry.`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retries++;
            continue;
          } else if (!response.ok) {
            if (retries < maxRetries - 1) {
              console.log(`CoinGecko API error: ${response.status} ${response.statusText}. Retrying...`);
              retries++;
              // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
              continue;
            } else {
              console.log(`CoinGecko API error: ${response.status} ${response.statusText}. Using fallback or cached data.`);
              // Return most recent cache if available, even if expired
              if (marketsCache[cacheKey]) {
                console.log(`Returning stale cache from ${Math.round((now - marketsCache[cacheKey].timestamp) / 1000)}s ago`);
                return {
                  data: marketsCache[cacheKey].data,
                  source: 'fallback'
                };
              }
              
              // No cache, use generated fallback data
              const fallbackData = this.generateFallbackMarketData();
              // Store fallback in cache but mark as fallback
              marketsCache[cacheKey] = {
                data: fallbackData,
                timestamp: now,
                source: 'fallback'
              };
              return {
                data: fallbackData,
                source: 'fallback'
              };
            }
          }
          
          // Success - parse response
          data = await response.json();
          success = true;
          
        } catch (error) {
          if (retries < maxRetries - 1) {
            console.log(`CoinGecko API fetch error: ${error}. Retrying...`);
            retries++;
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
          } else {
            console.log(`CoinGecko API fetch error after ${maxRetries} attempts: ${error}. Using fallback or cached data.`);
            // Return most recent cache if available, even if expired
            if (marketsCache[cacheKey]) {
              console.log(`Returning stale cache from ${Math.round((now - marketsCache[cacheKey].timestamp) / 1000)}s ago`);
              return {
                data: marketsCache[cacheKey].data,
                source: 'fallback'
              };
            }
            
            // No cache, use generated fallback data
            const fallbackData = this.generateFallbackMarketData();
            // Store fallback in cache but mark as fallback
            marketsCache[cacheKey] = {
              data: fallbackData,
              timestamp: now,
              source: 'fallback'
            };
            return {
              data: fallbackData,
              source: 'fallback'
            };
          }
        }
      }
      
      if (success && data) {
        console.log(`CoinGecko API request successful. Updating cache with ${data.length} coins.`);
        // Update cache
        marketsCache[cacheKey] = {
          data,
          timestamp: now,
          source: 'api'
        };
        return {
          data,
          source: 'api'
        };
      } else {
        // This should rarely happen but just in case
        console.log("CoinGecko API request failed for unknown reason. Using fallback data.");
        const fallbackData = this.generateFallbackMarketData();
        return {
          data: fallbackData,
          source: 'fallback'
        };
      }
    } catch (error) {
      console.error("Unexpected error in CoinGecko markets request:", error);
      throw new Error(`Failed to fetch cryptocurrency markets: ${(error as Error).message}`);
    }
  }
  
  /**
   * Get individual coin data with caching
   */
  async getCoinDetails(id: string, params: Record<string, any> = {}): Promise<{
    data: any;
    source: 'api' | 'cache' | 'fallback';
  }> {
    const now = Date.now();
    const cacheKey = `${id}:${createCacheKey('coin', params)}`;
    
    // Check cache first
    if (coinDetailsCache[cacheKey] && (now - coinDetailsCache[cacheKey].timestamp < DETAIL_CACHE_TTL)) {
      console.log(`Using cached CoinGecko details for ${id} from ${Math.round((now - coinDetailsCache[cacheKey].timestamp) / 1000)}s ago`);
      return {
        data: coinDetailsCache[cacheKey].data,
        source: coinDetailsCache[cacheKey].source
      };
    }
    
    // Build URL with parameters
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    }
    
    const url = `${this.baseUrl}/coins/${id}?${queryParams.toString()}`;
    
    try {
      // Implement retry logic for individual coin data
      const maxRetries = 3;
      let retries = 0;
      let success = false;
      let data;
      
      while (retries < maxRetries && !success) {
        try {
          console.log(`CoinGecko coin detail API attempt ${retries + 1}/${maxRetries} for ${id}`);
          
          // Make the request to CoinGecko
          const response = await fetch(url, { 
            headers: this.headers,
            method: 'GET',
          });
          
          // Handle rate limits and errors
          if (response.status === 429) {
            // Rate limit hit, wait before retrying
            const retryAfter = response.headers.get('retry-after') || '30';
            const waitTime = Math.min(parseInt(retryAfter, 10) * 1000, 60000); // Max 60s wait
            console.log(`CoinGecko API rate limit hit. Waiting ${waitTime}ms before retry.`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retries++;
            continue;
          } else if (!response.ok) {
            if (retries < maxRetries - 1) {
              console.log(`CoinGecko API error: ${response.status} ${response.statusText}. Retrying...`);
              retries++;
              // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
              continue;
            } else {
              console.log(`CoinGecko API error: ${response.status} ${response.statusText}. Using fallback or cached data.`);
              // Return most recent cache if available, even if expired
              if (coinDetailsCache[cacheKey]) {
                console.log(`Returning stale cache from ${Math.round((now - coinDetailsCache[cacheKey].timestamp) / 1000)}s ago`);
                return {
                  data: coinDetailsCache[cacheKey].data,
                  source: 'fallback'
                };
              }
              
              // No cache, use generated fallback data for the specific coin
              const fallbackData = this.generateFallbackCoinDetails(id);
              // Store fallback in cache but mark as fallback
              coinDetailsCache[cacheKey] = {
                data: fallbackData,
                timestamp: now,
                source: 'fallback'
              };
              return {
                data: fallbackData,
                source: 'fallback'
              };
            }
          }
          
          // Success - parse response
          data = await response.json();
          success = true;
          
        } catch (error) {
          if (retries < maxRetries - 1) {
            console.log(`CoinGecko API fetch error: ${error}. Retrying...`);
            retries++;
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
          } else {
            console.log(`CoinGecko API fetch error after ${maxRetries} attempts: ${error}. Using fallback or cached data.`);
            // Return most recent cache if available, even if expired
            if (coinDetailsCache[cacheKey]) {
              console.log(`Returning stale cache from ${Math.round((now - coinDetailsCache[cacheKey].timestamp) / 1000)}s ago`);
              return {
                data: coinDetailsCache[cacheKey].data,
                source: 'fallback'
              };
            }
            
            // No cache, use generated fallback data
            const fallbackData = this.generateFallbackCoinDetails(id);
            // Store fallback in cache but mark as fallback
            coinDetailsCache[cacheKey] = {
              data: fallbackData,
              timestamp: now,
              source: 'fallback'
            };
            return {
              data: fallbackData,
              source: 'fallback'
            };
          }
        }
      }
      
      if (success && data) {
        console.log(`CoinGecko API coin details request successful for ${id}. Updating cache.`);
        // Update cache
        coinDetailsCache[cacheKey] = {
          data,
          timestamp: now,
          source: 'api'
        };
        return {
          data,
          source: 'api'
        };
      } else {
        // This should rarely happen but just in case
        console.log(`CoinGecko API request failed for ${id} for unknown reason. Using fallback data.`);
        const fallbackData = this.generateFallbackCoinDetails(id);
        return {
          data: fallbackData,
          source: 'fallback'
        };
      }
    } catch (error) {
      console.error(`Unexpected error in CoinGecko coin details request for ${id}:`, error);
      throw new Error(`Failed to fetch coin details: ${(error as Error).message}`);
    }
  }
  
  /**
   * Get global cryptocurrency data with caching
   */
  async getGlobalData(): Promise<{
    data: any;
    source: 'api' | 'cache' | 'fallback';
  }> {
    const now = Date.now();
    const cacheKey = 'global';
    
    // Check cache first for global data (can be cached longer)
    if (globalDataCache[cacheKey] && (now - globalDataCache[cacheKey].timestamp < GLOBAL_CACHE_TTL)) {
      console.log(`Using cached CoinGecko global data from ${Math.round((now - globalDataCache[cacheKey].timestamp) / 1000)}s ago`);
      return {
        data: globalDataCache[cacheKey].data,
        source: globalDataCache[cacheKey].source
      };
    }
    
    const url = `${this.baseUrl}/global`;
    
    try {
      // Implement retry logic
      const maxRetries = 3;
      let retries = 0;
      let success = false;
      let data;
      
      while (retries < maxRetries && !success) {
        try {
          console.log(`CoinGecko global API attempt ${retries + 1}/${maxRetries}`);
          
          // Make the request to CoinGecko
          const response = await fetch(url, { 
            headers: this.headers,
            method: 'GET',
          });
          
          // Handle rate limits and errors
          if (response.status === 429) {
            // Rate limit hit, wait before retrying
            const retryAfter = response.headers.get('retry-after') || '30';
            const waitTime = Math.min(parseInt(retryAfter, 10) * 1000, 60000); // Max 60s wait
            console.log(`CoinGecko API rate limit hit. Waiting ${waitTime}ms before retry.`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retries++;
            continue;
          } else if (!response.ok) {
            if (retries < maxRetries - 1) {
              console.log(`CoinGecko API error: ${response.status} ${response.statusText}. Retrying...`);
              retries++;
              // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
              continue;
            } else {
              console.log(`CoinGecko API error: ${response.status} ${response.statusText}. Using fallback or cached data.`);
              // Return most recent cache if available, even if expired
              if (globalDataCache[cacheKey]) {
                console.log(`Returning stale global cache from ${Math.round((now - globalDataCache[cacheKey].timestamp) / 1000)}s ago`);
                return {
                  data: globalDataCache[cacheKey].data,
                  source: 'fallback'
                };
              }
              
              // No cache, use generated fallback data
              const fallbackData = this.generateFallbackGlobalData();
              // Store fallback in cache but mark as fallback
              globalDataCache[cacheKey] = {
                data: fallbackData,
                timestamp: now,
                source: 'fallback'
              };
              return {
                data: fallbackData,
                source: 'fallback'
              };
            }
          }
          
          // Success - parse response
          data = await response.json();
          success = true;
          
        } catch (error) {
          if (retries < maxRetries - 1) {
            console.log(`CoinGecko API fetch error: ${error}. Retrying...`);
            retries++;
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
          } else {
            console.log(`CoinGecko API fetch error after ${maxRetries} attempts: ${error}. Using fallback or cached data.`);
            // Return most recent cache if available, even if expired
            if (globalDataCache[cacheKey]) {
              console.log(`Returning stale global cache from ${Math.round((now - globalDataCache[cacheKey].timestamp) / 1000)}s ago`);
              return {
                data: globalDataCache[cacheKey].data,
                source: 'fallback'
              };
            }
            
            // No cache, use generated fallback data
            const fallbackData = this.generateFallbackGlobalData();
            // Store fallback in cache but mark as fallback
            globalDataCache[cacheKey] = {
              data: fallbackData,
              timestamp: now,
              source: 'fallback'
            };
            return {
              data: fallbackData,
              source: 'fallback'
            };
          }
        }
      }
      
      if (success && data) {
        console.log(`CoinGecko API global data request successful. Updating cache.`);
        // Update cache
        globalDataCache[cacheKey] = {
          data,
          timestamp: now,
          source: 'api'
        };
        return {
          data,
          source: 'api'
        };
      } else {
        // This should rarely happen but just in case
        console.log("CoinGecko API global data request failed for unknown reason. Using fallback data.");
        const fallbackData = this.generateFallbackGlobalData();
        return {
          data: fallbackData,
          source: 'fallback'
        };
      }
    } catch (error) {
      console.error("Unexpected error in CoinGecko global data request:", error);
      throw new Error(`Failed to fetch global cryptocurrency data: ${(error as Error).message}`);
    }
  }
  
  /**
   * Generate some realistic but artificial data for sparkline graphs
   */
  private generateMockSparklineData(basePrice: number, days: number, volatility: number) {
    const prices = [];
    let currentPrice = basePrice;
    
    for (let i = 0; i < days * 24; i++) { // Hourly points
      // Random price movement with some trending
      const randomFactor = Math.random() * 2 - 1; // Between -1 and 1
      const percentageChange = randomFactor * volatility; 
      currentPrice = currentPrice * (1 + percentageChange);
      
      // Ensure price doesn't go negative
      if (currentPrice < 0) currentPrice = basePrice * 0.1;
      
      prices.push(currentPrice);
    }
    
    return prices;
  }
  
  /**
   * Generate fallback market data for top 5 cryptocurrencies
   */
  private generateFallbackMarketData() {
    return [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        current_price: 60234.21,
        market_cap: 1183383834660,
        market_cap_rank: 1,
        total_volume: 28584304842,
        high_24h: 61250.12,
        low_24h: 59123.45,
        price_change_24h: 1432.76,
        price_change_percentage_24h: 2.4,
        price_change_percentage_7d: 5.2,
        price_change_percentage_14d: -3.1,
        price_change_percentage_30d: 8.7,
        circulating_supply: 19460000,
        total_supply: 21000000,
        max_supply: 21000000,
        ath: 69000,
        ath_change_percentage: -12.7,
        ath_date: "2021-11-10T14:24:11.849Z",
        atl: 67.81,
        atl_change_percentage: 88743.68,
        atl_date: "2013-07-06T00:00:00.000Z",
        sparkline_in_7d: {
          price: this.generateMockSparklineData(60000, 7, 0.05)
        },
        last_updated: new Date().toISOString()
      },
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        current_price: 3112.45,
        market_cap: 374235489302,
        market_cap_rank: 2,
        total_volume: 14378954321,
        high_24h: 3200.87,
        low_24h: 3050.12,
        price_change_24h: 62.33,
        price_change_percentage_24h: 1.8,
        price_change_percentage_7d: 3.1,
        price_change_percentage_14d: -1.2,
        price_change_percentage_30d: 4.5,
        circulating_supply: 120250981,
        total_supply: 120250981,
        max_supply: null,
        ath: 4878.26,
        ath_change_percentage: -36.2,
        ath_date: "2021-11-10T14:24:19.604Z",
        atl: 0.432979,
        atl_change_percentage: 720372.48,
        atl_date: "2015-10-20T00:00:00.000Z",
        sparkline_in_7d: {
          price: this.generateMockSparklineData(3000, 7, 0.04)
        },
        last_updated: new Date().toISOString()
      },
      {
        id: "binancecoin",
        symbol: "bnb",
        name: "BNB",
        current_price: 566.78,
        market_cap: 87312456789,
        market_cap_rank: 3,
        total_volume: 1987654321,
        high_24h: 570.12,
        low_24h: 550.45,
        price_change_24h: 16.33,
        price_change_percentage_24h: 2.9,
        price_change_percentage_7d: 5.7,
        price_change_percentage_14d: 12.3,
        price_change_percentage_30d: 22.5,
        circulating_supply: 153856150,
        total_supply: 163276975,
        max_supply: 163276975,
        ath: 690.93,
        ath_change_percentage: -18.2,
        ath_date: "2021-05-10T07:30:42.848Z",
        atl: 0.03981,
        atl_change_percentage: 1421325.97,
        atl_date: "2017-10-19T00:00:00.000Z",
        sparkline_in_7d: {
          price: this.generateMockSparklineData(550, 7, 0.03)
        },
        last_updated: new Date().toISOString()
      },
      {
        id: "solana",
        symbol: "sol",
        name: "Solana",
        current_price: 124.57,
        market_cap: 53791234567,
        market_cap_rank: 4,
        total_volume: 1423456789,
        high_24h: 128.45,
        low_24h: 121.22,
        price_change_24h: 3.35,
        price_change_percentage_24h: 2.7,
        price_change_percentage_7d: 15.3,
        price_change_percentage_14d: 22.7,
        price_change_percentage_30d: -5.2,
        circulating_supply: 430973731,
        total_supply: 539201727,
        max_supply: null,
        ath: 259.96,
        ath_change_percentage: -52.3,
        ath_date: "2021-11-06T21:54:35.825Z",
        atl: 0.50028,
        atl_change_percentage: 24821.21,
        atl_date: "2020-05-11T19:35:23.449Z",
        sparkline_in_7d: {
          price: this.generateMockSparklineData(125, 7, 0.06)
        },
        last_updated: new Date().toISOString()
      },
      {
        id: "dogecoin",
        symbol: "doge",
        name: "Dogecoin",
        current_price: 0.14523,
        market_cap: 19435678901,
        market_cap_rank: 8,
        total_volume: 987654321,
        high_24h: 0.14898,
        low_24h: 0.14012,
        price_change_24h: 0.00511,
        price_change_percentage_24h: 3.6,
        price_change_percentage_7d: 6.8,
        price_change_percentage_14d: -2.4,
        price_change_percentage_30d: 12.9,
        circulating_supply: 133737237990,
        total_supply: 133737237990,
        max_supply: null,
        ath: 0.731578,
        ath_change_percentage: -80.23,
        ath_date: "2021-05-08T05:08:23.458Z",
        atl: 0.0000869,
        atl_change_percentage: 166788.44,
        atl_date: "2015-05-06T00:00:00.000Z",
        sparkline_in_7d: {
          price: this.generateMockSparklineData(0.14, 7, 0.08)
        },
        last_updated: new Date().toISOString()
      }
    ];
  }
  
  /**
   * Generate fallback coin details for a specific coin
   */
  private generateFallbackCoinDetails(id: string) {
    const defaultCoins: Record<string, any> = {
      bitcoin: {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        description: {
          en: "Bitcoin is the first successful internet money based on peer-to-peer technology; whereby no central bank or authority is involved in the transaction and production of the Bitcoin currency. It was created by an anonymous individual/group under the name, Satoshi Nakamoto. The source code is available publicly as an open source project, anybody can look at it and be part of the developmental process.\r\n\r\nBitcoin is changing the way we see money as we speak. The idea was to produce a means of exchange, independent of any central authority, that could be transferred electronically in a secure, verifiable and immutable way. It is a decentralized peer-to-peer internet currency making mobile payment easy, very low transaction fees, protects your identity, and it works anywhere all the time with no central authority and banks.\r\n\r\nBitcoin is designed to have only 21 million BTC ever created, thus making it a deflationary currency. Bitcoin uses the <a href=\"https://www.coingecko.com/en?hashing_algorithm=SHA-256\">SHA-256</a> hashing algorithm with an average transaction confirmation time of 10 minutes. Miners today are mining Bitcoin using ASIC chip dedicated to only mining Bitcoin, and the hash rate has shot up to peta hashes.\r\n\r\nBeing the first successful online cryptography currency, Bitcoin has inspired other alternative currencies such as <a href=\"https://www.coingecko.com/en/coins/litecoin\">Litecoin</a>, <a href=\"https://www.coingecko.com/en/coins/peercoin\">Peercoin</a>, <a href=\"https://www.coingecko.com/en/coins/primecoin\">Primecoin</a>, and so on.\r\n\r\nThe cryptocurrency then took off with the innovation of the turing-complete smart contract by <a href=\"https://www.coingecko.com/en/coins/ethereum\">Ethereum</a> which led to the development of other amazing projects such as <a href=\"https://www.coingecko.com/en/coins/eos\">EOS</a>, <a href=\"https://www.coingecko.com/en/coins/tron\">Tron</a>, and even crypto-collectibles such as <a href=\"https://www.coingecko.com/buzz/ethereum-still-king-dapps-cryptokitties-need-1-billion-on-eos\">CryptoKitties</a>."
        },
        image: {
          thumb: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png",
          small: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
          large: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
        },
        market_data: {
          current_price: {
            usd: 60234.21
          },
          market_cap: {
            usd: 1183383834660
          },
          total_volume: {
            usd: 28584304842
          },
          high_24h: {
            usd: 61250.12
          },
          low_24h: {
            usd: 59123.45
          },
          price_change_24h: 1432.76,
          price_change_percentage_24h: 2.4,
          price_change_percentage_7d: 5.2,
          price_change_percentage_14d: -3.1,
          price_change_percentage_30d: 8.7,
          circulating_supply: 19460000,
          total_supply: 21000000,
          max_supply: 21000000
        },
        last_updated: new Date().toISOString()
      },
      ethereum: {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        description: {
          en: "Ethereum is a smart contract platform that enables developers to build tokens and decentralized applications (dapps). ETH is the native currency for the Ethereum platform and also works as the transaction fees to miners on the Ethereum network.\r\n\r\nEthereum is the pioneer for blockchain based smart contracts. Smart contract is essentially a computer code that runs exactly as programmed without any possibility of downtime, censorship, fraud or third-party interference. It can facilitate the exchange of money, content, property, shares, or anything of value. When running on the blockchain a smart contract becomes like a self-operating computer program that automatically executes when specific conditions are met. Ethereum allows programmers to run complete programs (smart contracts) on its network.\r\n\r\nEthereum's vision is to create a 'World Computer' - a global network of computers that could run decentralized applications. Instead of a closed ecosystem, Ethereum is meant to be open to all, with people building applications that could interoperate with one another. Before the creation of Ethereum, blockchain applications were designed to do a very limited set of operations."
        },
        image: {
          thumb: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png",
          small: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
          large: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
        },
        market_data: {
          current_price: {
            usd: 3112.45
          },
          market_cap: {
            usd: 374235489302
          },
          total_volume: {
            usd: 14378954321
          },
          high_24h: {
            usd: 3200.87
          },
          low_24h: {
            usd: 3050.12
          },
          price_change_24h: 62.33,
          price_change_percentage_24h: 1.8,
          price_change_percentage_7d: 3.1,
          price_change_percentage_14d: -1.2,
          price_change_percentage_30d: 4.5,
          circulating_supply: 120250981,
          total_supply: 120250981,
          max_supply: null
        },
        last_updated: new Date().toISOString()
      }
    };
    
    // Return specific coin data if available, or a generic template
    if (defaultCoins[id]) {
      return defaultCoins[id];
    }
    
    // Generic template for other coins
    return {
      id: id,
      symbol: id.substring(0, 4),
      name: id.charAt(0).toUpperCase() + id.slice(1),
      description: {
        en: "Data temporarily unavailable due to API limitations. Please check again later."
      },
      image: {
        thumb: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png",
        small: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
        large: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
      },
      market_data: {
        current_price: {
          usd: 100.00
        },
        market_cap: {
          usd: 10000000000
        },
        total_volume: {
          usd: 500000000
        },
        high_24h: {
          usd: 105.00
        },
        low_24h: {
          usd: 95.00
        },
        price_change_24h: 5.00,
        price_change_percentage_24h: 5.0,
        price_change_percentage_7d: 10.0,
        price_change_percentage_14d: -2.0,
        price_change_percentage_30d: 15.0,
        circulating_supply: 100000000,
        total_supply: 100000000,
        max_supply: null
      },
      last_updated: new Date().toISOString()
    };
  }
  
  /**
   * Generate fallback global market data
   */
  private generateFallbackGlobalData() {
    return {
      data: {
        active_cryptocurrencies: 10673,
        upcoming_icos: 0,
        ongoing_icos: 49,
        ended_icos: 3376,
        markets: 877,
        total_market_cap: {
          usd: 2521958762967,
        },
        total_volume: {
          usd: 82147287408,
        },
        market_cap_percentage: {
          btc: 46.89,
          eth: 16.25,
          bnb: 3.62,
          sol: 3.14,
          xrp: 2.54,
        },
        market_cap_change_percentage_24h_usd: 3.21,
        updated_at: new Date().getTime()
      }
    };
  }
  
  /**
   * Function to manually invalidate a specific cache entry
   */
  invalidateCache(type: 'markets' | 'coin' | 'global', key?: string) {
    if (type === 'markets') {
      if (key) {
        delete marketsCache[key];
        console.log(`Invalidated markets cache for key: ${key}`);
      } else {
        // Clear all markets cache
        for (const cacheKey of Object.keys(marketsCache)) {
          delete marketsCache[cacheKey];
        }
        console.log("Invalidated all markets cache");
      }
    } else if (type === 'coin') {
      if (key) {
        // Find and delete matching coin cache entries
        for (const cacheKey of Object.keys(coinDetailsCache)) {
          if (cacheKey.startsWith(`${key}:`)) {
            delete coinDetailsCache[cacheKey];
          }
        }
        console.log(`Invalidated coin cache for: ${key}`);
      } else {
        // Clear all coin cache
        for (const cacheKey of Object.keys(coinDetailsCache)) {
          delete coinDetailsCache[cacheKey];
        }
        console.log("Invalidated all coin details cache");
      }
    } else if (type === 'global') {
      delete globalDataCache['global'];
      console.log("Invalidated global market data cache");
    }
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      marketsCache: {
        entries: Object.keys(marketsCache).length,
        size: Object.keys(marketsCache).reduce((size, key) => {
          return size + JSON.stringify(marketsCache[key]).length;
        }, 0),
        keys: Object.keys(marketsCache),
      },
      coinDetailsCache: {
        entries: Object.keys(coinDetailsCache).length,
        size: Object.keys(coinDetailsCache).reduce((size, key) => {
          return size + JSON.stringify(coinDetailsCache[key]).length;
        }, 0),
        keys: Object.keys(coinDetailsCache),
      },
      globalDataCache: {
        entries: Object.keys(globalDataCache).length,
        size: Object.keys(globalDataCache).reduce((size, key) => {
          return size + JSON.stringify(globalDataCache[key]).length;
        }, 0),
        keys: Object.keys(globalDataCache),
      }
    };
  }
}

// Singleton instance
export const coinGeckoService = new CoinGeckoService();