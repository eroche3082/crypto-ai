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
    const { color, size, bgColor, premium } = req.query;
    
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
    
    // Get design scheme based on user category
    const categoryDesign = getCategoryDesign(profile.user_category || '');
    
    // Check if user has premium subscription for enhanced QR codes
    const isPremium = (premium === 'true') || 
                     (profile.subscription_status === 'paid') || 
                     (profile.subscription_status === 'premium') ||
                     (profile.user_category === 'VIP');
    
    // Allow for custom overrides from query parameters
    const qrOptions = {
      color: (color as string) || categoryDesign.color,
      size: size ? parseInt(size as string) : 240,
      bgColor: (bgColor as string) || 'FFFFFF',
      premium: isPremium,
      eyeStyle: categoryDesign.eyeStyle,
      gradient: categoryDesign.gradient,
      backgroundPattern: categoryDesign.backgroundPattern,
      logo: profile.qr_logo_url || undefined
    };
    
    // Generate QR code URL using QR Server API with enhanced options
    const qrCodeUrl = generateQRCodeUrl(dashboardUrl, qrOptions);
    
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
      dashboardUrl,
      colorScheme: qrOptions.color,
      category: profile.user_category
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
export function generateQRCodeUrl(dashboardUrl: string, options: { 
  size?: number, 
  color?: string, 
  bgColor?: string, 
  logo?: string,
  premium?: boolean,
  eyeStyle?: string,
  gradient?: boolean,
  backgroundPattern?: string 
} = {}): string {
  // Use an external QR code generation service
  // We're using QR Server which doesn't require API keys for basic usage
  const encodedUrl = encodeURIComponent(dashboardUrl);
  
  // Default values
  const size = options.size || 200;
  const color = options.color || '4F46E5'; // Indigo color by default
  const bgColor = options.bgColor || 'FFFFFF';
  const isPremium = options.premium || false;
  
  // For premium QR codes, use a more advanced design
  if (isPremium) {
    // Use QR Code Monkey API for more advanced styling
    // This is a more feature-rich service that allows for gradients, logos, and custom shapes
    const qrMonkeyOptions: any = {
      data: dashboardUrl,
      size: size,
      backgroundColor: bgColor.replace('#', ''),
      qrStyle: "dots", // dots, squares, or rounded
      eyeColor: color.replace('#', ''),
      margin: 5
    };
    
    // Apply custom eye style if provided
    if (options.eyeStyle) {
      qrMonkeyOptions.eyeStyle = options.eyeStyle;
    } else {
      qrMonkeyOptions.eyeStyle = "frame13"; // Default premium style
    }
    
    // Apply gradient if enabled
    if (options.gradient) {
      qrMonkeyOptions.gradient = {
        type: "linear",
        rotation: 45,
        colorOne: color.replace('#', ''),
        colorTwo: getGradientColor(color)  // Slightly different shade for gradient
      };
    } else {
      qrMonkeyOptions.color = color.replace('#', '');
    }
    
    // Apply background pattern if provided
    if (options.backgroundPattern) {
      qrMonkeyOptions.backgroundPattern = options.backgroundPattern;
    }
    
    // Apply logo if provided
    if (options.logo) {
      qrMonkeyOptions.logo = options.logo;
      qrMonkeyOptions.logoMode = "clean";
    }
    
    // Create a unique identifier for this code based on its properties
    const codeHash = `${color}-${size}-${options.eyeStyle || 'frame13'}-premium`;
    
    // Return the styled QR code URL
    return `https://api.qrcode-monkey.com/qr/custom?config=${encodeURIComponent(JSON.stringify(qrMonkeyOptions))}&hash=${codeHash}`;
  }
  
  // Standard QR code with enhanced styling
  let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedUrl}&size=${size}x${size}&color=${color.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}&qzone=2`;
  
  // Add more styling parameters
  qrUrl += '&format=svg'; // Use SVG for better quality
  
  // Add rounded corners and higher error correction for more customization
  qrUrl += '&ecc=H'; 
  
  return qrUrl;
}

/**
 * Helper function to generate a slightly lighter or darker color for gradients
 */
function getGradientColor(baseColor: string): string {
  // Convert hex to RGB
  let r = parseInt(baseColor.slice(0, 2), 16);
  let g = parseInt(baseColor.slice(2, 4), 16);
  let b = parseInt(baseColor.slice(4, 6), 16);
  
  // Adjust brightness
  const brightnessAdjust = 25; // Make color slightly lighter
  
  r = Math.min(255, r + brightnessAdjust);
  g = Math.min(255, g + brightnessAdjust);
  b = Math.min(255, b + brightnessAdjust);
  
  // Convert back to hex
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Generate a QR code with a styled design based on user category
 */
export function getCategoryDesign(category: string): { 
  color: string, 
  gradient: boolean,
  eyeStyle: string,
  backgroundPattern?: string
} {
  // Define category-specific design schemes
  switch (category) {
    case 'BEGINNER':
      return {
        color: '10B981', // Green
        gradient: false,
        eyeStyle: 'frame0'
      };
    case 'INTER':
      return {
        color: '3B82F6', // Blue
        gradient: true,
        eyeStyle: 'frame2'
      };
    case 'EXPERT':
      return {
        color: '8B5CF6', // Purple
        gradient: true,
        eyeStyle: 'frame8'
      };
    case 'VIP':
      return {
        color: 'F59E0B', // Amber/Gold
        gradient: true,
        eyeStyle: 'frame13',
        backgroundPattern: 'diamond'
      };
    default:
      return {
        color: '4F46E5', // Default indigo
        gradient: false,
        eyeStyle: 'frame0'
      };
  }
}