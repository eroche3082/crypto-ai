import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupWebSocketServer } from "./websocket";
import Stripe from "stripe";
import fs from 'fs';
import path from 'path';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

// Helper function to generate mock sparkline data
function generateMockSparklineData(basePrice: number, days: number, volatility: number) {
  const prices = [];
  let price = basePrice;
  
  for (let i = 0; i < days * 24; i++) {
    // Generate random price movement
    const change = price * (Math.random() * volatility * 2 - volatility);
    price += change;
    if (price < 0) price = 0.01; // Prevent negative prices
    prices.push(price);
  }
  
  return prices;
}

// Function to generate backup crypto data when API is unavailable
function generateBackupCryptoData() {
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
        price: generateMockSparklineData(60000, 7, 0.05)
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
      atl_change_percentage: 702256.2,
      atl_date: "2015-10-20T00:00:00.000Z",
      sparkline_in_7d: {
        price: generateMockSparklineData(3000, 7, 0.04)
      },
      last_updated: new Date().toISOString()
    },
    {
      id: "solana",
      symbol: "sol",
      name: "Solana",
      current_price: 123.87,
      market_cap: 55890432109,
      market_cap_rank: 5,
      total_volume: 3289476123,
      high_24h: 127.32,
      low_24h: 122.07,
      price_change_24h: -0.62,
      price_change_percentage_24h: -0.5,
      price_change_percentage_7d: -2.1,
      price_change_percentage_14d: 1.8,
      price_change_percentage_30d: -3.2,
      circulating_supply: 451089592,
      total_supply: 560395391,
      max_supply: null,
      ath: 259.96,
      ath_change_percentage: -52.5,
      ath_date: "2021-11-06T21:54:35.825Z",
      atl: 0.500801,
      atl_change_percentage: 24591.78,
      atl_date: "2020-05-11T19:35:23.449Z",
      sparkline_in_7d: {
        price: generateMockSparklineData(125, 7, 0.06)
      },
      last_updated: new Date().toISOString()
    },
    {
      id: "dogecoin",
      symbol: "doge",
      name: "Dogecoin",
      current_price: 0.1432,
      market_cap: 19346982745,
      market_cap_rank: 12,
      total_volume: 1289436782,
      high_24h: 0.1512,
      low_24h: 0.1398,
      price_change_24h: 0.0056,
      price_change_percentage_24h: 5.2,
      price_change_percentage_7d: 9.3,
      price_change_percentage_14d: -1.7,
      price_change_percentage_30d: 15.2,
      circulating_supply: 134782456384,
      total_supply: 134782456384,
      max_supply: null,
      ath: 0.731578,
      ath_change_percentage: -80.4,
      ath_date: "2021-05-08T05:08:23.458Z",
      atl: 0.0000869,
      atl_change_percentage: 164982.84,
      atl_date: "2015-05-06T00:00:00.000Z",
      sparkline_in_7d: {
        price: generateMockSparklineData(0.14, 7, 0.08)
      },
      last_updated: new Date().toISOString()
    },
    {
      id: "ripple",
      symbol: "xrp",
      name: "XRP",
      current_price: 0.5432,
      market_cap: 29384756123,
      market_cap_rank: 8,
      total_volume: 1768943512,
      high_24h: 0.5587,
      low_24h: 0.5312,
      price_change_24h: 0.0045,
      price_change_percentage_24h: 0.83,
      price_change_percentage_7d: 2.4,
      price_change_percentage_14d: -3.5,
      price_change_percentage_30d: 5.7,
      circulating_supply: 54198290492,
      total_supply: 100000000000,
      max_supply: 100000000000,
      ath: 3.4,
      ath_change_percentage: -84.0,
      ath_date: "2018-01-07T00:00:00.000Z",
      atl: 0.00268621,
      atl_change_percentage: 20123.67,
      atl_date: "2014-05-22T00:00:00.000Z",
      sparkline_in_7d: {
        price: generateMockSparklineData(0.54, 7, 0.05)
      },
      last_updated: new Date().toISOString()
    }
  ];
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Add a route to serve the static HTML fallback page
  app.get('/static', (req: Request, res: Response) => {
    try {
      const staticHtmlPath = path.join(process.cwd(), 'static', 'index.html');
      
      if (fs.existsSync(staticHtmlPath)) {
        res.setHeader('Content-Type', 'text/html');
        const staticHtml = fs.readFileSync(staticHtmlPath, 'utf8');
        res.send(staticHtml);
      } else {
        res.status(404).send('Static fallback page not found');
      }
    } catch (error) {
      res.status(500).send(`Error serving static page: ${(error as Error).message}`);
    }
  });
  
  // Setup WebSocket server with our custom implementation
  setupWebSocketServer(httpServer);
  
  // API Routes
  
  // User management
  app.post("/api/users", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.createUser({ username, password });
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  // Portfolio management
  app.post("/api/portfolio", async (req, res) => {
    try {
      const { userId, assets } = req.body;
      // In a real app, we would save this to a database
      // For now, just return success
      res.json({ success: true, userId, assetCount: assets.length });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  // Alert system
  app.post("/api/alerts", async (req, res) => {
    try {
      const { userId, alerts } = req.body;
      // In a real app, we would save this to a database
      // For now, just return success
      res.json({ success: true, userId, alertCount: alerts.length });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  // Gemini AI proxy
  app.post("/api/generate-ai-response", async (req, res) => {
    try {
      const { prompt, model, language } = req.body;
      
      // In a real app, we would call the Gemini API here
      // For now, return a mock response to avoid exposing API key
      const mockResponses = {
        "es": "Esta es una respuesta simulada del asistente. En una aplicación real, esto sería generado por Gemini AI basado en tu pregunta.",
        "en": "This is a simulated assistant response. In a real application, this would be generated by Gemini AI based on your question.",
        "pt": "Esta é uma resposta simulada do assistente. Em uma aplicação real, isso seria gerado pelo Gemini AI com base na sua pergunta.",
        "fr": "Ceci est une réponse simulée de l'assistant. Dans une application réelle, ce serait généré par Gemini AI sur la base de votre question."
      };
      
      res.json({ 
        response: mockResponses[language as keyof typeof mockResponses] || mockResponses.en,
        model: model || "gemini-1.5-pro",
        language: language || "en"
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  // Crypto data proxy to avoid exposing API keys on frontend
  app.get("/api/crypto/coins/markets", async (req, res) => {
    try {
      const { vs_currency, ids, category, order, per_page, page, sparkline, price_change_percentage } = req.query;
      
      // Construct the URL with query parameters - use Pro API endpoint for the paid tier
      const apiKey = process.env.VITE_COINGECKO_API_KEY;
      const baseUrl = apiKey ? "https://pro-api.coingecko.com/api/v3" : "https://api.coingecko.com/api/v3";
      const url = new URL(`${baseUrl}/coins/markets`);
      
      // Add common query parameters
      url.searchParams.append("vs_currency", (vs_currency as string) || "usd");
      
      if (ids) url.searchParams.append("ids", ids as string);
      if (category) url.searchParams.append("category", category as string);
      if (order) url.searchParams.append("order", order as string);
      if (per_page) url.searchParams.append("per_page", per_page as string);
      if (page) url.searchParams.append("page", page as string);
      if (sparkline) url.searchParams.append("sparkline", sparkline as string);
      if (price_change_percentage) url.searchParams.append("price_change_percentage", price_change_percentage as string);
      
      // Configure headers with API key
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
      };
      
      if (apiKey) {
        headers["x-cg-pro-api-key"] = apiKey;
        console.log("Using CoinGecko Pro API with API key");
      } else {
        console.log("Using CoinGecko free API tier (no API key provided)");
      }
      
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
            headers,
            method: 'GET',
          });
          
          // Handle rate limits and errors
          if (response.status === 429) {
            // Rate limit hit, wait before retrying
            const retryAfter = response.headers.get('retry-after') || '30';
            const waitTime = parseInt(retryAfter, 10) * 1000;
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
              console.log(`CoinGecko API error: ${response.status} ${response.statusText}. Using backup data.`);
              const backupData = generateBackupCryptoData();
              return res.json(backupData);
            }
          }
          
          // Success - parse and return data
          data = await response.json();
          success = true;
          
        } catch (error) {
          if (retries < maxRetries - 1) {
            console.log(`CoinGecko API fetch error: ${error}. Retrying...`);
            retries++;
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
          } else {
            console.log(`CoinGecko API fetch error after ${maxRetries} attempts: ${error}. Using backup data.`);
            const backupData = generateBackupCryptoData();
            return res.json(backupData);
          }
        }
      }
      
      if (success && data) {
        console.log(`CoinGecko API request successful. Returning ${data.length} coins.`);
        return res.json(data);
      } else {
        // This should never happen but just in case
        console.log("CoinGecko API request failed for unknown reason. Using backup data.");
        const backupData = generateBackupCryptoData();
        return res.json(backupData);
      }
    } catch (error) {
      console.error("Unexpected error in CoinGecko API proxy:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // Individual coin data proxy with improved error handling and retry logic
  app.get("/api/crypto/coins/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const queryParams = new URLSearchParams(req.query as any);
      
      // Construct the URL with query parameters - use Pro API endpoint for paid tier
      const apiKey = process.env.VITE_COINGECKO_API_KEY;
      const baseUrl = apiKey ? "https://pro-api.coingecko.com/api/v3" : "https://api.coingecko.com/api/v3";
      const url = `${baseUrl}/coins/${id}?${queryParams.toString()}`;
      
      // Configure headers with API key
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
      };
      
      if (apiKey) {
        headers["x-cg-pro-api-key"] = apiKey;
      }
      
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
            headers,
            method: 'GET', 
          });
          
          // Handle rate limits and errors
          if (response.status === 429) {
            // Rate limit hit, wait before retrying
            const retryAfter = response.headers.get('retry-after') || '30';
            const waitTime = parseInt(retryAfter, 10) * 1000;
            console.log(`CoinGecko API rate limit hit. Waiting ${waitTime}ms before retry.`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retries++;
            continue;
          } else if (!response.ok) {
            if (retries < maxRetries - 1) {
              console.log(`CoinGecko coin API error: ${response.status} ${response.statusText}. Retrying...`);
              retries++;
              // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
              continue;
            } else {
              // For specific coin, find in backup data or generate a more detailed response
              console.log(`CoinGecko coin API error after ${maxRetries} attempts. Using backup data.`);
              const backupData = generateBackupCryptoData().find(coin => coin.id === id);
              
              if (backupData) {
                // Enhance backup data for single coin view
                const enhancedData = {
                  ...backupData,
                  description: { en: `Detailed information about ${backupData.name} is temporarily unavailable.` },
                  links: {
                    homepage: ["https://example.com"],
                    blockchain_site: ["https://example.com"],
                    official_forum_url: ["https://example.com"],
                    twitter_screen_name: "example",
                    telegram_channel_identifier: "",
                    subreddit_url: "https://example.com",
                  },
                  market_data: {
                    current_price: { usd: backupData.current_price },
                    ath: { usd: backupData.ath },
                    ath_change_percentage: { usd: backupData.ath_change_percentage },
                    ath_date: { usd: backupData.ath_date },
                    atl: { usd: backupData.atl },
                    atl_change_percentage: { usd: backupData.atl_change_percentage },
                    atl_date: { usd: backupData.atl_date },
                    market_cap: { usd: backupData.market_cap },
                    total_volume: { usd: backupData.total_volume },
                    high_24h: { usd: backupData.high_24h },
                    low_24h: { usd: backupData.low_24h },
                    price_change_24h: backupData.price_change_24h,
                    price_change_percentage_24h: backupData.price_change_percentage_24h,
                    price_change_percentage_7d: backupData.price_change_percentage_7d,
                    price_change_percentage_14d: backupData.price_change_percentage_14d,
                    price_change_percentage_30d: backupData.price_change_percentage_30d,
                    sparkline_7d: { price: backupData.sparkline_in_7d?.price || [] },
                  },
                };
                return res.json(enhancedData);
              }
              
              return res.status(404).json({ error: `Coin ${id} not found and no backup data available` });
            }
          }
          
          // Success - parse and return data
          data = await response.json();
          success = true;
          
        } catch (error) {
          if (retries < maxRetries - 1) {
            console.log(`CoinGecko coin API fetch error: ${error}. Retrying...`);
            retries++;
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
          } else {
            console.log(`CoinGecko coin API fetch error after ${maxRetries} attempts: ${error}.`);
            return res.status(500).json({ error: `Failed to fetch data for ${id} after multiple attempts` });
          }
        }
      }
      
      if (success && data) {
        console.log(`CoinGecko coin API request successful for ${id}.`);
        return res.json(data);
      } else {
        // This should never happen but just in case
        return res.status(500).json({ error: `Failed to fetch data for ${id} for unknown reason` });
      }
    } catch (error) {
      console.error(`Unexpected error in CoinGecko coin API proxy: ${error}`);
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // News API proxy
  app.get("/api/crypto/news", async (req, res) => {
    try {
      const { category } = req.query;
      
      // Mock news data for demonstration
      const mockNews = [
        {
          id: "1",
          title: "Bitcoin Breaks $60,000 Barrier After ETF Approval",
          summary: "Bitcoin has surged past $60,000 following the SEC's approval of spot Bitcoin ETFs, marking a significant milestone for cryptocurrency adoption.",
          url: "#",
          source: "CryptoNews",
          publishedAt: new Date().toISOString(),
          categories: ["bitcoin", "market", "regulation"],
        },
        {
          id: "2",
          title: "Ethereum Completes Major Network Upgrade",
          summary: "Ethereum has successfully implemented its latest network upgrade, improving scalability and reducing gas fees for transactions.",
          url: "#",
          source: "BlockchainInsider",
          publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          categories: ["ethereum", "technology", "upgrade"],
        },
        {
          id: "3",
          title: "DeFi Protocol Launches New Governance Token",
          summary: "A leading DeFi protocol has launched a new governance token, giving users more control over the future development of the platform.",
          url: "#",
          source: "DeFiDaily",
          publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          categories: ["defi", "tokens", "governance"],
        },
        {
          id: "4",
          title: "NFT Market Shows Signs of Recovery After Slump",
          summary: "The NFT market is showing signs of recovery with increasing trading volumes after months of declining activity and prices.",
          url: "#",
          source: "NFTWorld",
          publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          categories: ["nft", "market", "trends"],
        },
        {
          id: "5",
          title: "Central Banks Accelerate CBDC Development",
          summary: "Several central banks worldwide are accelerating their central bank digital currency (CBDC) development efforts in response to the growing popularity of cryptocurrencies.",
          url: "#",
          source: "GlobalCryptoNews",
          publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
          categories: ["cbdc", "regulation", "government"],
        },
      ];
      
      if (category && category !== "all") {
        const filteredNews = mockNews.filter(item => 
          item.categories.includes(category as string)
        );
        return res.json(filteredNews);
      }
      
      res.json(mockNews);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  // Generic news endpoint
  app.get("/api/news", async (req, res) => {
    try {
      const mockNews = [
        {
          id: "1",
          title: "Bitcoin Price Surges Past $80,000 as Institutional Adoption Continues",
          summary: "Bitcoin has reached a new all-time high as major financial institutions announce further investments in the cryptocurrency market. Analysts predict continued growth in 2025.",
          url: "https://example.com/news/bitcoin-surge",
          source: "CryptoNews",
          publishedAt: new Date().toISOString(),
          categories: ["Bitcoin", "Markets"],
        },
        {
          id: "2",
          title: "Ethereum Completes Significant Protocol Upgrade",
          summary: "Ethereum has successfully implemented its latest network upgrade, improving scalability and reducing transaction fees by up to 80% for users.",
          url: "https://example.com/news/ethereum-upgrade",
          source: "ETH Daily",
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          categories: ["Ethereum", "Technology"],
        },
        {
          id: "3",
          title: "New DeFi Protocol Launches with $200M Total Value Locked",
          summary: "A revolutionary decentralized finance platform has attracted massive liquidity within just 24 hours of launch, signaling strong market demand for innovative DeFi solutions.",
          url: "https://example.com/news/defi-launch",
          source: "DeFi Daily",
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          categories: ["DeFi", "Ethereum"],
        },
        {
          id: "4",
          title: "SEC Approves New Cryptocurrency Regulations Framework",
          summary: "The Securities and Exchange Commission has announced a comprehensive regulatory framework for digital assets, providing clearer guidelines for cryptocurrency companies.",
          url: "https://example.com/news/sec-regulations",
          source: "Regulation Today",
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          categories: ["Regulation", "Government"],
        },
        {
          id: "5",
          title: "Major Bank Launches Institutional Crypto Custody Service",
          summary: "One of the world's largest banks has announced a new cryptocurrency custody service aimed at institutional investors, further legitimizing digital assets.",
          url: "https://example.com/news/bank-custody",
          source: "Banking News",
          publishedAt: new Date(Date.now() - 345600000).toISOString(),
          categories: ["Banking", "Custody", "Institutional"],
        },
        {
          id: "6",
          title: "NFT Market Shows Signs of Recovery with Record-Breaking Sale",
          summary: "The NFT market is showing strong signs of recovery after a notable digital artwork sold for $12.3 million, setting a new record for 2025.",
          url: "https://example.com/news/nft-recovery",
          source: "NFT Insider",
          publishedAt: new Date(Date.now() - 432000000).toISOString(),
          categories: ["NFT", "Art", "Markets"],
        },
        {
          id: "7",
          title: "Blockchain Technology Adoption Soars in Supply Chain Management",
          summary: "Major corporations are increasingly implementing blockchain solutions for supply chain management, with a 78% increase in adoption compared to last year.",
          url: "https://example.com/news/blockchain-supply-chain",
          source: "Blockchain Business",
          publishedAt: new Date(Date.now() - 518400000).toISOString(),
          categories: ["Blockchain", "Enterprise", "Supply Chain"],
        },
      ];
      
      const { category, search } = req.query;
      let filteredNews = [...mockNews];
      
      if (category) {
        filteredNews = filteredNews.filter(item => 
          item.categories.some(cat => cat.toLowerCase() === (category as string).toLowerCase())
        );
      }
      
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredNews = filteredNews.filter(item => 
          item.title.toLowerCase().includes(searchTerm) || 
          item.summary.toLowerCase().includes(searchTerm)
        );
      }
      
      res.json(filteredNews);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  // Stripe payment routes
  if (stripe) {
    // Create payment intent for one-time payments
    app.post("/api/create-payment-intent", async (req, res) => {
      try {
        const { amount } = req.body;
        
        if (!amount || isNaN(amount)) {
          return res.status(400).json({ error: "Valid amount is required" });
        }
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
        });
        
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res.status(500).json({ error: `Error creating payment intent: ${error.message}` });
      }
    });
    
    // Create subscription
    app.post('/api/create-subscription', async (req, res) => {
      try {
        const { email, name, paymentMethodId, priceId } = req.body;
        
        if (!email || !paymentMethodId || !priceId) {
          return res.status(400).json({ error: "Email, payment method, and price ID are required" });
        }
        
        // Create or get customer
        let customer;
        const existingCustomers = await stripe.customers.list({ email });
        
        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
        } else {
          customer = await stripe.customers.create({
            email,
            name,
            payment_method: paymentMethodId,
            invoice_settings: { default_payment_method: paymentMethodId },
          });
        }
        
        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: priceId }],
          expand: ['latest_invoice.payment_intent'],
        });
        
        res.json({ 
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any).payment_intent?.client_secret,
        });
      } catch (error: any) {
        res.status(500).json({ error: `Error creating subscription: ${error.message}` });
      }
    });
    
    // Webhook to handle Stripe events
    app.post('/api/stripe-webhook', async (req, res) => {
      const sig = req.headers['stripe-signature'] as string;
      
      let event;
      
      try {
        // This assumes you've set a STRIPE_WEBHOOK_SECRET environment variable
        // and are using Express's body-parser middleware
        if (process.env.STRIPE_WEBHOOK_SECRET) {
          event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
          );
        } else {
          // In development, you can skip signature verification
          event = req.body;
        }
        
        // Handle the event
        switch (event.type) {
          case 'payment_intent.succeeded':
            // Handle successful payment
            console.log('Payment succeeded:', event.data.object.id);
            break;
          case 'invoice.payment_succeeded':
            // Handle successful subscription payment
            console.log('Subscription payment succeeded:', event.data.object.id);
            break;
          // Handle other event types as needed
          default:
            console.log(`Unhandled event type ${event.type}`);
        }
        
        res.json({ received: true });
      } catch (error: any) {
        console.error('Webhook error:', error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
      }
    });
  } else {
    // If Stripe is not initialized, return error messages for Stripe endpoints
    const stripeErrorHandler = (_req: any, res: any) => {
      res.status(500).json({ error: "Stripe is not configured. Please provide STRIPE_SECRET_KEY." });
    };
    
    app.post("/api/create-payment-intent", stripeErrorHandler);
    app.post("/api/create-subscription", stripeErrorHandler);
    app.post("/api/stripe-webhook", stripeErrorHandler);
  }
  
  return httpServer;
}
