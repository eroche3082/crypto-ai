/**
 * Universal Access Code System Routes
 * 
 * This file contains all routes related to the Universal Access Code System
 * including Stripe payment integration and QR code functionality.
 */

import { Router } from 'express';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { userOnboardingProfiles } from '@shared/schema';
import { createCheckoutSession, handleStripeWebhook, getAvailableLevels, verifyReferralCode } from './stripeService';
import { generateQRCode, validateAccessCode } from './qrCodeService';

const router = Router();

// Create Stripe checkout session for level unlocking
router.post('/checkout', createCheckoutSession);

// Handle Stripe webhook for payment processing
router.post('/webhook', handleStripeWebhook);

// Get available levels for the dashboard with user-specific unlocks
router.get('/levels', getAvailableLevels);

// Verify a referral code and unlock features
router.post('/verify-referral', verifyReferralCode);

// Generate QR code for dashboard access
router.get('/generate-qr/:code', generateQRCode);

// Validate an access code from QR scan
router.get('/validate/:code', validateAccessCode);

// Get a specific profile by access code
router.get('/profile/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({
        error: 'Missing access code',
        details: 'Access code is required'
      });
    }

    // Find the user profile
    const [profile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, code));

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        details: 'No profile found with the provided access code'
      });
    }

    // Return profile data needed for dashboard
    return res.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        unique_code: profile.unique_code,
        user_category: profile.user_category,
        crypto_experience_level: profile.crypto_experience_level,
        unlocked_levels: profile.unlocked_levels || [],
        unlocked_features: profile.unlocked_features || [],
        subscription_status: profile.subscription_status || 'free'
      }
    });
  } catch (error) {
    console.error('Error fetching profile by access code:', error);
    return res.status(500).json({
      error: 'Failed to fetch profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Admin routes for the access code system
const adminRouter = Router();

// Code activity tracking for admin panel
adminRouter.get('/activity', async (req, res) => {
  try {
    // Query profiles with activity metrics
    const profiles = await db
      .select({
        id: userOnboardingProfiles.id,
        name: userOnboardingProfiles.name,
        email: userOnboardingProfiles.email,
        unique_code: userOnboardingProfiles.unique_code,
        user_category: userOnboardingProfiles.user_category,
        access_count: userOnboardingProfiles.access_count,
        last_access_date: userOnboardingProfiles.last_access_date,
        referral_count: userOnboardingProfiles.referral_count,
        subscription_status: userOnboardingProfiles.subscription_status,
        created_at: userOnboardingProfiles.created_at
      })
      .from(userOnboardingProfiles)
      .orderBy(userOnboardingProfiles.access_count, "desc");
    
    // Calculate usage statistics
    const stats = {
      totalProfiles: profiles.length,
      totalAccesses: profiles.reduce((sum, p) => sum + (p.access_count || 0), 0),
      activeProfiles: profiles.filter(p => p.access_count && p.access_count > 0).length,
      paidProfiles: profiles.filter(p => p.subscription_status === 'paid' || p.subscription_status === 'premium').length,
      referrals: profiles.reduce((sum, p) => sum + (p.referral_count || 0), 0)
    };

    return res.json({
      success: true,
      stats,
      profiles
    });
  } catch (error) {
    console.error('Error fetching access code activity:', error);
    return res.status(500).json({
      error: 'Failed to fetch access code activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as accessCodeRouter, adminRouter as accessCodeAdminRouter };