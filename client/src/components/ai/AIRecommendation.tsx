/**
 * AI Recommendation Component
 * 
 * Displays personalized AI recommendations to users based on their behavior patterns,
 * preferences, and current context.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AIRecommendation as AIRecommendationType, RecommendationPriority, trackRecommendationInteraction } from '@/utils/phase4Automation';
import { useToast } from '@/hooks/use-toast';

// Props interface
interface AIRecommendationProps {
  recommendation: AIRecommendationType;
  userId?: string;
  onAction?: (recommendation: AIRecommendationType) => void;
  onDismiss?: (recommendation: AIRecommendationType) => void;
  className?: string;
  compact?: boolean;
}

// Priority color mapping
const priorityColors: Record<RecommendationPriority, string> = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  medium: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  high: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
};

/**
 * AI Recommendation Component
 */
export function AIRecommendation({
  recommendation,
  userId,
  onAction,
  onDismiss,
  className = '',
  compact = false
}: AIRecommendationProps) {
  // Dismissed state
  const [isDismissed, setIsDismissed] = useState(recommendation.dismissed || false);
  // Loading state for action button
  const [isActionLoading, setIsActionLoading] = useState(false);
  // Toast for notifications
  const { toast } = useToast();
  
  // Format timestamp
  const formatTimestamp = (timestamp?: number): string => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };
  
  // Handle action button click
  const handleAction = async () => {
    setIsActionLoading(true);
    
    try {
      // Track interaction
      if (userId) {
        await trackRecommendationInteraction(userId, recommendation.id, 'click');
      }
      
      // Callback
      if (onAction) {
        onAction(recommendation);
      }
      
      // If there's an action URL, navigate to it
      if (recommendation.actionUrl) {
        if (recommendation.actionUrl.startsWith('#')) {
          // Anchor link - find and scroll to element
          const element = document.querySelector(recommendation.actionUrl);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else if (recommendation.actionUrl.startsWith('/')) {
          // Internal link - use history API
          window.history.pushState({}, '', recommendation.actionUrl);
          window.dispatchEvent(new Event('popstate'));
        } else {
          // External link - open in new tab
          window.open(recommendation.actionUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error handling recommendation action:', error);
      toast({
        title: 'Action Failed',
        description: 'Could not process this recommendation. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
    }
  };
  
  // Handle dismiss button click
  const handleDismiss = async () => {
    setIsDismissed(true);
    
    try {
      // Track interaction
      if (userId) {
        await trackRecommendationInteraction(userId, recommendation.id, 'dismiss');
      }
      
      // Callback
      if (onDismiss) {
        onDismiss(recommendation);
      }
      
      toast({
        title: 'Recommendation Dismissed',
        description: 'We won\'t show this suggestion again.',
      });
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      setIsDismissed(false);
    }
  };
  
  // Tracking view
  useState(() => {
    // Track view interaction on component mount
    if (userId) {
      trackRecommendationInteraction(userId, recommendation.id, 'view').catch(error => {
        console.error('Error tracking recommendation view:', error);
      });
    }
  });
  
  // If dismissed, don't render
  if (isDismissed) {
    return null;
  }
  
  // Compact version for inline or toast-style usage
  if (compact) {
    return (
      <div className={`flex items-start p-3 rounded-lg border bg-card shadow-sm ${className}`}>
        {recommendation.icon && (
          <div className="mr-3 text-xl">{recommendation.icon}</div>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div className="font-medium">{recommendation.title}</div>
            <div 
              className={`text-xs px-2 py-0.5 rounded-full ml-2 ${priorityColors[recommendation.priority]}`}
            >
              {recommendation.priority}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{recommendation.message}</p>
          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2">
              {recommendation.actionUrl && (
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isActionLoading}
                  onClick={handleAction}
                  className="h-7 px-2 text-xs"
                >
                  {isActionLoading ? 'Loading...' : 'View'}
                </Button>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleDismiss}
              className="h-7 px-2 text-xs"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Full card version
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {recommendation.icon && (
              <div className="mr-2 text-2xl">{recommendation.icon}</div>
            )}
            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
          </div>
          <div 
            className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[recommendation.priority]}`}
          >
            {recommendation.priority}
          </div>
        </div>
        {recommendation.timestamp && (
          <CardDescription className="text-xs">
            {formatTimestamp(recommendation.timestamp)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p>{recommendation.message}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div>
          {recommendation.category && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {recommendation.category}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
          {recommendation.actionUrl && (
            <Button 
              variant="default" 
              size="sm"
              disabled={isActionLoading}
              onClick={handleAction}
            >
              {isActionLoading ? 'Loading...' : 'View Details'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default AIRecommendation;