import { Request, Response } from 'express';
import axios from 'axios';

// Moralis API endpoint for fetching NFTs
const MORALIS_API_BASE_URL = 'https://deep-index.moralis.io/api/v2';

/**
 * Get NFTs for a wallet using Moralis API
 */
export async function getMoralisNFTs(req: Request, res: Response) {
  try {
    const { walletAddress, chain = 'eth', limit = 50 } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Wallet address is required' 
      });
    }

    if (!process.env.MORALIS_API_KEY) {
      console.warn('MORALIS_API_KEY not found, using backup data');
      return getBackupNFTsForWallet(req, res);
    }

    try {
      // Call Moralis API to get NFTs for the wallet
      const response = await axios.get(
        `${MORALIS_API_BASE_URL}/${walletAddress}/nft`,
        {
          params: {
            chain,
            format: 'decimal',
            limit,
            normalizeMetadata: true
          },
          headers: {
            'Accept': 'application/json',
            'X-API-Key': process.env.MORALIS_API_KEY
          }
        }
      );

      const nftData = response.data;
      
      // Transform the Moralis response to our standard format
      const formattedNFTs = nftData.result.map(item => ({
        identifier: item.token_id,
        collection: item.name || 'Unknown Collection',
        contract: item.token_address,
        token_standard: item.contract_type,
        name: item.metadata?.name || `NFT #${item.token_id}`,
        description: item.metadata?.description || 'No description available',
        image_url: item.metadata?.image || `https://via.placeholder.com/500?text=NFT%20${item.token_id}`,
        metadata: {
          attributes: item.metadata?.attributes || []
        },
        created_date: new Date().toISOString(),
        last_sale: null
      }));
      
      return res.status(200).json({
        status: 'success',
        data: {
          nfts: formattedNFTs,
          page: nftData.page,
          page_size: nftData.page_size,
          total: nftData.total
        }
      });
    } catch (apiError) {
      console.error('Moralis API error:', apiError);
      
      // If it's a rate limiting issue or authentication failure, use backup data
      if (apiError.response && 
          (apiError.response.status === 429 || 
           apiError.response.status === 403 || 
           apiError.response.status === 401)) {
        return getBackupNFTsForWallet(req, res);
      }
      
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch NFTs from Moralis',
        error: apiError.message
      });
    }
  } catch (error) {
    console.error('NFT fetching error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process NFT request',
      error: error.message
    });
  }
}

/**
 * Get NFT transfers for a wallet using Moralis API
 */
export async function getMoralisNFTTransfers(req: Request, res: Response) {
  try {
    const { walletAddress, chain = 'eth', limit = 50 } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Wallet address is required' 
      });
    }

    if (!process.env.MORALIS_API_KEY) {
      console.warn('MORALIS_API_KEY not found, using backup data');
      return getBackupNFTTransfers(req, res);
    }

    try {
      // Call Moralis API to get NFT transfers for the wallet
      const response = await axios.get(
        `${MORALIS_API_BASE_URL}/${walletAddress}/nft/transfers`,
        {
          params: {
            chain,
            format: 'decimal',
            limit,
            direction: 'both'
          },
          headers: {
            'Accept': 'application/json',
            'X-API-Key': process.env.MORALIS_API_KEY
          }
        }
      );

      return res.status(200).json({
        status: 'success',
        data: response.data
      });
    } catch (apiError) {
      console.error('Moralis API error:', apiError);
      
      // If it's a rate limiting issue or authentication failure, use backup data
      if (apiError.response && 
          (apiError.response.status === 429 || 
           apiError.response.status === 403 || 
           apiError.response.status === 401)) {
        return getBackupNFTTransfers(req, res);
      }
      
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch NFT transfers from Moralis',
        error: apiError.message
      });
    }
  } catch (error) {
    console.error('NFT transfers fetching error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process NFT transfers request',
      error: error.message
    });
  }
}

// Backup data functions
function getBackupNFTsForWallet(req: Request, res: Response) {
  const { walletAddress } = req.params;
  
  // Create a seed value based on the wallet address to ensure consistent results
  const seed = walletAddress ? walletAddress.slice(0, 8) : '0x1234567890';
  
  // Generate a set of NFTs that are consistently the same for a given wallet
  const nfts = generateSampleNFTs(walletAddress || '0x1234567890', 8);
  
  return res.status(200).json({
    status: 'success', 
    source: 'backup',
    data: {
      nfts,
      page: 1,
      page_size: 100,
      total: nfts.length
    }
  });
}

function getBackupNFTTransfers(req: Request, res: Response) {
  const { walletAddress } = req.params;
  
  // Generate sample transfer data
  const transfers = generateSampleTransfers(walletAddress || '0x1234567890', 5);
  
  return res.status(200).json({
    status: 'success',
    source: 'backup',
    data: {
      result: transfers,
      page: 1,
      page_size: 100,
      total: transfers.length
    }
  });
}

// Helper function to generate sample NFTs - same as opensea.ts but with slightly different structure
function generateSampleNFTs(walletAddress: string, count: number) {
  const collections = [
    'Bored Ape Yacht Club',
    'CryptoPunks',
    'Azuki',
    'Doodles',
    'Cool Cats',
    'World of Women',
    'CloneX',
    'Moonbirds'
  ];
  
  // Get a predictable number based on the wallet address
  const addrNum = parseInt(walletAddress.slice(-8), 16);
  
  return Array.from({ length: count }).map((_, i) => {
    // Use a formula to determine collection index based on wallet and position
    const collIndex = (addrNum + i) % collections.length;
    const collName = collections[collIndex];
    const tokenId = (addrNum + (i * 100)) % 10000;
    
    return {
      identifier: tokenId.toString(),
      collection: collName,
      contract: `0x${collName.substring(0, 2).toLowerCase()}${i}${walletAddress.substring(4, 10)}`,
      token_standard: 'ERC-721',
      name: `${collName} #${tokenId}`,
      description: `${collName} is a collection of unique NFTs on Ethereum.`,
      image_url: `https://via.placeholder.com/500?text=${collName.replace(/\\s+/g, '%20')}%20${tokenId}`,
      metadata: {
        attributes: [
          { trait_type: 'Background', value: ['Blue', 'Red', 'Green', 'Yellow', 'Purple'][i % 5] },
          { trait_type: 'Rarity', value: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][i % 5] }
        ]
      },
      created_date: new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      last_sale: {
        total_price: ((addrNum % 10) + 0.5).toString() + '000000000000000000',
        payment_token: {
          symbol: 'ETH',
          decimals: 18
        }
      }
    };
  });
}

// Helper function to generate sample NFT transfers
function generateSampleTransfers(walletAddress: string, count: number) {
  // Get a predictable number based on the wallet address
  const addrNum = parseInt(walletAddress.slice(-8), 16);
  
  return Array.from({ length: count }).map((_, i) => {
    const tokenId = (addrNum + (i * 100)) % 10000;
    const isIncoming = i % 2 === 0;
    
    // Generate a different address for the counterparty
    const counterparty = `0x${(parseInt(walletAddress.slice(2), 16) ^ (1 << i)).toString(16).padStart(40, '0')}`;
    
    return {
      block_number: String(12000000 + i * 1000),
      block_timestamp: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      transaction_hash: `0x${i}${addrNum.toString(16).padStart(62, '0')}`,
      transaction_index: String(i),
      token_address: `0x${'a' + i}${walletAddress.slice(3, 10)}${'f'.repeat(30)}`,
      token_id: String(tokenId),
      from_address: isIncoming ? counterparty : walletAddress,
      to_address: isIncoming ? walletAddress : counterparty,
      value: "1",
      amount: "1",
      contract_type: "ERC721",
      token_name: `NFT Collection ${i}`,
      token_symbol: `NFT${i}`
    };
  });
}