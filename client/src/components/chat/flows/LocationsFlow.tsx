import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Landmark, 
  Locate, 
  CalendarDays, 
  Star,
  Search 
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

/**
 * Locations Conversational Flow Component
 * Provides structured chatbot flows for the Locations tab
 */
export const LocationsFlow: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  
  // Locations flow triggers
  const flowTriggers = [
    { 
      name: 'Crypto ATMs', 
      description: 'Find nearby cryptocurrency ATMs', 
      icon: <Landmark className="h-4 w-4" />,
      command: 'find crypto ATMs near me'
    },
    { 
      name: 'Crypto-Friendly Stores', 
      description: 'Businesses accepting cryptocurrency', 
      icon: <MapPin className="h-4 w-4" />,
      command: 'show crypto friendly stores'
    },
    { 
      name: 'My Location', 
      description: 'Use current location', 
      icon: <Locate className="h-4 w-4" />,
      command: 'use my current location'
    },
    { 
      name: 'Crypto Events', 
      description: 'Blockchain meetups and conferences', 
      icon: <CalendarDays className="h-4 w-4" />,
      command: 'find crypto events nearby'
    },
    { 
      name: 'Saved Locations', 
      description: 'View your saved locations', 
      icon: <Star className="h-4 w-4" />,
      command: 'show my saved crypto locations'
    }
  ];

  // Handle flow trigger click
  const handleFlowTrigger = (trigger: any) => {
    console.log(`Triggering locations flow: ${trigger.command}`);
    
    // Save to memory context (persistently in localStorage)
    localStorage.setItem('last_locations_flow', trigger.name);
    
    // Track locations interests for personalization
    const locationsInterests = JSON.parse(localStorage.getItem('locations_interests') || '[]');
    if (!locationsInterests.includes(trigger.name)) {
      localStorage.setItem('locations_interests', 
        JSON.stringify([...locationsInterests, trigger.name])
      );
    }
    
    // Set selected action for UI feedback
    setSelectedAction(trigger.name);
    
    // Show visual feedback
    toast({
      title: "Location search initiated",
      description: `Looking for ${trigger.name.toLowerCase()}`,
    });
    
    // Simulate chatbot response
    document.dispatchEvent(new CustomEvent('chat:new-message', { 
      detail: { message: trigger.command, sender: 'user' } 
    }));
  };

  // Handle custom location search
  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    console.log(`Searching for: ${searchQuery}`);
    
    // Add to search history
    const searchHistory = JSON.parse(localStorage.getItem('locations_search_history') || '[]');
    localStorage.setItem('locations_search_history', 
      JSON.stringify([searchQuery, ...searchHistory.slice(0, 4)])
    );
    
    // Show visual feedback
    toast({
      title: "Location search",
      description: `Searching for "${searchQuery}"`,
    });
    
    // Simulate chatbot response
    document.dispatchEvent(new CustomEvent('chat:new-message', { 
      detail: { message: `search for crypto locations in ${searchQuery}`, sender: 'user' } 
    }));
    
    // Reset search field
    setSearchQuery('');
  };

  return (
    <Card className="border-border/40 bg-card/30">
      <CardContent className="p-4">
        <div className="mb-3">
          <Badge variant="outline" className="bg-primary/10 text-primary mb-2">
            Locations Assistant
          </Badge>
          <p className="text-sm text-muted-foreground">
            What kind of crypto locations would you like to find?
          </p>
        </div>
        
        <form onSubmit={handleCustomSearch} className="mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter city, address or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="default" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </form>
        
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
        
        {/* Search history section */}
        {(() => {
          const searchHistory = JSON.parse(localStorage.getItem('locations_search_history') || '[]');
          if (searchHistory.length > 0) {
            return (
              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Recent Searches</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => {
                      localStorage.removeItem('locations_search_history');
                      toast({
                        title: "History cleared",
                        description: "Your search history has been cleared",
                      });
                    }}
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {searchHistory.map((search: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs cursor-pointer"
                      onClick={() => {
                        setSearchQuery(search);
                        // Move to top of history
                        const newHistory = [
                          search,
                          ...searchHistory.filter((s: string) => s !== search)
                        ];
                        localStorage.setItem('locations_search_history', JSON.stringify(newHistory));
                      }}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })()}
      </CardContent>
    </Card>
  );
};

export default LocationsFlow;