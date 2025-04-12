/**
 * AI Provider Controller
 * 
 * Manages the available AI providers and their capabilities
 */

import { Request, Response } from 'express';
import * as openai from '../openai';
import * as anthropic from '../anthropic';
import * as gemini from '../gemini';
import * as vertexai from '../vertexai';
import { getAvailableProviders } from './contextAwareChatController';

/**
 * Get available AI providers
 */
export function getProviders(req: Request, res: Response) {
  try {
    const providers = getAvailableProviders();
    
    res.json({
      providers,
      capabilities: {
        text: providers,
        image: providers.filter(p => p === 'openai' || p === 'gemini' || p === 'vertexai' || p === 'anthropic'),
        audio: providers.filter(p => p === 'openai')
      },
      features: {
        contextAwareChat: providers.length > 0,
        imageGeneration: providers.includes('openai'),
        imageAnalysis: providers.some(p => ['gemini', 'openai', 'anthropic', 'vertexai'].includes(p)),
        translation: providers.length > 0,
        sentimentAnalysis: providers.length > 0
      }
    });
  } catch (error) {
    console.error('Error getting AI providers:', error);
    res.status(500).json({
      error: `Error getting AI providers: ${error.message}`
    });
  }
}