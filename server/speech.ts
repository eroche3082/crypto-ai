import { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import OpenAI from 'openai';

// Configure multer for handling audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + '.webm');
  }
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

export const audioMiddleware = upload.single('audio');

/**
 * Transcribe audio file using AI
 */
export async function transcribeAudio(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const filePath = req.file.path;
    let transcription = '';

    try {
      // Try OpenAI Whisper if API key is available
      if (process.env.OPENAI_API_KEY) {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        try {
          const audioReadStream = fs.createReadStream(filePath);
          const response = await openai.audio.transcriptions.create({
            file: audioReadStream,
            model: "whisper-1",
            language: req.body.language || 'en',
          });
          
          transcription = response.text;
          console.log('Successfully transcribed audio using OpenAI Whisper');
        } catch (whisperError) {
          console.error('Error using OpenAI Whisper:', whisperError);
          throw whisperError;
        }
      } else {
        // Fallback to simulated transcription
        console.log('No OpenAI API key available, providing simulated response');
        transcription = "This is a simulated transcription. To get real transcriptions, please provide an OpenAI API key.";
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      // Fallback response
      transcription = "I couldn't transcribe this audio clearly. Please try again with a clearer recording.";
    }

    // Clean up the temporary file
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupError) {
      console.error('Error cleaning up temp file:', cleanupError);
    }

    // Return the transcription
    res.json({
      transcription,
      success: true
    });
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    res.status(500).json({
      error: `Failed to process audio: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}