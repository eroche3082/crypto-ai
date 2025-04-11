import { Request as ExpressRequest, Response } from 'express';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import multer from 'multer';

// Extender el tipo Request para incluir la propiedad file de multer
interface Request extends ExpressRequest {
  file?: Express.Multer.File;
}
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Set up multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      // Create the directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Use a unique filename to avoid collisions
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit to 5MB
  }
});

// Helper function to handle file uploads
export const uploadMiddleware = upload.single('image');

// Initialize Google Vision client
let visionClient: ImageAnnotatorClient | null = null;

try {
  visionClient = new ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_VISION_KEY_PATH || './google-credentials-global.json',
  });
  console.log('Google Vision client initialized');
} catch (error) {
  console.error('Error initializing Google Vision client:', error);
}

// Function to handle image analysis with Vision API
export async function analyzeImage(req: Request, res: Response) {
  try {
    if (!visionClient) {
      return res.status(500).json({ 
        error: 'Vision API client not initialized', 
        message: 'Google Vision API is not available' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please upload an image file' 
      });
    }

    const filePath = req.file.path;
    
    // Define features to detect in the image
    const features = [
      { type: 'TEXT_DETECTION' },
      { type: 'LOGO_DETECTION' },
      { type: 'LANDMARK_DETECTION' },
      { type: 'LABEL_DETECTION', maxResults: 10 },
      { type: 'FACE_DETECTION' },
      { type: 'IMAGE_PROPERTIES' }
    ];

    // Analyze the image
    const [result] = await visionClient.annotateImage({
      image: { source: { filename: filePath } },
      features,
    });

    // Extract relevant information
    const analysisResults = {
      text: result.textAnnotations?.[0]?.description || null,
      logos: result.logoAnnotations?.map(logo => ({
        description: logo.description,
        confidence: logo.score,
      })) || [],
      landmarks: result.landmarkAnnotations?.map(landmark => ({
        description: landmark.description,
        confidence: landmark.score,
      })) || [],
      labels: result.labelAnnotations?.map(label => ({
        description: label.description,
        confidence: label.score,
      })) || [],
      faces: (result.faceAnnotations?.length || 0) > 0 ? 
        { count: result.faceAnnotations?.length } : null,
      colors: result.imagePropertiesAnnotation?.dominantColors?.colors?.map(color => ({
        rgb: `rgb(${Math.round(color.color?.red || 0)}, ${Math.round(color.color?.green || 0)}, ${Math.round(color.color?.blue || 0)})`,
        score: color.score,
        pixelFraction: color.pixelFraction,
      })).slice(0, 5) || [],
    };

    // Clean up the temporary file
    const unlinkAsync = promisify(fs.unlink);
    await unlinkAsync(filePath);

    res.json(analysisResults);
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ 
      error: 'Error analyzing image', 
      message: error.message 
    });
  }
}