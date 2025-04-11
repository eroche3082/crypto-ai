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
    
    // Generate content - Use simpler config without safety settings to avoid type errors
    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    // Extract the response text safely
    let responseText = "No response generated";
    
    // Access the response content through the appropriate structure
    // Note: The structure of the response might vary depending on the API version
    if (result.response && result.response.candidates && result.response.candidates.length > 0) {
      const candidate = result.response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const part = candidate.content.parts[0];
        if (part.text) {
          responseText = part.text;
        }
      }
    }
    
    // If we still don't have a response, try to log the structure for debugging
    if (responseText === "No response generated") {
      console.log("Could not extract text from response. Response structure:", 
                  JSON.stringify(result.response).substring(0, 500));
    } else {
      console.log("VertexAI generated response:", responseText.substring(0, 100) + "...");
    }
    
    // Return response to client
    res.json({ 
      response: responseText,
      model: modelName,
      language: language
    });
  } catch (error) {
    console.error('Vertex AI error:', error);
    res.status(500).json({ 
      error: `Failed to generate AI response: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}