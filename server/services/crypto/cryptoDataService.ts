import { coinGeckoService } from './coinGeckoService';
import { coinApiService } from './coinApiService';

/**
 * Unified Crypto Data Service
 * 
 * This service manages data from multiple sources (CoinGecko and CoinAPI)
 * and provides a unified interface for crypto data with automatic fallbacks.
 */
export class CryptoDataService {
  /**
   * Get cryptocurrency markets data with smart source selection
   */
  async getMarkets(params: Record<string, any> = {}): Promise<{
    data: any[];
    source: string;
  }> {
    try {
      // Try CoinGecko first (primary source)
      try {
        const { data, source } = await coinGeckoService.getMarkets(params);
        return {
          data,
          source: `coingecko-${source}`
        };
      } catch (geckoError) {
        console.error('CoinGecko markets request failed, falling back to CoinAPI:', geckoError);
        
        // Fall back to CoinAPI
        const { data, source } = await coinApiService.getMarketsCompatible(params);
        return {
          data,
          source: `coinapi-${source}`
        };
      }
    } catch (error) {
      console.error('All cryptocurrency data sources failed:', error);
      throw new Error(`Failed to fetch cryptocurrency markets data: ${(error as Error).message}`);
    }
  }
  
  /**
   * Get individual coin data with smart source selection
   */
  async getCoinDetails(id: string, params: Record<string, any> = {}): Promise<{
    data: any;
    source: string;
  }> {
    try {
      // Try CoinGecko first (primary source)
      try {
        const { data, source } = await coinGeckoService.getCoinDetails(id, params);
        return {
          data,
          source: `coingecko-${source}`
        };
      } catch (geckoError) {
        console.error(`CoinGecko coin details request for ${id} failed, falling back to CoinAPI:`, geckoError);
        
        // For CoinAPI we need to get different data and adapt it
        try {
          // Get the asset data
          const { data: assetHistory, source: historySource } = await coinApiService.getAssetHistory(id.toUpperCase(), '1DAY', 30);
          
          // Format the data to be similar to CoinGecko's format
          const formattedData = {
            id: id,
            symbol: id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            market_data: {
              current_price: {
                usd: assetHistory[0]?.price_close || 0
              },
              price_change_24h: assetHistory[1] ? assetHistory[0].price_close - assetHistory[1].price_close : 0,
              price_change_percentage_24h: assetHistory[1] ? 
                ((assetHistory[0].price_close - assetHistory[1].price_close) / assetHistory[1].price_close) * 100 : 0,
              sparkline_7d: {
                price: assetHistory.slice(0, 7).map(item => item.price_close).reverse()
              }
            },
            description: {
              en: "Data provided by CoinAPI as a fallback source."
            },
            last_updated: new Date().toISOString()
          };
          
          return {
            data: formattedData,
            source: `coinapi-${historySource}`
          };
        } catch (apiError) {
          console.error(`CoinAPI fallback for ${id} also failed:`, apiError);
          throw new Error(`All data sources failed for coin ${id}`);
        }
      }
    } catch (error) {
      console.error(`All cryptocurrency data sources failed for coin ${id}:`, error);
      throw new Error(`Failed to fetch data for ${id}: ${(error as Error).message}`);
    }
  }
  
  /**
   * Get global cryptocurrency market data
   */
  async getGlobalData(): Promise<{
    data: any;
    source: string;
  }> {
    try {
      // Try CoinGecko first (primary source)
      try {
        const { data, source } = await coinGeckoService.getGlobalData();
        return {
          data,
          source: `coingecko-${source}`
        };
      } catch (geckoError) {
        console.error('CoinGecko global data request failed, falling back to CoinAPI:', geckoError);
        
        // Try to aggregate CoinAPI data to create a global market overview
        try {
          const { data: assets, source: assetsSource } = await coinApiService.getAllAssets();
          
          // Calculate global market stats
          const cryptoAssets = assets.filter(asset => asset.type_is_crypto === 1);
          const totalMarketCap = cryptoAssets.reduce((total, asset) => {
            const marketCap = (asset.volume_1day_usd || 0) * (asset.price_usd || 0);
            return total + marketCap;
          }, 0);
          
          const totalVolume = cryptoAssets.reduce((total, asset) => {
            return total + (asset.volume_1day_usd || 0);
          }, 0);
          
          // Get top coins by market cap
          const topCoins = [...cryptoAssets]
            .sort((a, b) => {
              const marketCapA = (a.volume_1day_usd || 0) * (a.price_usd || 0);
              const marketCapB = (b.volume_1day_usd || 0) * (b.price_usd || 0);
              return marketCapB - marketCapA;
            })
            .slice(0, 5);
          
          // Calculate dominance percentages
          const marketCapPercentage: Record<string, number> = {};
          topCoins.forEach(coin => {
            const marketCap = (coin.volume_1day_usd || 0) * (coin.price_usd || 0);
            const percentage = (marketCap / totalMarketCap) * 100;
            marketCapPercentage[coin.asset_id.toLowerCase()] = parseFloat(percentage.toFixed(2));
          });
          
          // Create global data in CoinGecko format
          const globalData = {
            data: {
              active_cryptocurrencies: cryptoAssets.length,
              total_market_cap: {
                usd: totalMarketCap
              },
              total_volume: {
                usd: totalVolume
              },
              market_cap_percentage: marketCapPercentage,
              market_cap_change_percentage_24h_usd: 0, // Can't calculate without historical data
              updated_at: Date.now()
            }
          };
          
          return {
            data: globalData,
            source: `coinapi-${assetsSource}`
          };
        } catch (apiError) {
          console.error('CoinAPI fallback for global data also failed:', apiError);
          throw new Error('All data sources failed for global market data');
        }
      }
    } catch (error) {
      console.error('All cryptocurrency data sources failed for global market data:', error);
      throw new Error(`Failed to fetch global cryptocurrency data: ${(error as Error).message}`);
    }
  }
  
  /**
   * Invalidate caches across all services
   */
  invalidateAllCaches() {
    // Invalidate CoinGecko caches
    coinGeckoService.invalidateCache('markets');
    coinGeckoService.invalidateCache('coin');
    coinGeckoService.invalidateCache('global');
    
    // Invalidate CoinAPI caches
    coinApiService.invalidateCache('assets');
    coinApiService.invalidateCache('history');
    coinApiService.invalidateCache('exchange-rates');
    
    console.log('Invalidated all cryptocurrency data caches');
  }
  
  /**
   * Get cache statistics from all services
   */
  getCacheStats() {
    return {
      coinGecko: coinGeckoService.getCacheStats(),
      coinApi: coinApiService.getCacheStats()
    };
  }
}

// Create a singleton instance
export const cryptoDataService = new CryptoDataService();