/**
 * Phase 4 Initializer Component
 * 
 * Bootstrap component that initializes Phase 4 features on application startup,
 * handling cross-device synchronization, context restoration, and automatic optimization.
 */

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initializeFirebase, getFirebaseInstance } from '../services/firebaseSync';
import { loadUserContext, addUserActivity } from '../utils/chatContextManager';
import { optimizeUserExperience } from '../utils/phase4Automation';

// Props interface
interface Phase4InitializerProps {
  userId?: string;
  onInitialized?: (success: boolean, features: string[]) => void;
  onOptimized?: (optimizations: string[]) => void;
}

/**
 * Browser fingerprint for device identification
 */
function getBrowserFingerprint(): string {
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.platform
  ].join('|');
  
  // Generate deterministic device ID from fingerprint
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Phase4Initializer component
 */
export function Phase4Initializer({
  userId,
  onInitialized,
  onOptimized
}: Phase4InitializerProps) {
  // Initialization state
  const [initialized, setInitialized] = useState(false);
  const [initializedFeatures, setInitializedFeatures] = useState<string[]>([]);
  
  // Initialize Phase 4 features
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      const features: string[] = [];
      let success = true;
      
      try {
        // Initialize Firebase
        const firebase = initializeFirebase();
        if (firebase) {
          features.push('firebase');
          
          // Register device if user is logged in
          if (userId) {
            // Get or generate device ID
            let deviceId = localStorage.getItem('deviceId');
            if (!deviceId) {
              deviceId = `${getBrowserFingerprint()}-${uuidv4().slice(0, 8)}`;
              localStorage.setItem('deviceId', deviceId);
            }
            
            // Register this device
            await firebase.saveDeviceInfo(userId, deviceId, {
              userAgent: navigator.userAgent,
              language: navigator.language,
              screenSize: `${screen.width}x${screen.height}`,
              platform: navigator.platform,
              lastActive: new Date().toISOString()
            });
            
            features.push('cross-device-sync');
            
            // Load user context
            await loadUserContext(userId);
            features.push('context-restoration');
            
            // Track session start
            await firebase.trackBehavior(userId, 'session_start', {
              deviceId,
              timestamp: new Date().toISOString()
            });
            
            features.push('behavior-tracking');
            
            // Add session start activity
            addUserActivity('Started new session');
            
            // Run user experience optimization
            setTimeout(async () => {
              try {
                const optimizationResult = await optimizeUserExperience(userId);
                
                if (optimizationResult.applied && onOptimized && isMounted) {
                  onOptimized(optimizationResult.optimizations);
                }
              } catch (error) {
                console.error('Error optimizing user experience:', error);
              }
            }, 5000); // Delay optimization to not block initial loading
          }
        } else {
          console.warn('Firebase initialization skipped or failed');
        }
      } catch (error) {
        console.error('Error initializing Phase 4 features:', error);
        success = false;
      }
      
      // Mark as initialized
      if (isMounted) {
        setInitialized(true);
        setInitializedFeatures(features);
        onInitialized?.(success, features);
      }
    };
    
    initialize();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [userId, onInitialized, onOptimized]);
  
  // Handle session end on unmount
  useEffect(() => {
    return () => {
      if (userId) {
        const firebase = getFirebaseInstance();
        if (firebase) {
          const deviceId = localStorage.getItem('deviceId');
          
          firebase.trackBehavior(userId, 'session_end', {
            deviceId,
            timestamp: new Date().toISOString()
          }).catch(error => {
            console.error('Error tracking session end:', error);
          });
        }
      }
    };
  }, [userId]);
  
  // This component doesn't render anything
  return null;
}

export default Phase4Initializer;