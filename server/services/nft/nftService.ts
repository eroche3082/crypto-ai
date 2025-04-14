import { processSecret } from '../../secrets';

// Interfaces para datos NFT
export interface NFTCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  discordUrl?: string;
  twitterUsername?: string;
  externalUrl?: string;
  stats: NFTCollectionStats;
  traits?: Record<string, NFTTraitStats[]>;
  blockchain: string;  // 'ethereum', 'solana', etc.
  contractAddress?: string;
}

export interface NFTCollectionStats {
  floorPrice: number;  // En la moneda nativa (ETH, SOL, etc.)
  floorPriceUSD: number;
  volume24h: number;
  volume7d: number;
  volumeAllTime: number;
  averagePrice: number;
  numOwners: number;
  totalSupply: number;
  listedCount: number;
  marketCap?: number;
  updatedAt: string;
}

export interface NFTSale {
  id: string;
  tokenId: string;
  collectionId: string;
  price: number;
  priceUSD: number;
  seller: string;
  buyer: string;
  transactionHash: string;
  platform: string;  // 'opensea', 'blur', etc.
  timestamp: string;
}

export interface NFTHolderDistribution {
  topHolders: {
    address: string;
    count: number;
    percentage: number;
  }[];
  concentrationScore: number;  // 0-100, cuanto mayor, más concentrado
}

export interface NFTTraitStats {
  type: string;
  value: string;
  count: number;
  rarity: number;  // Porcentaje de NFTs que tienen este trait
}

export interface NFTRiskAssessment {
  score: number;  // 0-100, cuanto mayor, más riesgo
  level: 'Low' | 'Medium' | 'High' | 'Very High';
  factors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
}

export interface NFTPrediction {
  floorPricePrediction: {
    in7Days: number;
    in30Days: number;
  };
  volumePrediction: {
    in7Days: number;
    trend: 'up' | 'down' | 'stable';
    confidence: number;
  };
  analysis: string;
  updatedAt: string;
}

export interface NFTEvaluation {
  collection: NFTCollection;
  stats: NFTCollectionStats;
  holderDistribution?: NFTHolderDistribution;
  sales?: NFTSale[];
  riskAssessment: NFTRiskAssessment;
  prediction: NFTPrediction;
  socialSentiment?: {
    twitter: number;  // -100 a 100
    discord: number;  // -100 a 100
    overall: number;  // -100 a 100
    recentMentions: number;
  };
}

/**
 * Servicio para interactuar con APIs de NFT y proporcionar análisis
 * y predicciones de colecciones NFT utilizando IA
 */
export class NFTService {
  private openSeaApiKey: string;
  private raribleApiKey: string;
  private magicEdenApiKey: string;
  
  constructor() {
    this.openSeaApiKey = processSecret('OPENSEA_API_KEY', process.env.OPENSEA_API_KEY || '');
    this.raribleApiKey = processSecret('RARIBLE_API_KEY', process.env.RARIBLE_API_KEY || '');
    this.magicEdenApiKey = processSecret('MAGIC_EDEN_API_KEY', process.env.MAGIC_EDEN_API_KEY || '');
  }
  
  /**
   * Busca una colección NFT por nombre o dirección
   * @param query Nombre o dirección de la colección
   * @returns Información de la colección
   */
  async findCollection(query: string): Promise<NFTCollection | null> {
    try {
      // Intentar obtener de OpenSea primero
      const openSeaCollection = await this.getOpenSeaCollection(query);
      if (openSeaCollection) {
        return this.formatOpenSeaCollection(openSeaCollection);
      }
      
      // Si no se encuentra en OpenSea, intentar con Rarible
      const raribleCollection = await this.getRaribleCollection(query);
      if (raribleCollection) {
        return this.formatRaribleCollection(raribleCollection);
      }
      
      // Si no se encuentra en Rarible, intentar con Magic Eden (para Solana NFTs)
      const magicEdenCollection = await this.getMagicEdenCollection(query);
      if (magicEdenCollection) {
        return this.formatMagicEdenCollection(magicEdenCollection);
      }
      
      // No se encontró la colección en ninguna plataforma
      console.warn(`NFT collection not found for query: ${query}`);
      return null;
    } catch (error) {
      console.error('Error finding NFT collection:', error);
      return null;
    }
  }
  
  /**
   * Obtiene una evaluación completa de una colección NFT
   * @param collectionId ID de la colección o nombre/slug
   * @returns Evaluación completa de la colección
   */
  async evaluateCollection(collectionId: string): Promise<NFTEvaluation | null> {
    try {
      // Obtener la colección
      const collection = await this.findCollection(collectionId);
      if (!collection) {
        throw new Error(`Collection not found: ${collectionId}`);
      }
      
      // Obtener estadísticas actualizadas
      const stats = await this.getCollectionStats(collection.id);
      
      // Obtener distribución de holders
      const holderDistribution = await this.getHolderDistribution(collection.id);
      
      // Obtener ventas recientes
      const sales = await this.getRecentSales(collection.id);
      
      // Calcular evaluación de riesgo
      const riskAssessment = await this.assessRisk(collection, stats, holderDistribution);
      
      // Generar predicciones utilizando IA
      const prediction = await this.generatePrediction(collection, stats, sales);
      
      // Obtener sentimiento social (Twitter, Discord)
      const socialSentiment = await this.getSocialSentiment(collection);
      
      // Construir la evaluación completa
      return {
        collection,
        stats,
        holderDistribution,
        sales,
        riskAssessment,
        prediction,
        socialSentiment
      };
    } catch (error) {
      console.error('Error evaluating NFT collection:', error);
      return null;
    }
  }
  
  /**
   * Obtiene una colección de OpenSea por nombre o dirección
   */
  private async getOpenSeaCollection(query: string): Promise<any> {
    if (!this.openSeaApiKey) {
      console.warn('OpenSea API key not available');
      return null;
    }
    
    try {
      // Determinar si la consulta es una dirección o un nombre/slug
      const isAddress = query.startsWith('0x');
      const endpoint = isAddress
        ? `https://api.opensea.io/api/v1/asset_contract/${query}`
        : `https://api.opensea.io/api/v1/collection/${query.toLowerCase()}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'X-API-KEY': this.openSeaApiKey
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;  // Colección no encontrada
        }
        throw new Error(`OpenSea API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching from OpenSea:', error);
      return null;
    }
  }
  
  /**
   * Obtiene una colección de Rarible por nombre o dirección
   */
  private async getRaribleCollection(query: string): Promise<any> {
    if (!this.raribleApiKey) {
      console.warn('Rarible API key not available');
      return null;
    }
    
    try {
      // Implementación pendiente
      return null;
    } catch (error) {
      console.error('Error fetching from Rarible:', error);
      return null;
    }
  }
  
  /**
   * Obtiene una colección de Magic Eden por nombre o dirección
   */
  private async getMagicEdenCollection(query: string): Promise<any> {
    if (!this.magicEdenApiKey) {
      console.warn('Magic Eden API key not available');
      return null;
    }
    
    try {
      // Implementación pendiente
      return null;
    } catch (error) {
      console.error('Error fetching from Magic Eden:', error);
      return null;
    }
  }
  
  /**
   * Formatea los datos de una colección de OpenSea al formato interno
   */
  private formatOpenSeaCollection(openSeaData: any): NFTCollection {
    // Implementación simplificada, ajustar según la respuesta real de la API
    return {
      id: openSeaData.slug || openSeaData.collection.slug,
      name: openSeaData.name || openSeaData.collection.name,
      slug: openSeaData.slug || openSeaData.collection.slug,
      description: openSeaData.description || openSeaData.collection?.description,
      imageUrl: openSeaData.image_url || openSeaData.collection?.image_url,
      bannerImageUrl: openSeaData.banner_image_url || openSeaData.collection?.banner_image_url,
      discordUrl: openSeaData.discord_url || openSeaData.collection?.discord_url,
      twitterUsername: openSeaData.twitter_username || openSeaData.collection?.twitter_username,
      externalUrl: openSeaData.external_url || openSeaData.collection?.external_url,
      contractAddress: openSeaData.address || openSeaData.primary_asset_contracts?.[0]?.address,
      blockchain: 'ethereum',
      stats: {
        floorPrice: parseFloat(openSeaData.stats?.floor_price || '0'),
        floorPriceUSD: 0, // Convertir usando precio de ETH
        volume24h: parseFloat(openSeaData.stats?.one_day_volume || '0'),
        volume7d: parseFloat(openSeaData.stats?.seven_day_volume || '0'),
        volumeAllTime: parseFloat(openSeaData.stats?.total_volume || '0'),
        averagePrice: parseFloat(openSeaData.stats?.average_price || '0'),
        numOwners: parseInt(openSeaData.stats?.num_owners || '0'),
        totalSupply: parseInt(openSeaData.stats?.total_supply || '0'),
        listedCount: parseInt(openSeaData.stats?.listed_count || '0'),
        marketCap: parseFloat(openSeaData.stats?.market_cap || '0'),
        updatedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Formatea los datos de una colección de Rarible al formato interno
   */
  private formatRaribleCollection(raribleData: any): NFTCollection {
    // Implementación pendiente
    return {
      id: '',
      name: '',
      slug: '',
      blockchain: 'ethereum',
      stats: {
        floorPrice: 0,
        floorPriceUSD: 0,
        volume24h: 0,
        volume7d: 0,
        volumeAllTime: 0,
        averagePrice: 0,
        numOwners: 0,
        totalSupply: 0,
        listedCount: 0,
        updatedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Formatea los datos de una colección de Magic Eden al formato interno
   */
  private formatMagicEdenCollection(magicEdenData: any): NFTCollection {
    // Implementación pendiente
    return {
      id: '',
      name: '',
      slug: '',
      blockchain: 'solana',
      stats: {
        floorPrice: 0,
        floorPriceUSD: 0,
        volume24h: 0,
        volume7d: 0,
        volumeAllTime: 0,
        averagePrice: 0,
        numOwners: 0,
        totalSupply: 0,
        listedCount: 0,
        updatedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * Obtiene estadísticas actualizadas de una colección
   */
  private async getCollectionStats(collectionId: string): Promise<NFTCollectionStats> {
    // Implementación simplificada
    // En una implementación real, se obtendría de las APIs
    return {
      floorPrice: 10.5,
      floorPriceUSD: 19890.75,
      volume24h: 156.8,
      volume7d: 982.3,
      volumeAllTime: 45672.9,
      averagePrice: 12.3,
      numOwners: 5621,
      totalSupply: 10000,
      listedCount: 456,
      marketCap: 123450000,
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Obtiene la distribución de holders de una colección
   */
  private async getHolderDistribution(collectionId: string): Promise<NFTHolderDistribution> {
    // Implementación simplificada
    return {
      topHolders: [
        { address: '0x123...abc', count: 250, percentage: 2.5 },
        { address: '0x456...def', count: 180, percentage: 1.8 },
        { address: '0x789...ghi', count: 150, percentage: 1.5 },
        { address: '0xabc...123', count: 120, percentage: 1.2 },
        { address: '0xdef...456', count: 100, percentage: 1.0 },
      ],
      concentrationScore: 35
    };
  }
  
  /**
   * Obtiene ventas recientes de una colección
   */
  private async getRecentSales(collectionId: string): Promise<NFTSale[]> {
    // Implementación simplificada
    return [
      {
        id: 'sale1',
        tokenId: '1234',
        collectionId,
        price: 12.5,
        priceUSD: 23687.50,
        seller: '0xabc...123',
        buyer: '0xdef...456',
        transactionHash: '0x123...789',
        platform: 'opensea',
        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hora atrás
      },
      {
        id: 'sale2',
        tokenId: '5678',
        collectionId,
        price: 11.2,
        priceUSD: 21224.00,
        seller: '0xghi...789',
        buyer: '0xjkl...012',
        transactionHash: '0x456...012',
        platform: 'blur',
        timestamp: new Date(Date.now() - 7200000).toISOString() // 2 horas atrás
      }
    ];
  }
  
  /**
   * Evalúa el riesgo de una colección NFT
   */
  private async assessRisk(
    collection: NFTCollection,
    stats: NFTCollectionStats,
    holderDistribution?: NFTHolderDistribution
  ): Promise<NFTRiskAssessment> {
    // Implementación simplificada de evaluación de riesgo
    // En una implementación real, esto utilizaría algoritmos y ML
    
    // Calcular puntuación de riesgo basada en varios factores
    let riskScore = 50; // Punto medio
    
    // Volumen: más volumen = menos riesgo
    if (stats.volume24h > 100) riskScore -= 10;
    else if (stats.volume24h < 10) riskScore += 15;
    
    // Concentración de holders: mayor concentración = más riesgo
    if (holderDistribution && holderDistribution.concentrationScore > 60) riskScore += 20;
    else if (holderDistribution && holderDistribution.concentrationScore < 30) riskScore -= 15;
    
    // Proporción de listados: muchos listados vs supply = más riesgo
    const listingRatio = stats.listedCount / stats.totalSupply;
    if (listingRatio > 0.2) riskScore += 15;
    else if (listingRatio < 0.05) riskScore -= 10;
    
    // Determinar nivel de riesgo
    let riskLevel: 'Low' | 'Medium' | 'High' | 'Very High' = 'Medium';
    if (riskScore < 30) riskLevel = 'Low';
    else if (riskScore < 60) riskLevel = 'Medium';
    else if (riskScore < 80) riskLevel = 'High';
    else riskLevel = 'Very High';
    
    // Determinar factores que contribuyen al riesgo
    const factors = [];
    
    if (stats.volume24h < 10) {
      factors.push({
        factor: 'Low volume',
        impact: 'negative' as const,
        description: 'Low trading volume indicates poor liquidity'
      });
    } else if (stats.volume24h > 100) {
      factors.push({
        factor: 'High volume',
        impact: 'positive' as const,
        description: 'High trading volume indicates strong market interest'
      });
    }
    
    if (holderDistribution && holderDistribution.concentrationScore > 60) {
      factors.push({
        factor: 'High holder concentration',
        impact: 'negative' as const,
        description: 'A few wallets control a large percentage of the collection'
      });
    } else if (holderDistribution && holderDistribution.concentrationScore < 30) {
      factors.push({
        factor: 'Low holder concentration',
        impact: 'positive' as const,
        description: 'Well-distributed ownership across many holders'
      });
    }
    
    if (listingRatio > 0.2) {
      factors.push({
        factor: 'High listing ratio',
        impact: 'negative' as const,
        description: 'Many owners are trying to sell, potential sell pressure'
      });
    } else if (listingRatio < 0.05) {
      factors.push({
        factor: 'Low listing ratio',
        impact: 'positive' as const,
        description: 'Few owners are selling, indicating strong holding sentiment'
      });
    }
    
    return {
      score: riskScore,
      level: riskLevel,
      factors
    };
  }
  
  /**
   * Genera predicciones para una colección NFT usando IA
   */
  private async generatePrediction(
    collection: NFTCollection,
    stats: NFTCollectionStats,
    sales?: NFTSale[]
  ): Promise<NFTPrediction> {
    // Implementación simplificada
    // En una implementación real, utilizaría modelos de ML o Vertex AI
    
    // Calcular predicciones simples basadas en tendencias recientes
    const priceChange = stats.floorPrice / (stats.averagePrice || stats.floorPrice) - 1;
    const volumeChange = stats.volume24h / (stats.volume7d / 7) - 1;
    
    // Predecir el precio del floor en 7 días con un modelo simple
    const predictedFloorPrice7Days = stats.floorPrice * (1 + priceChange * 3);
    const predictedFloorPrice30Days = stats.floorPrice * (1 + priceChange * 8);
    
    // Predecir tendencia de volumen
    let volumeTrend: 'up' | 'down' | 'stable' = 'stable';
    if (volumeChange > 0.1) volumeTrend = 'up';
    else if (volumeChange < -0.1) volumeTrend = 'down';
    
    const predictedVolume7Days = stats.volume24h * 7 * (1 + volumeChange * 2);
    
    // Generar análisis
    let analysis = '';
    if (priceChange > 0.05 && volumeTrend === 'up') {
      analysis = `${collection.name} is showing strong bullish signals with increasing floor price and growing trading volume. This suggests increasing market interest and potential for further growth.`;
    } else if (priceChange < -0.05 && volumeTrend === 'down') {
      analysis = `${collection.name} is experiencing bearish pressure with decreasing floor price and declining trading volume. This suggests reduced market interest and potential for further downside.`;
    } else {
      analysis = `${collection.name} is showing relatively stable metrics with moderate fluctuations in floor price and trading volume. The collection appears to be in a consolidation phase.`;
    }
    
    return {
      floorPricePrediction: {
        in7Days: predictedFloorPrice7Days,
        in30Days: predictedFloorPrice30Days
      },
      volumePrediction: {
        in7Days: predictedVolume7Days,
        trend: volumeTrend,
        confidence: 0.7 // Confianza moderada
      },
      analysis,
      updatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Obtiene el sentimiento social para una colección NFT
   */
  private async getSocialSentiment(collection: NFTCollection): Promise<NFTEvaluation['socialSentiment']> {
    // Implementación simplificada
    return {
      twitter: 65, // Sentimiento positivo en Twitter
      discord: 58, // Sentimiento positivo en Discord
      overall: 62, // Sentimiento general positivo
      recentMentions: 245 // Menciones recientes
    };
  }
  
  /**
   * Genera un resumen de texto de la evaluación para chatbot
   */
  public generateChatSummary(evaluation: NFTEvaluation): string {
    const { collection, stats, riskAssessment, prediction } = evaluation;
    
    // Formato de precio y cambio porcentual
    const priceChange = stats.floorPrice / (stats.averagePrice || stats.floorPrice) - 1;
    const priceChangeText = priceChange >= 0 
      ? `up ${(priceChange * 100).toFixed(1)}%` 
      : `down ${(Math.abs(priceChange) * 100).toFixed(1)}%`;
    
    // Construir resumen
    let summary = `${collection.name} is currently trading at a floor of ${stats.floorPrice.toFixed(2)} ETH, `;
    summary += `${priceChangeText} in the past 24h. `;
    
    // Añadir información de volumen
    if (stats.volume24h > 50) {
      summary += `Sales volume remains high (${stats.volume24h.toFixed(1)} ETH in 24h). `;
    } else if (stats.volume24h > 10) {
      summary += `Sales volume is moderate (${stats.volume24h.toFixed(1)} ETH in 24h). `;
    } else {
      summary += `Sales volume is low (${stats.volume24h.toFixed(1)} ETH in 24h). `;
    }
    
    // Añadir información de riesgo
    summary += `Risk level: ${riskAssessment.level}. `;
    
    // Añadir una predicción destacada
    if (prediction.floorPricePrediction.in7Days > stats.floorPrice * 1.1) {
      summary += `AI predicts a potential rise to ${prediction.floorPricePrediction.in7Days.toFixed(2)} ETH in the next 7 days. `;
    } else if (prediction.floorPricePrediction.in7Days < stats.floorPrice * 0.9) {
      summary += `AI predicts a potential drop to ${prediction.floorPricePrediction.in7Days.toFixed(2)} ETH in the next 7 days. `;
    } else {
      summary += `AI predicts a stable floor price around ${prediction.floorPricePrediction.in7Days.toFixed(2)} ETH in the next 7 days. `;
    }
    
    // Añadir pregunta interactiva
    summary += `Want to track this collection or get more detailed analytics?`;
    
    return summary;
  }
}