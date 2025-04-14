import { Request, Response } from 'express';
import { NFTService } from './nftService';

// Instancia del servicio NFT
const nftService = new NFTService();

/**
 * Controlador para los endpoints relacionados con NFTs
 */
export const nftController = {
  /**
   * Busca una colección NFT por nombre, slug o dirección
   */
  async findCollection(req: Request, res: Response) {
    try {
      const { query } = req.params;
      
      if (!query) {
        return res.status(400).json({ 
          success: false, 
          message: 'Collection name or address is required' 
        });
      }
      
      const collection = await nftService.findCollection(query);
      
      if (!collection) {
        return res.status(404).json({ 
          success: false, 
          message: `Collection not found: ${query}` 
        });
      }
      
      res.json({
        success: true,
        collection
      });
    } catch (error) {
      console.error('Error finding NFT collection:', error);
      res.status(500).json({ 
        success: false, 
        message: `Error finding NFT collection: ${(error as Error).message}`
      });
    }
  },
  
  /**
   * Evalúa una colección NFT
   */
  async evaluateCollection(req: Request, res: Response) {
    try {
      const { collectionId } = req.params;
      
      if (!collectionId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Collection ID is required' 
        });
      }
      
      const evaluation = await nftService.evaluateCollection(collectionId);
      
      if (!evaluation) {
        return res.status(404).json({ 
          success: false, 
          message: `Failed to evaluate collection: ${collectionId}` 
        });
      }
      
      // Generar resumen para chatbot
      const chatSummary = nftService.generateChatSummary(evaluation);
      
      res.json({
        success: true,
        evaluation,
        chatSummary
      });
    } catch (error) {
      console.error('Error evaluating NFT collection:', error);
      res.status(500).json({ 
        success: false, 
        message: `Error evaluating NFT collection: ${(error as Error).message}`
      });
    }
  },
  
  /**
   * Obtiene las estadísticas de una colección NFT (endpoint simplificado para consultas de chatbot)
   */
  async getCollectionStats(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      
      if (!slug) {
        return res.status(400).json({ 
          success: false, 
          message: 'Collection slug is required' 
        });
      }
      
      // Obtener colección
      const collection = await nftService.findCollection(slug);
      
      if (!collection) {
        return res.status(404).json({ 
          success: false, 
          message: `Collection not found: ${slug}` 
        });
      }
      
      // Obtener evaluación completa
      const evaluation = await nftService.evaluateCollection(slug);
      
      if (!evaluation) {
        return res.status(404).json({ 
          success: false, 
          message: `Failed to evaluate collection: ${slug}` 
        });
      }
      
      // Para solicitudes simples desde el chatbot, devolver un formato más condensado
      res.json({
        success: true,
        collection: {
          name: collection.name,
          floorPrice: `${evaluation.stats.floorPrice.toFixed(2)} ${collection.blockchain === 'ethereum' ? 'ETH' : 'SOL'}`,
          volume24h: `${evaluation.stats.volume24h.toFixed(1)} ${collection.blockchain === 'ethereum' ? 'ETH' : 'SOL'}`,
          avgSale: `${evaluation.stats.averagePrice.toFixed(2)} ${collection.blockchain === 'ethereum' ? 'ETH' : 'SOL'}`,
          holderConcentration: `Top 5 wallets own ${evaluation.holderDistribution ? 
            (evaluation.holderDistribution.topHolders.slice(0, 5).reduce((acc, h) => acc + h.percentage, 0)).toFixed(1) : '?'}%`,
          riskScore: evaluation.riskAssessment.level,
          aiPrediction: evaluation.prediction.analysis
        },
        chatSummary: nftService.generateChatSummary(evaluation)
      });
    } catch (error) {
      console.error('Error getting NFT collection stats:', error);
      res.status(500).json({ 
        success: false, 
        message: `Error getting NFT collection stats: ${(error as Error).message}`
      });
    }
  }
};