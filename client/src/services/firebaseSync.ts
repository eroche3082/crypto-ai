/**
 * Firebase Synchronization Service
 * 
 * Provides real-time synchronization between local state and Firebase Realtime Database
 * Used for user preferences, context, and cross-tab communication
 */

import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  onValue, 
  push, 
  update, 
  remove,
  serverTimestamp,
  DatabaseReference  
} from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Interfaces
interface SyncOptions {
  onSync?: (data: any) => void;
  onError?: (error: Error) => void;
}

// Firebase initialization status
let isInitialized = false;
let currentUserId: string | null = null;
let unsubscribers: Array<() => void> = [];

/**
 * Initialize Firebase sync
 */
export function initializeFirebaseSync(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      if (isInitialized) {
        console.log('Firebase sync already initialized');
        resolve(true);
        return;
      }
      
      // Firebase configuration from environment variables
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
      };
      
      // Ensure we have required config
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
        console.error('Missing Firebase configuration');
        reject(new Error('Missing Firebase configuration'));
        return;
      }
      
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      
      // Initialize database
      const database = getDatabase(app);
      
      // Setup auth listener to sync user data
      const auth = getAuth(app);
      
      const authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in
          currentUserId = user.uid;
          console.log('Firebase sync: User signed in', user.uid);
          
          // Initialize user data
          initializeUserData(user.uid);
        } else {
          // User is signed out
          currentUserId = null;
          console.log('Firebase sync: User signed out');
          
          // Clear local user data
          localStorage.removeItem('user_preferences');
          localStorage.removeItem('user_context');
        }
      });
      
      // Store unsubscribe function
      unsubscribers.push(authUnsubscribe);
      
      // Mark as initialized
      isInitialized = true;
      
      // Sync any local data to Firebase
      syncLocalDataToFirebase();
      
      console.log('Firebase sync initialized successfully');
      resolve(true);
    } catch (error) {
      console.error('Error initializing Firebase sync:', error);
      reject(error);
    }
  });
}

/**
 * Initialize user data in Firebase
 */
function initializeUserData(userId: string): void {
  try {
    const database = getDatabase();
    const userRef = ref(database, `users/${userId}`);
    
    // Check if user data exists, if not initialize it
    onValue(userRef, (snapshot) => {
      if (!snapshot.exists()) {
        // Initialize user data
        set(userRef, {
          createdAt: serverTimestamp(),
          preferences: {},
          context: {},
          lastActive: serverTimestamp()
        });
      } else {
        // Update last active
        update(ref(database, `users/${userId}`), {
          lastActive: serverTimestamp()
        });
      }
    }, {
      onlyOnce: true
    });
  } catch (error) {
    console.error('Error initializing user data:', error);
  }
}

/**
 * Sync local data to Firebase
 */
function syncLocalDataToFirebase(): void {
  if (!currentUserId) {
    console.log('Cannot sync local data to Firebase: No user signed in');
    return;
  }
  
  try {
    const database = getDatabase();
    
    // Sync preferences
    const preferences = localStorage.getItem('user_preferences');
    if (preferences) {
      try {
        const preferencesObj = JSON.parse(preferences);
        set(ref(database, `users/${currentUserId}/preferences`), preferencesObj);
      } catch (error) {
        console.error('Error parsing user preferences:', error);
      }
    }
    
    // Sync context
    const context = localStorage.getItem('user_context');
    if (context) {
      try {
        const contextObj = JSON.parse(context);
        set(ref(database, `users/${currentUserId}/context`), contextObj);
      } catch (error) {
        console.error('Error parsing user context:', error);
      }
    }
    
    // Sync behavior events
    const behaviorEvents = localStorage.getItem('user_behavior_events');
    if (behaviorEvents) {
      try {
        const eventsArray = JSON.parse(behaviorEvents);
        // Only sync recent events (last 100)
        const recentEvents = eventsArray.slice(-100);
        
        // Use update to merge rather than overwrite
        const updates: Record<string, any> = {};
        recentEvents.forEach((event: any) => {
          updates[`users/${currentUserId}/behaviorEvents/${event.id}`] = event;
        });
        
        update(ref(database), updates);
      } catch (error) {
        console.error('Error parsing behavior events:', error);
      }
    }
    
    // Sync recommendations
    const recommendations = localStorage.getItem('ai_recommendations');
    if (recommendations) {
      try {
        const recommendationsArray = JSON.parse(recommendations);
        // Only sync pending recommendations
        const pendingRecommendations = recommendationsArray.filter((rec: any) => rec.status === 'pending');
        
        // Use update to merge rather than overwrite
        const updates: Record<string, any> = {};
        pendingRecommendations.forEach((rec: any) => {
          updates[`users/${currentUserId}/recommendations/${rec.id}`] = rec;
        });
        
        update(ref(database), updates);
      } catch (error) {
        console.error('Error parsing recommendations:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing local data to Firebase:', error);
  }
}

/**
 * Sync specific data path to Firebase
 */
export function syncToFirebase(path: string, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isInitialized) {
      reject(new Error('Firebase sync not initialized'));
      return;
    }
    
    if (!currentUserId) {
      reject(new Error('No user signed in'));
      return;
    }
    
    try {
      const database = getDatabase();
      const dataRef = ref(database, `users/${currentUserId}/${path}`);
      
      set(dataRef, data)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error(`Error syncing data to Firebase path ${path}:`, error);
          reject(error);
        });
    } catch (error) {
      console.error(`Error syncing data to Firebase path ${path}:`, error);
      reject(error);
    }
  });
}

/**
 * Listen for changes to a specific path in Firebase
 */
export function listenForChanges(path: string, options: SyncOptions = {}): () => void {
  if (!isInitialized) {
    console.error('Firebase sync not initialized');
    if (options.onError) {
      options.onError(new Error('Firebase sync not initialized'));
    }
    return () => {};
  }
  
  if (!currentUserId) {
    console.error('No user signed in');
    if (options.onError) {
      options.onError(new Error('No user signed in'));
    }
    return () => {};
  }
  
  try {
    const database = getDatabase();
    const dataRef = ref(database, `users/${currentUserId}/${path}`);
    
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      
      if (options.onSync) {
        options.onSync(data);
      }
      
      // Also update localStorage for offline access
      localStorage.setItem(`firebase_${path}`, JSON.stringify(data));
    }, (error) => {
      console.error(`Error listening for changes to Firebase path ${path}:`, error);
      if (options.onError) {
        options.onError(error as Error);
      }
    });
    
    // Store unsubscribe function
    unsubscribers.push(unsubscribe);
    
    return unsubscribe;
  } catch (error) {
    console.error(`Error listening for changes to Firebase path ${path}:`, error);
    if (options.onError) {
      options.onError(error as Error);
    }
    return () => {};
  }
}

/**
 * Add a new item to a list in Firebase
 */
export function addToFirebaseList(path: string, data: any): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isInitialized) {
      reject(new Error('Firebase sync not initialized'));
      return;
    }
    
    if (!currentUserId) {
      reject(new Error('No user signed in'));
      return;
    }
    
    try {
      const database = getDatabase();
      const listRef = ref(database, `users/${currentUserId}/${path}`);
      
      const newItemRef = push(listRef);
      
      set(newItemRef, data)
        .then(() => {
          // Return the new item key
          resolve(newItemRef.key || '');
        })
        .catch((error) => {
          console.error(`Error adding item to Firebase list at path ${path}:`, error);
          reject(error);
        });
    } catch (error) {
      console.error(`Error adding item to Firebase list at path ${path}:`, error);
      reject(error);
    }
  });
}

/**
 * Update an item in a Firebase list
 */
export function updateFirebaseListItem(path: string, itemId: string, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isInitialized) {
      reject(new Error('Firebase sync not initialized'));
      return;
    }
    
    if (!currentUserId) {
      reject(new Error('No user signed in'));
      return;
    }
    
    try {
      const database = getDatabase();
      const itemRef = ref(database, `users/${currentUserId}/${path}/${itemId}`);
      
      update(itemRef, data)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error(`Error updating item in Firebase list at path ${path}/${itemId}:`, error);
          reject(error);
        });
    } catch (error) {
      console.error(`Error updating item in Firebase list at path ${path}/${itemId}:`, error);
      reject(error);
    }
  });
}

/**
 * Remove an item from a Firebase list
 */
export function removeFromFirebaseList(path: string, itemId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isInitialized) {
      reject(new Error('Firebase sync not initialized'));
      return;
    }
    
    if (!currentUserId) {
      reject(new Error('No user signed in'));
      return;
    }
    
    try {
      const database = getDatabase();
      const itemRef = ref(database, `users/${currentUserId}/${path}/${itemId}`);
      
      remove(itemRef)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error(`Error removing item from Firebase list at path ${path}/${itemId}:`, error);
          reject(error);
        });
    } catch (error) {
      console.error(`Error removing item from Firebase list at path ${path}/${itemId}:`, error);
      reject(error);
    }
  });
}

/**
 * Cleanup Firebase listeners
 */
export function cleanupFirebaseSync(): void {
  unsubscribers.forEach(unsubscribe => {
    unsubscribe();
  });
  
  unsubscribers = [];
  isInitialized = false;
  currentUserId = null;
}

// Export interfaces
export {
  SyncOptions
};