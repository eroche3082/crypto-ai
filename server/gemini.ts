import { Request, Response } from 'express';
import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';

/**
 * Generates a response from Google's Gemini AI models
 */
export async function generateAIResponse(req: Request, res: Response) {
  try {
    const { prompt, model = 'gemini-1.5-flash', language = 'en' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Gemini API key not found. Please set GEMINI_API_KEY environment variable.'
      });
    }
    
    // Select appropriate model
    const modelId = selectGeminiModel(model);
    
    // Create system instructions based on language
    const systemInstruction = createSystemInstruction(language);
    
    // Make API request to Gemini
    const response = await callGeminiAPI(modelId, apiKey, systemInstruction, prompt);
    
    // Return response to client
    res.json({ 
      response: response.text,
      model: modelId,
      language
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ 
      error: `Failed to generate AI response: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

/**
 * Select the appropriate Gemini model
 */
function selectGeminiModel(requestedModel: string): string {
  // Model mapping - default to gemini-1.5-flash if unknown model requested
  const modelMap: Record<string, string> = {
    'gemini-1.5-flash': 'gemini-1.5-flash',
    'gemini-1.5-pro': 'gemini-1.5-pro',
    'gemini-pro': 'gemini-pro',
    'gpt-4o': 'gemini-1.5-pro', // Use Gemini Pro as fallback for GPT requests
  };
  
  return modelMap[requestedModel] || 'gemini-1.5-flash';
}

/**
 * Create system instructions based on language
 */
function createSystemInstruction(language: string): string {
  const languageMap: Record<string, string> = {
    'en': 'You are CryptoBot, an expert assistant for cryptocurrency information and insights. Reply in English.',
    'es': 'Eres CryptoBot, un asistente experto en información y conocimientos sobre criptomonedas. Responde en español.',
    'fr': 'Tu es CryptoBot, un assistant expert en informations et en connaissances sur les cryptomonnaies. Réponds en français.',
    'pt': 'Você é o CryptoBot, um assistente especializado em informações e conhecimentos sobre criptomoedas. Responda em português.',
  };
  
  return languageMap[language] || languageMap['en'];
}

/**
 * Call the Gemini API with the given parameters
 */
async function callGeminiAPI(
  model: string, 
  apiKey: string, 
  systemInstruction: string, 
  prompt: string
): Promise<{ text: string }> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt }
            ]
          }
        ],
        system: systemInstruction,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    
    // Extract the text from the response
    const responseData = data as any;
    if (responseData.candidates && responseData.candidates.length > 0 && 
        responseData.candidates[0].content && 
        responseData.candidates[0].content.parts && 
        responseData.candidates[0].content.parts.length > 0) {
      return { text: responseData.candidates[0].content.parts[0].text };
    } else {
      throw new Error('No valid response from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}