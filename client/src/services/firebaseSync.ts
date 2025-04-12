/**
 * Firebase Synchronization Service
 * 
 * Provides cross-device synchronization for user data, chat history,
 * preferences, and other application state using Firebase.
 */

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";
import { ChatMessage } from "../utils/chatContextManager";

// Singleton instance
let instance: FirebaseSync | null = null;

class FirebaseSync {
  private app;
  private auth;
  private db;
  private user: User | null = null;
  private isInitialized = false;
  
  constructor() {
    // Check for Firebase configuration
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const appId = import.meta.env.VITE_FIREBASE_APP_ID;
    
    if (!apiKey || !projectId || !appId) {
      console.warn('Firebase configuration missing. Cross-device sync will be disabled.');
      return;
    }
    
    try {
      // Initialize Firebase
      const firebaseConfig = {
        apiKey,
        authDomain: `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: `${projectId}.appspot.com`,
        messagingSenderId: '',  // Not required for our use case
        appId
      };
      
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      
      // Set up auth state change listener
      onAuthStateChanged(this.auth, (user) => {
        this.user = user;
        console.log(user ? `Firebase user logged in: ${user.displayName}` : 'Firebase user logged out');
      });
      
      this.isInitialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }
  
  /**
   * Check if Firebase is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User | null> {
    if (!this.isInitialized) return null;
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return null;
    }
  }
  
  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      await this.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
  
  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.user;
  }
  
  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.user?.uid || null;
  }
  
  /**
   * Save user preferences
   */
  async saveUserPreferences(userId: string, preferences: any): Promise<boolean> {
    if (!this.isInitialized) return false;
    
    try {
      const userRef = doc(this.db, 'users', userId);
      await setDoc(userRef, {
        preferences,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }
  
  /**
   * Load user preferences
   */
  async loadUserPreferences(userId: string): Promise<any | null> {
    if (!this.isInitialized) return null;
    
    try {
      const userRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data().preferences;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return null;
    }
  }
  
  /**
   * Save chat context
   */
  async saveChatContext(userId: string, messages: ChatMessage[]): Promise<boolean> {
    if (!this.isInitialized) return false;
    
    try {
      const userRef = doc(this.db, 'users', userId);
      await setDoc(userRef, {
        chatContext: messages,
        chatUpdatedAt: serverTimestamp()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error saving chat context:', error);
      return false;
    }
  }
  
  /**
   * Load chat context
   */
  async loadChatContext(userId: string): Promise<ChatMessage[] | null> {
    if (!this.isInitialized) return null;
    
    try {
      const userRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().chatContext) {
        return userDoc.data().chatContext;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading chat context:', error);
      return null;
    }
  }
  
  /**
   * Log user behavior for analytics
   */
  async logBehavior(
    userId: string,
    action: string,
    details: any = {},
    tabContext?: string
  ): Promise<void> {
    if (!this.isInitialized) return;
    
    try {
      const behaviorRef = collection(this.db, 'users', userId, 'behaviors');
      await addDoc(behaviorRef, {
        action,
        details,
        tabContext,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging user behavior:', error);
    }
  }
  
  /**
   * Get recent behaviors for a user
   */
  async getRecentBehaviors(
    userId: string,
    count: number = 10
  ): Promise<any[]> {
    if (!this.isInitialized) return [];
    
    try {
      const behaviorsRef = collection(this.db, 'users', userId, 'behaviors');
      const q = query(
        behaviorsRef,
        orderBy('timestamp', 'desc'),
        limit(count)
      );
      
      const querySnapshot = await getDocs(q);
      const behaviors: any[] = [];
      
      querySnapshot.forEach((doc) => {
        behaviors.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return behaviors;
    } catch (error) {
      console.error('Error getting recent behaviors:', error);
      return [];
    }
  }
  
  /**
   * Sync tab state
   */
  async syncTabState(
    userId: string,
    tabId: string,
    state: any
  ): Promise<boolean> {
    if (!this.isInitialized) return false;
    
    try {
      const tabRef = doc(this.db, 'users', userId, 'tabs', tabId);
      await setDoc(tabRef, {
        state,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error syncing tab state:', error);
      return false;
    }
  }
  
  /**
   * Get tab state
   */
  async getTabState(
    userId: string,
    tabId: string
  ): Promise<any | null> {
    if (!this.isInitialized) return null;
    
    try {
      const tabRef = doc(this.db, 'users', userId, 'tabs', tabId);
      const tabDoc = await getDoc(tabRef);
      
      if (tabDoc.exists()) {
        return tabDoc.data().state;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting tab state:', error);
      return null;
    }
  }
}

/**
 * Get the Firebase sync instance
 */
export function getFirebaseInstance(): FirebaseSync | null {
  if (!instance) {
    instance = new FirebaseSync();
    
    // If initialization failed, return null
    if (!instance.isReady()) {
      instance = null;
    }
  }
  
  return instance;
}

/**
 * Initialize Firebase
 */
export function initializeFirebase(): FirebaseSync | null {
  return getFirebaseInstance();
}