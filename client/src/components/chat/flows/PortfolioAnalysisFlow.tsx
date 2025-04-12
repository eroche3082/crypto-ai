import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart4, 
  PieChart, 
  TrendingUp, 
  ArrowDownUp, 
  AlertCircle
} from 'lucide-react';

/**
 * Portfolio Analysis Conversational Flow Component
 * Provides structured chatbot flows for the Portfolio Analysis tab
 */
export const PortfolioAnalysisFlow: React.FC = () => {
  // Fake flow triggers for demonstration
  const flowTriggers = [
    { 
      name: 'Performance Attribution', 
      description: 'Analyze the sources of portfolio returns', 
      icon: <TrendingUp className="h-4 w-4" />,
      command: 'analyze portfolio performance attribution'
    },
    { 
      name: 'Risk Analysis', 
      description: 'Evaluate portfolio risk metrics', 
      icon: <AlertCircle className="h-4 w-4" />,
      command: 'run portfolio risk analysis'
    },
    { 
      name: 'Asset Correlation', 
      description: 'View correlations between assets', 
      icon: <ArrowDownUp className="h-4 w-4" />,
      command: 'show asset correlation matrix'
    },
    { 
      name: 'Sector Breakdown', 
      description: 'Analyze portfolio by sectors', 
      icon: <PieChart className="h-4 w-4" />,
      command: 'display portfolio sector breakdown'
    },
    { 
      name: 'Performance Charts', 
      description: 'View historical performance charts', 
      icon: <BarChart4 className="h-4 w-4" />,
      command: 'display performance charts'
    }
  ];

  return (
    <Card className="border-border/40 bg-card/30">
      <CardContent className="p-4">
        <div className="mb-3">
          <Badge variant="outline" className="bg-primary/10 text-primary mb-2">
            Portfolio Analysis Assistant
          </Badge>
          <p className="text-sm text-muted-foreground">
            What would you like to analyze in your portfolio today?
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {flowTriggers.map((trigger, index) => (
            <Button 
              key={index} 
              variant="outline" 
              className="justify-start h-auto py-2 px-3"
              onClick={() => {
                // In a real implementation, this would trigger the chatbot flow
                console.log(`Triggering flow: ${trigger.command}`);
                // Save to memory context
                localStorage.setItem('last_portfolio_analysis_flow', trigger.name);
                // Simulate visual feedback
                document.dispatchEvent(new CustomEvent('chat:new-message', { 
                  detail: { message: trigger.command, sender: 'user' } 
                }));
              }}
            >
              <div className="flex items-start gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  {trigger.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium">{trigger.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{trigger.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioAnalysisFlow;