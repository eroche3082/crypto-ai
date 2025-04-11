import { Request, Response } from 'express';
import fetch from 'node-fetch';

// API base URL
const WHALE_ALERT_API_BASE = 'https://api.whale-alert.io/v1';

// Cache to store recent responses
const apiCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Get recent large transactions (whale movements)
 */
export async function getWhaleTransactions(req: Request, res: Response) {
  try {
    const { min_value = 5000000, currency = 'usd', limit = 10 } = req.query;
    const apiKey = process.env.WHALE_ALERT_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing Whale Alert API key',
        message: 'Please set the WHALE_ALERT_API_KEY environment variable'
      });
    }
    
    // Create cache key based on parameters
    const cacheKey = `whale-${min_value}-${currency}-${limit}`;
    
    // Check cache first
    const now = Date.now();
    if (apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        ...apiCache[cacheKey].data,
        source: 'cache'
      });
    }
    
    // Calculate time range (last 24 hours)
    const end = Math.floor(Date.now() / 1000);
    const start = end - (24 * 60 * 60); // 24 hours ago
    
    // Make request to Whale Alert API
    const response = await fetch(
      `${WHALE_ALERT_API_BASE}/transactions?api_key=${apiKey}&min_value=${min_value}&currency=${currency}&limit=${limit}&start=${start}&end=${end}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Process and format the transactions
    const formattedData = {
      count: data.count || 0,
      transactions: data.transactions?.map((tx: any) => ({
        id: tx.hash,
        timestamp: tx.timestamp,
        date: new Date(tx.timestamp * 1000).toISOString(),
        blockchain: tx.blockchain,
        from: {
          address: tx.from.address,
          owner: tx.from.owner || 'Unknown',
          ownerType: tx.from.owner_type || 'unknown'
        },
        to: {
          address: tx.to.address,
          owner: tx.to.owner || 'Unknown',
          ownerType: tx.to.owner_type || 'unknown'
        },
        symbol: tx.symbol,
        amount: tx.amount,
        amountUsd: tx.amount_usd,
        transactionType: tx.transaction_type
      })) || []
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
    console.error('Error fetching whale transactions:', error);
    
    // Provide informative error for API key issues
    if (error.message?.includes('401')) {
      return res.status(401).json({
        error: 'Invalid Whale Alert API key',
        message: 'Please check your API key and make sure it is valid'
      });
    }
    
    res.status(500).json({
      error: 'Error fetching whale transactions',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get blockchain status information
 */
export async function getBlockchainStatus(req: Request, res: Response) {
  try {
    const apiKey = process.env.WHALE_ALERT_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing Whale Alert API key',
        message: 'Please set the WHALE_ALERT_API_KEY environment variable'
      });
    }
    
    // Check cache first
    const cacheKey = 'blockchain-status';
    const now = Date.now();
    if (apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        ...apiCache[cacheKey].data,
        source: 'cache'
      });
    }
    
    // Make request to Whale Alert API
    const response = await fetch(
      `${WHALE_ALERT_API_BASE}/status?api_key=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format the response
    const formattedData = {
      blockchains: data.blockchains?.map((blockchain: any) => ({
        name: blockchain.name,
        symbol: blockchain.symbol,
        supported: blockchain.supported,
        lastBlock: blockchain.last_block,
        lastTransaction: blockchain.last_transaction
      })) || []
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
    console.error('Error fetching blockchain status:', error);
    res.status(500).json({
      error: 'Error fetching blockchain status',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get statistical information about whale movements
 */
export async function getWhaleStats(req: Request, res: Response) {
  try {
    const { period = '24h' } = req.query; // 24h, 7d, 30d
    const now = Date.now();
    
    // Create cache key based on parameters
    const cacheKey = `whale-stats-${period}`;
    
    // Check cache first
    if (apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        ...apiCache[cacheKey].data,
        source: 'cache'
      });
    }
    
    // Since we don't have a specific endpoint for this, we calculate this
    // based on the regular transactions data
    const end = Math.floor(now / 1000);
    let start: number;
    
    // Determine period in seconds
    switch (period) {
      case '7d':
        start = end - (7 * 24 * 60 * 60);
        break;
      case '30d':
        start = end - (30 * 24 * 60 * 60);
        break;
      default: // 24h
        start = end - (24 * 60 * 60);
        break;
    }
    
    // Fetch transaction data (requires API key)
    const apiKey = process.env.WHALE_ALERT_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing Whale Alert API key',
        message: 'Please set the WHALE_ALERT_API_KEY environment variable'
      });
    }
    
    const response = await fetch(
      `${WHALE_ALERT_API_BASE}/transactions?api_key=${apiKey}&min_value=1000000&currency=usd&limit=100&start=${start}&end=${end}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Calculate statistics from the transactions
    const transactions = data.transactions || [];
    
    // Group transactions by blockchain and symbol
    const blockchainStats: Record<string, { totalValue: number, count: number }> = {};
    const symbolStats: Record<string, { totalValue: number, count: number }> = {};
    let totalValueAllTransactions = 0;
    
    transactions.forEach((tx: any) => {
      // Add to blockchain stats
      if (!blockchainStats[tx.blockchain]) {
        blockchainStats[tx.blockchain] = { totalValue: 0, count: 0 };
      }
      blockchainStats[tx.blockchain].totalValue += tx.amount_usd;
      blockchainStats[tx.blockchain].count += 1;
      
      // Add to symbol stats
      if (!symbolStats[tx.symbol]) {
        symbolStats[tx.symbol] = { totalValue: 0, count: 0 };
      }
      symbolStats[tx.symbol].totalValue += tx.amount_usd;
      symbolStats[tx.symbol].count += 1;
      
      // Add to total
      totalValueAllTransactions += tx.amount_usd;
    });
    
    // Format the stats
    const formattedStats = {
      period: period,
      totalTransactions: transactions.length,
      totalValueUsd: totalValueAllTransactions,
      blockchains: Object.entries(blockchainStats).map(([name, stats]) => ({
        name,
        totalValueUsd: stats.totalValue,
        transactionCount: stats.count,
        percentageOfTotal: (stats.totalValue / totalValueAllTransactions) * 100
      })),
      symbols: Object.entries(symbolStats).map(([symbol, stats]) => ({
        symbol,
        totalValueUsd: stats.totalValue,
        transactionCount: stats.count,
        percentageOfTotal: (stats.totalValue / totalValueAllTransactions) * 100
      })),
      startTime: new Date(start * 1000).toISOString(),
      endTime: new Date(end * 1000).toISOString()
    };
    
    // Update cache
    apiCache[cacheKey] = {
      data: formattedStats,
      timestamp: now
    };
    
    res.json({
      ...formattedStats,
      source: 'api'
    });
  } catch (error) {
    console.error('Error calculating whale stats:', error);
    res.status(500).json({
      error: 'Error calculating whale stats',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}