/**
 * Stripe Integration Service for Universal Access Code System
 * 
 * Handles payments, subscriptions, and level unlocking through Stripe
 */

import { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { userOnboardingProfiles } from '@shared/schema';

// Initialize Stripe with the secret key
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

// Define paid levels and their features
const PAID_LEVELS = {
  'BASIC': {
    price: 1999, // $19.99
    name: 'Basic Plan',
    features: [
      'Portfolio Tracker',
      'Basic Market Analysis',
      'News Feed',
      'Email Alerts'
    ],
    description: 'Essential tools for crypto beginners and casual investors'
  },
  'PRO': {
    price: 4999, // $49.99
    name: 'Pro Plan',
    features: [
      'All Basic Plan Features',
      'Advanced Technical Analysis',
      'AI Market Predictions',
      'Portfolio Optimization',
      'Trading Signals',
      'Tax Reporting'
    ],
    description: 'Comprehensive toolkit for serious crypto traders'
  },
  'PREMIUM': {
    price: 9999, // $99.99
    name: 'Premium Plan',
    features: [
      'All Pro Plan Features',
      'Custom AI Strategy Builder',
      'API Access',
      'Dedicated Account Manager',
      'Priority Support',
      'Early Access to New Features'
    ],
    description: 'Enterprise-grade solutions for professional traders and institutions'
  }
};

/**
 * Create a Stripe checkout session for level unlocking
 */
export async function createCheckoutSession(req: Request, res: Response) {
  try {
    if (!stripe) {
      return res.status(400).json({
        error: 'Stripe not configured',
        details: 'Stripe API key is missing'
      });
    }

    const { accessCode, levelId } = req.body;

    if (!accessCode || !levelId) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Access code and levelId are required'
      });
    }

    // Validate level exists
    const level = PAID_LEVELS[levelId as keyof typeof PAID_LEVELS];
    if (!level) {
      return res.status(400).json({
        error: 'Invalid level',
        details: `Level ${levelId} does not exist`
      });
    }

    // Find user profile with the access code
    const [profile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, accessCode));

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        details: 'No profile found with the provided access code'
      });
    }

    // Create checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: level.name,
              description: level.description,
              metadata: {
                levelId
              }
            },
            unit_amount: level.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        accessCode,
        profileId: profile.id.toString(),
        levelId
      },
      mode: 'payment',
      success_url: `${req.headers.origin}/dashboard?code=${accessCode}&success=true&level=${levelId}`,
      cancel_url: `${req.headers.origin}/dashboard?code=${accessCode}&canceled=true`,
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
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
  try {
    if (!stripe) {
      return res.status(400).json({
        error: 'Stripe not configured',
        details: 'Stripe API key is missing'
      });
    }

    // Get the webhook signature
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      return res.status(400).json({
        error: 'Missing signature',
        details: 'Stripe webhook signature is required'
      });
    }

    // In a production environment, we would validate the Stripe webhook signature
    // For demo purposes, we'll skip this step

    // Parse the webhook event
    const event = req.body;

    // Handle the event based on its type
    switch (event.type) {
      case 'checkout.session.completed':
        await handleSuccessfulPayment(event.data.object);
        break;
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    res.status(500).json({
      error: 'Failed to handle webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Handle successful payment by updating the user's profile
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    // Extract metadata from the session
    const { accessCode, levelId, profileId } = session.metadata || {};

    if (!accessCode || !levelId || !profileId) {
      console.error('Missing metadata in Stripe session:', session.id);
      return;
    }

    // Convert profileId to number for database query
    const id = parseInt(profileId, 10);
    if (isNaN(id)) {
      console.error('Invalid profile ID:', profileId);
      return;
    }

    // Find the user profile
    const [profile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.id, id));

    if (!profile) {
      console.error('Profile not found for ID:', id);
      return;
    }

    // Update the user profile with the new level
    const updatedUnlockedLevels = [...(profile.unlocked_levels || []), levelId];
    
    // Add level-specific features
    const level = PAID_LEVELS[levelId as keyof typeof PAID_LEVELS];
    const updatedUnlockedFeatures = [
      ...(profile.unlocked_features || []),
      ...level.features
    ];

    // Update the profile in the database
    await db.update(userOnboardingProfiles)
      .set({
        unlocked_levels: updatedUnlockedLevels,
        unlocked_features: updatedUnlockedFeatures,
        subscription_status: 'paid',
        last_payment_date: new Date(),
        payment_amount: level.price / 100, // Convert cents to dollars
        payment_currency: 'USD',
        payment_reference: session.id
      })
      .where(eq(userOnboardingProfiles.id, id));

    console.log(`Successfully updated profile ${id} with new level ${levelId}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

/**
 * Get available paid levels for dashboard 
 */
export async function getAvailableLevels(req: Request, res: Response) {
  try {
    const { accessCode } = req.query;

    // If no accessCode is provided, return all available levels
    if (!accessCode) {
      return res.json({
        levels: Object.entries(PAID_LEVELS).map(([id, level]) => ({
          id,
          name: level.name,
          price: level.price / 100,
          features: level.features,
          description: level.description
        }))
      });
    }

    // If accessCode is provided, get user-specific unlocked levels
    const [profile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, accessCode as string));

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        details: 'No profile found with the provided access code'
      });
    }

    // Return all levels with an 'unlocked' flag
    const unlockedLevels = profile.unlocked_levels || [];
    
    const levelsWithStatus = Object.entries(PAID_LEVELS).map(([id, level]) => ({
      id,
      name: level.name,
      price: level.price / 100,
      features: level.features,
      description: level.description,
      unlocked: unlockedLevels.includes(id)
    }));

    res.json({
      levels: levelsWithStatus,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        subscription_status: profile.subscription_status || 'free'
      }
    });
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
    const { accessCode, referralCode } = req.body;

    if (!accessCode || !referralCode) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Access code and referral code are required'
      });
    }

    // Check if codes are the same
    if (accessCode === referralCode) {
      return res.status(400).json({
        error: 'Invalid referral',
        details: 'You cannot use your own code as a referral'
      });
    }

    // Find the referrer profile (the one who owns the referral code)
    const [referrerProfile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, referralCode));

    if (!referrerProfile) {
      return res.status(404).json({
        error: 'Invalid referral code',
        details: 'Referral code not found'
      });
    }

    // Find the current user's profile
    const [userProfile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, accessCode));

    if (!userProfile) {
      return res.status(404).json({
        error: 'Profile not found',
        details: 'No profile found with the provided access code'
      });
    }

    // Check if this user has already used a referral code
    if (userProfile.used_referral_code) {
      return res.status(400).json({
        error: 'Referral already used',
        details: 'You have already used a referral code'
      });
    }

    // Update the referrer's referral count
    await db.update(userOnboardingProfiles)
      .set({
        referral_count: (referrerProfile.referral_count || 0) + 1
      })
      .where(eq(userOnboardingProfiles.id, referrerProfile.id));

    // Special features unlocked through referrals
    const referralFeatures = [
      'Extended Market Data',
      'Custom Price Alerts',
      'Enhanced Portfolio Analytics'
    ];

    // Update the user's profile with referral benefits
    const updatedFeatures = [
      ...(userProfile.unlocked_features || []),
      ...referralFeatures
    ];

    await db.update(userOnboardingProfiles)
      .set({
        unlocked_features: updatedFeatures,
        used_referral_code: referralCode,
        referral_date: new Date()
      })
      .where(eq(userOnboardingProfiles.id, userProfile.id));

    res.json({
      success: true,
      message: 'Referral code successfully applied',
      unlockedFeatures: referralFeatures
    });
  } catch (error) {
    console.error('Error verifying referral code:', error);
    res.status(500).json({
      error: 'Failed to verify referral code',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}