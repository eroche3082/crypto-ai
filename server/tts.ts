import { Request, Response } from 'express';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Initialize Google TTS client
let ttsClient: TextToSpeechClient;
try {
  // Try to use the credentials JSON file if available
  const credentialsPath = path.join(process.cwd(), 'google-credentials-global.json');
  if (fs.existsSync(credentialsPath)) {
    ttsClient = new TextToSpeechClient({
      keyFilename: credentialsPath
    });
    console.log('Google TTS client initialized with credentials file');
  } else if (process.env.GOOGLE_TTS_KEY_ID) {
    // Use environment variables if file is not available
    ttsClient = new TextToSpeechClient();
    console.log('Google TTS client initialized with environment credentials');
  } else {
    console.warn('No Google TTS credentials found');
  }
} catch (error) {
  console.error('Error initializing Google TTS client:', error);
}

/**
 * Google TTS API endpoint
 */
export async function googleTTSHandler(req: Request, res: Response) {
  try {
    if (!ttsClient) {
      return res.status(500).json({
        error: 'Google TTS client not initialized. Please provide valid credentials.'
      });
    }

    const {
      text,
      languageCode = 'en-US',
      name = 'en-US-Neural2-A',
      gender = 'NEUTRAL',
      speakingRate = 1.0,
      pitch = 0,
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Validate text length
    if (text.length > 5000) {
      return res.status(400).json({
        error: 'Text is too long. Maximum allowed length is 5000 characters.'
      });
    }

    // Prepare request
    const request = {
      input: { text },
      voice: {
        languageCode,
        name,
        ssmlGender: gender,
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate,
        pitch,
      },
    };

    // Call Google TTS API
    const [response] = await ttsClient.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('No audio content received from Google TTS API');
    }

    // Convert to base64
    const audioContent = Buffer.from(response.audioContent as Uint8Array).toString('base64');

    // Return as JSON
    res.json({
      audioContent,
      format: 'mp3',
      provider: 'google',
    });
  } catch (error) {
    console.error('Google TTS API error:', error);
    res.status(500).json({
      error: `Failed to synthesize speech: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

/**
 * ElevenLabs TTS API endpoint
 */
export async function elevenLabsTTSHandler(req: Request, res: Response) {
  try {
    const elevenlabsApiKey = process.env.ELEVEN_LABS_API_KEY;
    
    if (!elevenlabsApiKey) {
      return res.status(500).json({
        error: 'ElevenLabs API key not found. Please set ELEVEN_LABS_API_KEY environment variable.'
      });
    }

    const {
      text,
      voiceId = 'pNInz6obpgDQGcFmaJgB', // Default voice ID
      modelId = 'eleven_monolingual_v1',
      stability = 0.5,
      similarityBoost = 0.75,
      speed = 1.0,
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Validate text length
    if (text.length > 2000) {
      return res.status(400).json({
        error: 'Text is too long for ElevenLabs. Maximum allowed length is 2000 characters.'
      });
    }

    // Prepare request to ElevenLabs API
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenlabsApiKey
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          speed
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Get audio content as buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64
    const audioContent = Buffer.from(audioBuffer).toString('base64');

    // Return as JSON
    res.json({
      audioContent,
      format: 'mp3',
      provider: 'elevenlabs',
    });
  } catch (error) {
    console.error('ElevenLabs TTS API error:', error);
    res.status(500).json({
      error: `Failed to synthesize speech: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}