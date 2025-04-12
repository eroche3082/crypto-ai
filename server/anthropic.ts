/**
 * Anthropic Integration Service
 * 
 * Provides functions for interacting with Anthropic's API (Claude)
 */
import Anthropic from '@anthropic-ai/sdk';
import { Request, Response } from 'express';

// Initialize Anthropic with API key from environment
const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Check if Anthropic is configured
const isConfigured = !!anthropic;

/**
 * Generate a chat response using Anthropic's Claude
 */
export async function generateChatResponse(
  systemPrompt: string,
  userMessage: string,
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<string> {
  if (!isConfigured) {
    throw new Error('Anthropic API is not configured. Please provide ANTHROPIC_API_KEY environment variable.');
  }

  try {
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw new Error(`Anthropic API error: ${error.message}`);
  }
}

/**
 * Express handler for Claude chat requests
 */
export function generateClaudeResponse(req: Request, res: Response) {
  if (!isConfigured) {
    return res.status(503).json({
      error: 'Anthropic API is not configured. Please provide ANTHROPIC_API_KEY environment variable.'
    });
  }

  const {
    system = 'You are Claude, a helpful AI assistant.',
    messages,
    temperature = 0.7,
    max_tokens = 1000
  } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: 'Messages array is required.'
    });
  }

  // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
  anthropic.messages.create({
    model: 'claude-3-7-sonnet-20250219',
    max_tokens,
    temperature,
    system,
    messages
  })
    .then(response => {
      res.json({
        text: response.content[0].text,
        model: response.model,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      });
    })
    .catch(error => {
      console.error('Error calling Anthropic API:', error);
      res.status(500).json({
        error: `Anthropic API error: ${error.message}`
      });
    });
}

/**
 * Analyze an image with Claude
 */
export function analyzeImageWithClaude(req: Request, res: Response) {
  if (!isConfigured) {
    return res.status(503).json({
      error: 'Anthropic API is not configured. Please provide ANTHROPIC_API_KEY environment variable.'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      error: 'Image file is required.'
    });
  }

  // Convert image buffer to base64
  const base64Image = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype;

  const { 
    prompt = 'Describe this image in detail.',
    temperature = 0.7,
    max_tokens = 1000
  } = req.body;

  // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
  anthropic.messages.create({
    model: 'claude-3-7-sonnet-20250219',
    max_tokens,
    temperature,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Image
            }
          }
        ]
      }
    ]
  })
    .then(response => {
      res.json({
        text: response.content[0].text,
        model: response.model,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      });
    })
    .catch(error => {
      console.error('Error calling Anthropic API for image analysis:', error);
      res.status(500).json({
        error: `Anthropic API error: ${error.message}`
      });
    });
}

export { isConfigured };