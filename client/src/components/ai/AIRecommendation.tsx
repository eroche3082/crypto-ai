/**
 * AI Recommendation Component
 * 
 * Displays personalized AI recommendations based on user behavior
 * with customizable appearance and interactive actions.
 */

import { useState } from 'react';
import { AIRecommendation as AIRecommendationType } from '../../utils/phase4Automation';

// Component props
interface AIRecommendationProps {
  recommendation: AIRecommendationType;
  onDismiss?: (id: string) => void;
  onAction?: (id: string, url?: string) => void;
  className?: string;
}

// Priority to color mapping
const priorityColors = {
  low: 'bg-blue-100 border-blue-200',
  medium: 'bg-yellow-100 border-yellow-200',
  high: 'bg-red-100 border-red-200'
};

// Type to icon mapping
const typeIcons = {
  content: '📄',
  action: '🔄',
  notification: '🔔'
};

// AIRecommendation component
export function AIRecommendation({
  recommendation,
  onDismiss,
  onAction,
  className = ''
}: AIRecommendationProps) {
  // Dismiss state
  const [dismissed, setDismissed] = useState(recommendation.dismissed || false);
  
  // Handle dismiss action
  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.(recommendation.id);
  };
  
  // Handle action click
  const handleAction = () => {
    onAction?.(recommendation.id, recommendation.actionUrl);
  };
  
  // Skip rendering if dismissed
  if (dismissed) return null;
  
  // Priority color class
  const colorClass = priorityColors[recommendation.priority] || priorityColors.medium;
  
  // Icon based on type
  const icon = recommendation.icon || typeIcons[recommendation.type] || '💡';
  
  return (
    <div 
      className={`
        p-3 mb-3 rounded-lg border
        ${colorClass}
        transition-all duration-300 hover:shadow-md
        ${className}
      `}
      data-testid="ai-recommendation"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <span className="text-xl mr-2">{icon}</span>
          <h4 className="font-semibold text-sm">{recommendation.title}</h4>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      
      <p className="text-sm mt-1 mb-2 text-gray-700">{recommendation.message}</p>
      
      {recommendation.actionUrl && (
        <div className="text-right">
          <button
            onClick={handleAction}
            className="px-3 py-1 text-xs rounded bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
          >
            {recommendation.type === 'content' ? 'Learn More' : 
             recommendation.type === 'action' ? 'Take Action' : 'View'}
          </button>
        </div>
      )}
    </div>
  );
}

export default AIRecommendation;