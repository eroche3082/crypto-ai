import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import googleApiKeyManager from './services/googleApiKeyManager';

/**
 * Google TTS API endpoint using the REST API with API Key
 */
export async function googleTTSHandler(req: Request, res: Response) {
  try {
    // Get API key from the Google API Key Manager (uses GROUP5)
    const apiKey = googleApiKeyManager.getApiKeyForService('text-to-speech');
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'No API key available for Text-to-Speech service'
      });
    }

    const {
      text,
      languageCode = 'en-US',
      name = 'en-US-Neural2-F', // Updated to a newer neural voice
      gender = 'FEMALE',
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

    // Prepare request data for REST API
    const requestData = {
      input: { text },
      voice: {
        languageCode,
        name,
        ssmlGender: gender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate,
        pitch,
      },
    };

    // Call Google TTS API using REST endpoint with API key
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API returned status ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    
    if (!responseData.audioContent) {
      throw new Error('No audio content received from Google TTS API');
    }

    // Track successful initialization
    googleApiKeyManager.trackServiceInitialization(
      'text-to-speech',
      'GROUP5',
      true
    );

    // Return as JSON (the API already returns base64-encoded audio)
    res.json({
      audioContent: responseData.audioContent,
      format: 'mp3',
      provider: 'google',
    });
  } catch (error) {
    // Track failed initialization
    googleApiKeyManager.trackServiceInitialization(
      'text-to-speech',
      'GROUP5',
      false,
      error.message
    );
    
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