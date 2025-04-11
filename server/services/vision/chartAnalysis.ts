import { Request as ExpressRequest, Response } from 'express';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { VertexAI } from "@google-cloud/vertexai";
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Interface para extender el tipo Request
interface Request extends ExpressRequest {
  file?: Express.Multer.File;
}

// Configuration for file uploads
const storage = multer.diskStorage({
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
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Middleware for chart image uploads
export const chartImageMiddleware = upload.single('chart');

// Initialize Google Vision client
let visionClient: ImageAnnotatorClient | null = null;

try {
  visionClient = new ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_VISION_KEY_PATH || './google-credentials-global.json',
  });
  console.log('Google Vision client initialized for chart analysis');
} catch (error) {
  console.error('Error initializing Google Vision client for chart analysis:', error);
}

// Initialize Vertex AI for chart pattern recognition
const vertexAiOptions = {
  project: process.env.GOOGLE_PROJECT_ID || "erudite-creek-431302-q3",
  location: process.env.GOOGLE_LOCATION || "us-central1",
};

// Create the VertexAI client
const vertexAi = new VertexAI(vertexAiOptions);

// Get the generative model with multimodal capabilities
const getGenerativeModel = (modelName: string = "gemini-1.5-flash-latest") => {
  return vertexAi.getGenerativeModel({ model: modelName });
};

/**
 * Analyze cryptocurrency chart images to identify patterns and provide analysis
 */
export async function analyzeChartImage(req: Request, res: Response) {
  try {
    if (!visionClient) {
      return res.status(500).json({
        error: 'Vision API client not initialized',
        message: 'Google Vision API is not available for chart analysis'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No chart image uploaded',
        message: 'Please upload a chart image for analysis'
      });
    }

    const filePath = req.file.path;
    const { symbol, timeframe = 'Unknown', language = 'en' } = req.body;

    // Step 1: Basic image analysis with Vision API
    const [result] = await visionClient.annotateImage({
      image: { source: { filename: filePath } },
      features: [
        { type: 'TEXT_DETECTION' },
        { type: 'LABEL_DETECTION', maxResults: 10 },
        { type: 'IMAGE_PROPERTIES' }
      ],
    });

    // Extract text found in the chart
    const extractedText = result.textAnnotations?.[0]?.description || '';
    const labels = result.labelAnnotations?.map(label => label.description) || [];

    // Step 2: Use Vertex AI with Gemini model for technical pattern recognition
    // Convert image to base64
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');

    // Create appropriate language instruction
    let languageInstruction = '';
    if (language === 'es') {
      languageInstruction = 'Responde en español. ';
    } else if (language === 'fr') {
      languageInstruction = 'Réponds en français. ';
    } else if (language === 'pt') {
      languageInstruction = 'Responda em português. ';
    }

    // Send to Gemini for analysis
    const generativeModel = getGenerativeModel();
    const vertexResult = await generativeModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${languageInstruction}You are a cryptocurrency technical analysis expert. Analyze this ${symbol || ''} chart image (${timeframe} timeframe) and identify common technical analysis patterns, key support/resistance levels, trend lines, and potential price movements. Also consider these text elements found in the image: ${extractedText}`
            },
            {
              inlineData: {
                mimeType: `image/${path.extname(filePath).substring(1) || 'jpeg'}`,
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    // Extract the AI analysis
    let technicalAnalysis = "Unable to generate technical analysis";
    if (vertexResult.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      technicalAnalysis = vertexResult.response.candidates[0].content.parts[0].text;
    }

    // Clean up temp file
    const unlinkAsync = promisify(fs.unlink);
    await unlinkAsync(filePath);

    // Return combined results
    res.json({
      symbol: symbol || 'Unknown',
      timeframe: timeframe,
      technicalAnalysis: technicalAnalysis,
      extractedText: extractedText,
      chartLabels: labels,
      language: language,
      disclaimer: "This analysis is generated by AI and should not be considered financial advice."
    });
  } catch (error) {
    console.error('Error analyzing chart image:', error);
    res.status(500).json({
      error: 'Error analyzing chart image',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}