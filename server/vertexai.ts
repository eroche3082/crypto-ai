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
    
    try {
      // Attempt various ways to extract the text based on the API version
      if (typeof result.response.text === 'function') {
        // If text() is a function, call it
        responseText = result.response.text();
      } else if (result.response.candidates && result.response.candidates.length > 0) {
        // Try to get text from candidates array
        if (result.response.candidates[0].content?.parts?.[0]?.text) {
          responseText = result.response.candidates[0].content.parts[0].text;
        }
      } else {
        // Last resort - try to convert the entire response to a string
        console.log("Attempting to stringify the entire response");
        const stringifiedResponse = JSON.stringify(result.response);
        if (stringifiedResponse && stringifiedResponse.length > 0) {
          responseText = `Raw response: ${stringifiedResponse.substring(0, 500)}...`;
        }
      }
    } catch (e) {
      console.error("Error extracting text from response:", e);
    }
    
    console.log("VertexAI generated response:", responseText.substring(0, 100) + "...");
    
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