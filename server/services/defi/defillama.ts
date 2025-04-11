import { Request, Response } from 'express';
import fetch from 'node-fetch';

// API base URL
const DEFILLAMA_API_BASE = 'https://api.llama.fi';
const DEFILLAMA_YIELDS_API_BASE = 'https://yields.llama.fi';

// Cache to store recent responses
const apiCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache TTL

/**
 * Get DeFi protocol information
 */
export async function getProtocolInfo(req: Request, res: Response) {
  try {
    const { protocol } = req.params;
    
    if (!protocol) {
      return res.status(400).json({
        error: 'Missing protocol',
        message: 'Please provide a protocol slug'
      });
    }
    
    // Create cache key
    const cacheKey = `protocol-${protocol}`;
    
    // Check cache first
    const now = Date.now();
    if (apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        ...apiCache[cacheKey].data,
        source: 'cache'
      });
    }
    
    // Get protocol data
    const response = await fetch(`${DEFILLAMA_API_BASE}/protocol/${protocol}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format the response
    const formattedData = {
      name: data.name,
      address: data.address,
      symbol: data.symbol,
      url: data.url,
      description: data.description,
      chain: data.chain,
      logo: data.logo,
      audits: data.audits,
      audit_links: data.audit_links,
      category: data.category,
      tvl: data.tvl,
      tokenBreakdowns: data.tokenBreakdowns || {},
      currentChainTvls: data.currentChainTvls || {},
      chains: data.chains || [],
      tvlList: data.tvlList?.map((item: any) => ({
        date: item.date,
        totalLiquidityUSD: item.totalLiquidityUSD,
      })) || [],
      lastUpdated: new Date().toISOString()
    };
    
    // Update cache
    apiCache[cacheKey] = {
      data: formattedData,
      timestamp: now
    };
    
    res.json({
      ...formattedData,
      source: 'api'
    });
  } catch (error) {
    console.error('Error fetching protocol info:', error);
    res.status(500).json({
      error: 'Error fetching protocol info',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get top DeFi protocols
 */
export async function getTopProtocols(req: Request, res: Response) {
  try {
    const { limit = 25 } = req.query;
    
    // Create cache key
    const cacheKey = `top-protocols-${limit}`;
    
    // Check cache first
    const now = Date.now();
    if (apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        ...apiCache[cacheKey].data,
        source: 'cache'
      });
    }
    
    // Get protocols data
    const response = await fetch(`${DEFILLAMA_API_BASE}/protocols`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Sort by TVL and limit
    const sortedProtocols = [...data]
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, parseInt(limit as string));
    
    // Format the response
    const formattedData = {
      protocols: sortedProtocols.map(protocol => ({
        name: protocol.name,
        symbol: protocol.symbol,
        category: protocol.category,
        logo: protocol.logo,
        slug: protocol.slug,
        tvl: protocol.tvl,
        change_1h: protocol.change_1h,
        change_1d: protocol.change_1d,
        change_7d: protocol.change_7d,
        chains: protocol.chains
      })),
      count: sortedProtocols.length,
      lastUpdated: new Date().toISOString()
    };
    
    // Update cache
    apiCache[cacheKey] = {
      data: formattedData,
      timestamp: now
    };
    
    res.json({
      ...formattedData,
      source: 'api'
    });
  } catch (error) {
    console.error('Error fetching top protocols:', error);
    res.status(500).json({
      error: 'Error fetching top protocols',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get top yield opportunities
 */
export async function getTopYields(req: Request, res: Response) {
  try {
    const { chain = 'all', minTvl = 1000000 } = req.query;
    
    // Create cache key
    const cacheKey = `yields-${chain}-${minTvl}`;
    
    // Check cache first
    const now = Date.now();
    if (apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        ...apiCache[cacheKey].data,
        source: 'cache'
      });
    }
    
    // Get yields data
    const response = await fetch(`${DEFILLAMA_YIELDS_API_BASE}/pools`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter by chain and TVL
    let filteredYields = data.filter((pool: any) => 
      pool.tvlUsd >= parseInt(minTvl as string)
    );
    
    if (chain !== 'all') {
      filteredYields = filteredYields.filter((pool: any) => 
        pool.chain.toLowerCase() === (chain as string).toLowerCase()
      );
    }
    
    // Sort by APY (descending)
    filteredYields.sort((a: any, b: any) => b.apy - a.apy);
    
    // Take top 50
    filteredYields = filteredYields.slice(0, 50);
    
    // Format the response
    const formattedData = {
      pools: filteredYields.map((pool: any) => ({
        pool: pool.pool,
        symbol: pool.symbol,
        chain: pool.chain,
        project: pool.project,
        tvlUsd: pool.tvlUsd,
        apy: pool.apy,
        apyBase: pool.apyBase,
        apyReward: pool.apyReward,
        rewardTokens: pool.rewardTokens,
        il7d: pool.il7d,
        stackingType: pool.stackingType || "unknown",
        underlyingTokens: pool.underlyingTokens
      })),
      count: filteredYields.length,
      chain: chain,
      minTvl: minTvl,
      lastUpdated: new Date().toISOString()
    };
    
    // Update cache
    apiCache[cacheKey] = {
      data: formattedData,
      timestamp: now
    };
    
    res.json({
      ...formattedData,
      source: 'api'
    });
  } catch (error) {
    console.error('Error fetching top yields:', error);
    res.status(500).json({
      error: 'Error fetching top yields',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get chain TVL information
 */
export async function getChainTVL(req: Request, res: Response) {
  try {
    const { chain } = req.params;
    
    if (!chain) {
      return res.status(400).json({
        error: 'Missing chain',
        message: 'Please provide a chain name'
      });
    }
    
    // Create cache key
    const cacheKey = `chain-tvl-${chain}`;
    
    // Check cache first
    const now = Date.now();
    if (apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        ...apiCache[cacheKey].data,
        source: 'cache'
      });
    }
    
    // Get chain TVL data
    const response = await fetch(`${DEFILLAMA_API_BASE}/v2/historicalChainTvl/${chain}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format the response
    const formattedData = {
      chain: chain,
      tvl: data.tvl?.map((item: any) => ({
        date: item.date,
        tvl: item.totalLiquidityUSD,
      })) || [],
      currentTvl: data.tvl?.length ? data.tvl[data.tvl.length - 1].totalLiquidityUSD : 0,
      lastUpdated: new Date().toISOString()
    };
    
    // Update cache
    apiCache[cacheKey] = {
      data: formattedData,
      timestamp: now
    };
    
    res.json({
      ...formattedData,
      source: 'api'
    });
  } catch (error) {
    console.error('Error fetching chain TVL:', error);
    res.status(500).json({
      error: 'Error fetching chain TVL',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}