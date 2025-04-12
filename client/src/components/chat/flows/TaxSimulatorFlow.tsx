import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  FileText, 
  Clock, 
  TrendingDown, 
  Globe,
  HelpCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

/**
 * Tax Simulator Conversational Flow Component
 * Provides structured chatbot flows for the Tax Simulator tab
 */
export const TaxSimulatorFlow: React.FC = () => {
  const { toast } = useToast();
  const [country, setCountry] = useState<string>('United States');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'connected' | 'limited' | 'error'>('connected');
  
  // Simulate API check on component mount
  useEffect(() => {
    const checkTaxApi = async () => {
      try {
        // Simulated API check
        const taxRatesAvailable = localStorage.getItem('tax_rates_available') === 'true';
        if (!taxRatesAvailable) {
          setApiStatus('limited');
        }
      } catch (error) {
        console.error('Error checking tax API:', error);
        setApiStatus('error');
      }
    };
    
    checkTaxApi();
  }, []);
  
  // Tax simulator flow triggers
  const flowTriggers = [
    { 
      name: 'Calculate Taxes', 
      description: 'Estimate taxes on crypto gains', 
      icon: <Calculator className="h-4 w-4" />,
      command: 'calculate my crypto taxes'
    },
    { 
      name: 'Tax Report', 
      description: 'Generate annual tax report', 
      icon: <FileText className="h-4 w-4" />,
      command: 'generate tax report'
    },
    { 
      name: 'Tax Calendar', 
      description: 'Important tax dates', 
      icon: <Clock className="h-4 w-4" />,
      command: 'show crypto tax calendar'
    },
    { 
      name: 'Tax Loss Harvesting', 
      description: 'Optimize for tax efficiency', 
      icon: <TrendingDown className="h-4 w-4" />,
      command: 'find tax loss harvesting opportunities'
    },
    { 
      name: 'Tax Regulations', 
      description: 'Learn about tax laws', 
      icon: <Globe className="h-4 w-4" />,
      command: 'explain crypto tax regulations'
    }
  ];

  // Countries with crypto tax support
  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 
    'Germany', 'France', 'Japan', 'Singapore', 'Switzerland'
  ];

  // Handle flow trigger click
  const handleFlowTrigger = (trigger: any) => {
    console.log(`Triggering tax flow: ${trigger.command} for ${country}`);
    
    // Save to memory context
    localStorage.setItem('last_tax_flow', trigger.name);
    localStorage.setItem('tax_country', country);
    
    // Set selected action for UI feedback
    setSelectedAction(trigger.name);
    
    // Show visual feedback
    toast({
      title: "Tax calculation initiated",
      description: `${trigger.name} for ${country}`,
    });
    
    // Send structured data to chatbot
    document.dispatchEvent(new CustomEvent('chat:new-message', { 
      detail: { 
        message: `${trigger.command} for ${country}`, 
        sender: 'user',
        metadata: {
          country: country,
          action: trigger.name,
          timestamp: new Date().toISOString()
        }
      } 
    }));
  };

  return (
    <Card className="border-border/40 bg-card/30">
      <CardContent className="p-4">
        <div className="mb-3">
          <Badge variant="outline" className="bg-primary/10 text-primary mb-2">
            Tax Assistant
          </Badge>
          <p className="text-sm text-muted-foreground">
            How can I help with your crypto taxes?
          </p>
        </div>
        
        {apiStatus !== 'connected' && (
          <Alert className="mb-4 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <AlertDescription className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              {apiStatus === 'limited' 
                ? 'Tax rates database is being updated. Some jurisdictions may have limited data.'
                : 'Tax calculation API is currently unavailable. Using fallback calculations.'}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">
            Select your tax jurisdiction:
          </label>
          <Select 
            value={country} 
            onValueChange={setCountry}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {flowTriggers.map((trigger, index) => (
            <Button 
              key={index} 
              variant={selectedAction === trigger.name ? "default" : "outline"}
              className="justify-start h-auto py-2 px-3"
              onClick={() => handleFlowTrigger(trigger)}
            >
              <div className="flex items-start gap-2">
                <div className={`${selectedAction === trigger.name ? 'bg-primary-foreground' : 'bg-primary/10'} p-2 rounded-full`}>
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
        
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Tax Disclaimer</span>
          </div>
          <p className="text-xs text-muted-foreground">
            This tool provides estimates only and should not be considered tax or financial advice. 
            Please consult with a tax professional for personalized advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxSimulatorFlow;