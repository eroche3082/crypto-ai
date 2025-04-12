/**
 * Firebase Sync Service
 * 
 * Manages Firebase integration for cross-device synchronization,
 * user authentication, and data persistence.
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { ChatMessage, ChatContext } from './contextAwareChatService';

// Singleton instance
let firebaseInstance: FirebaseSync | null = null;

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

/**
 * Firebase Sync Class
 */
class FirebaseSync {
  private app;
  private auth;
  private db;
  private currentUser: User | null = null;
  private initialized: boolean = false;

  constructor() {
    try {
      // Initialize Firebase app
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      
      // Setup auth state listener
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
      });
      
      this.initialized = true;
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      this.initialized = false;
    }
  }
  
  /**
   * Check if Firebase is ready
   */
  isReady(): boolean {
    return this.initialized;
  }
  
  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      this.currentUser = result.user;
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }
  
  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      await this.auth.signOut();
      this.currentUser = null;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
  
  /**
   * Save user context
   */
  async saveUserContext(userId: string, context: ChatContext): Promise<void> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      await setDoc(doc(this.db, 'userContext', userId), {
        ...context,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user context:', error);
      throw error;
    }
  }
  
  /**
   * Load user context
   */
  async loadUserContext(userId: string): Promise<ChatContext | null> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const docRef = doc(this.db, 'userContext', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as ChatContext;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading user context:', error);
      throw error;
    }
  }
  
  /**
   * Save conversation
   */
  async saveConversation(
    userId: string,
    conversationId: string,
    messages: ChatMessage[],
    context?: ChatContext
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      // Convert message timestamps to Firestore timestamps
      const firestoreMessages = messages.map(msg => ({
        ...msg,
        timestamp: Timestamp.fromMillis(msg.timestamp)
      }));
      
      // Save conversation
      await setDoc(doc(this.db, 'users', userId, 'conversations', conversationId), {
        messages: firestoreMessages,
        context: context || null,
        updatedAt: serverTimestamp()
      });
      
      // Update conversation index for quick access
      await setDoc(doc(this.db, 'users', userId, 'conversationIndex', conversationId), {
        preview: messages.length > 0 ? messages[messages.length - 1].content.slice(0, 100) : '',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }
  
  /**
   * Load conversation
   */
  async loadConversation(
    userId: string,
    conversationId: string
  ): Promise<{ messages: ChatMessage[], context?: ChatContext } | null> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const docRef = doc(this.db, 'users', userId, 'conversations', conversationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Convert Firestore timestamps to milliseconds
        const messages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp.toMillis()
        }));
        
        return {
          messages,
          context: data.context || undefined
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error loading conversation:', error);
      throw error;
    }
  }
  
  /**
   * Delete conversation
   */
  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      // Delete conversation
      await deleteDoc(doc(this.db, 'users', userId, 'conversations', conversationId));
      
      // Delete from index
      await deleteDoc(doc(this.db, 'users', userId, 'conversationIndex', conversationId));
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
  
  /**
   * Get recent conversations
   */
  async getRecentConversations(
    userId: string,
    limit_: number = 10
  ): Promise<{ id: string, preview: string, timestamp: number }[]> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const q = query(
        collection(this.db, 'users', userId, 'conversationIndex'),
        orderBy('updatedAt', 'desc'),
        limit(limit_)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        preview: doc.data().preview || '',
        timestamp: doc.data().updatedAt ? doc.data().updatedAt.toMillis() : 0
      }));
    } catch (error) {
      console.error('Error getting recent conversations:', error);
      throw error;
    }
  }
  
  /**
   * Track user behavior
   */
  async trackBehavior(
    userId: string,
    action: string,
    details?: any,
    tabContext?: string
  ): Promise<string> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const behaviorRef = doc(collection(this.db, 'users', userId, 'behaviors'));
      
      await setDoc(behaviorRef, {
        action,
        details: details || null,
        tabContext: tabContext || null,
        timestamp: serverTimestamp()
      });
      
      return behaviorRef.id;
    } catch (error) {
      console.error('Error tracking behavior:', error);
      throw error;
    }
  }
  
  /**
   * Get recent behaviors
   */
  async getRecentBehaviors(
    userId: string,
    limit_: number = 100
  ): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const q = query(
        collection(this.db, 'users', userId, 'behaviors'),
        orderBy('timestamp', 'desc'),
        limit(limit_)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting recent behaviors:', error);
      throw error;
    }
  }
  
  /**
   * Save preference
   */
  async savePreference(
    userId: string,
    key: string,
    value: any
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      await setDoc(doc(this.db, 'users', userId, 'preferences', key), {
        value,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving preference:', error);
      throw error;
    }
  }
  
  /**
   * Load preference
   */
  async loadPreference(
    userId: string,
    key: string
  ): Promise<any | null> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const docRef = doc(this.db, 'users', userId, 'preferences', key);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().value;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading preference:', error);
      throw error;
    }
  }
  
  /**
   * Save device info
   */
  async saveDeviceInfo(
    userId: string,
    deviceId: string,
    deviceInfo: any
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      await setDoc(doc(this.db, 'users', userId, 'devices', deviceId), {
        ...deviceInfo,
        lastSeen: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving device info:', error);
      throw error;
    }
  }
  
  /**
   * Get user devices
   */
  async getUserDevices(userId: string): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('Firebase is not initialized');
    }
    
    try {
      const q = query(
        collection(this.db, 'users', userId, 'devices'),
        orderBy('lastSeen', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user devices:', error);
      throw error;
    }
  }
}

/**
 * Get Firebase instance
 */
export function getFirebaseInstance(): FirebaseSync | null {
  // Skip initialization if Firebase keys are missing
  if (!import.meta.env.VITE_FIREBASE_API_KEY || 
      !import.meta.env.VITE_FIREBASE_PROJECT_ID ||
      !import.meta.env.VITE_FIREBASE_APP_ID) {
    console.warn('Firebase configuration is missing');
    return null;
  }
  
  // Create instance if it doesn't exist
  if (!firebaseInstance) {
    firebaseInstance = new FirebaseSync();
  }
  
  return firebaseInstance;
}

/**
 * Initialize Firebase
 */
export function initializeFirebase(): FirebaseSync | null {
  return getFirebaseInstance();
}

export default FirebaseSync;