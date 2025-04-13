/**
 * Stripe Integration Service for Universal Access Code System
 * 
 * Handles payments, subscriptions, and level unlocking through Stripe
 */

import { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from './db';
import { userOnboardingProfiles } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe payments will be unavailable.');
}

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

const DOMAIN = process.env.NODE_ENV === 'production' 
  ? 'https://cryptobot.replit.app'
  : 'http://localhost:5000';

/**
 * Create a Stripe checkout session for level unlocking
 */
export async function createCheckoutSession(req: Request, res: Response) {
  if (!stripe) {
    return res.status(503).json({ 
      error: 'Stripe payments are unavailable',
      details: 'Stripe API key is not configured'
    });
  }

  try {
    const { code, levelId, priceId } = req.body;

    // Verify request body
    if (!code || !levelId || !priceId) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'code, levelId, and priceId are required'
      });
    }

    // Find the user profile with the provided code
    const [profile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, code));

    if (!profile) {
      return res.status(404).json({ 
        error: 'Profile not found',
        details: 'No user profile found with the provided code'
      });
    }

    // Create or retrieve Stripe customer
    let customerId = profile.stripe_customer_id;
    
    if (!customerId) {
      // Create a new customer if one doesn't exist
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.name,
        metadata: {
          code: profile.unique_code,
          user_category: profile.user_category || 'standard'
        }
      });
      
      customerId = customer.id;
      
      // Update the profile with the new customer ID
      await db
        .update(userOnboardingProfiles)
        .set({ stripe_customer_id: customerId })
        .where(eq(userOnboardingProfiles.id, profile.id));
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer: customerId,
      metadata: {
        code: profile.unique_code,
        levelId: levelId,
        userId: profile.id.toString()
      },
      success_url: `${DOMAIN}/dashboard?code=${profile.unique_code}&success=true&level=${levelId}`,
      cancel_url: `${DOMAIN}/dashboard?code=${profile.unique_code}&canceled=true`
    });

    // Return session ID for the frontend
    res.json({ 
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe payments are unavailable' });
  }

  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Check if payment succeeded
        if (session.payment_status === 'paid') {
          await handleSuccessfulPayment(session);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent was successful:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
}

/**
 * Handle successful payment by updating the user's profile
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    // Extract metadata from session
    const { code, levelId } = session.metadata || {};
    
    if (!code || !levelId) {
      console.error('Missing metadata in Stripe session:', session.id);
      return;
    }

    // Find the user profile
    const [profile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, code));

    if (!profile) {
      console.error('Profile not found for code:', code);
      return;
    }

    // Get current unlocked levels
    const unlockedLevels = Array.isArray(profile.unlocked_levels) 
      ? profile.unlocked_levels 
      : [];
    
    // Add the new level if not already unlocked
    if (!unlockedLevels.includes(levelId)) {
      unlockedLevels.push(levelId);
    }

    // Get current payment history
    const paymentHistory = Array.isArray(profile.stripe_payment_history) 
      ? profile.stripe_payment_history 
      : [];
    
    // Add the new payment to history
    paymentHistory.push({
      sessionId: session.id,
      amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
      level: levelId,
      date: new Date().toISOString(),
      status: 'completed'
    });

    // Update the profile
    await db
      .update(userOnboardingProfiles)
      .set({
        unlocked_levels: unlockedLevels,
        stripe_payment_history: paymentHistory,
        last_payment_date: new Date(),
        subscription_status: 'paid',
        updated_at: new Date()
      })
      .where(eq(userOnboardingProfiles.id, profile.id));

    console.log(`Successfully unlocked level ${levelId} for user ${profile.name} (${code})`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

/**
 * Get available paid levels for dashboard 
 */
export async function getAvailableLevels(req: Request, res: Response) {
  try {
    // In a real app, these would likely come from a database
    // For this implementation, we're providing static levels
    const levels = [
      {
        id: 'level_1',
        name: 'Basic Access',
        description: 'Access to basic features and analytics',
        price: 0,
        currency: 'USD',
        features: ['Basic market data', 'Limited portfolio tracking', 'Standard AI chat'],
        status: 'free'
      },
      {
        id: 'level_2',
        name: 'Advanced Analytics',
        description: 'Enhanced analytics and trading insights',
        price: 19.99,
        currency: 'USD',
        priceId: process.env.STRIPE_PRICE_LEVEL_2 || 'price_mock_level_2',
        features: [
          'Advanced technical indicators', 
          'Extended historical data', 
          'Market sentiment analysis',
          'Portfolio optimization'
        ],
        status: 'paid'
      },
      {
        id: 'level_3',
        name: 'Premium Trading Suite',
        description: 'Full access to all trading tools and features',
        price: 49.99,
        currency: 'USD',
        priceId: process.env.STRIPE_PRICE_LEVEL_3 || 'price_mock_level_3',
        features: [
          'Real-time trading signals',
          'Custom alert systems',
          'Priority AI responses',
          'Exclusive market reports',
          'Premium tech support'
        ],
        status: 'premium'
      }
    ];

    // Get the user's already unlocked levels
    const { code } = req.query;
    
    if (code) {
      const [profile] = await db
        .select()
        .from(userOnboardingProfiles)
        .where(eq(userOnboardingProfiles.unique_code, code as string));

      if (profile) {
        // Mark levels as unlocked based on user's profile
        const unlockedLevels = Array.isArray(profile.unlocked_levels) 
          ? profile.unlocked_levels 
          : [];
        
        // Update the levels with unlocked status
        const userLevels = levels.map(level => ({
          ...level,
          unlocked: level.status === 'free' || unlockedLevels.includes(level.id)
        }));
        
        return res.json(userLevels);
      }
    }

    // If no code provided or profile not found, return standard levels
    res.json(levels.map(level => ({
      ...level,
      unlocked: level.status === 'free'
    })));
  } catch (error) {
    console.error('Error getting available levels:', error);
    res.status(500).json({ 
      error: 'Failed to get available levels',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Verify a referral code and unlock features if valid
 */
export async function verifyReferralCode(req: Request, res: Response) {
  try {
    const { userCode, referralCode } = req.body;

    if (!userCode || !referralCode) {
      return res.status(400).json({
        error: 'Missing codes',
        details: 'Both userCode and referralCode are required'
      });
    }

    // Check that codes are different
    if (userCode === referralCode) {
      return res.status(400).json({
        error: 'Invalid referral',
        details: 'You cannot use your own code as a referral'
      });
    }

    // Find the user profile
    const [userProfile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, userCode));

    if (!userProfile) {
      return res.status(404).json({
        error: 'User not found',
        details: 'No profile found with the provided user code'
      });
    }

    // Find the referrer profile
    const [referrerProfile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, referralCode));

    if (!referrerProfile) {
      return res.status(404).json({
        error: 'Referrer not found',
        details: 'Invalid referral code'
      });
    }

    // Update referrer's referral count
    await db
      .update(userOnboardingProfiles)
      .set({
        referral_count: (referrerProfile.referral_count || 0) + 1,
        updated_at: new Date()
      })
      .where(eq(userOnboardingProfiles.id, referrerProfile.id));

    // Unlock level 2 for the user if not already unlocked
    const unlockedLevels = Array.isArray(userProfile.unlocked_levels) 
      ? userProfile.unlocked_levels 
      : [];
    
    if (!unlockedLevels.includes('level_2')) {
      unlockedLevels.push('level_2');
      
      await db
        .update(userOnboardingProfiles)
        .set({
          unlocked_levels: unlockedLevels,
          updated_at: new Date()
        })
        .where(eq(userOnboardingProfiles.id, userProfile.id));
    }

    res.json({
      success: true,
      message: 'Referral code successfully applied',
      unlockedLevel: 'level_2'
    });
  } catch (error) {
    console.error('Error verifying referral code:', error);
    res.status(500).json({
      error: 'Failed to verify referral code',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}