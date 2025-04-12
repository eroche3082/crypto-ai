/**
 * Subscriber Service
 * Handles storage and retrieval of user profile data
 */

import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getFirestore } from 'firebase/firestore';
import { SubscriberProfile } from '@/lib/subscriberSchema';

// Firebase Firestore instance
const db = getFirestore();

/**
 * Save subscriber data to Firestore
 */
export async function saveSubscriberData(userId: string, data: Partial<SubscriberProfile>): Promise<void> {
  try {
    // Add updated timestamp
    const updatedData = {
      ...data,
      updatedAt: new Date()
    };
    
    // Check if the document exists
    const docRef = doc(db, 'subscribers', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Update existing document
      await updateDoc(docRef, updatedData);
    } else {
      // Create new document
      await setDoc(docRef, {
        ...updatedData,
        createdAt: new Date(),
        userId
      });
    }
    
    // Update local storage for offline access
    localStorage.setItem('crypto_profile', JSON.stringify({
      ...updatedData,
      userId
    }));
  } catch (error) {
    console.error('Error saving subscriber data:', error);
    throw error;
  }
}

/**
 * Get subscriber profile from Firestore
 */
export async function getSubscriberProfile(userId: string): Promise<Partial<SubscriberProfile> | null> {
  try {
    const docRef = doc(db, 'subscribers', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SubscriberProfile;
    }
    
    // Try to get from local storage if not found in Firestore
    const localProfile = localStorage.getItem('crypto_profile');
    if (localProfile) {
      return JSON.parse(localProfile);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting subscriber profile:', error);
    
    // Fallback to local storage
    const localProfile = localStorage.getItem('crypto_profile');
    if (localProfile) {
      return JSON.parse(localProfile);
    }
    
    return null;
  }
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const profile = await getSubscriberProfile(userId);
    return profile?.completedOnboarding === true;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Get current user ID
 */
export function getCurrentUserId(): string | null {
  const auth = getAuth();
  return auth.currentUser?.uid || null;
}

/**
 * Save local profile (for users not logged in)
 */
export function saveLocalProfile(profile: Partial<SubscriberProfile>): void {
  localStorage.setItem('crypto_profile', JSON.stringify({
    ...profile,
    updatedAt: new Date()
  }));
}

/**
 * Get local profile (for users not logged in)
 */
export function getLocalProfile(): Partial<SubscriberProfile> | null {
  const profile = localStorage.getItem('crypto_profile');
  return profile ? JSON.parse(profile) : null;
}

/**
 * Clear local profile
 */
export function clearLocalProfile(): void {
  localStorage.removeItem('crypto_profile');
}

/**
 * Get the current user's profile (from Firebase if logged in, otherwise from local storage)
 */
export async function getCurrentUserProfile(): Promise<Partial<SubscriberProfile> | null> {
  const userId = getCurrentUserId();
  
  if (userId) {
    return getSubscriberProfile(userId);
  }
  
  return getLocalProfile();
}