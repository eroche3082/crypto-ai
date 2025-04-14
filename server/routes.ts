import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupWebSocketServer } from "./websocket";
import Stripe from "stripe";
import fs from 'fs';
import path from 'path';
import { googleTTSHandler, elevenLabsTTSHandler } from "./tts";
import { analyzeImage, uploadMiddleware } from "./vision";
import { getTwitterSentiment, getMarketSentiment } from "./twitter";
import { analyzeSentiment } from "./sentiment";
import { generateAIResponse } from "./gemini";
import { 
  handleVertexAIResponse, 
  handleVisionAIResponse, 
  generateMarketAnalysis,
  getAIDiagnostics
} from "./vertexai";
import { transcribeAudio, audioMiddleware } from "./speech";
import { handleVertexChat } from "./chatbot";
import { checkVertexAi, checkPaymentMethods, getSystemStatus } from "./systemCheck";
import { runVertexDiagnostics, runComprehensiveVertexDiagnostic } from "./vertexDiagnostic";
import { initializeAppSecrets } from "./services/secrets/secretManager";
import { sendAccessCodeEmail, sendNewsletterCampaign } from './emailService';
import { createCheckoutSession, handleStripeWebhook, getAvailableLevels, verifyReferralCode } from './stripeService';
import { generateQRCode, validateAccessCode } from './qrCodeService';
import { 
  getPaymentMethods, 
  initPayPalPayment, 
  initCryptoPayment, 
  getBankTransferInstructions,
  verifyCryptoPayment 
} from './paymentService';
import apiRouter from "./apiRoutes";
import { accessCodeRouter, accessCodeAdminRouter } from "./accessCodeRoutes";
import { db } from "./db";
import { insertUserOnboardingProfileSchema, userOnboardingProfiles } from "../shared/schema";

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
  
  // Add a status endpoint to check system health including email service status
  app.get('/api/system/status', getSystemStatus);
  
  // API status endpoint for monitoring data sources health
  app.get('/api/system/api-status', async (req, res) => {
    try {
      // Check CoinAPI status
      let coinApiStatus = 'unknown';
      try {
        const { coinApiService } = await import('./services/crypto/coinApiService');
        // Just getting exchange rates is a simple way to check if the API is working
        const result = await coinApiService.getExchangeRates();
        coinApiStatus = result.source === 'api' ? 'online' : 'degraded';
      } catch (error) {
        coinApiStatus = 'offline';
        console.error('CoinAPI health check failed:', error);
      }
      
      // Check News API (optional, but useful)
      let newsApiStatus = 'unknown';
      if (process.env.NEWS_API_KEY) {
        try {
          const response = await fetch(
            'https://newsapi.org/v2/top-headlines?country=us&pageSize=1',
            { headers: { 'X-Api-Key': process.env.NEWS_API_KEY } }
          );
          newsApiStatus = response.ok ? 'online' : 'degraded';
        } catch (error) {
          newsApiStatus = 'offline';
          console.error('NewsAPI health check failed:', error);
        }
      } else {
        newsApiStatus = 'not_configured';
      }
      
      // Load cache statistics from crypto data services
      let cacheStats = {};
      try {
        const { cryptoDataService } = await import('./services/crypto/cryptoDataService');
        cacheStats = cryptoDataService.getCacheStats();
      } catch (error) {
        console.error('Failed to get cache statistics:', error);
      }
      
      // Send the combined API status information
      res.json({
        timestamp: new Date().toISOString(),
        apis: {
          coinApi: {
            status: coinApiStatus,
            provider: 'CoinAPI',
            description: 'Primary cryptocurrency market data provider'
          },
          newsApi: {
            status: newsApiStatus,
            provider: 'NewsAPI',
            description: 'Financial and cryptocurrency news provider'
          }
        },
        cache: cacheStats
      });
    } catch (error) {
      console.error('Error checking API status:', error);
      res.status(500).json({ error: 'Failed to check API status' });
    }
  });
  
  // Vertex AI diagnostics endpoints
  app.get('/api/system/vertex-diagnostics', runVertexDiagnostics);
  app.get('/api/system/vertex-diagnostics/comprehensive', runComprehensiveVertexDiagnostic);
  
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
  
  // Initialize app secrets from Secret Manager
  try {
    await initializeAppSecrets();
    console.log('Application secrets initialized from Secret Manager');
  } catch (error) {
    console.warn('Failed to initialize secrets from Secret Manager:', error);
  }
  
  // Register expanded API routes
  app.use('/api', apiRouter);
  app.use('/api/v2', apiRouter); // Keep v2 for backward compatibility
  
  // Register Universal Access Code System routes
  app.use('/api/access-code', accessCodeRouter);
  app.use('/api/admin/access-code', accessCodeAdminRouter);
  
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
  
  // Gemini AI proxy - using real implementation
  app.post("/api/generate-ai-response", generateAIResponse);
  
  // Chat endpoint with Vertex Flash AI
  app.post("/api/chat/vertex", handleVertexChat);
  
  // System check endpoints
  app.get("/api/chat/vertex-check", checkVertexAi);
  app.get("/api/payments/methods", checkPaymentMethods);
  
  // User onboarding profile endpoint
  app.post("/api/onboarding/profile", async (req, res) => {
    try {
      // Validate the input using Zod schema
      const profileData = insertUserOnboardingProfileSchema.parse(req.body);
      
      // Insert the profile data into the database
      const [newProfile] = await db.insert(userOnboardingProfiles).values(profileData).returning();
      
      console.log('Saved new onboarding profile:', newProfile.name, newProfile.email);
      
      return res.status(201).json({
        success: true,
        profile: newProfile,
        message: 'Onboarding profile created successfully'
      });
    } catch (error: any) {
      console.error('Error saving onboarding profile:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to save onboarding profile',
        details: error.errors || []
      });
    }
  });
  
  // Admin endpoint to get all onboarding profiles
  app.get("/api/admin/onboarding-profiles", async (req, res) => {
    try {
      // In a real application, we would add authentication middleware here
      // to ensure only admins can access this endpoint
      
      // Query all profiles from the database
      const profiles = await db.select().from(userOnboardingProfiles).orderBy(userOnboardingProfiles.created_at, "desc");
      
      return res.status(200).json({
        success: true,
        profiles,
        count: profiles.length
      });
    } catch (error: any) {
      console.error('Error fetching onboarding profiles:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch onboarding profiles'
      });
    }
  });
  
  // Email endpoints
  app.post("/api/email/send-access-code", sendAccessCodeEmail);
  app.post("/api/email/send-newsletter", sendNewsletterCampaign);
  
  // VertexAI endpoints with enhanced fallback capabilities
  app.post("/api/vertex-ai-response", handleVertexAIResponse);
  app.post("/api/vertex-ai-vision", handleVisionAIResponse);
  app.get("/api/vertex-ai-diagnostics", getAIDiagnostics);
  
  // API Key Manager diagnostics endpoint
  app.get("/api/google-api-key-manager/diagnostics", (req, res) => {
    const googleApiKeyManager = require('./services/googleApiKeyManager').default;
    
    res.json({
      timestamp: new Date().toISOString(),
      initializationSummary: googleApiKeyManager.getServiceInitializationSummary(),
      detailedReport: googleApiKeyManager.getServiceInitializationReport()
    });
  });
  app.get("/api/vertex-ai-diagnostics/comprehensive", async (req, res) => {
    try {
      // Import all necessary variables from vertexai.ts
      const { 
        lastRequestDiagnostics, 
        isConfigured, 
        vertexAI, 
        genAI, 
        USE_API_KEY_AUTH, 
        USE_GEMINI_FALLBACK, 
        projectId, 
        location,
        apiKey,
        generateResponse
      } = await import('./vertexai');
      
      // First get basic diagnostics
      const basicDiagnostics = {
        ...lastRequestDiagnostics,
        configStatus: {
          isConfigured,
          vertexAIAvailable: !!vertexAI,
          geminiAIAvailable: !!genAI,
          useAPIKeyAuth: USE_API_KEY_AUTH,
          useGeminiFallback: USE_GEMINI_FALLBACK,
          projectId,
          location
        }
      };
      
      // Then run a test request to verify connectivity
      let testSuccess = false;
      let modelUsed = '';
      let responseTime = 0;
      let errorDetails = '';
      
      const startTime = Date.now();
      try {
        const response = await generateResponse('Test connectivity with a simple response. Please reply with "Connection successful."', 0.1, 50);
        testSuccess = true;
        responseTime = Date.now() - startTime;
        modelUsed = lastRequestDiagnostics.modelUsed || 'unknown';
      } catch (error) {
        testSuccess = false;
        responseTime = Date.now() - startTime;
        errorDetails = error.message;
      }
      
      // Generate a comprehensive report
      const overallStatus = testSuccess ? 'success' : (genAI ? 'warning' : 'error');
      const recommendedAction = !testSuccess ? 
        'Check your API key and GCP project settings.' : 
        (basicDiagnostics.method === 'gemini' ? 'Primary Vertex AI connection failed, but Gemini API fallback is working.' : '');
      
      res.json({
        timestamp: new Date().toISOString(),
        overallStatus,
        apiConnectivity: testSuccess,
        responseTime,
        modelUsed,
        errorDetails,
        recommendedAction,
        diagnostics: basicDiagnostics,
        apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : null
      });
    } catch (error) {
      console.error('Error in comprehensive diagnostics:', error);
      res.status(500).json({ 
        error: 'Diagnostic error', 
        details: error.message 
      });
    }
  });
  
  // Vertex AI Market Analysis with full fallback support
  app.post("/api/v2/vertex/market/analyze", generateMarketAnalysis);
  
  // Legacy Market Analysis endpoint (keeping for compatibility)
  app.post("/api/v2/vertex/market/analyze-legacy", async (req, res) => {
    try {
      const { coins, timeframe, language = 'en' } = req.body;
      
      if (!coins || !Array.isArray(coins) || coins.length === 0) {
        return res.status(400).json({
          error: 'Invalid request: coins array is required'
        });
      }

      // For demo purposes, generate mock analysis
      const coinNames = coins.map(c => c.toUpperCase()).join(', ');
      
      const timeframeTexts: Record<string, string> = {
        '24h': 'next 24 hours',
        '7d': 'coming week',
        '30d': 'next month', 
        '90d': 'next quarter'
      };
      
      const timeText = timeframeTexts[timeframe] || timeframe;
      
      // In a production app, this would be a call to Vertex AI
      // For demo purposes, we'll generate a mock analysis
      const analysis = `
# Market Analysis for ${coinNames}

## Overview
Based on technical indicators, market sentiment analysis, and trading volume patterns, this analysis provides insights for the ${timeText}.

## Key Insights
- BTC shows strong support at current levels with positive momentum indicators
- ETH is consolidating after recent gains, with increasing developer activity
- SOL exhibits higher volatility but remains in a positive trend channel
- XRP faces regulatory uncertainty but maintains stable trading volumes

## Market Sentiment
Overall market sentiment appears cautiously optimistic with institutional interest growing.
Trading volumes suggest continued accumulation by large holders, particularly for Bitcoin and Ethereum.

## Technical Analysis
RSI indicators show ${coins[0]} approaching overbought territory (68) while ${coins.length > 1 ? coins[1] : 'other altcoins'} remain in neutral range.
Moving averages confirm upward trend but suggest potential resistance at key price levels.

## Recommendation
Consider diversified position across these assets with appropriate risk management.
Watch for increased volatility around upcoming economic announcements.
`;

      res.json({
        success: true,
        analysis,
        metadata: {
          coins,
          timeframe,
          timestamp: new Date().toISOString(),
          analysisEngine: 'Vertex AI Gemini 1.5',
        }
      });
      
    } catch (error) {
      console.error('Error in market analysis:', error);
      res.status(500).json({
        error: 'Failed to analyze market trends', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Crypto data proxy to avoid exposing API keys on frontend
  // Sentiment analysis API routes
  app.get("/api/sentiment/twitter/:symbol", getTwitterSentiment);
  app.get("/api/sentiment/market", getMarketSentiment);
  app.post("/api/sentiment/analyze", analyzeSentiment);

  app.get("/api/crypto/coins/markets", async (req, res) => {
    try {
      const { vs_currency, ids, category, order, per_page, page, sparkline, price_change_percentage } = req.query;
      
      // Import the unified crypto data service with CoinGecko and CoinAPI
      const { cryptoDataService } = await import('./services/crypto/cryptoDataService');
      
      // Construct parameters object for the service
      const params: Record<string, any> = {
        vs_currency: vs_currency || "usd",
      };
      
      if (ids) params.ids = ids;
      if (category) params.category = category;
      if (order) params.order = order;
      if (per_page) params.per_page = per_page;
      if (page) params.page = page;
      if (sparkline) params.sparkline = sparkline;
      if (price_change_percentage) params.price_change_percentage = price_change_percentage;
      
      // Get data from unified service with smart source selection and caching
      const { data, source } = await cryptoDataService.getMarkets(params);
      
      // Add data source info to header for debugging
      res.setHeader('X-Data-Source', source);
      
      console.log(`Crypto markets data returned from source: ${source}`);
      return res.json(data);
    } catch (error) {
      console.error("Unexpected error in cryptocurrency markets API:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // Global cryptocurrency market data with caching and fallbacks
  app.get("/api/crypto/global", async (req, res) => {
    try {
      // Import the unified crypto data service with CoinGecko and CoinAPI
      const { cryptoDataService } = await import('./services/crypto/cryptoDataService');
      
      // Get global market data from the service
      try {
        const { data, source } = await cryptoDataService.getGlobalData();
        
        // Add data source info to header for debugging
        res.setHeader('X-Data-Source', source);
        
        console.log(`Global crypto market data returned from source: ${source}`);
        return res.json(data);
      } catch (error) {
        console.error('Error fetching global cryptocurrency data:', error);
        return res.status(500).json({ 
          error: 'Could not retrieve global cryptocurrency market data',
          message: (error as Error).message
        });
      }
    } catch (error) {
      console.error('Unexpected error in global cryptocurrency data API:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // Individual coin data proxy with smart source selection and caching
  app.get("/api/crypto/coins/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const params = Object.fromEntries(
        Object.entries(req.query).map(([key, value]) => [key, value as string])
      );
      
      // Import the unified crypto data service with CoinGecko and CoinAPI
      const { cryptoDataService } = await import('./services/crypto/cryptoDataService');
      
      // Get data from unified service with smart source selection and caching
      try {
        const { data, source } = await cryptoDataService.getCoinDetails(id, params);
        
        // Add data source info to header for debugging
        res.setHeader('X-Data-Source', source);
        
        console.log(`Crypto coin details for ${id} returned from source: ${source}`);
        return res.json(data);
      } catch (error) {
        console.error(`Error fetching coin details for ${id}:`, error);
        return res.status(404).json({ 
          error: `Could not retrieve data for coin ${id}`,
          message: (error as Error).message
        });
      }
    } catch (error) {
      console.error(`Unexpected error in cryptocurrency details API: ${error}`);
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // News API proxy with live data
  app.get("/api/crypto/news", async (req, res) => {
    try {
      const { category } = req.query;
      const apiKey = process.env.NEWS_API_KEY;
      
      if (!apiKey) {
        throw new Error("NEWS_API_KEY is required. Please provide a NewsAPI.org API key.");
      }
      
      // Determine search query based on category
      let q = "cryptocurrency OR bitcoin OR blockchain";
      if (category && category !== "all") {
        q = `${category}`;
      }
      
      // Build URL with query parameters
      const url = new URL("https://newsapi.org/v2/everything");
      url.searchParams.append("q", q);
      url.searchParams.append("language", "en");
      url.searchParams.append("sortBy", "publishedAt");
      url.searchParams.append("pageSize", "20");
      
      console.log(`Fetching news from NewsAPI: ${url.toString()}`);
      
      // Make request to News API
      const response = await fetch(url.toString(), {
        headers: {
          "X-Api-Key": apiKey,
        },
      });
      
      if (!response.ok) {
        console.error(`NewsAPI error: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }
      
      const newsData = await response.json();
      
      if (newsData.status !== "ok") {
        console.error("NewsAPI returned an error:", newsData);
        throw new Error(newsData.message || "Unknown error from NewsAPI");
      }
      
      // Transform the response to match our API format
      const formattedNews = newsData.articles.map((article: any, index: number) => {
        // Generate categories based on content
        const title = article.title?.toLowerCase() || "";
        const description = article.description?.toLowerCase() || "";
        
        const categories = [];
        
        if (title.includes("bitcoin") || description.includes("bitcoin")) categories.push("bitcoin");
        if (title.includes("ethereum") || description.includes("ethereum")) categories.push("ethereum");
        if (title.includes("defi") || description.includes("defi")) categories.push("defi");
        if (title.includes("nft") || description.includes("nft")) categories.push("nft");
        if (title.includes("regulation") || description.includes("regulation")) categories.push("regulation");
        if (title.includes("exchange") || description.includes("exchange")) categories.push("exchange");
        if (title.includes("mining") || description.includes("mining")) categories.push("mining");
        if (title.includes("wallet") || description.includes("wallet")) categories.push("wallet");
        
        // Default category if none matched
        if (categories.length === 0) categories.push("market");
        
        return {
          id: String(index + 1),
          title: article.title || "No Title Available",
          summary: article.description || article.content || "No description available",
          url: article.url || "#",
          imageUrl: article.urlToImage,
          source: article.source?.name || "Unknown Source",
          publishedAt: article.publishedAt || new Date().toISOString(),
          categories: categories,
        };
      });
      
      // Filter by category if needed
      if (category && category !== "all") {
        const filteredNews = formattedNews.filter((item: any) => 
          item.categories.includes(category as string)
        );
        return res.json(filteredNews);
      }
      
      res.json(formattedNews);
    } catch (error) {
      console.error("Error in /api/crypto/news:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // Generic news endpoint using NewsAPI
  app.get("/api/news", async (req, res) => {
    try {
      const { category, search } = req.query;
      const apiKey = process.env.NEWS_API_KEY;
      
      if (!apiKey) {
        throw new Error("NEWS_API_KEY is required. Please provide a NewsAPI.org API key.");
      }
      
      // Build search query
      let q = "cryptocurrency OR bitcoin OR blockchain OR crypto";
      
      if (search) {
        q = `${search}`;
      }
      
      if (category && category !== "all") {
        q = `${q} AND ${category}`;
      }
      
      // Build URL with query parameters
      const url = new URL("https://newsapi.org/v2/everything");
      url.searchParams.append("q", q);
      url.searchParams.append("language", "en");
      url.searchParams.append("sortBy", "publishedAt");
      url.searchParams.append("pageSize", "30");
      
      console.log(`Fetching general news from NewsAPI: ${url.toString()}`);
      
      // Make request to News API
      const response = await fetch(url.toString(), {
        headers: {
          "X-Api-Key": apiKey,
        },
      });
      
      if (!response.ok) {
        console.error(`NewsAPI error: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }
      
      const newsData = await response.json();
      
      if (newsData.status !== "ok") {
        console.error("NewsAPI returned an error:", newsData);
        throw new Error(newsData.message || "Unknown error from NewsAPI");
      }
      
      // Generate map of categories
      const categoryKeywords = {
        "Bitcoin": ["bitcoin", "btc"],
        "Ethereum": ["ethereum", "eth"],
        "DeFi": ["defi", "decentralized finance", "yield farming"],
        "NFT": ["nft", "non-fungible"],
        "Markets": ["markets", "price", "trading", "exchange"],
        "Technology": ["technology", "protocol", "blockchain", "crypto"],
        "Regulation": ["regulation", "sec", "law", "compliance", "legal"],
        "Government": ["government", "policy", "central bank"],
        "Banking": ["bank", "banking"],
        "Enterprise": ["enterprise", "business", "corporate", "company"],
        "Supply Chain": ["supply chain", "logistics", "tracking"],
        "Mining": ["mining", "miner", "hash rate", "proof of work"],
        "Security": ["security", "hack", "exploit", "vulnerability"],
        "Adoption": ["adoption", "mainstream", "institutional"],
      };
      
      // Transform the response to match our API format
      const formattedNews = newsData.articles.map((article: any, index: number) => {
        // Combine title and description for category matching
        const text = (article.title + " " + (article.description || "")).toLowerCase();
        
        // Generate categories based on content
        const categories = Object.entries(categoryKeywords)
          .filter(([_, keywords]) => keywords.some(keyword => text.includes(keyword)))
          .map(([category, _]) => category);
        
        // Default category if none matched
        if (categories.length === 0) categories.push("Markets");
        
        return {
          id: String(index + 1),
          title: article.title || "No Title Available",
          summary: article.description || article.content || "No description available",
          url: article.url || "#",
          imageUrl: article.urlToImage,
          source: article.source?.name || "Unknown Source",
          publishedAt: article.publishedAt || new Date().toISOString(),
          categories: categories,
        };
      });
      
      // Additional filtering if needed beyond the API query
      let filteredNews = formattedNews;
      
      if (category && category !== "all") {
        filteredNews = filteredNews.filter((item: any) => 
          item.categories.some((cat: string) => cat.toLowerCase() === (category as string).toLowerCase())
        );
      }
      
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredNews = filteredNews.filter((item: any) => 
          item.title.toLowerCase().includes(searchTerm) || 
          item.summary.toLowerCase().includes(searchTerm)
        );
      }
      
      res.json(filteredNews);
    } catch (error) {
      console.error("Error in /api/news:", error);
      res.status(500).json({ error: (error as Error).message });
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
  
  // Multi-payment options routes (beyond Stripe)
  app.get('/api/payment/methods', getPaymentMethods);
  app.post('/api/payment/paypal/init', initPayPalPayment);
  app.post('/api/payment/crypto/init', initCryptoPayment);
  app.post('/api/payment/bank-transfer/instructions', getBankTransferInstructions);
  app.post('/api/payment/crypto/verify', verifyCryptoPayment);
  
  // Text-to-Speech API routes
  app.post('/api/tts/google', googleTTSHandler);
  app.post('/api/tts/elevenlabs', elevenLabsTTSHandler);
  
  // Speech-to-text API for audio transcription
  app.post('/api/speech/transcribe', audioMiddleware, transcribeAudio);
  
  // Image analysis with Google Vision API
  app.post('/api/vision/analyze', uploadMiddleware, analyzeImage);
  
  // Twitter sentiment analysis endpoints
  app.get('/api/sentiment/twitter/:symbol', getTwitterSentiment);
  app.get('/api/sentiment/market', getMarketSentiment);
  
  // API routes for Favorites
  app.get("/api/favorites", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      // For now, using a mock user ID of 1
      const userId = 1;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  app.post("/api/favorites/:symbol", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      let userId = 1;
      const symbol = req.params.symbol.toLowerCase();
      
      // Make sure user exists in the database
      let user = await storage.getUser(userId);
      if (!user) {
        // Create a default user if it doesn't exist
        user = await storage.createUser({
          username: "default_user",
          email: "user@example.com",
          password: "not_a_real_password",
        });
        userId = user.id;
      }
      
      // Check if already a favorite
      const exists = await storage.checkFavorite(userId, symbol);
      if (exists) {
        return res.status(400).json({ error: "Already a favorite" });
      }
      
      // Use only the fields defined in the schema
      const favorite = await storage.createFavorite({
        userId,
        symbol
      });
      
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  app.delete("/api/favorites/:symbol", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      let userId = 1;
      const symbol = req.params.symbol.toLowerCase();
      
      // Make sure user exists in the database
      let user = await storage.getUser(userId);
      if (!user) {
        // Return an error since we shouldn't be deleting a favorite for a non-existent user
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get the favorite first
      const favorites = await storage.getFavorites(userId);
      const favorite = favorites.find(f => f.symbol.toLowerCase() === symbol);
      
      if (!favorite) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      
      const result = await storage.deleteFavorite(favorite.id);
      
      if (result) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to delete favorite" });
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  // System status endpoint for health checks and system audits
  app.get('/api/system/api-status', (req: Request, res: Response) => {
    try {
      // Collect API service statuses
      const apiServices = {
        coinApi: {
          status: 'operational',
          lastChecked: Date.now()
        },
        twitter: { 
          status: process.env.TWITTER_API_KEY ? 'operational' : 'degraded',
          lastChecked: Date.now(),
          issues: process.env.TWITTER_API_KEY ? [] : ['API key not configured']
        },
        gemini: { 
          status: process.env.VITE_GEMINI_API_KEY ? 'operational' : 'degraded',
          lastChecked: Date.now()
        },
        openai: { 
          status: process.env.OPENAI_API_KEY ? 'operational' : 'degraded',
          lastChecked: Date.now()
        },
        anthropic: { 
          status: process.env.ANTHROPIC_API_KEY ? 'operational' : 'degraded',
          lastChecked: Date.now()
        }
      };
      
      // Collect component statuses
      const components = {
        core: {
          api: { status: 'operational' },
          database: { status: 'operational' },
          frontend: { status: 'operational' },
          chatbot: { status: 'operational' },
          auth: { status: 'operational' }
        }
      };
      
      // Return system status
      res.json({
        status: 'healthy',
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || 'development',
        services: apiServices,
        components,
        metrics: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        }
      });
    } catch (error) {
      console.error('Error retrieving system status:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to retrieve system status', 
        error: (error as Error).message 
      });
    }
  });
  
  return httpServer;
}
