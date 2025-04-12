/**
 * Gemini Integration Service
 * 
 * Provides functions for interacting with Google's Gemini API
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Request, Response } from 'express';

// Initialize Gemini with API key from environment
const geminiApiKey = process.env.VITE_GEMINI_API_KEY;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Check if Gemini is configured
const isConfigured = !!genAI;

/**
 * Generate a response using Gemini
 */
export async function generateResponse(
  prompt: string,
  temperature: number = 0.7,
  maxTokens?: number
): Promise<string> {
  if (!isConfigured) {
    throw new Error('Gemini API is not configured. Please provide VITE_GEMINI_API_KEY environment variable.');
  }

  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

/**
 * Generate a response with image input using Gemini
 */
export async function generateResponseWithImage(
  prompt: string,
  imageData: string,
  mimeType: string,
  temperature: number = 0.7,
  maxTokens?: number
): Promise<string> {
  if (!isConfigured) {
    throw new Error('Gemini API is not configured. Please provide VITE_GEMINI_API_KEY environment variable.');
  }

  try {
    // Get the generative model with vision capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Generate content
    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: imageData } }
        ] 
      }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API with image:', error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

/**
 * Express handler for Gemini requests
 */
export async function generateAIResponse(req: Request, res: Response) {
  if (!isConfigured) {
    return res.status(503).json({
      error: 'Gemini API is not configured. Please provide VITE_GEMINI_API_KEY environment variable.'
    });
  }

  const {
    prompt,
    temperature = 0.7,
    maxTokens
  } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: 'Prompt is required.'
    });
  }

  try {
    const response = await generateResponse(prompt, temperature, maxTokens);
    res.json({
      response,
      model: "gemini-pro"
    });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({
      error: `Gemini API error: ${error.message}`
    });
  }
}

/**
 * Express handler for Gemini Vision requests
 */
export async function handleImageAnalysis(req: Request, res: Response) {
  if (!isConfigured) {
    return res.status(503).json({
      error: 'Gemini API is not configured. Please provide VITE_GEMINI_API_KEY environment variable.'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      error: 'Image file is required.'
    });
  }

  const {
    prompt = 'Describe this image in detail.',
    temperature = 0.7,
    maxTokens
  } = req.body;

  // Convert image buffer to base64
  const imageData = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype;

  try {
    const response = await generateResponseWithImage(
      prompt,
      imageData,
      mimeType,
      temperature,
      maxTokens
    );

    res.json({
      response,
      model: "gemini-pro-vision"
    });
  } catch (error) {
    console.error('Error calling Gemini API for image analysis:', error);
    res.status(500).json({
      error: `Gemini API error: ${error.message}`
    });
  }
}

export { isConfigured };