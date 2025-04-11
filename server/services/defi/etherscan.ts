import { Request, Response } from 'express';
import fetch from 'node-fetch';

// API base URL
const ETHERSCAN_API_BASE = 'https://api.etherscan.io/api';

// Cache to store recent responses
const apiCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache TTL

/**
 * Get Ethereum address information
 */
export async function getAddressInfo(req: Request, res: Response) {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        error: 'Missing address',
        message: 'Please provide an Ethereum address'
      });
    }
    
    const apiKey = process.env.ETHERSCAN_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing Etherscan API key',
        message: 'Please set the ETHERSCAN_API_KEY environment variable'
      });
    }
    
    // Create cache key based on address
    const cacheKey = `address-${address.toLowerCase()}`;
    
    // Check cache first
    const now = Date.now();
    if (apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        ...apiCache[cacheKey].data,
        source: 'cache'
      });
    }
    
    // Get ETH balance
    const balanceResponse = await fetch(
      `${ETHERSCAN_API_BASE}?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
    );
    
    if (!balanceResponse.ok) {
      throw new Error(`API request failed with status ${balanceResponse.status}: ${balanceResponse.statusText}`);
    }
    
    const balanceData = await balanceResponse.json();
    
    // Get transactions
    const txResponse = await fetch(
      `${ETHERSCAN_API_BASE}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`
    );
    
    if (!txResponse.ok) {
      throw new Error(`API request failed with status ${txResponse.status}: ${txResponse.statusText}`);
    }
    
    const txData = await txResponse.json();
    
    // Get token balances (ERC-20)
    const tokenResponse = await fetch(
      `${ETHERSCAN_API_BASE}?module=account&action=tokenbalance&address=${address}&tag=latest&apikey=${apiKey}`
    );
    
    if (!tokenResponse.ok) {
      throw new Error(`API request failed with status ${tokenResponse.status}: ${tokenResponse.statusText}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    // Format the response
    const formattedData = {
      address: address,
      ethBalance: {
        wei: balanceData.result,
        ether: parseFloat(balanceData.result) / 1e18
      },
      transactions: txData.result?.map((tx: any) => ({
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        timeStamp: tx.timeStamp,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        valueEth: parseFloat(tx.value) / 1e18,
        gasUsed: tx.gasUsed,
        isError: tx.isError === '1',
        txreceipt_status: tx.txreceipt_status,
        functionName: tx.functionName,
      })) || [],
      erc20Tokens: tokenData.result?.map((token: any) => ({
        tokenSymbol: token.tokenSymbol,
        tokenName: token.tokenName,
        contractAddress: token.contractAddress,
        balance: token.balance,
        tokenDecimal: token.tokenDecimal,
        balanceFormatted: parseFloat(token.balance) / Math.pow(10, parseInt(token.tokenDecimal))
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
    console.error('Error fetching Ethereum address info:', error);
    
    // Provide informative error for API key issues
    if (error.message?.includes('API Key Required') || error.message?.includes('Invalid API Key')) {
      return res.status(401).json({
        error: 'Invalid Etherscan API key',
        message: 'Please check your API key and make sure it is valid'
      });
    }
    
    res.status(500).json({
      error: 'Error fetching Ethereum address info',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get contract information
 */
export async function getContractInfo(req: Request, res: Response) {
  try {
    const { address } = req.params;
    
    if (!address) {
      return res.status(400).json({
        error: 'Missing contract address',
        message: 'Please provide a contract address'
      });
    }
    
    const apiKey = process.env.ETHERSCAN_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing Etherscan API key',
        message: 'Please set the ETHERSCAN_API_KEY environment variable'
      });
    }
    
    // Create cache key based on address
    const cacheKey = `contract-${address.toLowerCase()}`;
    
    // Check cache first
    const now = Date.now();
    if (apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp < CACHE_TTL)) {
      return res.json({
        ...apiCache[cacheKey].data,
        source: 'cache'
      });
    }
    
    // Get contract ABI
    const abiResponse = await fetch(
      `${ETHERSCAN_API_BASE}?module=contract&action=getabi&address=${address}&apikey=${apiKey}`
    );
    
    if (!abiResponse.ok) {
      throw new Error(`API request failed with status ${abiResponse.status}: ${abiResponse.statusText}`);
    }
    
    const abiData = await abiResponse.json();
    
    // Get contract source code
    const sourceResponse = await fetch(
      `${ETHERSCAN_API_BASE}?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`
    );
    
    if (!sourceResponse.ok) {
      throw new Error(`API request failed with status ${sourceResponse.status}: ${sourceResponse.statusText}`);
    }
    
    const sourceData = await sourceResponse.json();
    
    // Format the response
    const formattedData = {
      address: address,
      abi: abiData.result,
      sourceCode: sourceData.result?.[0]?.SourceCode || '',
      contractName: sourceData.result?.[0]?.ContractName || '',
      compilerVersion: sourceData.result?.[0]?.CompilerVersion || '',
      optimizationUsed: sourceData.result?.[0]?.OptimizationUsed === '1',
      runs: sourceData.result?.[0]?.Runs || '',
      constructorArguments: sourceData.result?.[0]?.ConstructorArguments || '',
      evmVersion: sourceData.result?.[0]?.EVMVersion || '',
      library: sourceData.result?.[0]?.Library || '',
      licenseType: sourceData.result?.[0]?.LicenseType || '',
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
    console.error('Error fetching contract info:', error);
    res.status(500).json({
      error: 'Error fetching contract info',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get gas price information
 */
export async function getGasPrice(req: Request, res: Response) {
  try {
    const apiKey = process.env.ETHERSCAN_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing Etherscan API key',
        message: 'Please set the ETHERSCAN_API_KEY environment variable'
      });
    }
    
    // Check cache first
    const cacheKey = 'gas-price';
    const now = Date.now();
    
    // Use a shorter TTL for gas price since it changes frequently
    const gasCache_TTL = 30 * 1000; // 30 seconds
    
    if (apiCache[cacheKey] && (now - apiCache[cacheKey].timestamp < gasCache_TTL)) {
      return res.json({
        ...apiCache[cacheKey].data,
        source: 'cache'
      });
    }
    
    // Get gas oracle data
    const gasResponse = await fetch(
      `${ETHERSCAN_API_BASE}?module=gastracker&action=gasoracle&apikey=${apiKey}`
    );
    
    if (!gasResponse.ok) {
      throw new Error(`API request failed with status ${gasResponse.status}: ${gasResponse.statusText}`);
    }
    
    const gasData = await gasResponse.json();
    
    // Format the response
    const formattedData = {
      safeGasPrice: gasData.result?.SafeGasPrice || '',
      proposeGasPrice: gasData.result?.ProposeGasPrice || '',
      fastGasPrice: gasData.result?.FastGasPrice || '',
      lastBlock: gasData.result?.LastBlock || '',
      suggestBaseFee: gasData.result?.suggestBaseFee || '',
      gasUsedRatio: gasData.result?.gasUsedRatio || '',
      timestamp: new Date().toISOString()
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
    console.error('Error fetching gas price:', error);
    res.status(500).json({
      error: 'Error fetching gas price',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}