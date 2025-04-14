import { Request, Response } from 'express';
import fetch from 'node-fetch';
import googleApiKeyManager from './services/googleApiKeyManager';

/**
 * Google Speech-to-Text API handler
 * Converts audio to text using Google Cloud Speech-to-Text API
 */
export async function googleSTTHandler(req: Request, res: Response) {
  try {
    // Get API key from the Google API Key Manager (uses GROUP5)
    const apiKey = googleApiKeyManager.getApiKeyForService('speech');
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'No API key available for Speech-to-Text service'
      });
    }

    const {
      audioContent, // Base64 encoded audio data
      encoding = 'LINEAR16',
      languageCode = 'en-US',
      sampleRateHertz = 16000,
      audioChannelCount = 1,
      enableAutomaticPunctuation = true,
      model = 'latest_long' // Using a more accurate model for better transcription
    } = req.body;

    if (!audioContent) {
      return res.status(400).json({ error: 'Audio content is required' });
    }

    // Prepare request data for REST API
    const requestData = {
      config: {
        encoding,
        sampleRateHertz,
        languageCode,
        audioChannelCount,
        enableAutomaticPunctuation,
        model
      },
      audio: {
        content: audioContent // This should be base64-encoded audio
      }
    };

    // Call Google Speech-to-Text API using REST endpoint with API key
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
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
    
    // Track successful initialization
    googleApiKeyManager.trackServiceInitialization(
      'speech',
      'GROUP5',
      true
    );

    // Extract the transcriptions
    const results = responseData.results || [];
    let transcript = '';
    let confidence = 0;

    if (results.length > 0) {
      // Get the first alternative from the first result
      // (Usually the most likely transcription)
      transcript = results[0].alternatives[0]?.transcript || '';
      confidence = results[0].alternatives[0]?.confidence || 0;
    }

    // Return the transcription
    res.json({
      transcript,
      confidence,
      language: languageCode,
      provider: 'google',
      allResults: results
    });
  } catch (error) {
    // Track failed initialization
    googleApiKeyManager.trackServiceInitialization(
      'speech',
      'GROUP5',
      false,
      error.message
    );
    
    console.error('Google STT API error:', error);
    res.status(500).json({
      error: `Failed to transcribe speech: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

/**
 * This handler processes audio data to detect languages using the Speech API
 */
export async function detectSpeechLanguageHandler(req: Request, res: Response) {
  try {
    // Get API key from the Google API Key Manager
    const apiKey = googleApiKeyManager.getApiKeyForService('speech');
    
    if (!apiKey) {
      return res.status(500).json({
        error: 'No API key available for Speech-to-Text service'
      });
    }

    const { audioContent } = req.body;

    if (!audioContent) {
      return res.status(400).json({ error: 'Audio content is required' });
    }

    // List of potential languages to detect from
    const languageOptions = [
      'en-US', // English (United States)
      'es-ES', // Spanish
      'fr-FR', // French
      'pt-BR', // Portuguese (Brazil)
      'de-DE', // German
      'it-IT', // Italian
      'ja-JP', // Japanese
      'zh-CN'  // Chinese (Simplified)
    ];

    // Prepare request data for language detection
    const requestData = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCodes: languageOptions,
        model: 'latest_short',
      },
      audio: {
        content: audioContent
      }
    };

    // Call Google Speech-to-Text API for language detection
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
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
    
    // Process the results to determine the most likely language
    const results = responseData.results || [];
    let detectedLanguage = 'en-US'; // Default to English
    let transcript = '';
    let confidence = 0;

    if (results.length > 0 && results[0].alternatives && results[0].alternatives.length > 0) {
      detectedLanguage = results[0].languageCode || 'en-US';
      transcript = results[0].alternatives[0].transcript || '';
      confidence = results[0].alternatives[0].confidence || 0;
    }

    // Return the detected language and transcription
    res.json({
      language: detectedLanguage,
      transcript,
      confidence,
      provider: 'google',
      allResults: results
    });
  } catch (error) {
    console.error('Google Speech Language Detection API error:', error);
    res.status(500).json({
      error: `Failed to detect speech language: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}