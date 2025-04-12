import { Request, Response } from 'express';
import { GoogleAuth } from 'google-auth-library';
import fetch from 'node-fetch';
import { getSystemPrompt } from "./lib/systemPrompts";

/**
 * Generates a response from Google's Gemini AI models
 */
export async function generateAIResponse(req: Request, res: Response) {
  try {
    const { prompt, model = 'gemini-1.5-flash', language = 'en', userProfile } = req.body;
    
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
    
    // Create system instructions based on language and user profile
    const systemInstruction = createSystemInstruction(language, userProfile);
    
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
    'gemini-1.5-flash-latest': 'gemini-1.5-flash-latest',
    'gemini-1.5-pro': 'gemini-1.5-pro',
    'gemini-pro': 'gemini-pro',
    'gpt-4o': 'gemini-1.5-pro', // Use Gemini Pro as fallback for GPT requests
  };
  
  return modelMap[requestedModel] || 'gemini-1.5-flash';
}

/**
 * Create system instructions based on language and user profile
 */
function createSystemInstruction(language: string, userProfile?: any): string {
  // Get the base system prompt
  let basePrompt = getSystemPrompt('gemini', language);
  
  // If user profile is available, enhance the prompt with personalization
  if (userProfile) {
    const personalizationPrompt = createPersonalizationPrompt(userProfile, language);
    return `${basePrompt}\n\n${personalizationPrompt}`;
  }
  
  // Otherwise return standard prompt
  return basePrompt;
}

/**
 * Create a personalization prompt based on user profile data
 */
function createPersonalizationPrompt(userProfile: any, language: string): string {
  // Extract profile information
  const { name, experience, interests, exchanges, goals, preferredCrypto } = userProfile;
  
  // Create English or Spanish personalization instructions
  if (language === 'es') {
    return `
INFORMACIÓN DEL PERFIL DEL USUARIO:
- Nombre: ${name || 'No disponible'}
- Nivel de experiencia en criptomonedas: ${experience || 'No especificado'}
- Intereses: ${interests?.join(', ') || 'No especificado'}
- Exchanges preferidos: ${exchanges?.join(', ') || 'No especificado'}
- Objetivos de inversión: ${goals || 'No especificado'}
- Criptomonedas preferidas: ${preferredCrypto?.join(', ') || 'No especificado'}

INSTRUCCIONES PARA PERSONALIZACIÓN:
- Adapta tus respuestas al nivel de experiencia del usuario.
- Prioriza información sobre sus intereses y criptomonedas preferidas.
- Contextualiza tus respuestas en función de sus objetivos de inversión.
- Haz referencias relevantes a los exchanges que utiliza.
- Sé empático y personaliza el tono según el perfil del usuario.
- Mantén un estilo conversacional y amigable.`;
  }
  
  // Default to English
  return `
USER PROFILE INFORMATION:
- Name: ${name || 'Not available'}
- Cryptocurrency experience level: ${experience || 'Not specified'}
- Interests: ${interests?.join(', ') || 'Not specified'}
- Preferred exchanges: ${exchanges?.join(', ') || 'Not specified'}
- Investment goals: ${goals || 'Not specified'}
- Preferred cryptocurrencies: ${preferredCrypto?.join(', ') || 'Not specified'}

PERSONALIZATION INSTRUCTIONS:
- Adapt your responses to the user's experience level.
- Prioritize information about their interests and preferred cryptocurrencies.
- Contextualize your responses based on their investment goals.
- Make relevant references to exchanges they use.
- Be empathetic and personalize tone based on user profile.
- Maintain a conversational and friendly style.`;
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
  
  // Combine system instruction and prompt into a single text for the user role
  // This is because Gemini API in REST mode does not accept "system" role
  const combinedPrompt = systemInstruction + "\n\n" + prompt;
  
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
              { text: combinedPrompt }
            ]
          }
        ],
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