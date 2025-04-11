import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import * as Jimp from 'jimp';
import jsQR from 'jsqr';

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const qrUpload = multer({ storage });

// Middleware for handling QR code image upload
export const qrImageMiddleware = qrUpload.single('qrImage');

let visionClient: ImageAnnotatorClient | null = null;

// Initialize Google Vision API client if credentials are available
try {
  visionClient = new ImageAnnotatorClient();
} catch (error) {
  console.warn("Unable to initialize Google Vision client. QR scanning with Google Vision will not be available.", error);
}

/**
 * Scan QR code using Google Cloud Vision API
 */
export async function scanQRCodeWithVision(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'QR image file is required' });
    }

    if (!visionClient) {
      return res.status(500).json({ 
        error: 'Google Vision API client is not initialized. Please check your credentials.'
      });
    }

    // Call Google Vision API to detect QR codes
    const [result] = await visionClient.textDetection(req.file.buffer);
    const detections = result.textAnnotations;

    if (detections && detections.length > 0) {
      // Return the first detected text (usually the full text content)
      return res.json({ 
        result: detections[0].description,
        source: 'google-vision'
      });
    } else {
      // If Google Vision didn't find a QR code, try fallback method
      return await scanQRCodeWithJsQR(req, res);
    }
  } catch (error) {
    console.error('Error scanning QR code with Google Vision:', error);
    // Try fallback method if Google Vision fails
    return await scanQRCodeWithJsQR(req, res);
  }
}

/**
 * Fallback QR code scanner using jsQR library
 */
export async function scanQRCodeWithJsQR(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'QR image file is required' });
    }

    // Read image with Jimp
    const image = await Jimp.read(req.file.buffer);
    const { width, height } = image.bitmap;
    
    // Get image data
    const imageData = new Uint8ClampedArray(4 * width * height);
    let pos = 0;
    
    image.scan(0, 0, width, height, function(x, y, idx) {
      imageData[pos++] = this.bitmap.data[idx + 0]; // R
      imageData[pos++] = this.bitmap.data[idx + 1]; // G
      imageData[pos++] = this.bitmap.data[idx + 2]; // B
      imageData[pos++] = this.bitmap.data[idx + 3]; // A
    });

    // Scan QR code
    const code = jsQR(imageData, width, height);
    
    if (code) {
      return res.json({ 
        result: code.data,
        source: 'jsqr'
      });
    } else {
      return res.status(404).json({ 
        error: 'No QR code detected in the image',
        source: 'jsqr'
      });
    }
  } catch (error) {
    console.error('Error scanning QR code with jsQR:', error);
    return res.status(500).json({ 
      error: `Failed to scan QR code: ${error instanceof Error ? error.message : String(error)}`,
      source: 'jsqr'
    });
  }
}

/**
 * Handler that tries multiple QR scanning methods in sequence
 */
export async function scanQRCode(req: Request, res: Response) {
  try {
    if (visionClient) {
      // Try Google Vision first if available
      return await scanQRCodeWithVision(req, res);
    } else {
      // Fall back to jsQR if Vision API isn't available
      return await scanQRCodeWithJsQR(req, res);
    }
  } catch (error) {
    console.error('Error in QR code scanning:', error);
    return res.status(500).json({ 
      error: `Failed to scan QR code: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}