import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Lightbulb, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AIRecommendation as AIRecommendationType, updateRecommendationStatus } from '@/utils/phase4Automation';

interface AIRecommendationProps {
  recommendation: AIRecommendationType;
  onAction?: (actionType: string, params?: any) => void;
  onClose?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export const AIRecommendation: React.FC<AIRecommendationProps> = ({
  recommendation,
  onAction,
  onClose,
  style,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const { toast } = useToast();
  
  // Record that the recommendation was shown
  useEffect(() => {
    if (recommendation.status === 'pending') {
      updateRecommendationStatus(recommendation.id, 'shown');
    }
  }, [recommendation.id]);
  
  // Handle the close button
  const handleClose = () => {
    setVisible(false);
    
    // Mark as rejected
    updateRecommendationStatus(recommendation.id, 'rejected');
    
    // Call the onClose callback if provided
    if (onClose) {
      onClose();
    }
  };
  
  // Handle an action button
  const handleAction = (action: string, params?: any) => {
    // Update the recommendation status
    updateRecommendationStatus(recommendation.id, 'accepted');
    
    // Call the onAction callback if provided
    if (onAction) {
      onAction(action, params);
    }
    
    // Show a toast for feedback
    toast({
      title: "Action taken",
      description: `You've chosen to ${action.replace('_', ' ')}`,
    });
    
    // Close the recommendation
    setVisible(false);
    
    // Call the onClose callback if provided
    if (onClose) {
      onClose();
    }
  };
  
  // Render nothing if not visible
  if (!visible) {
    return null;
  }
  
  // Get confidence level text
  const getConfidenceLevel = (confidence: number): string => {
    if (confidence > 0.8) {
      return 'High';
    } else if (confidence > 0.5) {
      return 'Medium';
    } else {
      return 'Low';
    }
  };
  
  // Get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.8) {
      return 'text-green-500';
    } else if (confidence > 0.5) {
      return 'text-yellow-500';
    } else {
      return 'text-red-500';
    }
  };
  
  return (
    <Card 
      className={`shadow-lg border-primary/20 bg-card/95 backdrop-blur-sm ${className}`}
      style={style}
    >
      <CardContent className="pt-4 pb-2">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <Lightbulb className="h-5 w-5 text-primary mr-2" />
            <span className="font-medium">AI Suggestion</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <span className={getConfidenceColor(recommendation.confidence)}>
                {getConfidenceLevel(recommendation.confidence)} confidence
              </span>
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <p className="text-sm mb-2">{recommendation.content}</p>
        
        {expanded && (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded-md">
            <p className="font-medium mb-1">Why am I seeing this?</p>
            <p>{recommendation.reasoning}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2 pt-0 pb-3">
        <div className="w-full flex flex-wrap gap-2">
          {recommendation.actions.map((action, index) => (
            <Button
              key={index}
              variant={index === 0 ? "default" : "secondary"}
              size="sm"
              onClick={() => handleAction(action.action, action.params)}
              className={index === 0 ? "" : "text-muted-foreground"}
            >
              {action.label}
            </Button>
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs w-full flex items-center justify-center gap-1"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              <span>Why am I seeing this?</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIRecommendation;