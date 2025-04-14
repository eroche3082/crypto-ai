/**
 * Google Cloud Services Test Suite
 * 
 * This file contains test functions for verifying the functionality
 * of Google Cloud services using our API Key Manager configuration.
 */
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import googleApiKeyManager, { GoogleServiceType } from './services/googleApiKeyManager';

// Keep track of test results for each service
interface TestResult {
  service: GoogleServiceType;
  success: boolean;
  response?: any;
  error?: string;
  timestamp: string;
}

// Store results to display in diagnostics
const testResults: TestResult[] = [];

/**
 * Test Google Cloud Text-to-Speech API
 */
export async function testTextToSpeech(): Promise<TestResult> {
  const service: GoogleServiceType = 'text-to-speech';
  
  try {
    // Get the API key for this service
    const apiKey = googleApiKeyManager.getApiKeyForService(service);
    
    if (!apiKey) {
      throw new Error('No API key available for Text-to-Speech service');
    }
    
    // Define the API request data
    const requestData = {
      input: {
        text: 'This is a test of the Google Cloud Text-to-Speech API for CryptoBot.'
      },
      voice: {
        languageCode: 'en-US',
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'MP3'
      }
    };
    
    // Make the API request
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
    
    // Track the successful initialization
    googleApiKeyManager.trackServiceInitialization(
      service,
      'GROUP1',
      true
    );
    
    // Return success result
    return {
      service,
      success: true,
      response: {
        audioContentLength: responseData.audioContent ? responseData.audioContent.length : 0,
        // Don't return the full audio content to keep the response small
        audioContentPreview: responseData.audioContent ? `${responseData.audioContent.substring(0, 50)}...` : null
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    // Track the failed initialization
    googleApiKeyManager.trackServiceInitialization(
      service,
      'GROUP1',
      false,
      error.message
    );
    
    console.error(`Text-to-Speech API test failed:`, error);
    
    // Return error result
    return {
      service,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test Google Cloud Vision API
 */
export async function testVisionAPI(): Promise<TestResult> {
  const service: GoogleServiceType = 'vision';
  
  try {
    // Get the API key for this service
    const apiKey = googleApiKeyManager.getApiKeyForService(service);
    
    if (!apiKey) {
      throw new Error('No API key available for Vision API service');
    }
    
    // Define a simple base64-encoded image (1x1 pixel, transparent PNG)
    const sampleImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    
    // Define the API request data
    const requestData = {
      requests: [
        {
          image: {
            content: sampleImageBase64
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 5
            }
          ]
        }
      ]
    };
    
    // Make the API request
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
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
    
    // Track the successful initialization
    googleApiKeyManager.trackServiceInitialization(
      service,
      'GROUP1',
      true
    );
    
    // Return success result
    return {
      service,
      success: true,
      response: responseData,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    // Track the failed initialization
    googleApiKeyManager.trackServiceInitialization(
      service,
      'GROUP1',
      false,
      error.message
    );
    
    console.error(`Vision API test failed:`, error);
    
    // Return error result
    return {
      service,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test Google Cloud Natural Language API
 */
export async function testLanguageAPI(): Promise<TestResult> {
  const service: GoogleServiceType = 'language';
  
  try {
    // Get the API key for this service
    const apiKey = googleApiKeyManager.getApiKeyForService(service);
    
    if (!apiKey) {
      throw new Error('No API key available for Natural Language API service');
    }
    
    // Define the API request data
    const requestData = {
      document: {
        type: 'PLAIN_TEXT',
        content: 'Bitcoin is the leading cryptocurrency, offering decentralized transactions and financial freedom.'
      },
      encodingType: 'UTF8'
    };
    
    // Make the API request
    const response = await fetch(
      `https://language.googleapis.com/v1/documents:analyzeEntities?key=${apiKey}`,
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
    
    // Track the successful initialization
    googleApiKeyManager.trackServiceInitialization(
      service,
      'GROUP1',
      true
    );
    
    // Return success result
    return {
      service,
      success: true,
      response: responseData,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    // Track the failed initialization
    googleApiKeyManager.trackServiceInitialization(
      service,
      'GROUP1',
      false,
      error.message
    );
    
    console.error(`Natural Language API test failed:`, error);
    
    // Return error result
    return {
      service,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test Google Cloud Translation API
 */
export async function testTranslationAPI(): Promise<TestResult> {
  const service: GoogleServiceType = 'translate';
  
  try {
    // Get the API key for this service
    const apiKey = googleApiKeyManager.getApiKeyForService(service);
    
    if (!apiKey) {
      throw new Error('No API key available for Translation API service');
    }
    
    // Make the API request
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=Hello%20world&target=es&source=en`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API returned status ${response.status}: ${JSON.stringify(errorData)}`);
    }
    
    const responseData = await response.json();
    
    // Track the successful initialization
    googleApiKeyManager.trackServiceInitialization(
      service,
      'GROUP1',
      true
    );
    
    // Return success result
    return {
      service,
      success: true,
      response: responseData,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    // Track the failed initialization
    googleApiKeyManager.trackServiceInitialization(
      service,
      'GROUP1',
      false,
      error.message
    );
    
    console.error(`Translation API test failed:`, error);
    
    // Return error result
    return {
      service,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test Google Cloud Speech-to-Text API
 */
export async function testSpeechToTextAPI(): Promise<TestResult> {
  const service: GoogleServiceType = 'speech';
  
  try {
    // Get the API key for this service
    const apiKey = googleApiKeyManager.getApiKeyForService(service);
    
    if (!apiKey) {
      throw new Error('No API key available for Speech-to-Text API service');
    }
    
    // Define a very short audio content in base64 (empty audio)
    // In a real test, this would be actual audio content
    const dummyAudioContent = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    
    // Define the API request data
    const requestData = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US'
      },
      audio: {
        content: dummyAudioContent
      }
    };
    
    // Make the API request
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
    
    // Track the successful initialization
    googleApiKeyManager.trackServiceInitialization(
      service,
      'GROUP1',
      true
    );
    
    // Return success result
    return {
      service,
      success: true,
      response: responseData,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    // Track the failed initialization
    googleApiKeyManager.trackServiceInitialization(
      service,
      'GROUP1',
      false,
      error.message
    );
    
    console.error(`Speech-to-Text API test failed:`, error);
    
    // Return error result
    return {
      service,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Run all tests and return a comprehensive report
 */
export async function runAllServiceTests(): Promise<{
  timestamp: string;
  results: TestResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  }
}> {
  // Clear previous test results
  testResults.length = 0;
  
  // Run each test and collect results
  const results = await Promise.all([
    testTextToSpeech(),
    testVisionAPI(),
    testLanguageAPI(),
    testTranslationAPI(),
    testSpeechToTextAPI()
  ]);
  
  // Store results
  testResults.push(...results);
  
  // Generate summary
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  return {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      successful,
      failed
    }
  };
}

/**
 * Express handler for running Google Cloud service tests
 */
export function handleRunServiceTests(req: Request, res: Response): void {
  // Run the tests
  runAllServiceTests().then(report => {
    res.json(report);
  }).catch(error => {
    console.error('Error running service tests:', error);
    res.status(500).json({
      error: 'Failed to run service tests',
      message: error.message
    });
  });
}

export default {
  testTextToSpeech,
  testVisionAPI,
  testLanguageAPI,
  testTranslationAPI,
  testSpeechToTextAPI,
  runAllServiceTests,
  handleRunServiceTests
};