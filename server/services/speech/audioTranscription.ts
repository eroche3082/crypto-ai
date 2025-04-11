import { Request, Response } from 'express';
import multer from 'multer';
import { SpeechClient } from '@google-cloud/speech';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const audioUpload = multer({ storage });

// Middleware for handling audio file upload
export const audioMiddleware = audioUpload.single('audio');

// Initialize OpenAI client if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Initialize Google Speech client if credentials are available
let speechClient: SpeechClient | null = null;
try {
  speechClient = new SpeechClient();
} catch (error) {
  console.warn("Unable to initialize Google Speech client. Audio transcription with Google Speech will not be available.", error);
}

/**
 * Transcribe audio using Google Cloud Speech-to-Text
 */
async function transcribeWithGoogleSpeech(audioBuffer: Buffer, mimeType: string): Promise<string> {
  if (!speechClient) {
    throw new Error('Google Speech client is not initialized');
  }

  const audio = {
    content: audioBuffer.toString('base64'),
  };
  
  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    alternativeLanguageCodes: ['es-ES', 'fr-FR', 'pt-BR'],
  };
  
  const request = {
    audio: audio,
    config: config,
  };

  const [response] = await speechClient.recognize(request);
  const transcription = response.results
    ?.map(result => result.alternatives?.[0]?.transcript)
    .filter(Boolean)
    .join('\n');
    
  return transcription || '';
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
async function transcribeWithWhisper(audioBuffer: Buffer, mimeType: string): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI client is not initialized. Please set OPENAI_API_KEY.');
  }

  // Create a temporary file to store the audio
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `audio-${Date.now()}.${mimeType.split('/')[1] || 'webm'}`);
  
  try {
    // Write the buffer to the temporary file
    fs.writeFileSync(tempFile, audioBuffer);
    
    // Create a readable stream from the file
    const fileStream = fs.createReadStream(tempFile);
    
    // Call OpenAI API
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
      language: "en", // Default to English, but Whisper can auto-detect
    });
    
    return transcription.text;
  } finally {
    // Clean up the temporary file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

/**
 * Main handler for audio transcription with fallback logic
 */
export async function transcribeAudio(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioBuffer = req.file.buffer;
    const mimeType = req.file.mimetype || 'audio/webm';
    
    let transcription = '';
    let transcriptionSource = '';
    
    // Try Google Speech first if available
    if (speechClient) {
      try {
        transcription = await transcribeWithGoogleSpeech(audioBuffer, mimeType);
        transcriptionSource = 'google-speech';
      } catch (error) {
        console.warn('Google Speech transcription failed, trying OpenAI Whisper:', error);
      }
    }
    
    // If Google Speech failed or wasn't available, try OpenAI Whisper
    if (!transcription && openai) {
      try {
        transcription = await transcribeWithWhisper(audioBuffer, mimeType);
        transcriptionSource = 'openai-whisper';
      } catch (error) {
        console.error('OpenAI Whisper transcription failed:', error);
        throw error; // Re-throw to be caught by the outer try/catch
      }
    }
    
    // If both methods failed, return an error
    if (!transcription) {
      return res.status(500).json({
        error: 'Failed to transcribe audio with any available service',
      });
    }
    
    // Return successful transcription
    return res.json({
      transcription,
      source: transcriptionSource,
    });
  } catch (error) {
    console.error('Audio transcription error:', error);
    return res.status(500).json({ 
      error: `Failed to transcribe audio: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}