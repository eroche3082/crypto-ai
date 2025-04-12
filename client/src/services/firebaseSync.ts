/**
 * Firebase Synchronization Service
 * 
 * Provides utilities for synchronizing data between devices and persisting
 * user preferences, behaviors, and AI recommendations.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  Timestamp, 
  DocumentData
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { 
  AIRecommendation, 
  BehaviorPattern, 
  UserPreference, 
  SessionContext 
} from '@/utils/phase4Automation';

// Firebase singleton instance
let firebaseInstance: FirebaseSync | null = null;

/**
 * Firebase Synchronization Class
 */
export class FirebaseSync {
  private readonly firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };
  
  private app;
  private db;
  private auth;
  private currentUser: User | null = null;
  
  /**
   * Constructor
   */
  constructor() {
    try {
      // Initialize Firebase app
      this.app = getApps().length === 0 ? initializeApp(this.firebaseConfig) : getApp();
      
      // Get Firestore instance
      this.db = getFirestore(this.app);
      
      // Get Auth instance
      this.auth = getAuth(this.app);
      
      // Listen for auth state changes
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        
        if (user) {
          // User is signed in
          console.log('Firebase user signed in:', user.uid);
          
          // Log user session
          this.logUserSession(user.uid);
        } else {
          // User is signed out
          console.log('Firebase user signed out');
        }
      });
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }
  
  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUser?.uid || null;
  }
  
  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return !!this.currentUser;
  }
  
  /**
   * Log user session
   */
  private async logUserSession(userId: string): Promise<void> {
    try {
      // Create session document
      const sessionRef = doc(collection(this.db, 'users', userId, 'sessions'));
      
      // Set session data
      await setDoc(sessionRef, {
        startTime: serverTimestamp(),
        lastActive: serverTimestamp(),
        device: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        },
        active: true
      });
      
      // Store session ID in localStorage
      localStorage.setItem('current_session_id', sessionRef.id);
      
      // Update user's lastActive timestamp
      await updateDoc(doc(this.db, 'users', userId), {
        lastActive: serverTimestamp()
      });
      
      console.log('User session logged with ID:', sessionRef.id);
    } catch (error) {
      console.error('Error logging user session:', error);
    }
  }
  
  /**
   * Save user chat context
   */
  async saveChatContext(userId: string, context: any): Promise<void> {
    try {
      if (!userId) {
        console.warn('Cannot save chat context: No user ID provided');
        return;
      }
      
      // Get reference to chat context document
      const contextRef = doc(this.db, 'users', userId, 'data', 'chatContext');
      
      // Set chat context data
      await setDoc(contextRef, {
        context,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('Chat context saved for user:', userId);
    } catch (error) {
      console.error('Error saving chat context:', error);
      throw error;
    }
  }
  
  /**
   * Get user chat context
   */
  async getChatContext(userId: string): Promise<any | null> {
    try {
      if (!userId) {
        console.warn('Cannot get chat context: No user ID provided');
        return null;
      }
      
      // Get reference to chat context document
      const contextRef = doc(this.db, 'users', userId, 'data', 'chatContext');
      
      // Get chat context data
      const docSnap = await getDoc(contextRef);
      
      if (docSnap.exists()) {
        return docSnap.data().context;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting chat context:', error);
      return null;
    }
  }
  
  /**
   * Log user interaction
   */
  async logUserInteraction(
    userId: string, 
    action: string, 
    details: any = {}
  ): Promise<void> {
    try {
      if (!userId) {
        console.warn('Cannot log user interaction: No user ID provided');
        return;
      }
      
      // Get session ID
      const sessionId = localStorage.getItem('current_session_id');
      
      // Create interaction document
      const interactionRef = doc(collection(this.db, 'users', userId, 'interactions'));
      
      // Set interaction data
      await setDoc(interactionRef, {
        action,
        details,
        timestamp: serverTimestamp(),
        sessionId,
        tabContext: details.tabContext || null
      });
      
      // Update session's lastActive timestamp
      if (sessionId) {
        await updateDoc(doc(this.db, 'users', userId, 'sessions', sessionId), {
          lastActive: serverTimestamp()
        });
      }
      
      console.log('User interaction logged:', action);
    } catch (error) {
      console.error('Error logging user interaction:', error);
    }
  }
  
  /**
   * Log system event
   */
  async logSystemEvent(
    eventName: string, 
    data: any = {}
  ): Promise<void> {
    try {
      // Create system event document
      const eventRef = doc(collection(this.db, 'systemEvents'));
      
      // Set event data
      await setDoc(eventRef, {
        event: eventName,
        data,
        timestamp: serverTimestamp()
      });
      
      console.log('System event logged:', eventName);
    } catch (error) {
      console.error('Error logging system event:', error);
    }
  }
  
  /**
   * Save behavior pattern
   */
  async saveBehaviorPattern(
    userId: string, 
    pattern: BehaviorPattern
  ): Promise<void> {
    try {
      if (!userId) {
        console.warn('Cannot save behavior pattern: No user ID provided');
        return;
      }
      
      // Create behavior pattern document
      const patternRef = doc(this.db, 'users', userId, 'behaviorPatterns', pattern.id);
      
      // Convert timestamp to Firestore Timestamp
      const patternData = {
        ...pattern,
        lastDetected: Timestamp.fromMillis(pattern.lastDetected)
      };
      
      // Set pattern data
      await setDoc(patternRef, patternData);
      
      console.log('Behavior pattern saved:', pattern.pattern);
    } catch (error) {
      console.error('Error saving behavior pattern:', error);
      throw error;
    }
  }
  
  /**
   * Get behavior patterns
   */
  async getBehaviorPatterns(userId: string): Promise<BehaviorPattern[]> {
    try {
      if (!userId) {
        console.warn('Cannot get behavior patterns: No user ID provided');
        return [];
      }
      
      // Get reference to behavior patterns collection
      const patternsRef = collection(this.db, 'users', userId, 'behaviorPatterns');
      
      // Query behavior patterns
      const q = query(patternsRef, orderBy('lastDetected', 'desc'));
      const querySnapshot = await getDocs(q);
      
      // Convert documents to BehaviorPattern objects
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          lastDetected: data.lastDetected.toMillis(),
        } as BehaviorPattern;
      });
    } catch (error) {
      console.error('Error getting behavior patterns:', error);
      return [];
    }
  }
  
  /**
   * Save user preference
   */
  async saveUserPreference(
    userId: string, 
    preference: UserPreference
  ): Promise<void> {
    try {
      if (!userId) {
        console.warn('Cannot save user preference: No user ID provided');
        return;
      }
      
      // Create user preference document
      const preferenceRef = doc(this.db, 'users', userId, 'preferences', preference.id);
      
      // Convert timestamp to Firestore Timestamp
      const preferenceData = {
        ...preference,
        lastUpdated: Timestamp.fromMillis(preference.lastUpdated)
      };
      
      // Set preference data
      await setDoc(preferenceRef, preferenceData);
      
      console.log('User preference saved:', preference.category);
    } catch (error) {
      console.error('Error saving user preference:', error);
      throw error;
    }
  }
  
  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreference[]> {
    try {
      if (!userId) {
        console.warn('Cannot get user preferences: No user ID provided');
        return [];
      }
      
      // Get reference to user preferences collection
      const preferencesRef = collection(this.db, 'users', userId, 'preferences');
      
      // Query user preferences
      const querySnapshot = await getDocs(preferencesRef);
      
      // Convert documents to UserPreference objects
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          lastUpdated: data.lastUpdated.toMillis(),
        } as UserPreference;
      });
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return [];
    }
  }
  
  /**
   * Save recommendation
   */
  async saveRecommendation(
    userId: string, 
    recommendation: AIRecommendation
  ): Promise<void> {
    try {
      if (!userId) {
        console.warn('Cannot save recommendation: No user ID provided');
        return;
      }
      
      // Create recommendation document
      const recommendationRef = doc(
        this.db, 
        'users', 
        userId, 
        'recommendations', 
        recommendation.id
      );
      
      // Convert timestamp to Firestore Timestamp
      const recommendationData = {
        ...recommendation,
        timestamp: recommendation.timestamp 
          ? Timestamp.fromMillis(recommendation.timestamp) 
          : Timestamp.now()
      };
      
      // Set recommendation data
      await setDoc(recommendationRef, recommendationData);
      
      console.log('Recommendation saved:', recommendation.title);
    } catch (error) {
      console.error('Error saving recommendation:', error);
      throw error;
    }
  }
  
  /**
   * Update recommendation
   */
  async updateRecommendation(
    userId: string, 
    recommendationId: string, 
    updates: Partial<AIRecommendation>
  ): Promise<void> {
    try {
      if (!userId) {
        console.warn('Cannot update recommendation: No user ID provided');
        return;
      }
      
      // Get reference to recommendation document
      const recommendationRef = doc(
        this.db, 
        'users', 
        userId, 
        'recommendations', 
        recommendationId
      );
      
      // Convert timestamp to Firestore Timestamp if present
      const updateData = { ...updates };
      if (updateData.timestamp) {
        updateData.timestamp = Timestamp.fromMillis(updateData.timestamp);
      }
      
      // Update recommendation document
      await updateDoc(recommendationRef, updateData);
      
      console.log('Recommendation updated:', recommendationId);
    } catch (error) {
      console.error('Error updating recommendation:', error);
      throw error;
    }
  }
  
  /**
   * Get user recommendations
   */
  async getUserRecommendations(userId: string): Promise<AIRecommendation[]> {
    try {
      if (!userId) {
        console.warn('Cannot get recommendations: No user ID provided');
        return [];
      }
      
      // Get reference to recommendations collection
      const recommendationsRef = collection(this.db, 'users', userId, 'recommendations');
      
      // Query recommendations
      const q = query(
        recommendationsRef, 
        where('dismissed', '==', false), 
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      // Convert documents to AIRecommendation objects
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          timestamp: data.timestamp?.toMillis(),
        } as AIRecommendation;
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }
  
  /**
   * Save session context
   */
  async saveSessionContext(
    userId: string, 
    sessionContext: SessionContext
  ): Promise<void> {
    try {
      if (!userId) {
        console.warn('Cannot save session context: No user ID provided');
        return;
      }
      
      // Create session context document
      const sessionContextRef = doc(
        this.db, 
        'users', 
        userId, 
        'sessions', 
        sessionContext.id
      );
      
      // Convert timestamps to Firestore Timestamps
      const sessionContextData = {
        ...sessionContext,
        startTime: Timestamp.fromMillis(sessionContext.startTime),
        lastActive: Timestamp.fromMillis(sessionContext.lastActive)
      };
      
      // Set session context data
      await setDoc(sessionContextRef, sessionContextData);
      
      console.log('Session context saved:', sessionContext.id);
    } catch (error) {
      console.error('Error saving session context:', error);
      throw error;
    }
  }
  
  /**
   * Get recent behaviors
   */
  async getRecentBehaviors(
    userId: string, 
    count: number = 50
  ): Promise<any[]> {
    try {
      if (!userId) {
        console.warn('Cannot get recent behaviors: No user ID provided');
        return [];
      }
      
      // Get reference to interactions collection
      const interactionsRef = collection(this.db, 'users', userId, 'interactions');
      
      // Query interactions
      const q = query(
        interactionsRef, 
        orderBy('timestamp', 'desc'), 
        limit(count)
      );
      const querySnapshot = await getDocs(q);
      
      // Convert documents to behavior objects
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          action: data.action,
          details: data.details,
          timestamp: data.timestamp,
          tabContext: data.tabContext
        };
      });
    } catch (error) {
      console.error('Error getting recent behaviors:', error);
      return [];
    }
  }
  
  /**
   * Sync data between devices
   */
  async syncDataBetweenDevices(userId: string): Promise<boolean> {
    try {
      if (!userId) {
        console.warn('Cannot sync data between devices: No user ID provided');
        return false;
      }
      
      // Get current device ID
      const deviceId = localStorage.getItem('device_id') || 'unknown_device';
      
      // Log sync attempt
      await this.logSystemEvent('device_sync_attempt', {
        userId,
        deviceId,
        timestamp: Date.now()
      });
      
      // Get user data
      const userData = await this.getUserData(userId);
      
      // Apply user data to local storage
      this.applyUserDataToLocalStorage(userData);
      
      // Log successful sync
      await this.logSystemEvent('device_sync_complete', {
        userId,
        deviceId,
        timestamp: Date.now()
      });
      
      console.log('Data synced between devices for user:', userId);
      return true;
    } catch (error) {
      console.error('Error syncing data between devices:', error);
      return false;
    }
  }
  
  /**
   * Get user data
   */
  private async getUserData(userId: string): Promise<DocumentData | null> {
    try {
      if (!userId) {
        return null;
      }
      
      // Get reference to user document
      const userRef = doc(this.db, 'users', userId);
      
      // Get user data
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }
  
  /**
   * Apply user data to local storage
   */
  private applyUserDataToLocalStorage(userData: DocumentData | null): void {
    if (!userData) {
      return;
    }
    
    // Apply user settings
    if (userData.settings) {
      localStorage.setItem('user_settings', JSON.stringify(userData.settings));
    }
    
    // Apply user preferences
    if (userData.preferences) {
      localStorage.setItem('user_preferences', JSON.stringify(userData.preferences));
    }
    
    // Apply theme
    if (userData.theme) {
      localStorage.setItem('theme', userData.theme);
      document.documentElement.setAttribute('data-theme', userData.theme);
    }
    
    // Apply language
    if (userData.language) {
      localStorage.setItem('language', userData.language);
    }
  }
}

/**
 * Get Firebase instance
 */
export function getFirebaseInstance(): FirebaseSync | null {
  if (!firebaseInstance) {
    try {
      // Check if Firebase config is available
      if (
        import.meta.env.VITE_FIREBASE_API_KEY &&
        import.meta.env.VITE_FIREBASE_PROJECT_ID &&
        import.meta.env.VITE_FIREBASE_APP_ID
      ) {
        firebaseInstance = new FirebaseSync();
      } else {
        console.warn('Firebase config is not available');
        return null;
      }
    } catch (error) {
      console.error('Error creating Firebase instance:', error);
      return null;
    }
  }
  
  return firebaseInstance;
}

export default getFirebaseInstance;