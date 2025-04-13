/**
 * QR Code Service for Universal Access Code System
 * 
 * Handles generation and validation of QR codes for dashboard access
 */

import { Request, Response } from 'express';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { userOnboardingProfiles } from '@shared/schema';

/**
 * Generate a QR code URL for a specific access code
 */
export async function generateQRCode(req: Request, res: Response) {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({
        error: 'Missing access code',
        details: 'Access code is required'
      });
    }

    // Find the profile with this access code
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

    // Generate dashboard URL with the access code
    const dashboardUrl = `${req.protocol}://${req.get('host')}/dashboard?code=${code}`;
    
    // Generate QR code URL using QR Server API
    const qrCodeUrl = generateQRCodeUrl(dashboardUrl);
    
    // Update profile with the QR code URL
    await db.update(userOnboardingProfiles)
      .set({
        qr_code_url: qrCodeUrl,
        qr_code_generated_at: new Date()
      })
      .where(eq(userOnboardingProfiles.id, profile.id));

    res.json({
      success: true,
      qrCodeUrl,
      dashboardUrl
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      error: 'Failed to generate QR code',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Validate an access code from QR scan
 */
export async function validateAccessCode(req: Request, res: Response) {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({
        error: 'Missing access code',
        details: 'Access code is required'
      });
    }

    // Find the profile with this access code
    const [profile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, code));

    if (!profile) {
      return res.status(404).json({
        error: 'Invalid access code',
        details: 'The provided access code is not valid'
      });
    }

    // Update access statistics
    await db.update(userOnboardingProfiles)
      .set({
        access_count: (profile.access_count || 0) + 1,
        last_access_date: new Date()
      })
      .where(eq(userOnboardingProfiles.id, profile.id));

    // Return simplified profile information
    res.json({
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
    console.error('Error validating access code:', error);
    res.status(500).json({
      error: 'Failed to validate access code',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Generate a QR code for the completion screen
 * Used after onboarding to show the user their access code
 */
export function generateQRCodeUrl(dashboardUrl: string): string {
  // Use an external QR code generation service
  // We're using QR Server which doesn't require API keys for basic usage
  const encodedUrl = encodeURIComponent(dashboardUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodedUrl}&size=200x200`;
}