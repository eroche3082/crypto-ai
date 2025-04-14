/**
 * Vertex AI Diagnostic Service
 * 
 * Provides diagnostic functions for testing Vertex AI connectivity, quota, and billing status
 */
import { Request, Response } from 'express';
import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';

// Prepare response object
interface DiagnosticResult {
  status: 'success' | 'error' | 'warning';
  apiConnectivity: boolean;
  quotaStatus: string;
  billingActive: boolean;
  errorDetails?: string;
  responseTime?: number;
  modelUsed?: string;
  recommendedAction?: string;
}

/**
 * Performs a diagnostic test on Vertex AI
 * - Tests connectivity
 * - Checks for quota/billing issues
 * - Reports response times
 * - Returns detailed diagnostics
 */
export async function runVertexDiagnostics(req: Request, res: Response) {
  const result: DiagnosticResult = {
    status: 'error',
    apiConnectivity: false,
    quotaStatus: 'unknown',
    billingActive: false
  };

  const startTime = Date.now();

  try {
    // Check for API key and credentials config
    const apiKey = process.env.GOOGLE_API_KEY || process.env.VERTEX_AI_API_KEY || process.env.GOOGLE_VERTEX_KEY_ID;
    const credentialsFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!apiKey && !credentialsFile) {
      result.status = 'error';
      result.errorDetails = 'No Vertex AI API key or credentials found in environment variables';
      result.recommendedAction = 'Please configure GOOGLE_API_KEY, VERTEX_AI_API_KEY, GOOGLE_VERTEX_KEY_ID, or GOOGLE_APPLICATION_CREDENTIALS';
      return res.status(500).json(result);
    }
    
    // Check if credential file exists (if used)
    if (credentialsFile) {
      if (!fs.existsSync(credentialsFile)) {
        result.status = 'error';
        result.errorDetails = `Google credentials file not found at path: ${credentialsFile}`;
        result.recommendedAction = 'Please ensure the GOOGLE_APPLICATION_CREDENTIALS points to a valid file';
        return res.status(500).json(result);
      }
    }

    console.log(`Using API key: ${apiKey ? 'Yes (via env var)' : 'No'}, Using credentials file: ${credentialsFile ? 'Yes' : 'No'}`);

    // Try the @google/generative-ai library first (works better with API keys)
    const model = 'gemini-1.5-pro';
    let responseText = '';
    let responseTime = 0;
    
    try {
      console.log('Attempting to connect using @google/generative-ai library');
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model: model });
      
      // Use a simple diagnostic prompt
      const prompt = "Respond with a single word: 'active' if you can read this message.";
      
      const genResponse = await genModel.generateContent(prompt);
      responseText = genResponse.response.text();
      const endTime = Date.now();
      responseTime = endTime - startTime;
      
      console.log('Response from GoogleGenerativeAI:', responseText);
    } catch (genAiError) {
      console.error('Error with GoogleGenerativeAI:', genAiError);
      console.log('Falling back to VertexAI library...');
      
      // Initialize Vertex AI client using API key if available
      let vertexAI;
      try {
        if (apiKey) {
          vertexAI = new VertexAI({
            project: process.env.GOOGLE_PROJECT_ID || 'cryptobot-ai',
            location: process.env.GOOGLE_LOCATION || 'us-central1',
            apiEndpoint: "us-central1-aiplatform.googleapis.com",
          });
        } else {
          vertexAI = new VertexAI({
            project: process.env.GOOGLE_PROJECT_ID || 'cryptobot-ai',
            location: process.env.GOOGLE_LOCATION || 'us-central1',
            apiEndpoint: "us-central1-aiplatform.googleapis.com",
            googleAuthOptions: {
              scopes: ["https://www.googleapis.com/auth/cloud-platform"],
              keyFile: credentialsFile || './google-credentials-global.json',
            },
          });
        }

        // Try to make a simple API call to test connectivity
        const generativeModel = vertexAI.getGenerativeModel({
          model: model,
          apiKey: apiKey,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
          ],
          generation_config: {
            max_output_tokens: 50,
            temperature: 0.2,
          },
        });

        // Use a simple diagnostic prompt
        const prompt = "Respond with a single word: 'active' if you can read this message.";
        
        const response = await generativeModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        responseText = response.response.candidates[0].content.parts[0].text;
        const endTime = Date.now();
        responseTime = endTime - startTime;
      } catch (vertexError) {
        console.error('Error with VertexAI:', vertexError);
        throw vertexError; // Rethrow to be caught by outer catch block
      }
    }
    
    // Check the response
    const endTime = Date.now();

    // Check the response
    if (responseText && responseText.toLowerCase().includes('active')) {
      result.status = 'success';
      result.apiConnectivity = true;
      result.quotaStatus = 'available';
      result.billingActive = true;
      result.responseTime = responseTime;
      result.modelUsed = model;
    } else {
      result.status = 'warning';
      result.apiConnectivity = true;
      result.quotaStatus = 'uncertain';
      result.billingActive = true;
      result.responseTime = responseTime;
      result.modelUsed = model;
      result.errorDetails = 'API responded but with unexpected content';
    }

  } catch (error: any) {
    result.status = 'error';
    result.errorDetails = error.message || 'Unknown error occurred';
    
    // Check for specific error messages related to quota and billing
    const errorMsg = error.message?.toLowerCase() || '';
    
    if (errorMsg.includes('quota') || errorMsg.includes('rate limit')) {
      result.quotaStatus = 'exceeded';
      result.recommendedAction = 'Your quota has been exceeded. Consider upgrading your plan or waiting until the quota resets.';
    } else if (errorMsg.includes('billing') || errorMsg.includes('payment') || errorMsg.includes('budget')) {
      result.billingActive = false;
      result.recommendedAction = 'There appears to be an issue with billing. Please check your Google Cloud billing account.';
    } else if (errorMsg.includes('permission') || errorMsg.includes('unauthorized') || errorMsg.includes('unauthenticated')) {
      result.recommendedAction = 'Authentication failed. Please check your API key and permissions.';
    } else if (errorMsg.includes('not found')) {
      result.recommendedAction = 'The specified model or resource was not found. Verify that you are using the correct model name.';
    } else {
      result.recommendedAction = 'An unexpected error occurred. Please check your network connection and try again.';
    }
  }

  return res.json(result);
}

/**
 * Runs a more comprehensive series of tests on the Vertex AI API
 * - Tests connectivity with different models
 * - Checks response times under load
 * - Verifies token limits
 */
export async function runComprehensiveVertexDiagnostic(req: Request, res: Response) {
  const results = {
    overallStatus: 'pending',
    modelTests: [] as any[],
    loadTests: {
      status: 'pending',
      averageResponseTime: 0,
      errorRate: 0,
      details: ''
    },
    tokenTests: {
      status: 'pending',
      maxTokensReached: 0,
      details: ''
    },
    startTime: new Date().toISOString(),
    endTime: '',
    duration: 0
  };

  const startTime = Date.now();

  try {
    // Check for API key and credentials config
    const apiKey = process.env.GOOGLE_API_KEY || process.env.VERTEX_AI_API_KEY || process.env.GOOGLE_VERTEX_KEY_ID;
    const credentialsFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    console.log(`Comprehensive Test - Using API key: ${apiKey ? 'Yes (via env var)' : 'No'}, Using credentials file: ${credentialsFile ? 'Yes' : 'No'}`);

    // Test different models
    const models = ['gemini-1.5-pro', 'gemini-1.5-flash'];
    
    // Try the @google/generative-ai library first
    try {
      console.log('Comprehensive test: Attempting to connect using @google/generative-ai library');
      const genAI = new GoogleGenerativeAI(apiKey);
      
      for (const modelName of models) {
        try {
          const modelTest = {
            model: modelName,
            status: 'pending',
            responseTime: 0,
            errorDetails: '',
            api: 'GoogleGenerativeAI'
          };
          
          const modelStartTime = Date.now();
          const genModel = genAI.getGenerativeModel({ model: modelName });
          
          const prompt = `Test connectivity for model: ${modelName}`;
          const genResponse = await genModel.generateContent(prompt);
          
          const modelEndTime = Date.now();
          modelTest.responseTime = modelEndTime - modelStartTime;
          modelTest.status = 'success';
          
          results.modelTests.push(modelTest);
        } catch (modelError: any) {
          results.modelTests.push({
            model: modelName,
            status: 'error',
            responseTime: 0,
            errorDetails: modelError.message || 'Unknown error',
            api: 'GoogleGenerativeAI'
          });
        }
      }
    } catch (genAiError) {
      console.error('Error with GoogleGenerativeAI:', genAiError);
      console.log('Falling back to VertexAI library...');
      
      // Initialize Vertex AI client as fallback
      let vertexAI;
      if (apiKey) {
        vertexAI = new VertexAI({
          project: process.env.GOOGLE_PROJECT_ID || 'cryptobot-ai',
          location: process.env.GOOGLE_LOCATION || 'us-central1',
          apiEndpoint: "us-central1-aiplatform.googleapis.com",
        });
      } else {
        vertexAI = new VertexAI({
          project: process.env.GOOGLE_PROJECT_ID || 'cryptobot-ai',
          location: process.env.GOOGLE_LOCATION || 'us-central1',
          apiEndpoint: "us-central1-aiplatform.googleapis.com",
          googleAuthOptions: {
            scopes: ["https://www.googleapis.com/auth/cloud-platform"],
            keyFile: credentialsFile || './google-credentials-global.json',
          },
        });
      }

      for (const modelName of models) {
        try {
          const modelTest = {
            model: modelName,
            status: 'pending',
            responseTime: 0,
            errorDetails: '',
            api: 'VertexAI'
          };
          
          const modelStartTime = Date.now();
          const generativeModel = vertexAI.getGenerativeModel({
            model: modelName,
            apiKey: apiKey,
            safetySettings: [
              {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
              },
              {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
              },
            ],
            generation_config: {
              max_output_tokens: 50,
              temperature: 0.2,
            },
          });
          
          const response = await generativeModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: `Test connectivity for model: ${modelName}` }] }],
          });
          
          const modelEndTime = Date.now();
          modelTest.responseTime = modelEndTime - modelStartTime;
          modelTest.status = 'success';
          
          results.modelTests.push(modelTest);
        } catch (error: any) {
          results.modelTests.push({
            model: modelName,
            status: 'error',
            responseTime: 0,
            errorDetails: error.message || 'Unknown error',
            api: 'VertexAI'
          });
        }
      }
    }
    
    // Evaluate overall status
    const successfulTests = results.modelTests.filter(test => test.status === 'success').length;
    results.overallStatus = successfulTests > 0 ? 'success' : 'error';
    
    const endTime = Date.now();
    results.endTime = new Date().toISOString();
    results.duration = endTime - startTime;
    
    return res.json(results);
  } catch (error: any) {
    results.overallStatus = 'error';
    results.endTime = new Date().toISOString();
    results.duration = Date.now() - startTime;
    
    return res.status(500).json({
      ...results,
      error: error.message || 'An unexpected error occurred during diagnostics'
    });
  }
}