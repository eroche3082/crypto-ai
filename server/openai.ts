/**
 * OpenAI Integration Service
 * 
 * Provides functions for interacting with OpenAI's API
 */
import OpenAI from 'openai';
import { Request, Response } from 'express';

// Initialize OpenAI with API key from environment
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Check if OpenAI is configured
const isConfigured = !!openai;

/**
 * Generate a chat response using OpenAI
 */
export async function generateChatResponse(
  systemPrompt: string,
  userMessage: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  if (!isConfigured) {
    throw new Error('OpenAI API is not configured. Please provide OPENAI_API_KEY environment variable.');
  }

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature,
      max_tokens: maxTokens
    });

    return response.choices[0].message.content || 'No response generated.';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Express handler for OpenAI chat requests
 */
export async function handleOpenAIChat(req: Request, res: Response) {
  if (!isConfigured) {
    return res.status(503).json({
      error: 'OpenAI API is not configured. Please provide OPENAI_API_KEY environment variable.'
    });
  }

  const {
    messages,
    systemPrompt = 'You are a helpful assistant.',
    temperature = 0.7,
    max_tokens = 1000
  } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: 'Messages array is required.'
    });
  }

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature,
      max_tokens
    });

    res.json({
      text: response.choices[0].message.content,
      model: response.model,
      usage: response.usage
    });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({
      error: `OpenAI API error: ${error.message}`
    });
  }
}

/**
 * Generate an image using DALL-E
 */
export async function generateImage(
  prompt: string,
  size: '256x256' | '512x512' | '1024x1024' = '512x512',
  quality: 'standard' | 'hd' = 'standard',
  n: number = 1
): Promise<string[]> {
  if (!isConfigured) {
    throw new Error('OpenAI API is not configured. Please provide OPENAI_API_KEY environment variable.');
  }

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n,
      size,
      quality
    });

    return response.data.map(img => img.url);
  } catch (error) {
    console.error('Error generating image with DALL-E:', error);
    throw new Error(`DALL-E API error: ${error.message}`);
  }
}

/**
 * Express handler for image generation
 */
export async function handleImageGeneration(req: Request, res: Response) {
  if (!isConfigured) {
    return res.status(503).json({
      error: 'OpenAI API is not configured. Please provide OPENAI_API_KEY environment variable.'
    });
  }

  const {
    prompt,
    size = '512x512',
    quality = 'standard',
    n = 1
  } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: 'Prompt is required.'
    });
  }

  try {
    const urls = await generateImage(prompt, size, quality, n);
    res.json({
      urls
    });
  } catch (error) {
    console.error('Error generating image with DALL-E:', error);
    res.status(500).json({
      error: `DALL-E API error: ${error.message}`
    });
  }
}

export { isConfigured };