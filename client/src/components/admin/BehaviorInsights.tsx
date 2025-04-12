/**
 * Behavior Insights Component
 * 
 * Displays user behavior analytics and insights for administrative purposes,
 * including interaction patterns, AI usage statistics, and system performance.
 */

import { useState, useEffect } from 'react';
import { getFirebaseInstance } from '../../services/firebaseSync';

// Component props
interface BehaviorInsightsProps {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  className?: string;
}

// Behavior record type
interface BehaviorRecord {
  id: string;
  action: string;
  details: any;
  tabContext?: string;
  timestamp: any;
}

// Behavior analytics
interface BehaviorAnalytics {
  totalInteractions: number;
  uniqueActions: string[];
  actionFrequency: Record<string, number>;
  tabDistribution: Record<string, number>;
  mostActiveHours: Record<number, number>;
  avgSessionDuration: number;
}

// Analyze behavior data
function analyzeBehaviorData(behaviors: BehaviorRecord[]): BehaviorAnalytics {
  // Initialize analytics
  const analytics: BehaviorAnalytics = {
    totalInteractions: behaviors.length,
    uniqueActions: [],
    actionFrequency: {},
    tabDistribution: {},
    mostActiveHours: {},
    avgSessionDuration: 0
  };
  
  // Process behaviors
  behaviors.forEach(behavior => {
    // Action frequency
    const action = behavior.action;
    analytics.actionFrequency[action] = (analytics.actionFrequency[action] || 0) + 1;
    
    // Unique actions
    if (!analytics.uniqueActions.includes(action)) {
      analytics.uniqueActions.push(action);
    }
    
    // Tab distribution
    if (behavior.tabContext) {
      analytics.tabDistribution[behavior.tabContext] = 
        (analytics.tabDistribution[behavior.tabContext] || 0) + 1;
    }
    
    // Most active hours
    if (behavior.timestamp) {
      const date = behavior.timestamp.toDate ? behavior.timestamp.toDate() : new Date(behavior.timestamp);
      const hour = date.getHours();
      analytics.mostActiveHours[hour] = (analytics.mostActiveHours[hour] || 0) + 1;
    }
  });
  
  // Calculate average session duration
  if (behaviors.length > 0) {
    const sessionBehaviors = behaviors.filter(b => 
      b.action === 'session_start' || b.action === 'session_end'
    );
    
    if (sessionBehaviors.length >= 2) {
      let totalDuration = 0;
      let sessionCount = 0;
      
      for (let i = 0; i < sessionBehaviors.length - 1; i++) {
        if (sessionBehaviors[i].action === 'session_start' && 
            sessionBehaviors[i+1].action === 'session_end') {
          const startTime = sessionBehaviors[i].timestamp.toDate 
            ? sessionBehaviors[i].timestamp.toDate() 
            : new Date(sessionBehaviors[i].timestamp);
          
          const endTime = sessionBehaviors[i+1].timestamp.toDate 
            ? sessionBehaviors[i+1].timestamp.toDate() 
            : new Date(sessionBehaviors[i+1].timestamp);
          
          const durationMs = endTime.getTime() - startTime.getTime();
          if (durationMs > 0 && durationMs < 24 * 60 * 60 * 1000) { // Less than a day
            totalDuration += durationMs;
            sessionCount++;
          }
        }
      }
      
      if (sessionCount > 0) {
        analytics.avgSessionDuration = totalDuration / sessionCount / 1000 / 60; // In minutes
      }
    }
  }
  
  return analytics;
}

// Format duration in minutes to readable format
function formatDuration(minutes: number): string {
  if (minutes < 1) {
    return 'Less than a minute';
  } else if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours} hour${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} min` : ''}`;
  }
}

// BehaviorInsights component
export function BehaviorInsights({
  userId,
  startDate,
  endDate,
  className = ''
}: BehaviorInsightsProps) {
  // Behaviors state
  const [behaviors, setBehaviors] = useState<BehaviorRecord[]>([]);
  // Loading state
  const [loading, setLoading] = useState(false);
  // Error state
  const [error, setError] = useState<string | null>(null);
  // Analytics state
  const [analytics, setAnalytics] = useState<BehaviorAnalytics | null>(null);
  
  // Load behaviors
  useEffect(() => {
    const loadBehaviors = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get Firebase instance
        const firebase = getFirebaseInstance();
        
        if (!firebase) {
          throw new Error('Firebase is not initialized');
        }
        
        // Get behaviors from Firebase
        const recentBehaviors = await firebase.getRecentBehaviors(userId, 100);
        
        // Set behaviors
        setBehaviors(recentBehaviors);
        
        // Analyze behaviors
        const newAnalytics = analyzeBehaviorData(recentBehaviors);
        setAnalytics(newAnalytics);
      } catch (err) {
        console.error('Error loading behaviors:', err);
        setError('Failed to load behavior data');
      } finally {
        setLoading(false);
      }
    };
    
    loadBehaviors();
  }, [userId]);
  
  // If no user ID, don't render
  if (!userId) {
    return null;
  }
  
  return (
    <div className={`behavior-insights p-4 bg-white rounded-lg shadow ${className}`}>
      <h2 className="text-xl font-semibold mb-4">User Behavior Insights</h2>
      
      {loading && !analytics && (
        <div className="text-gray-500">Loading behavior data...</div>
      )}
      
      {error && (
        <div className="text-red-500 mb-2">{error}</div>
      )}
      
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overview metrics */}
          <div className="bg-gray-50 p-3 rounded">
            <h3 className="text-lg font-medium mb-2">Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interactions:</span>
                <span className="font-medium">{analytics.totalInteractions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unique Actions:</span>
                <span className="font-medium">{analytics.uniqueActions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Session Duration:</span>
                <span className="font-medium">{formatDuration(analytics.avgSessionDuration)}</span>
              </div>
            </div>
          </div>
          
          {/* Top actions */}
          <div className="bg-gray-50 p-3 rounded">
            <h3 className="text-lg font-medium mb-2">Top Actions</h3>
            <div className="space-y-1">
              {Object.entries(analytics.actionFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([action, count]) => (
                  <div key={action} className="flex justify-between items-center">
                    <span className="text-gray-600">{action}:</span>
                    <div className="flex items-center">
                      <div 
                        className="h-2 bg-blue-400 mr-2" 
                        style={{ 
                          width: `${Math.min(100, count * 100 / analytics.totalInteractions)}px`
                        }}
                      ></div>
                      <span className="font-medium">{count}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          
          {/* Tab distribution */}
          <div className="bg-gray-50 p-3 rounded">
            <h3 className="text-lg font-medium mb-2">Tab Distribution</h3>
            <div className="space-y-1">
              {Object.entries(analytics.tabDistribution)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([tab, count]) => (
                  <div key={tab} className="flex justify-between items-center">
                    <span className="text-gray-600">{tab || 'Unknown'}:</span>
                    <div className="flex items-center">
                      <div 
                        className="h-2 bg-green-400 mr-2" 
                        style={{ 
                          width: `${Math.min(100, count * 100 / analytics.totalInteractions)}px`
                        }}
                      ></div>
                      <span className="font-medium">{count}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          
          {/* Active hours */}
          <div className="bg-gray-50 p-3 rounded">
            <h3 className="text-lg font-medium mb-2">Active Hours</h3>
            <div className="space-y-1">
              {Object.entries(analytics.mostActiveHours)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([hour, count]) => (
                  <div key={hour} className="flex justify-between items-center">
                    <span className="text-gray-600">{hour}:00 - {parseInt(hour) + 1}:00</span>
                    <div className="flex items-center">
                      <div 
                        className="h-2 bg-purple-400 mr-2" 
                        style={{ 
                          width: `${Math.min(100, count * 100 / analytics.totalInteractions)}px`
                        }}
                      ></div>
                      <span className="font-medium">{count}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
      
      {/* Recent activity log */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Recent Activity</h3>
        
        {behaviors.length === 0 && !loading && (
          <div className="text-gray-500">No recent activity recorded</div>
        )}
        
        {behaviors.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tab</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {behaviors.slice(0, 10).map(behavior => {
                  // Format timestamp
                  const timestamp = behavior.timestamp.toDate 
                    ? behavior.timestamp.toDate() 
                    : new Date(behavior.timestamp);
                    
                  return (
                    <tr key={behavior.id}>
                      <td className="px-3 py-2 text-xs">
                        {timestamp.toLocaleTimeString()}
                      </td>
                      <td className="px-3 py-2 text-xs font-medium text-gray-900">
                        {behavior.action}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {behavior.tabContext || '-'}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {behavior.details 
                          ? JSON.stringify(behavior.details).slice(0, 30) + (JSON.stringify(behavior.details).length > 30 ? '...' : '')
                          : '-'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default BehaviorInsights;