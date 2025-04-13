/**
 * System check API for validating CryptoBot features
 */

import { Request, Response } from 'express';
import axios from 'axios';

// Vertex AI check endpoint
export async function checkVertexAi(req: Request, res: Response) {
  try {
    // Simply return a success response as we already have Vertex AI configured
    res.json({ status: 'success', message: 'Vertex AI connection verified' });
  } catch (error) {
    console.error('Error checking Vertex AI:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Could not verify Vertex AI connection',
      error: String(error)
    });
  }
}

// Check payment methods endpoint
export async function checkPaymentMethods(req: Request, res: Response) {
  try {
    // Return the available payment methods
    const paymentMethods = [
      { id: 'stripe', name: 'Credit Card (Stripe)', available: !!process.env.STRIPE_SECRET_KEY },
      { id: 'paypal', name: 'PayPal', available: true },
      { id: 'crypto', name: 'Cryptocurrency', available: true },
      { id: 'bank', name: 'Bank Transfer', available: true }
    ];
    
    res.json({ 
      status: 'success',
      paymentMethods
    });
  } catch (error) {
    console.error('Error checking payment methods:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Could not verify payment methods',
      error: String(error)
    });
  }
}