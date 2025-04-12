/**
 * AI Recommendation Container Component
 * 
 * Manages and displays AI recommendations, handling loading states,
 * user interactions, and automated refreshing of recommendations.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  AIRecommendation as AIRecommendationType,
  getAIRecommendations 
} from '../../utils/phase4Automation';
import AIRecommendation from './AIRecommendation';

// Component props
interface AIRecommendationContainerProps {
  userId?: string;
  count?: number;
  refreshInterval?: number;
  onAction?: (id: string, url?: string) => void;
  className?: string;
}

// AIRecommendationContainer component
export function AIRecommendationContainer({
  userId,
  count = 3,
  refreshInterval = 300000,  // 5 minutes default
  onAction,
  className = ''
}: AIRecommendationContainerProps) {
  // Recommendations state
  const [recommendations, setRecommendations] = useState<AIRecommendationType[]>([]);
  // Loading state
  const [loading, setLoading] = useState(false);
  // Error state
  const [error, setError] = useState<string | null>(null);
  // Dismissed recommendations
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  
  // Load recommendations
  const loadRecommendations = useCallback(async () => {
    // Skip if no user ID
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newRecommendations = await getAIRecommendations(userId, count);
      
      // Filter out dismissed recommendations
      const filteredRecommendations = newRecommendations.filter(
        rec => !dismissedIds.has(rec.id)
      );
      
      setRecommendations(filteredRecommendations);
    } catch (err) {
      console.error('Error loading AI recommendations:', err);
      setError('Failed to load personalized recommendations');
    } finally {
      setLoading(false);
    }
  }, [userId, count, dismissedIds]);
  
  // Initial load and refresh interval
  useEffect(() => {
    // Initial load
    loadRecommendations();
    
    // Set up refresh interval
    const intervalId = setInterval(loadRecommendations, refreshInterval);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [loadRecommendations, refreshInterval]);
  
  // Handle recommendation dismissal
  const handleDismiss = useCallback((id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
  }, []);
  
  // Handle recommendation action
  const handleAction = useCallback((id: string, url?: string) => {
    onAction?.(id, url);
    // Optionally dismiss after action
    // handleDismiss(id);
  }, [onAction]);
  
  // Don't render anything if there are no recommendations
  if (!userId || (recommendations.length === 0 && !loading && !error)) {
    return null;
  }
  
  return (
    <div className={`ai-recommendations ${className}`}>
      <h3 className="text-md font-semibold mb-2">Personalized Insights</h3>
      
      {loading && recommendations.length === 0 && (
        <div className="text-sm text-gray-500">
          Generating personalized recommendations...
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-500 mb-2">
          {error}
        </div>
      )}
      
      {recommendations.map(recommendation => (
        <AIRecommendation
          key={recommendation.id}
          recommendation={recommendation}
          onDismiss={handleDismiss}
          onAction={handleAction}
        />
      ))}
      
      {recommendations.length > 0 && (
        <div className="text-xs text-gray-400 text-right mt-1">
          Recommendations based on your activity
        </div>
      )}
    </div>
  );
}

export default AIRecommendationContainer;