// API client for CoinGecko via our proxy endpoint
// This ensures API key security and better error handling
const BASE_URL = "/api/crypto";

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  price_change_percentage_14d?: number;
  price_change_percentage_30d?: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  sparkline_in_7d?: { price: number[] };
  last_updated: string;
}

interface MarketParams {
  vs_currency: string;
  ids?: string;
  category?: string;
  order?: string;
  per_page?: number;
  page?: number;
  sparkline?: boolean;
  price_change_percentage?: string;
}

export const cryptoApi = {
  getMarketData: async (params: MarketParams) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
      
      const url = `${BASE_URL}/coins/markets?${queryParams.toString()}`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        // If API rate limit is hit, use backup data
        if (response.status === 429) {
          console.warn("CoinGecko API rate limit reached. Using backup data.");
          return getBackupCryptoData();
        }
        
        throw new Error(`Error fetching market data: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error in CoinGecko API:", error);
      // Return backup data in case of any error
      return getBackupCryptoData();
    }
  },
  
  getCoinData: async (id: string) => {
    try {
      const url = `${BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`Error fetching coin data: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching coin data:", error);
      throw error;
    }
  },
};

// Backup data in case API is down or rate limited
const getBackupCryptoData = () => {
  return [
    {
      id: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      current_price: 60234.21,
      price_change_percentage_24h: 2.4,
      price_change_percentage_7d: 5.2,
      price_change_percentage_14d: -3.1,
      price_change_percentage_30d: 8.7,
      sparkline_in_7d: {
        price: generateMockSparklineData(60000, 7, 0.05),
      },
    },
    {
      id: "ethereum",
      symbol: "ETH",
      name: "Ethereum",
      current_price: 3112.45,
      price_change_percentage_24h: 1.8,
      price_change_percentage_7d: 3.1,
      price_change_percentage_14d: -1.2,
      price_change_percentage_30d: 4.5,
      sparkline_in_7d: {
        price: generateMockSparklineData(3000, 7, 0.04),
      },
    },
    {
      id: "solana",
      symbol: "SOL",
      name: "Solana",
      current_price: 123.87,
      price_change_percentage_24h: -0.5,
      price_change_percentage_7d: -2.1,
      price_change_percentage_14d: 1.8,
      price_change_percentage_30d: -3.2,
      sparkline_in_7d: {
        price: generateMockSparklineData(125, 7, 0.06),
      },
    },
    {
      id: "dogecoin",
      symbol: "DOGE",
      name: "Dogecoin",
      current_price: 0.1432,
      price_change_percentage_24h: 5.2,
      price_change_percentage_7d: 9.3,
      price_change_percentage_14d: -1.7,
      price_change_percentage_30d: 15.2,
      sparkline_in_7d: {
        price: generateMockSparklineData(0.14, 7, 0.08),
      },
    },
    {
      id: "ripple",
      symbol: "XRP",
      name: "XRP",
      current_price: 0.5827,
      price_change_percentage_24h: 1.2,
      price_change_percentage_7d: -0.8,
      price_change_percentage_14d: 3.5,
      price_change_percentage_30d: -2.1,
      sparkline_in_7d: {
        price: generateMockSparklineData(0.58, 7, 0.05),
      },
    },
    {
      id: "binancecoin",
      symbol: "BNB",
      name: "Binance Coin",
      current_price: 523.64,
      price_change_percentage_24h: 0.9,
      price_change_percentage_7d: 2.3,
      price_change_percentage_14d: -1.4,
      price_change_percentage_30d: 5.6,
      sparkline_in_7d: {
        price: generateMockSparklineData(520, 7, 0.03),
      },
    },
    {
      id: "tether",
      symbol: "USDT",
      name: "Tether",
      current_price: 1.0,
      price_change_percentage_24h: 0.01,
      price_change_percentage_7d: -0.02,
      price_change_percentage_14d: 0.01,
      price_change_percentage_30d: 0.0,
      sparkline_in_7d: {
        price: generateMockSparklineData(1, 7, 0.001),
      },
    },
    {
      id: "cardano",
      symbol: "ADA",
      name: "Cardano",
      current_price: 0.4371,
      price_change_percentage_24h: -1.2,
      price_change_percentage_7d: 2.8,
      price_change_percentage_14d: -3.7,
      price_change_percentage_30d: 1.5,
      sparkline_in_7d: {
        price: generateMockSparklineData(0.43, 7, 0.07),
      },
    },
  ];
};

// Generate mock sparkline data
function generateMockSparklineData(basePrice: number, days: number, volatility: number) {
  const dataPoints = days * 24; // Hourly data points
  const result = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < dataPoints; i++) {
    const change = basePrice * volatility * (Math.random() - 0.5);
    currentPrice += change;
    currentPrice = Math.max(currentPrice, basePrice * 0.7); // Prevent too low values
    result.push(currentPrice);
  }
  
  return result;
}
