/**
 * Phase 4 Initializer Component
 * 
 * Initializes Phase 4 features including Firebase synchronization,
 * behavior tracking, AI recommendations, and self-optimization.
 */

import { useEffect, useState } from 'react';
import { initializeFirebase } from '../services/firebaseSync';
import { initChatContextManager } from '../utils/chatContextManager';
import { trackBehavior } from '../utils/phase4Automation';

// Component props
interface Phase4InitializerProps {
  userId?: string;
  onInitialized?: () => void;
  onError?: (error: Error) => void;
}

// Component state
interface InitState {
  firebaseInitialized: boolean;
  chatContextInitialized: boolean;
  automationInitialized: boolean;
}

// Phase 4 initializer component
export function Phase4Initializer({ 
  userId,
  onInitialized,
  onError
}: Phase4InitializerProps) {
  // Initialization state
  const [initState, setInitState] = useState<InitState>({
    firebaseInitialized: false,
    chatContextInitialized: false,
    automationInitialized: false
  });
  
  // Initialize Firebase
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const firebase = initializeFirebase();
        setInitState(prev => ({ ...prev, firebaseInitialized: true }));
        console.log('Firebase initialized:', !!firebase);
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        onError?.(new Error('Failed to initialize Firebase'));
      }
    };
    
    initFirebase();
  }, [onError]);
  
  // Initialize chat context
  useEffect(() => {
    if (!initState.firebaseInitialized) return;
    
    const initChatContext = async () => {
      try {
        await initChatContextManager(userId);
        setInitState(prev => ({ ...prev, chatContextInitialized: true }));
        console.log('Chat context initialized');
      } catch (error) {
        console.error('Error initializing chat context:', error);
        onError?.(new Error('Failed to initialize chat context'));
      }
    };
    
    initChatContext();
  }, [initState.firebaseInitialized, userId, onError]);
  
  // Initialize automation
  useEffect(() => {
    if (!initState.chatContextInitialized) return;
    
    const initAutomation = async () => {
      try {
        // Track initialization
        if (userId) {
          await trackBehavior(userId, 'session_start', {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          });
        }
        
        setInitState(prev => ({ ...prev, automationInitialized: true }));
        console.log('Automation initialized');
      } catch (error) {
        console.error('Error initializing automation:', error);
        onError?.(new Error('Failed to initialize automation'));
      }
    };
    
    initAutomation();
  }, [initState.chatContextInitialized, userId, onError]);
  
  // Call onInitialized when everything is ready
  useEffect(() => {
    const { firebaseInitialized, chatContextInitialized, automationInitialized } = initState;
    
    if (firebaseInitialized && chatContextInitialized && automationInitialized) {
      console.log('All Phase 4 features initialized');
      onInitialized?.();
    }
  }, [initState, onInitialized]);
  
  // This is a utility component that doesn't render anything
  return null;
}

export default Phase4Initializer;