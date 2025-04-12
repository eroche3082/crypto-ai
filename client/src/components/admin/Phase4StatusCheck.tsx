/**
 * Phase 4 Status Check Component
 * 
 * Displays the status of Phase 4 automation features for admin monitoring.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getFirebaseInstance } from '@/services/firebaseSync';
import { resetPhase4Automation } from '@/utils/phase4Automation';

// Component props
interface Phase4StatusCheckProps {
  userId?: string;
  className?: string;
}

// Status type
export type StatusType = 'success' | 'warning' | 'error' | 'pending' | 'default';

// Feature status interface
interface FeatureStatus {
  name: string;
  status: StatusType;
  description: string;
  completionPercentage: number;
}

/**
 * Phase 4 Status Check Component
 */
export function Phase4StatusCheck({ userId, className = '' }: Phase4StatusCheckProps) {
  // Status states
  const [features, setFeatures] = useState<FeatureStatus[]>([]);
  const [overallStatus, setOverallStatus] = useState<StatusType>('pending');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize status
  useEffect(() => {
    // Skip if no user ID
    if (!userId) return;
    
    // Check status
    checkStatus();
    
    // Refresh status every 60 seconds
    const intervalId = setInterval(checkStatus, 60000);
    
    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [userId]);
  
  /**
   * Check status of Phase 4 features
   */
  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get firebase instance
      const firebase = getFirebaseInstance();
      if (!firebase || !userId) {
        throw new Error('Firebase is not initialized or no user ID provided');
      }
      
      // Check if Phase 4 is initialized
      const isInitialized = localStorage.getItem('phase4_initialized') === 'true';
      
      // Get behavior patterns
      const patterns = await firebase.getBehaviorPatterns(userId);
      
      // Get user preferences
      const preferences = await firebase.getUserPreferences(userId);
      
      // Get recommendations
      const recommendations = await firebase.getUserRecommendations(userId);
      
      // Check chat context
      const chatContext = await firebase.getChatContext(userId);
      
      // Build feature statuses
      const updatedFeatures: FeatureStatus[] = [
        {
          name: 'Initialization',
          status: isInitialized ? 'success' : 'pending',
          description: isInitialized 
            ? 'Phase 4 automation initialized successfully' 
            : 'Phase 4 automation not yet initialized',
          completionPercentage: isInitialized ? 100 : 0
        },
        {
          name: 'Behavior Tracking',
          status: patterns.length > 0 ? 'success' : 'warning',
          description: patterns.length > 0 
            ? `${patterns.length} behavior patterns detected` 
            : 'No behavior patterns detected yet',
          completionPercentage: patterns.length > 0 ? 100 : 25
        },
        {
          name: 'User Preferences',
          status: preferences.length > 0 ? 'success' : 'warning',
          description: preferences.length > 0 
            ? `${preferences.length} user preferences stored` 
            : 'No user preferences stored yet',
          completionPercentage: preferences.length > 0 ? 100 : 25
        },
        {
          name: 'AI Recommendations',
          status: recommendations.length > 0 ? 'success' : 'warning',
          description: recommendations.length > 0 
            ? `${recommendations.length} recommendations generated` 
            : 'No recommendations generated yet',
          completionPercentage: recommendations.length > 0 ? 100 : 25
        },
        {
          name: 'Cross-Device Sync',
          status: chatContext ? 'success' : 'warning',
          description: chatContext 
            ? 'Chat context synchronized with Firebase' 
            : 'Chat context not yet synchronized',
          completionPercentage: chatContext ? 100 : 25
        }
      ];
      
      // Calculate overall status
      const newOverallStatus = calculateOverallStatus(updatedFeatures);
      
      // Update states
      setFeatures(updatedFeatures);
      setOverallStatus(newOverallStatus);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error checking Phase 4 status:', error);
      setError('Failed to check Phase 4 status: ' + error.message);
      setLoading(false);
    }
  };
  
  /**
   * Calculate overall status
   */
  const calculateOverallStatus = (features: FeatureStatus[]): StatusType => {
    // Count statuses
    const counts = {
      success: features.filter(f => f.status === 'success').length,
      warning: features.filter(f => f.status === 'warning').length,
      error: features.filter(f => f.status === 'error').length,
      pending: features.filter(f => f.status === 'pending').length
    };
    
    // Determine overall status
    if (counts.error > 0) {
      return 'error';
    } else if (counts.pending > 0) {
      return 'pending';
    } else if (counts.warning > 0) {
      return 'warning';
    } else {
      return 'success';
    }
  };
  
  /**
   * Reset Phase 4 automation
   */
  const handleReset = () => {
    // Reset Phase 4 automation
    resetPhase4Automation();
    
    // Show temporary status
    setFeatures(prev => prev.map(feature => ({
      ...feature,
      status: 'pending',
      description: 'Resetting...',
      completionPercentage: 0
    })));
    
    // Check status after reset
    setTimeout(checkStatus, 1000);
  };
  
  // Status badge colors
  const statusColors: Record<StatusType, string> = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  };
  
  // Progress bar colors
  const progressColors: Record<StatusType, string> = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    pending: 'bg-blue-500',
    default: 'bg-gray-500'
  };
  
  // Status icons
  const statusIcons: Record<StatusType, string> = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    pending: '⏳',
    default: 'ℹ️'
  };
  
  // Get overall status description
  const getOverallStatusDescription = (): string => {
    switch (overallStatus) {
      case 'success':
        return 'All Phase 4 features are operational';
      case 'warning':
        return 'Some Phase 4 features require attention';
      case 'error':
        return 'Critical Phase 4 features are not functioning';
      case 'pending':
        return 'Phase 4 features are still initializing';
      default:
        return 'Phase 4 status unknown';
    }
  };
  
  // Format last updated timestamp
  const formatLastUpdated = (): string => {
    if (!lastUpdated) return 'Never';
    
    return lastUpdated.toLocaleString(undefined, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });
  };
  
  // If no user ID, render placeholder
  if (!userId) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Phase 4 Status</CardTitle>
          <CardDescription>No user selected</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a user to view Phase 4 status</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Phase 4 Status</CardTitle>
            <CardDescription>Automation and personalization features</CardDescription>
          </div>
          <Badge className={statusColors[overallStatus]}>
            {statusIcons[overallStatus]} {overallStatus.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-md text-red-800 dark:text-red-300">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">{getOverallStatusDescription()}</p>
              <p className="text-sm text-muted-foreground">Last updated: {formatLastUpdated()}</p>
            </div>
            
            <div className="space-y-3">
              {features.map(feature => (
                <div key={feature.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{feature.name}</div>
                    <Badge className={statusColors[feature.status]}>
                      {feature.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{feature.description}</div>
                  <Progress 
                    value={feature.completionPercentage} 
                    className={`h-1.5 ${progressColors[feature.status]}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset} 
          disabled={loading}
        >
          Reset Phase 4
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={checkStatus} 
          disabled={loading}
        >
          Refresh Status
        </Button>
      </CardFooter>
    </Card>
  );
}

export default Phase4StatusCheck;