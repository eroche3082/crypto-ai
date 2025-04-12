/**
 * Phase 4 Status Check Component
 * 
 * Monitors and displays the status of Phase 4 features including Firebase,
 * AI services, automation, and cross-device synchronization.
 */

import { useState, useEffect } from 'react';
import { getFirebaseInstance } from '../../services/firebaseSync';
import { getAvailableProviders } from '../../services/contextAwareChatService';

// Component props
interface Phase4StatusCheckProps {
  userId?: string;
  className?: string;
}

// Service status type
interface ServiceStatus {
  name: string;
  status: 'active' | 'inactive' | 'error' | 'checking';
  message?: string;
  details?: any;
}

// Phase4StatusCheck component
export function Phase4StatusCheck({
  userId,
  className = ''
}: Phase4StatusCheckProps) {
  // Services state
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Firebase', status: 'checking' },
    { name: 'OpenAI', status: 'checking' },
    { name: 'Anthropic', status: 'checking' },
    { name: 'Gemini', status: 'checking' },
    { name: 'Vertex AI', status: 'checking' },
    { name: 'Cross-Device Sync', status: 'checking' },
    { name: 'Behavior Tracking', status: 'checking' },
    { name: 'AI Recommendations', status: 'checking' }
  ]);
  
  // Update service status helper
  const updateServiceStatus = (
    name: string, 
    status: 'active' | 'inactive' | 'error' | 'checking',
    message?: string,
    details?: any
  ) => {
    setServices(prevServices => 
      prevServices.map(service => 
        service.name === name 
          ? { ...service, status, message, details }
          : service
      )
    );
  };
  
  // Check Firebase status
  useEffect(() => {
    const checkFirebase = async () => {
      try {
        const firebase = getFirebaseInstance();
        
        if (firebase && firebase.isReady()) {
          updateServiceStatus('Firebase', 'active', 'Firebase is connected and ready');
          
          // Also check cross-device sync
          const currentUser = firebase.getCurrentUser();
          if (currentUser) {
            updateServiceStatus(
              'Cross-Device Sync', 
              'active', 
              `Sync enabled for ${currentUser.displayName || currentUser.email}`
            );
          } else {
            updateServiceStatus(
              'Cross-Device Sync', 
              'inactive', 
              'User not signed in'
            );
          }
        } else {
          updateServiceStatus('Firebase', 'inactive', 'Firebase is not initialized');
          updateServiceStatus('Cross-Device Sync', 'inactive', 'Firebase is required for cross-device sync');
        }
      } catch (error) {
        console.error('Error checking Firebase status:', error);
        updateServiceStatus('Firebase', 'error', `Error: ${error.message}`);
        updateServiceStatus('Cross-Device Sync', 'error', 'Firebase error');
      }
    };
    
    checkFirebase();
  }, []);
  
  // Check AI providers
  useEffect(() => {
    const checkAIProviders = async () => {
      try {
        // Get available providers
        const providers = await getAvailableProviders();
        
        // OpenAI status
        if (providers.includes('openai')) {
          updateServiceStatus('OpenAI', 'active', 'OpenAI API is configured and active');
        } else {
          updateServiceStatus('OpenAI', 'inactive', 'OpenAI API is not configured');
        }
        
        // Anthropic status
        if (providers.includes('anthropic')) {
          updateServiceStatus('Anthropic', 'active', 'Anthropic API is configured and active');
        } else {
          updateServiceStatus('Anthropic', 'inactive', 'Anthropic API is not configured');
        }
        
        // Gemini status
        if (providers.includes('gemini')) {
          updateServiceStatus('Gemini', 'active', 'Gemini API is configured and active');
        } else {
          updateServiceStatus('Gemini', 'inactive', 'Gemini API is not configured');
        }
        
        // Vertex AI status
        if (providers.includes('vertexai')) {
          updateServiceStatus('Vertex AI', 'active', 'Vertex AI is configured and active');
        } else {
          updateServiceStatus('Vertex AI', 'inactive', 'Vertex AI is not configured');
        }
        
        // AI Recommendations status (depends on at least one AI provider)
        if (providers.length > 0) {
          updateServiceStatus(
            'AI Recommendations', 
            'active', 
            `AI Recommendations ready with ${providers.length} providers`
          );
        } else {
          updateServiceStatus(
            'AI Recommendations', 
            'inactive', 
            'No AI providers available for recommendations'
          );
        }
      } catch (error) {
        console.error('Error checking AI providers:', error);
        
        // Update all AI services to error state
        updateServiceStatus('OpenAI', 'error', `Error: ${error.message}`);
        updateServiceStatus('Anthropic', 'error', `Error: ${error.message}`);
        updateServiceStatus('Gemini', 'error', `Error: ${error.message}`);
        updateServiceStatus('Vertex AI', 'error', `Error: ${error.message}`);
        updateServiceStatus('AI Recommendations', 'error', 'Error checking AI providers');
      }
    };
    
    checkAIProviders();
  }, []);
  
  // Check behavior tracking status
  useEffect(() => {
    const checkBehaviorTracking = async () => {
      if (!userId) {
        updateServiceStatus('Behavior Tracking', 'inactive', 'No user logged in');
        return;
      }
      
      try {
        const firebase = getFirebaseInstance();
        
        if (firebase && firebase.isReady()) {
          // Try to get recent behaviors to test tracking
          const recentBehaviors = await firebase.getRecentBehaviors(userId, 1);
          
          if (recentBehaviors && recentBehaviors.length > 0) {
            updateServiceStatus(
              'Behavior Tracking', 
              'active', 
              'User behavior tracking is active'
            );
          } else {
            updateServiceStatus(
              'Behavior Tracking', 
              'inactive', 
              'No user behavior data found'
            );
          }
        } else {
          updateServiceStatus(
            'Behavior Tracking', 
            'inactive', 
            'Firebase is required for behavior tracking'
          );
        }
      } catch (error) {
        console.error('Error checking behavior tracking:', error);
        updateServiceStatus('Behavior Tracking', 'error', `Error: ${error.message}`);
      }
    };
    
    checkBehaviorTracking();
  }, [userId]);
  
  return (
    <div className={`phase4-status p-4 bg-white rounded-lg shadow ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Phase 4 System Status</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map(service => (
          <div 
            key={service.name}
            className={`
              p-3 rounded-lg border
              ${service.status === 'active' ? 'bg-green-50 border-green-200' : 
                service.status === 'inactive' ? 'bg-yellow-50 border-yellow-200' :
                service.status === 'error' ? 'bg-red-50 border-red-200' :
                'bg-gray-50 border-gray-200'}
            `}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{service.name}</h3>
              <span 
                className={`
                  inline-block h-3 w-3 rounded-full
                  ${service.status === 'active' ? 'bg-green-500' : 
                    service.status === 'inactive' ? 'bg-yellow-400' :
                    service.status === 'error' ? 'bg-red-500' :
                    'bg-gray-400 animate-pulse'}
                `}
              ></span>
            </div>
            
            {service.message && (
              <p className="text-xs mt-1 text-gray-600">{service.message}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Last refreshed: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

export default Phase4StatusCheck;