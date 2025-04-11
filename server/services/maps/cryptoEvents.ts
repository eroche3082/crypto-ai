import { Request, Response } from 'express';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

// Define types for crypto events
interface CryptoEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    country: string;
  };
  website: string;
  type: 'conference' | 'meetup' | 'hackathon' | 'workshop' | 'other';
  tags: string[];
  isVirtual: boolean;
}

interface CryptoAdoption {
  country: string;
  countryCode: string;
  adoptionRate: number;
  legalStatus: 'legal' | 'illegal' | 'restricted' | 'regulated' | 'undefined';
  btcAtms: number;
  merchantAdoption: number;
  lat: number;
  lng: number;
}

// Cache data to minimize API calls
let eventsCache: CryptoEvent[] | null = null;
let adoptionCache: CryptoAdoption[] | null = null;
let eventsCacheTime = 0;
let adoptionCacheTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get cryptocurrency events worldwide
 */
export async function getCryptoEvents(req: Request, res: Response) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'Maps API key not found',
        message: 'Please set the GOOGLE_MAPS_API_KEY environment variable'
      });
    }

    // Check cache first
    const now = Date.now();
    if (eventsCache && (now - eventsCacheTime < CACHE_TTL)) {
      return res.json({
        events: eventsCache,
        source: 'cache'
      });
    }

    // For demonstration, we'll use a combination of sample data and real API calls
    // In production, you would call a real API like CoinMarketCal, Eventbrite, etc.
    
    // Sample static data (this would come from an API in production)
    const sampleEvents: CryptoEvent[] = [
      {
        id: '1',
        name: 'Bitcoin 2025 Conference',
        description: 'The world\'s largest Bitcoin conference',
        startDate: '2025-06-15',
        endDate: '2025-06-17',
        location: {
          name: 'Miami Beach Convention Center',
          address: '1901 Convention Center Dr, Miami Beach, FL 33139, USA',
          lat: 25.7950,
          lng: -80.1364,
          country: 'USA'
        },
        website: 'https://b.tc/conference',
        type: 'conference',
        tags: ['bitcoin', 'cryptocurrency', 'blockchain'],
        isVirtual: false
      },
      {
        id: '2',
        name: 'Ethereum Developer Summit',
        description: 'Conference for Ethereum developers and enthusiasts',
        startDate: '2025-04-20',
        endDate: '2025-04-22',
        location: {
          name: 'Ethereum Foundation',
          address: 'Zug, Switzerland',
          lat: 47.1662,
          lng: 8.5154,
          country: 'Switzerland'
        },
        website: 'https://ethereum.org/summit',
        type: 'conference',
        tags: ['ethereum', 'developers', 'blockchain'],
        isVirtual: false
      },
      {
        id: '3',
        name: 'DeFi Global Hackathon',
        description: 'Build the future of decentralized finance',
        startDate: '2025-05-01',
        endDate: '2025-05-03',
        location: {
          name: 'Virtual Event',
          address: 'Online',
          lat: 0,
          lng: 0,
          country: 'Global'
        },
        website: 'https://defi-hackathon.io',
        type: 'hackathon',
        tags: ['defi', 'hackathon', 'blockchain'],
        isVirtual: true
      },
      {
        id: '4',
        name: 'Crypto Asia Expo',
        description: 'Leading cryptocurrency event in Asia',
        startDate: '2025-07-10',
        endDate: '2025-07-12',
        location: {
          name: 'Singapore Expo',
          address: 'Singapore Expo, 1 Expo Dr, Singapore 486150',
          lat: 1.3352,
          lng: 103.9614,
          country: 'Singapore'
        },
        website: 'https://cryptoasiaexpo.com',
        type: 'conference',
        tags: ['cryptocurrency', 'blockchain', 'asia'],
        isVirtual: false
      },
      {
        id: '5',
        name: 'NFT London',
        description: 'Exhibition of NFT art and technology',
        startDate: '2025-08-15',
        endDate: '2025-08-17',
        location: {
          name: 'Olympia London',
          address: 'Hammersmith Rd, London W14 8UX, UK',
          lat: 51.4965,
          lng: -0.2108,
          country: 'UK'
        },
        website: 'https://nftlondon.io',
        type: 'conference',
        tags: ['nft', 'art', 'blockchain'],
        isVirtual: false
      }
    ];

    // In a real implementation, you would merge this with data from actual API calls
    // For demo purposes, we're using the sample data
    eventsCache = sampleEvents;
    eventsCacheTime = now;

    res.json({
      events: eventsCache,
      source: 'api'
    });
  } catch (error) {
    console.error('Error fetching crypto events:', error);
    res.status(500).json({
      error: 'Error fetching crypto events',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get global cryptocurrency adoption data
 */
export async function getCryptoAdoption(req: Request, res: Response) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'Maps API key not found',
        message: 'Please set the GOOGLE_MAPS_API_KEY environment variable'
      });
    }

    // Check cache first
    const now = Date.now();
    if (adoptionCache && (now - adoptionCacheTime < CACHE_TTL)) {
      return res.json({
        adoption: adoptionCache,
        source: 'cache'
      });
    }

    // Sample adoption data (this would come from an API in production)
    const sampleAdoption: CryptoAdoption[] = [
      {
        country: 'El Salvador',
        countryCode: 'SV',
        adoptionRate: 0.85,
        legalStatus: 'legal',
        btcAtms: 212,
        merchantAdoption: 0.65,
        lat: 13.7942,
        lng: -88.8965
      },
      {
        country: 'United States',
        countryCode: 'US',
        adoptionRate: 0.32,
        legalStatus: 'regulated',
        btcAtms: 34120,
        merchantAdoption: 0.28,
        lat: 37.0902,
        lng: -95.7129
      },
      {
        country: 'Switzerland',
        countryCode: 'CH',
        adoptionRate: 0.41,
        legalStatus: 'regulated',
        btcAtms: 145,
        merchantAdoption: 0.38,
        lat: 46.8182,
        lng: 8.2275
      },
      {
        country: 'Singapore',
        countryCode: 'SG',
        adoptionRate: 0.39,
        legalStatus: 'regulated',
        btcAtms: 24,
        merchantAdoption: 0.36,
        lat: 1.3521,
        lng: 103.8198
      },
      {
        country: 'Japan',
        countryCode: 'JP',
        adoptionRate: 0.24,
        legalStatus: 'legal',
        btcAtms: 92,
        merchantAdoption: 0.27,
        lat: 36.2048,
        lng: 138.2529
      },
      {
        country: 'China',
        countryCode: 'CN',
        adoptionRate: 0.12,
        legalStatus: 'restricted',
        btcAtms: 0,
        merchantAdoption: 0.05,
        lat: 35.8617,
        lng: 104.1954
      },
      {
        country: 'Ukraine',
        countryCode: 'UA',
        adoptionRate: 0.37,
        legalStatus: 'legal',
        btcAtms: 18,
        merchantAdoption: 0.19,
        lat: 48.3794,
        lng: 31.1656
      },
      {
        country: 'United Kingdom',
        countryCode: 'GB',
        adoptionRate: 0.29,
        legalStatus: 'regulated',
        btcAtms: 270,
        merchantAdoption: 0.22,
        lat: 55.3781,
        lng: -3.4360
      },
      {
        country: 'Germany',
        countryCode: 'DE',
        adoptionRate: 0.27,
        legalStatus: 'regulated',
        btcAtms: 95,
        merchantAdoption: 0.25,
        lat: 51.1657,
        lng: 10.4515
      },
      {
        country: 'Nigeria',
        countryCode: 'NG',
        adoptionRate: 0.42,
        legalStatus: 'regulated',
        btcAtms: 0,
        merchantAdoption: 0.18,
        lat: 9.0820,
        lng: 8.6753
      },
      {
        country: 'India',
        countryCode: 'IN',
        adoptionRate: 0.18,
        legalStatus: 'regulated',
        btcAtms: 2,
        merchantAdoption: 0.09,
        lat: 20.5937,
        lng: 78.9629
      },
      {
        country: 'Brazil',
        countryCode: 'BR',
        adoptionRate: 0.26,
        legalStatus: 'regulated',
        btcAtms: 25,
        merchantAdoption: 0.17,
        lat: -14.2350,
        lng: -51.9253
      }
    ];

    // In a real implementation, you would fetch from actual sources
    // For demo purposes, we're using sample data
    adoptionCache = sampleAdoption;
    adoptionCacheTime = now;

    res.json({
      adoption: adoptionCache,
      disclaimer: "This data is for demonstration purposes and should be updated with real API data in production.",
      source: 'api'
    });
  } catch (error) {
    console.error('Error fetching crypto adoption data:', error);
    res.status(500).json({
      error: 'Error fetching crypto adoption data',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Get merchant locations accepting crypto in a specific area
 */
export async function getCryptoMerchants(req: Request, res: Response) {
  try {
    const { lat, lng, radius = 10000 } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'Maps API key not found',
        message: 'Please set the GOOGLE_MAPS_API_KEY environment variable'
      });
    }

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing coordinates',
        message: 'Please provide latitude and longitude'
      });
    }

    // In a real implementation, you would call the Places API
    // For demo purposes, we'll generate some sample nearby merchants
    const merchantTypes = [
      'café', 'restaurant', 'hotel', 'shop', 'bar', 'gallery', 'tech store'
    ];
    
    const cryptocurrencies = [
      'Bitcoin', 'Ethereum', 'Bitcoin & Ethereum', 'Multiple cryptocurrencies'
    ];

    // Generate a predictable but seemingly random set of merchants based on coordinates
    const seed = parseFloat(lat as string) * parseFloat(lng as string);
    const merchantCount = Math.floor(Math.abs(Math.sin(seed) * 20)) + 5;
    
    const merchants = Array.from({ length: merchantCount }, (_, i) => {
      // Generate "random" values based on seed + index
      const seedVal = seed + i;
      const latOffset = (Math.sin(seedVal * 1.1) * 2 - 1) * (parseInt(radius as string) / 100000);
      const lngOffset = (Math.cos(seedVal * 1.2) * 2 - 1) * (parseInt(radius as string) / 100000);
      const typeIndex = Math.floor(Math.abs(Math.sin(seedVal * 3.3)) * merchantTypes.length);
      const cryptoIndex = Math.floor(Math.abs(Math.sin(seedVal * 4.4)) * cryptocurrencies.length);
      
      return {
        id: `merchant-${i}-${seedVal.toFixed(0)}`,
        name: `Crypto ${merchantTypes[typeIndex]} ${i + 1}`,
        type: merchantTypes[typeIndex],
        acceptedCrypto: cryptocurrencies[cryptoIndex],
        location: {
          lat: parseFloat(lat as string) + latOffset,
          lng: parseFloat(lng as string) + lngOffset,
          address: `${i + 1} Crypto Street, Blockchain City`
        },
        rating: Math.floor(Math.abs(Math.sin(seedVal * 5.5)) * 4) + 2, // 2-5 rating
        distance: Math.floor(Math.abs(Math.sin(seedVal * 6.6)) * parseInt(radius as string)),
      };
    });

    res.json({
      merchants,
      center: {
        lat: parseFloat(lat as string),
        lng: parseFloat(lng as string)
      },
      radius: parseInt(radius as string),
      disclaimer: "This data is for demonstration purposes and should be replaced with real merchant data in production."
    });
  } catch (error) {
    console.error('Error fetching crypto merchants:', error);
    res.status(500).json({
      error: 'Error fetching crypto merchants',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}