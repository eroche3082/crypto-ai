import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getSystemPrompt } from "./lib/systemPrompts";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Check if environment variable exists
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("ANTHROPIC_API_KEY environment variable is not set. Anthropic API will not work.");
}

/**
 * Generate a response using Anthropic's Claude model
 */
export async function generateClaudeResponse(req: Request, res: Response) {
  try {
    const { prompt, model = 'claude-3-7-sonnet-20250219', language = 'en' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Anthropic API key not found. Please set ANTHROPIC_API_KEY environment variable.'
      });
    }
    
    // Get the system prompt for Claude - using OpenAI prompt format for compatibility
    const systemPromptText = getSystemPrompt('openai', language);
    
    // Send request to Anthropic API
    const result = await anthropic.messages.create({
      model: model,
      max_tokens: 1024,
      system: systemPromptText,
      messages: [
        { role: 'user', content: prompt }
      ]
    });
    
    // Extract response content
    let responseText = "";
    if (result.content && result.content.length > 0) {
      responseText = result.content[0].text;
    } else {
      responseText = "No response generated";
    }
    
    // Return response to client
    res.json({ 
      response: responseText,
      model: model,
      language: language
    });
  } catch (error) {
    console.error('Anthropic API error:', error);
    res.status(500).json({ 
      error: `Failed to generate Claude response: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}

/**
 * Analyze an image using Claude's vision capabilities
 */
export async function analyzeImageWithClaude(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Anthropic API key not found. Please set ANTHROPIC_API_KEY environment variable.'
      });
    }
    
    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    
    // Get the enhanced system prompt for image analysis
    const imageAnalysisSystemPrompt = `You are CryptoBot, an advanced cryptocurrency image analysis expert with multimodal capabilities as part of PHASE 4 - UNIVERSAL INTELLIGENCE.
You can analyze:
1. Cryptocurrency charts and identify technical patterns like head and shoulders, wedges, pennants, etc.
2. Blockchain transaction visualizations and network graphs
3. Cryptocurrency logos and brand materials
4. NFT collections and digital assets
5. QR codes containing wallet addresses or transaction data
6. Market sentiment visualizations

When analyzing charts:
- Identify the time frame and scale
- Note key support and resistance levels
- Describe visible patterns and what they typically indicate
- Identify trend lines and potential breakout/breakdown points
- Comment on volume indicators if visible

For QR codes:
- Describe what the QR code likely contains (wallet address, transaction, etc.)
- Identify the blockchain network if possible

For NFTs or digital assets:
- Describe the visual elements and artistic style
- Identify the collection if recognizable
- Note any distinctive features that might affect valuation

Respond with clear, educational analysis without making definitive price predictions.`;

    // Send request to Anthropic API
    const result = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      system: imageAnalysisSystemPrompt,
      messages: [
        { 
          role: 'user', 
          content: [
            {
              type: "text",
              text: "Analyze this cryptocurrency-related image in detail and explain what you see. Identify patterns, trends, or important information that would be relevant for cryptocurrency investors or enthusiasts."
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: imageBase64
              }
            }
          ]
        }
      ]
    });
    
    // Extract response content
    let analysisText = "";
    if (result.content && result.content.length > 0) {
      analysisText = result.content[0].text;
    } else {
      analysisText = "No analysis generated";
    }
    
    // Return response to client
    res.json({ 
      analysis: analysisText,
      model: "claude-3-7-sonnet-20250219"
    });
  } catch (error) {
    console.error('Claude image analysis error:', error);
    res.status(500).json({ 
      error: `Failed to analyze image with Claude: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}