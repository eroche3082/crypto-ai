import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Newspaper, 
  TrendingUp, 
  BarChart, 
  Globe, 
  Search, 
  RefreshCw
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

/**
 * News Conversational Flow Component
 * Provides structured chatbot flows for the News tab
 */
export const NewsFlow: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newsApiStatus, setNewsApiStatus] = useState<'connected' | 'limited' | 'error'>('connected');
  
  // News flow triggers
  const flowTriggers = [
    { 
      name: 'Latest Headlines', 
      description: 'Breaking crypto news', 
      icon: <Newspaper className="h-4 w-4" />,
      command: 'show latest crypto headlines'
    },
    { 
      name: 'Market Analysis', 
      description: 'Expert market insights', 
      icon: <TrendingUp className="h-4 w-4" />,
      command: 'get crypto market analysis'
    },
    { 
      name: 'Sentiment Report', 
      description: 'Market sentiment overview', 
      icon: <BarChart className="h-4 w-4" />,
      command: 'show crypto sentiment report'
    },
    { 
      name: 'Global Events', 
      description: 'Regulatory and global news', 
      icon: <Globe className="h-4 w-4" />,
      command: 'latest crypto regulations news'
    },
    { 
      name: 'Custom Search', 
      description: 'Search for specific topics', 
      icon: <Search className="h-4 w-4" />,
      command: 'search crypto news for '
    }
  ];

  // Simulate API check on component mount
  useEffect(() => {
    const checkNewsApi = async () => {
      try {
        // Simulated API check
        const hasApiKey = process.env.NEWS_API_KEY || localStorage.getItem('NEWS_API_KEY');
        if (!hasApiKey) {
          setNewsApiStatus('error');
        } else {
          // Check if we're within rate limits
          const apiCallsToday = parseInt(localStorage.getItem('news_api_calls_today') || '0');
          if (apiCallsToday > 95) { // Simulated API limit
            setNewsApiStatus('limited');
          }
        }
      } catch (error) {
        console.error('Error checking news API:', error);
        setNewsApiStatus('error');
      }
    };
    
    checkNewsApi();
  }, []);

  // Handle flow trigger click
  const handleFlowTrigger = (trigger: any) => {
    setLoading(true);
    console.log(`Triggering news flow: ${trigger.command}`);
    
    // Increment API call counter
    const apiCallsToday = parseInt(localStorage.getItem('news_api_calls_today') || '0');
    localStorage.setItem('news_api_calls_today', (apiCallsToday + 1).toString());
    
    // Save to memory context
    localStorage.setItem('last_news_flow', trigger.name);
    localStorage.setItem('news_preferences', 
      JSON.stringify([
        ...(JSON.parse(localStorage.getItem('news_preferences') || '[]')),
        trigger.name
      ])
    );
    
    // Set selected category for UI feedback
    setSelectedCategory(trigger.name);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      // Show visual feedback
      toast({
        title: "News category selected",
        description: `${trigger.name} has been loaded`,
      });
      
      // Simulate chatbot response with custom event
      document.dispatchEvent(new CustomEvent('chat:new-message', { 
        detail: { message: trigger.command, sender: 'user' } 
      }));
    }, 1000);
  };

  return (
    <Card className="border-border/40 bg-card/30">
      <CardContent className="p-4">
        <div className="mb-3">
          <Badge variant="outline" className="bg-primary/10 text-primary mb-2">
            News Assistant
          </Badge>
          <p className="text-sm text-muted-foreground">
            What type of news are you interested in?
          </p>
        </div>
        
        {newsApiStatus !== 'connected' && (
          <Alert className="mb-4 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <AlertDescription>
              {newsApiStatus === 'limited' 
                ? 'News API rate limit reached. Some results may be cached.'
                : 'News API connection issue. Showing limited data.'}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {flowTriggers.map((trigger, index) => (
            <Button 
              key={index} 
              variant={selectedCategory === trigger.name ? "default" : "outline"}
              className="justify-start h-auto py-2 px-3"
              onClick={() => handleFlowTrigger(trigger)}
              disabled={loading}
            >
              <div className="flex items-start gap-2">
                <div className={`${selectedCategory === trigger.name ? 'bg-primary-foreground' : 'bg-primary/10'} p-2 rounded-full`}>
                  {loading && selectedCategory === trigger.name ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    trigger.icon
                  )}
                </div>
                <div className="text-left">
                  <div className="font-medium">{trigger.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{trigger.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        {selectedCategory && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">News Preferences</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => {
                  localStorage.removeItem('news_preferences');
                  toast({
                    title: "Preferences reset",
                    description: "Your news preferences have been reset",
                  });
                }}
              >
                Reset
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Your content feed will be customized based on your interests
            </p>
            
            <div className="flex flex-wrap gap-1">
              {Array.from(new Set([
                ...(JSON.parse(localStorage.getItem('news_preferences') || '[]')),
                selectedCategory
              ])).map((pref, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {pref}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsFlow;