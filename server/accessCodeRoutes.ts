/**
 * Universal Access Code System Routes
 * 
 * This file contains all routes related to the Universal Access Code System
 * including Stripe payment integration and QR code functionality.
 */

import { Router } from 'express';
import { db } from './db';
import { eq, sql } from 'drizzle-orm';
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
    const { period = '30days', category } = req.query;
    
    // Query profiles with activity metrics
    let profilesQuery = db
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
        payment_amount: userOnboardingProfiles.payment_amount,
        last_payment_date: userOnboardingProfiles.last_payment_date,
        used_referral_code: userOnboardingProfiles.used_referral_code,
        qr_code_generated_at: userOnboardingProfiles.qr_code_generated_at,
        created_at: userOnboardingProfiles.created_at,
        unlocked_levels: userOnboardingProfiles.unlocked_levels
      })
      .from(userOnboardingProfiles);
    
    // Apply category filter if provided
    if (category) {
      profilesQuery = profilesQuery.where(eq(userOnboardingProfiles.user_category, category as string));
    }
    
    // Apply time period filter
    if (period === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      profilesQuery = profilesQuery.where(
        sql`${userOnboardingProfiles.created_at} >= ${sevenDaysAgo.toISOString()}`
      );
    } else if (period === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      profilesQuery = profilesQuery.where(
        sql`${userOnboardingProfiles.created_at} >= ${thirtyDaysAgo.toISOString()}`
      );
    }
    
    const profiles = await profilesQuery.orderBy(userOnboardingProfiles.access_count, "desc");
    
    // Get past period data for comparison
    const comparisonDate = new Date();
    if (period === '7days') {
      comparisonDate.setDate(comparisonDate.getDate() - 14); // Previous 7 days
    } else if (period === '30days') {
      comparisonDate.setDate(comparisonDate.getDate() - 60); // Previous 30 days
    } else {
      comparisonDate.setFullYear(comparisonDate.getFullYear() - 1); // Previous year
    }
    
    // Calculate current usage statistics
    const now = new Date();
    const activeThreshold = new Date();
    activeThreshold.setDate(activeThreshold.getDate() - 7); // Active = accessed in last 7 days

    // Enhanced metrics for detailed analysis
    const stats = {
      totalProfiles: profiles.length,
      totalAccesses: profiles.reduce((sum, p) => sum + (p.access_count || 0), 0),
      activeProfiles: profiles.filter(p => p.last_access_date && new Date(p.last_access_date) >= activeThreshold).length,
      newProfilesLast24h: profiles.filter(p => {
        const created = new Date(p.created_at);
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return created >= yesterday;
      }).length,
      conversionRate: calculateConversionRate(profiles),
      paidProfiles: profiles.filter(p => p.subscription_status === 'paid' || p.subscription_status === 'premium').length,
      totalRevenue: calculateTotalRevenue(profiles),
      referrals: profiles.reduce((sum, p) => sum + (p.referral_count || 0), 0),
      referralConversions: profiles.filter(p => p.used_referral_code).length,
      categoryBreakdown: getCategoryBreakdown(profiles),
      qrCodesGenerated: profiles.filter(p => p.qr_code_generated_at).length,
      avgAccessPerProfile: profiles.length ? (profiles.reduce((sum, p) => sum + (p.access_count || 0), 0) / profiles.length).toFixed(2) : '0',
      mostPopularLevels: getMostPopularLevels(profiles),
      retentionRate: calculateRetentionRate(profiles, activeThreshold),
    };

    return res.json({
      success: true,
      stats,
      profiles,
      period: period || 'all'
    });
  } catch (error) {
    console.error('Error fetching access code activity:', error);
    return res.status(500).json({
      error: 'Failed to fetch access code activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to calculate conversion rate
function calculateConversionRate(profiles: any[]): number {
  if (!profiles.length) return 0;
  
  const paidUsers = profiles.filter(p => p.subscription_status === 'paid' || p.subscription_status === 'premium').length;
  return parseFloat(((paidUsers / profiles.length) * 100).toFixed(2));
}

// Helper function to calculate total revenue
function calculateTotalRevenue(profiles: any[]): number {
  return profiles.reduce((sum, p) => {
    return sum + (p.payment_amount || 0);
  }, 0);
}

// Helper function to get category breakdown
function getCategoryBreakdown(profiles: any[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  
  profiles.forEach(profile => {
    const category = profile.user_category || 'unknown';
    breakdown[category] = (breakdown[category] || 0) + 1;
  });
  
  return breakdown;
}

// Helper function to get most popular levels
function getMostPopularLevels(profiles: any[]): Record<string, number> {
  const levelCounts: Record<string, number> = {};
  
  profiles.forEach(profile => {
    const levels = profile.unlocked_levels || [];
    if (Array.isArray(levels)) {
      levels.forEach(level => {
        if (typeof level === 'string') {
          levelCounts[level] = (levelCounts[level] || 0) + 1;
        }
      });
    }
  });
  
  // Convert to array, sort, and convert back to object
  return Object.fromEntries(
    Object.entries(levelCounts)
      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
      .slice(0, 5) // Get top 5
  );
}

// Helper function to calculate retention rate
function calculateRetentionRate(profiles: any[], activeThreshold: Date): number {
  if (!profiles.length) return 0;
  
  // Users who accessed the platform in the last week
  const activeUsers = profiles.filter(p => p.last_access_date && new Date(p.last_access_date) >= activeThreshold).length;
  
  // Only consider users created at least a week ago for retention calculation
  const weekOldProfiles = profiles.filter(p => {
    const created = new Date(p.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created <= weekAgo;
  });
  
  if (!weekOldProfiles.length) return 0;
  
  return parseFloat(((activeUsers / weekOldProfiles.length) * 100).toFixed(2));
}

// Additional admin routes for detailed analytics
adminRouter.get('/reports/referrals', async (req, res) => {
  try {
    // Get profiles with referral data
    const profiles = await db
      .select({
        id: userOnboardingProfiles.id,
        name: userOnboardingProfiles.name,
        email: userOnboardingProfiles.email,
        unique_code: userOnboardingProfiles.unique_code,
        referral_count: userOnboardingProfiles.referral_count,
        used_referral_code: userOnboardingProfiles.used_referral_code,
        payment_amount: userOnboardingProfiles.payment_amount,
        created_at: userOnboardingProfiles.created_at
      })
      .from(userOnboardingProfiles)
      .where(sql`(${userOnboardingProfiles.referral_count} > 0 OR ${userOnboardingProfiles.used_referral_code} IS NOT NULL)`)
      .orderBy(userOnboardingProfiles.referral_count, "desc");
    
    // Build referral tree
    const referralTree = buildReferralTree(profiles);
    
    // Calculate referral metrics
    const metrics = {
      totalReferrals: profiles.reduce((sum, p) => sum + (p.referral_count || 0), 0),
      topReferrers: profiles
        .filter(p => p.referral_count && p.referral_count > 0)
        .sort((a, b) => (b.referral_count || 0) - (a.referral_count || 0))
        .slice(0, 5)
        .map(p => ({
          name: p.name,
          email: p.email,
          code: p.unique_code,
          referrals: p.referral_count
        })),
      referralRevenue: calculateReferralRevenue(profiles),
      conversionRate: calculateReferralConversionRate(profiles),
      referralTree: referralTree
    };
    
    return res.json({
      success: true,
      metrics,
      profiles
    });
  } catch (error) {
    console.error('Error fetching referral data:', error);
    return res.status(500).json({
      error: 'Failed to fetch referral data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to build a referral tree
function buildReferralTree(profiles: any[]): Record<string, any> {
  const tree: Record<string, any> = {};
  const codeToProfile: Record<string, any> = {};
  
  // Create a map of codes to profiles
  profiles.forEach(profile => {
    if (profile.unique_code) {
      codeToProfile[profile.unique_code] = profile;
    }
  });
  
  // Build the tree
  profiles.forEach(profile => {
    if (profile.used_referral_code && codeToProfile[profile.used_referral_code]) {
      const referrerCode = profile.used_referral_code;
      
      if (!tree[referrerCode]) {
        tree[referrerCode] = {
          name: codeToProfile[referrerCode].name,
          email: codeToProfile[referrerCode].email,
          code: referrerCode,
          referrals: []
        };
      }
      
      tree[referrerCode].referrals.push({
        name: profile.name,
        email: profile.email,
        code: profile.unique_code,
        date: profile.created_at,
        paid: !!profile.payment_amount
      });
    }
  });
  
  return tree;
}

// Helper function to calculate revenue from referrals
function calculateReferralRevenue(profiles: any[]): number {
  return profiles
    .filter(p => p.used_referral_code && p.payment_amount)
    .reduce((sum, p) => sum + p.payment_amount, 0);
}

// Helper function to calculate referral conversion rate
function calculateReferralConversionRate(profiles: any[]): number {
  const referredUsers = profiles.filter(p => p.used_referral_code).length;
  if (!referredUsers) return 0;
  
  const convertedUsers = profiles.filter(p => p.used_referral_code && p.payment_amount).length;
  return parseFloat(((convertedUsers / referredUsers) * 100).toFixed(2));
}

export { router as accessCodeRouter, adminRouter as accessCodeAdminRouter };