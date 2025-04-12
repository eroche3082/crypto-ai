/**
 * Subscriber Schema
 * Defines the structure of user profile data collected during onboarding
 */

import { z } from 'zod';

// Subscriber schema using Zod for runtime validation
export const subscriberSchema = z.object({
  // Basic information
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  
  // Preferences and settings
  experience: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  exchanges: z.array(z.string()).optional(),
  goals: z.string().min(5, "Please describe your goals"),
  riskTolerance: z.enum(["Very Low", "Low", "Moderate", "High", "Very High"]).optional(),
  preferredCrypto: z.array(z.string()).optional(),
  investmentAmount: z.string().optional(),
  analysisPreference: z.array(z.string()).optional(),
  updateFrequency: z.string().optional(),
  preferredLanguage: z.string().default("English"),
  
  // System fields
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  agentType: z.string().default("crypto"),
  userId: z.string().optional(),
  completedOnboarding: z.boolean().default(false)
});

// Type extraction from the schema
export type SubscriberProfile = z.infer<typeof subscriberSchema>;

// Initial empty profile
export const emptyProfile: Partial<SubscriberProfile> = {
  name: "",
  email: "",
  interests: [],
  goals: "",
  preferredCrypto: [],
  preferredLanguage: "English",
  agentType: "crypto",
  completedOnboarding: false
};

// Function to validate a profile
export function validateProfile(profile: Partial<SubscriberProfile>): { valid: boolean; errors?: z.ZodError } {
  try {
    // Validate only the fields that are required
    // We use pick to create a subset schema of just the required fields
    const requiredSchema = subscriberSchema.pick({
      name: true,
      email: true,
      experience: true,
      interests: true,
      goals: true
    });
    
    requiredSchema.parse(profile);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error };
    }
    return { valid: false };
  }
}