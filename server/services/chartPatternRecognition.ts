/**
 * Chart Pattern Recognition Service
 * 
 * This service uses Google Vision API and Vertex AI to analyze uploaded chart images,
 * detect technical patterns, and provide trading insights based on those patterns.
 */
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { VertexAI } from '@google-cloud/vertexai';
import { Request as ExpressRequest, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { getApiKeyForService, trackServiceInitialization } from './googleApiKeyManager';

// Technical chart patterns database with properties and signals
const CHART_PATTERNS = {
  'head_and_shoulders': {
    name: 'Head and Shoulders',
    type: 'reversal',
    bullish: false,
    description: 'A bearish reversal pattern consisting of three peaks, with the middle peak being the highest.',
    reliability: 0.75,
    typicalMove: '-7% to -15%',
    stopLoss: 'Above the right shoulder',
    timeToTarget: '2-4 weeks',
  },
  'inverse_head_and_shoulders': {
    name: 'Inverse Head and Shoulders',
    type: 'reversal',
    bullish: true,
    description: 'A bullish reversal pattern consisting of three troughs, with the middle trough being the lowest.',
    reliability: 0.78,
    typicalMove: '+7% to +15%',
    stopLoss: 'Below the right shoulder',
    timeToTarget: '2-4 weeks',
  },
  'double_top': {
    name: 'Double Top',
    type: 'reversal',
    bullish: false,
    description: 'A bearish reversal pattern consisting of two consecutive peaks at approximately the same price level.',
    reliability: 0.72,
    typicalMove: '-5% to -12%',
    stopLoss: 'Above the higher peak',
    timeToTarget: '2-3 weeks',
  },
  'double_bottom': {
    name: 'Double Bottom',
    type: 'reversal',
    bullish: true,
    description: 'A bullish reversal pattern consisting of two consecutive troughs at approximately the same price level.',
    reliability: 0.74,
    typicalMove: '+5% to +12%',
    stopLoss: 'Below the lower trough',
    timeToTarget: '2-3 weeks',
  },
  'ascending_triangle': {
    name: 'Ascending Triangle',
    type: 'continuation',
    bullish: true,
    description: 'A bullish continuation pattern with a flat top and rising bottom trendline.',
    reliability: 0.67,
    typicalMove: '+5% to +10%',
    stopLoss: 'Below the last swing low',
    timeToTarget: '1-3 weeks',
  },
  'descending_triangle': {
    name: 'Descending Triangle',
    type: 'continuation',
    bullish: false,
    description: 'A bearish continuation pattern with a flat bottom and decreasing top trendline.',
    reliability: 0.69,
    typicalMove: '-5% to -10%',
    stopLoss: 'Above the last swing high',
    timeToTarget: '1-3 weeks',
  },
  'symmetrical_triangle': {
    name: 'Symmetrical Triangle',
    type: 'continuation',
    bullish: null, // Depends on the prior trend
    description: 'A continuation pattern with converging trendlines of similar slope.',
    reliability: 0.63,
    typicalMove: '±5% to ±10%',
    stopLoss: 'Below/above the last swing low/high',
    timeToTarget: '1-3 weeks',
  },
  'flag': {
    name: 'Flag',
    type: 'continuation',
    bullish: null, // Depends on the prior trend
    description: 'A short-term continuation pattern consisting of a small channel that slopes against the prior trend.',
    reliability: 0.75,
    typicalMove: '±3% to ±7%',
    stopLoss: 'Outside the flag pattern',
    timeToTarget: '1-2 weeks',
  },
  'pennant': {
    name: 'Pennant',
    type: 'continuation',
    bullish: null, // Depends on the prior trend
    description: 'A short-term continuation pattern forming a small symmetrical triangle after a strong move.',
    reliability: 0.73,
    typicalMove: '±3% to ±7%',
    stopLoss: 'Outside the pennant pattern',
    timeToTarget: '1-2 weeks',
  },
  'cup_and_handle': {
    name: 'Cup and Handle',
    type: 'continuation',
    bullish: true,
    description: 'A bullish continuation pattern resembling a cup with a handle, signaling a brief consolidation before an upward breakout.',
    reliability: 0.65,
    typicalMove: '+7% to +15%',
    stopLoss: 'Below the handle',
    timeToTarget: '3-4 weeks',
  },
  'wedge_rising': {
    name: 'Rising Wedge',
    type: 'reversal',
    bullish: false,
    description: 'A bearish reversal pattern with converging upward-sloping trendlines.',
    reliability: 0.66,
    typicalMove: '-5% to -10%',
    stopLoss: 'Above the upper trendline',
    timeToTarget: '2-3 weeks',
  },
  'wedge_falling': {
    name: 'Falling Wedge',
    type: 'reversal',
    bullish: true,
    description: 'A bullish reversal pattern with converging downward-sloping trendlines.',
    reliability: 0.69,
    typicalMove: '+5% to +10%',
    stopLoss: 'Below the lower trendline',
    timeToTarget: '2-3 weeks',
  },
  'rounding_bottom': {
    name: 'Rounding Bottom',
    type: 'reversal',
    bullish: true,
    description: 'A bullish reversal pattern resembling a "U" shape, indicating a gradual shift from selling to buying pressure.',
    reliability: 0.62,
    typicalMove: '+5% to +15%',
    stopLoss: 'Below the lowest point of the curve',
    timeToTarget: '4-8 weeks',
  }
};

// Interface for chart pattern analysis result
interface ChartPatternResult {
  pattern: string;
  confidence: number;
  predictedMove: string;
  moveDirection: 'bullish' | 'bearish' | 'neutral';
  timeframe: string;
  entryZone: string;
  stopLoss: string;
  targetZone: string;
  patternInfo: {
    description: string;
    type: string;
    reliability: number;
    timeToTarget: string;
  };
}

// Setup multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      cb(null, 'chart-' + uniqueSuffix + extension);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit to 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
      cb(null, false);
    }
  }
});

// Export middleware for route handler
export const uploadChartMiddleware = upload.single('chart');

// Initialize Vision client
let visionClient: ImageAnnotatorClient | null = null;
let vertexAIClient: VertexAI | null = null;

try {
  // Get API key for Vision service
  const apiKey = getApiKeyForService('vision');
  
  if (apiKey) {
    visionClient = new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_VISION_KEY_PATH || './google-credentials-global.json',
    });
    trackServiceInitialization('vision', 'GROUP5', true);
  } else {
    console.error('No API key available for Vision service');
    trackServiceInitialization('vision', 'GROUP5', false, 'No API key available');
  }
  
  // Initialize Vertex AI client
  const projectId = 'erudite-creek-431302-q3';
  const location = 'us-central1';
  
  vertexAIClient = new VertexAI({
    project: projectId,
    location: location,
  });
  
  trackServiceInitialization('vertex-ai', 'GROUP5', true);
} catch (error: any) {
  console.error('Error initializing chart pattern recognition services:', error);
  trackServiceInitialization('vision', 'GROUP5', false, error.message);
  trackServiceInitialization('vertex-ai', 'GROUP5', false, error.message);
}

/**
 * Detects lines, edges, and shapes in the image using Vision API
 */
async function detectPatternsInChart(imagePath: string) {
  if (!visionClient) {
    throw new Error('Vision client not initialized');
  }
  
  // Define features for chart pattern detection
  const features = [
    { type: 'TEXT_DETECTION' },      // Detect any text (labels, prices, dates)
    { type: 'DOCUMENT_TEXT_DETECTION' }, // More comprehensive text detection
    { type: 'OBJECT_LOCALIZATION' }, // Detect shapes and objects
    { type: 'LABEL_DETECTION', maxResults: 15 }, // Identify elements in the chart
    { type: 'IMAGE_PROPERTIES' }     // Color distribution (green/red candles)
  ];
  
  // Run image analysis
  const [result] = await visionClient.annotateImage({
    image: { source: { filename: imagePath } },
    features,
  });
  
  return {
    text: result.textAnnotations?.[0]?.description || '',
    fullText: result.fullTextAnnotation?.text || '',
    objects: result.localizedObjectAnnotations?.map(obj => ({
      name: obj.name,
      confidence: obj.score,
      boundingPoly: obj.boundingPoly
    })) || [],
    labels: result.labelAnnotations?.map(label => ({
      description: label.description,
      confidence: label.score
    })) || [],
    colors: result.imagePropertiesAnnotation?.dominantColors?.colors?.map(color => ({
      rgb: `rgb(${Math.round(color.color?.red || 0)}, ${Math.round(color.color?.green || 0)}, ${Math.round(color.color?.blue || 0)})`,
      score: color.score,
      pixelFraction: color.pixelFraction
    })).slice(0, 5) || []
  };
}

/**
 * Uses Vertex AI to analyze the chart pattern and generate insights
 */
async function analyzeChartWithVertexAI(visionData: any, context?: any) {
  if (!vertexAIClient) {
    throw new Error('Vertex AI client not initialized');
  }
  
  const generativeModel = vertexAIClient.preview.getGenerativeModel({
    model: "gemini-1.5-pro",
  });
  
  // Create a comprehensive prompt for chart pattern analysis
  const prompt = `
You are a professional crypto technical analyst specialized in chart pattern recognition.
Analyze the following data extracted from a cryptocurrency price chart and identify the most likely technical pattern present.

Text detected in the chart: ${visionData.text || 'No text detected'}

Objects detected: ${JSON.stringify(visionData.objects)}

Labels detected: ${JSON.stringify(visionData.labels)}

Color distribution: ${JSON.stringify(visionData.colors)}

${context ? `Additional context: ${context}` : ''}

Based on this information, identify which of the following patterns is most likely present in the chart:
- Head and Shoulders 
- Inverse Head and Shoulders
- Double Top
- Double Bottom
- Ascending Triangle
- Descending Triangle
- Symmetrical Triangle
- Flag
- Pennant
- Cup and Handle
- Rising Wedge
- Falling Wedge
- Rounding Bottom

Respond with a JSON object containing:
1. pattern (string): The name of the most likely pattern
2. confidence (number): Your confidence level between 0 and 1
3. moveDirection (string): "bullish", "bearish", or "neutral"
4. entryZone (string): Ideal entry price zone
5. stopLoss (string): Recommended stop loss level
6. targetZone (string): Price target zone
7. timeframe (string): Detected chart timeframe (e.g., "1D", "4H")
8. additionalInsights (string): Brief technical analysis insights
`;

  try {
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const textContent = response.candidates[0].content.parts[0].text;
    
    // Extract JSON from text response
    let jsonStart = textContent.indexOf('{');
    let jsonEnd = textContent.lastIndexOf('}');
    
    if (jsonStart >= 0 && jsonEnd >= 0) {
      const jsonString = textContent.substring(jsonStart, jsonEnd + 1);
      try {
        const patternAnalysis = JSON.parse(jsonString);
        return patternAnalysis;
      } catch (e) {
        console.error('Error parsing Vertex AI response as JSON:', e);
        throw new Error('Failed to parse Vertex AI response');
      }
    } else {
      throw new Error('Vertex AI response did not contain valid JSON');
    }
  } catch (error) {
    console.error('Error in Vertex AI analysis:', error);
    throw error;
  }
}

/**
 * Enhances the analysis with pattern database information
 */
function enhancePatternAnalysis(aiAnalysis: any): ChartPatternResult {
  // Find the matching pattern in our database
  const patternKey = Object.keys(CHART_PATTERNS).find(key => 
    CHART_PATTERNS[key as keyof typeof CHART_PATTERNS].name.toLowerCase() === aiAnalysis.pattern.toLowerCase()
  );
  
  let patternInfo = {
    description: "Unknown pattern",
    type: "unknown",
    reliability: 0.5,
    timeToTarget: "Unknown"
  };
  
  if (patternKey) {
    const pattern = CHART_PATTERNS[patternKey as keyof typeof CHART_PATTERNS];
    patternInfo = {
      description: pattern.description,
      type: pattern.type,
      reliability: pattern.reliability,
      timeToTarget: pattern.timeToTarget
    };
  }
  
  return {
    pattern: aiAnalysis.pattern,
    confidence: aiAnalysis.confidence,
    predictedMove: aiAnalysis.moveDirection === 'bullish' ? `+${aiAnalysis.confidence * 10}%` : 
                   aiAnalysis.moveDirection === 'bearish' ? `-${aiAnalysis.confidence * 10}%` : '0%',
    moveDirection: aiAnalysis.moveDirection,
    timeframe: aiAnalysis.timeframe || "Unknown",
    entryZone: aiAnalysis.entryZone,
    stopLoss: aiAnalysis.stopLoss,
    targetZone: aiAnalysis.targetZone,
    patternInfo
  };
}

/**
 * Main handler for analyzing chart patterns from uploaded images
 */
export async function analyzeChartPattern(req: ExpressRequest & { file?: Express.Multer.File }, res: Response) {
  try {
    if (!visionClient || !vertexAIClient) {
      return res.status(500).json({ 
        error: 'Chart pattern recognition services not initialized', 
        message: 'Google Vision API or Vertex AI is not available' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        error: 'No chart image uploaded',
        message: 'Please upload a chart image for analysis' 
      });
    }

    const filePath = req.file.path;
    const timeframe = req.body.timeframe || 'Unknown';
    const symbol = req.body.symbol || 'Unknown';
    
    // Extract data from the chart image using Vision API
    const visionData = await detectPatternsInChart(filePath);
    
    // Analyze the chart pattern using Vertex AI
    const chartContext = `This is a ${timeframe} chart for ${symbol}`;
    const aiAnalysis = await analyzeChartWithVertexAI(visionData, chartContext);
    
    // Enhance with additional pattern information
    const enhancedAnalysis = enhancePatternAnalysis(aiAnalysis);
    
    // Clean up the temporary file
    const unlinkAsync = promisify(fs.unlink);
    await unlinkAsync(filePath);

    res.json({
      status: 'success',
      data: enhancedAnalysis,
      rawVisionData: visionData
    });
  } catch (error: any) {
    console.error('Error analyzing chart pattern:', error);
    res.status(500).json({ 
      error: 'Error analyzing chart pattern', 
      message: error.message 
    });
  }
}