import { Request, Response } from 'express';
import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max size
  },
  fileFilter: (req, file, cb) => {
    // Accept only specific file types
    const allowedFileTypes = /jpeg|jpg|png|pdf|svg|webp|json/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, PDF, SVG, WEBP, and JSON files are allowed'));
    }
  }
});

// Initialize Cloud Storage client
let storageClient: Storage | null = null;
let bucketName: string = 'cryptobot-user-content';

try {
  storageClient = new Storage({
    keyFilename: process.env.GOOGLE_STORAGE_KEY_PATH || './google-credentials-global.json',
  });
  
  // Use environment variable for bucket name if provided
  if (process.env.GOOGLE_STORAGE_BUCKET) {
    bucketName = process.env.GOOGLE_STORAGE_BUCKET;
  }
  
  console.log('Google Cloud Storage client initialized');
} catch (error) {
  console.error('Error initializing Cloud Storage client:', error);
}

/**
 * Upload a file to Cloud Storage
 */
export async function uploadFile(req: Request, res: Response) {
  try {
    if (!storageClient) {
      return res.status(500).json({
        error: 'Cloud Storage client not initialized',
        message: 'Cloud Storage is not available'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a file'
      });
    }

    // Get user ID for organizing files (from authenticated session)
    const userId = req.user?.id || 'anonymous';
    
    // Define folder structure: userId/fileType/filename
    const fileType = req.body.fileType || 'misc';
    const sanitizedFileType = fileType.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    
    // Create a clean filename
    const originalExtension = path.extname(req.file.originalname);
    const timestamp = Date.now();
    const randomHash = crypto.createHash('md5')
      .update(`${timestamp}-${req.file.originalname}`)
      .digest('hex')
      .substring(0, 8);
    
    const filename = `${sanitizedFileType}-${timestamp}-${randomHash}${originalExtension}`;
    const destinationPath = `user-${userId}/${sanitizedFileType}/${filename}`;

    // Upload file to Cloud Storage
    const bucket = storageClient.bucket(bucketName);
    const [file] = await bucket.upload(req.file.path, {
      destination: destinationPath,
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          userId: userId.toString(),
          fileType: sanitizedFileType,
          uploadTimestamp: timestamp.toString(),
        }
      }
    });
    
    // Set appropriate permissions based on your requirements
    // For example, make the file publicly accessible
    await file.makePublic();
    
    // Generate file URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationPath}`;
    
    // Clean up the temporary file
    fs.unlinkSync(req.file.path);
    
    // Return file information
    res.json({
      success: true,
      file: {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        url: publicUrl,
        path: destinationPath,
        timestamp: timestamp,
        userId: userId.toString()
      }
    });
  } catch (error) {
    console.error('Error uploading file to Cloud Storage:', error);
    
    // Remove temp file if it exists and there was an error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
      }
    }
    
    res.status(500).json({
      error: 'Error uploading file',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * List user files from Cloud Storage
 */
export async function listUserFiles(req: Request, res: Response) {
  try {
    if (!storageClient) {
      return res.status(500).json({
        error: 'Cloud Storage client not initialized',
        message: 'Cloud Storage is not available'
      });
    }

    // Get user ID from authenticated session
    const userId = req.user?.id || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        error: 'Missing user ID',
        message: 'User ID is required to list files'
      });
    }
    
    // Get optional file type filter
    const fileType = req.query.fileType ? 
      (req.query.fileType as string).replace(/[^a-z0-9-]/gi, '-').toLowerCase() : 
      undefined;
    
    // Define the prefix to search
    const prefix = fileType ? 
      `user-${userId}/${fileType}/` : 
      `user-${userId}/`;
    
    // List files in the bucket with the specified prefix
    const [files] = await storageClient.bucket(bucketName).getFiles({
      prefix: prefix
    });
    
    // Format file information
    const formattedFiles = files.map(file => {
      // Extract file metadata
      const metadata = file.metadata.metadata || {};
      
      return {
        name: metadata.originalName || path.basename(file.name),
        path: file.name,
        url: `https://storage.googleapis.com/${bucketName}/${file.name}`,
        size: parseInt(file.metadata.size, 10),
        contentType: file.metadata.contentType,
        uploadTimestamp: metadata.uploadTimestamp,
        fileType: metadata.fileType || 'unknown',
        userId: metadata.userId || 'unknown'
      };
    });
    
    res.json({
      success: true,
      files: formattedFiles,
      count: formattedFiles.length,
      userId: userId,
      fileType: fileType || 'all'
    });
  } catch (error) {
    console.error('Error listing files from Cloud Storage:', error);
    res.status(500).json({
      error: 'Error listing files',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Delete a file from Cloud Storage
 */
export async function deleteFile(req: Request, res: Response) {
  try {
    if (!storageClient) {
      return res.status(500).json({
        error: 'Cloud Storage client not initialized',
        message: 'Cloud Storage is not available'
      });
    }

    const { filePath } = req.params;
    
    if (!filePath) {
      return res.status(400).json({
        error: 'Missing file path',
        message: 'File path is required to delete a file'
      });
    }
    
    // Verify user owns the file (based on path structure: user-{userId}/...)
    const userId = req.user?.id;
    const pathParts = filePath.split('/');
    
    if (pathParts[0] !== `user-${userId}` && userId) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'You do not have permission to delete this file'
      });
    }
    
    // Delete the file
    await storageClient.bucket(bucketName).file(filePath).delete();
    
    res.json({
      success: true,
      message: 'File deleted successfully',
      filePath: filePath
    });
  } catch (error) {
    console.error('Error deleting file from Cloud Storage:', error);
    res.status(500).json({
      error: 'Error deleting file',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}