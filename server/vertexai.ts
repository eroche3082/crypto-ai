import { VertexAI } from "@google-cloud/vertexai";
import { systemPrompt } from "../client/src/lib/systemPrompt";
import { Request, Response } from 'express';

// Create client options
const options = {
  project: process.env.GOOGLE_PROJECT_ID || "your-project-id",
  location: process.env.GOOGLE_LOCATION || "us-central1",
  apiEndpoint: process.env.GOOGLE_API_ENDPOINT,
};

// Create the VertexAI client
const vertexAi = new VertexAI(options);

// Get the generative model
const getGenerativeModel = (modelName: string = "gemini-1.5-flash-latest") => {
  return vertexAi.getGenerativeModel({ model: modelName });
};

/**
 * Generate a response using Vertex AI Gemini
 */
export async function generateVertexAIResponse(req: Request, res: Response) {
  try {
    const { prompt, modelName = 'gemini-1.5-flash-latest', language = 'en' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Gemini API key not found. Please set GEMINI_API_KEY environment variable.'
      });
    }
    
    // Create a language-specific instruction based on the user's preference
    let languageInstruction = "";
    if (language === 'es') {
      languageInstruction = "Responde en español. ";
    } else if (language === 'fr') {
      languageInstruction = "Réponds en français. ";
    } else if (language === 'pt') {
      languageInstruction = "Responda em português. ";
    }
    
    // Combine the system prompt with the user's prompt
    const fullPrompt = `${systemPrompt}\n\n${languageInstruction}${prompt}`;
    
    // Get the generative model
    const generativeModel = getGenerativeModel(modelName);
    
    // Generate content
    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
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
    });
    
    // Get the response text
    const responseText = await result.response.text();
    
    // Return response to client
    res.json({ 
      response: responseText,
      model: modelName,
      language
    });
  } catch (error) {
    console.error('Vertex AI error:', error);
    res.status(500).json({ 
      error: `Failed to generate AI response: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}