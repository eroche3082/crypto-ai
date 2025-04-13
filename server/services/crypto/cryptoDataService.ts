import { coinApiService } from './coinApiService';

/**
 * Unified Crypto Data Service
 * 
 * This service manages crypto data from CoinAPI and provides
 * a unified interface with caching capabilities.
 */
export class CryptoDataService {
  /**
   * Get cryptocurrency markets data
   */
  async getMarkets(params: Record<string, any> = {}): Promise<{
    data: any[];
    source: string;
  }> {
    try {
      // Use CoinAPI as the only data source
      const { data, source } = await coinApiService.getMarketsCompatible(params);
      return {
        data,
        source: `coinapi-${source}`
      };
    } catch (error) {
      console.error('CoinAPI markets request failed:', error);
      throw new Error(`Failed to fetch cryptocurrency markets data: ${(error as Error).message}`);
    }
  }
  
  /**
   * Get individual coin data
   */
  async getCoinDetails(id: string, params: Record<string, any> = {}): Promise<{
    data: any;
    source: string;
  }> {
    try {
      // Get the asset data from CoinAPI
      const { data: assetHistory, source: historySource } = await coinApiService.getAssetHistory(id.toUpperCase(), '1DAY', 30);
      
      // Format the data to match the expected format
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
          en: "Data provided by CoinAPI."
        },
        last_updated: new Date().toISOString()
      };
      
      return {
        data: formattedData,
        source: `coinapi-${historySource}`
      };
    } catch (error) {
      console.error(`CoinAPI request for coin ${id} failed:`, error);
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
      
      // Create global data
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
    } catch (error) {
      console.error('CoinAPI global data request failed:', error);
      throw new Error(`Failed to fetch global cryptocurrency data: ${(error as Error).message}`);
    }
  }
  
  /**
   * Invalidate caches across all services
   */
  invalidateAllCaches() {
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
      coinApi: coinApiService.getCacheStats()
    };
  }
}

// Create a singleton instance
export const cryptoDataService = new CryptoDataService();