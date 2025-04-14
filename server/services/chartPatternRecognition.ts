import { processSecret } from '../secrets';
import { GoogleVertexAI } from '../google/vertexAi';
import { GoogleVision } from '../google/vision';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

interface ChartPatternResult {
  pattern: string;          // The identified pattern name (e.g., "Head and Shoulders", "Double Bottom")
  confidence: number;       // Confidence level in the pattern detection (0-1)
  predictedMove: string;    // Description of the predicted price movement
  moveDirection: 'bullish' | 'bearish' | 'neutral'; // Direction of predicted movement
  timeframe: string;        // Suggested timeframe for the pattern to play out
  entryZone: string;        // Suggested entry price or zone
  stopLoss: string;         // Suggested stop loss level
  targetZone: string;       // Suggested take profit or target zone
  patternInfo: {
    description: string;    // Detailed explanation of what the pattern is
    type: string;           // Categorization (continuation, reversal, etc.)
    reliability: number;    // Historical reliability of this pattern (0-100%)
    timeToTarget: string;   // Typical time duration until target is reached
  };
}

/**
 * Service for analyzing cryptocurrency chart images to identify patterns
 * and provide trading insights using computer vision and AI.
 */
export class ChartPatternRecognitionService {
  private vertexAI: GoogleVertexAI;
  private visionAPI: GoogleVision;
  
  constructor() {
    this.vertexAI = new GoogleVertexAI();
    this.visionAPI = new GoogleVision();
  }
  
  /**
   * Analyzes a chart image to identify patterns and provide trading insights
   * @param imageBase64 Base64 encoded image data
   * @returns Analysis results including pattern identification and trading insights
   */
  async analyzeChartPattern(imageBase64: string): Promise<ChartPatternResult> {
    try {
      // First use Vision API to get basic chart information
      const visionResults = await this.visionAPI.analyzeImage(imageBase64);
      
      // Extract chart data description from vision results
      const chartDescription = visionResults.fullTextAnnotation?.text || 
                               "Cryptocurrency price chart with candlestick patterns";
                               
      // Use Vertex AI to analyze the pattern with specific chart pattern recognition prompting
      const vertexPrompt = `
        You are an expert cryptocurrency technical analyst specializing in chart pattern recognition.
        Analyze this price chart image carefully and identify the most prominent technical pattern present.
        
        Chart context: ${chartDescription}
        
        Provide a detailed analysis in JSON format with the following structure:
        {
          "pattern": "Name of the identified pattern",
          "confidence": 0.85, // Confidence level from 0-1
          "predictedMove": "Detailed description of the predicted price movement",
          "moveDirection": "bullish/bearish/neutral",
          "timeframe": "Suggested timeframe for the pattern to play out",
          "entryZone": "Suggested entry price or zone",
          "stopLoss": "Suggested stop loss level",
          "targetZone": "Suggested take profit or target zone",
          "patternInfo": {
            "description": "Detailed explanation of what the pattern is",
            "type": "Pattern type (continuation, reversal, etc.)",
            "reliability": 75, // Historical reliability percentage
            "timeToTarget": "Typical time duration until target is reached"
          }
        }
        
        If you cannot confidently identify a pattern, return your best guess but with a lower confidence score.
        Base your analysis purely on what you can see in the chart, without making assumptions about specific assets.
      `;
      
      // Call Vertex AI with the prompt and image
      const vertexResponse = await this.vertexAI.generateMultimodalContent(vertexPrompt, imageBase64);
      
      // Extract JSON from response
      try {
        // Find JSON in the response - often AI wraps JSON in markdown code blocks
        const jsonMatch = vertexResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                          vertexResponse.match(/{[\s\S]*}/);
                          
        const jsonContent = jsonMatch ? jsonMatch[1] || jsonMatch[0] : vertexResponse;
        const cleanedJson = jsonContent.replace(/```json|```/g, '').trim();
        
        // Parse the JSON response
        const patternResult = JSON.parse(cleanedJson) as ChartPatternResult;
        
        return patternResult;
      } catch (jsonError) {
        console.error("Failed to parse AI response as JSON:", jsonError);
        // Fallback with a basic response if JSON parsing fails
        return {
          pattern: "Unknown Pattern",
          confidence: 0.5,
          predictedMove: "Unable to determine from provided image",
          moveDirection: "neutral",
          timeframe: "Unknown",
          entryZone: "Not available",
          stopLoss: "Not available",
          targetZone: "Not available",
          patternInfo: {
            description: "Could not extract pattern information from the image",
            type: "Unknown",
            reliability: 0,
            timeToTarget: "Unknown"
          }
        };
      }
    } catch (error) {
      console.error("Chart pattern analysis failed:", error);
      throw new Error("Failed to analyze chart pattern: " + (error as Error).message);
    }
  }
}

// Configurar multer para la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'chart-' + uniqueSuffix + ext);
  }
});

// Filtro para asegurar que solo se suben imágenes
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

// Middleware de multer para subir imágenes de gráficos
export const uploadChartMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite: 5MB
  }
}).single('chart');

// Instancia del servicio
const chartService = new ChartPatternRecognitionService();

/**
 * Controlador para analizar patrones en gráficos
 */
export const analyzeChartPattern = async (req: Request, res: Response) => {
  try {
    let imageBase64;
    
    // Para solicitudes JSON con imágenes en base64
    if (req.body.image) {
      imageBase64 = req.body.image;
    } 
    // Para solicitudes multipart/form-data (archivos subidos)
    else if (req.file) {
      const filePath = req.file.path;
      const fileData = fs.readFileSync(filePath);
      imageBase64 = fileData.toString('base64');
      
      // Eliminar el archivo temporal
      fs.unlinkSync(filePath);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'No image provided. Please upload an image file or provide a base64 encoded image.' 
      });
    }
    
    // Analizar el patrón del gráfico
    const result = await chartService.analyzeChartPattern(imageBase64);
    
    res.json(result);
  } catch (error) {
    console.error('Error analyzing chart pattern:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error analyzing chart pattern: ' + (error as Error).message 
    });
  }
};