/**
 * QR Code Service for Universal Access Code System
 * 
 * Handles generation and validation of QR codes for dashboard access
 */

import { Request, Response } from 'express';
import { db } from './db';
import { userOnboardingProfiles } from '@shared/schema';
import { eq } from 'drizzle-orm';

const DOMAIN = process.env.NODE_ENV === 'production' 
  ? 'https://cryptobot.replit.app'
  : 'http://localhost:5000';

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

    // Create dashboard access URL with the code
    const dashboardUrl = `${DOMAIN}/dashboard?code=${code}`;
    
    // Generate QR code using a third-party service
    // We're using the free QR Server API for simplicity
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(dashboardUrl)}&size=300x300`;
    
    // Store the QR code URL in the profile
    await db
      .update(userOnboardingProfiles)
      .set({ 
        qr_code_url: qrCodeUrl,
        updated_at: new Date()
      })
      .where(eq(userOnboardingProfiles.id, profile.id));

    // Return the QR code data
    res.json({
      qrCodeUrl,
      dashboardUrl,
      code
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

    // Find the user profile
    const [profile] = await db
      .select()
      .from(userOnboardingProfiles)
      .where(eq(userOnboardingProfiles.unique_code, code));

    if (!profile) {
      return res.status(404).json({
        error: 'Invalid access code',
        details: 'No profile found with the provided access code'
      });
    }

    // Update access count and last access date
    await db
      .update(userOnboardingProfiles)
      .set({ 
        access_count: (profile.access_count || 0) + 1,
        last_access_date: new Date(),
        updated_at: new Date()
      })
      .where(eq(userOnboardingProfiles.id, profile.id));

    // Return profile data needed for dashboard access
    res.json({
      valid: true,
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        unique_code: profile.unique_code,
        user_category: profile.user_category,
        unlocked_levels: profile.unlocked_levels,
        subscription_status: profile.subscription_status,
        crypto_experience_level: profile.crypto_experience_level
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
  // Create a QR code URL using a third-party service
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(dashboardUrl)}&size=200x200`;
}