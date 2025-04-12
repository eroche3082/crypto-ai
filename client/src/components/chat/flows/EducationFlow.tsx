import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  GraduationCap, 
  LightbulbIcon, 
  ScrollText, 
  Video
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

/**
 * Education Conversational Flow Component
 * Provides structured chatbot flows for the Education tab
 */
export const EducationFlow: React.FC = () => {
  const { toast } = useToast();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  
  // Educational flow triggers
  const flowTriggers = [
    { 
      name: 'Beginner Courses', 
      description: 'Learn cryptocurrency fundamentals', 
      icon: <BookOpen className="h-4 w-4" />,
      command: 'show me beginner crypto courses'
    },
    { 
      name: 'Advanced Trading', 
      description: 'Technical analysis and strategy', 
      icon: <GraduationCap className="h-4 w-4" />,
      command: 'explore advanced trading courses'
    },
    { 
      name: 'Blockchain Concepts', 
      description: 'Understand blockchain technology', 
      icon: <LightbulbIcon className="h-4 w-4" />,
      command: 'explain blockchain concepts'
    },
    { 
      name: 'Crypto Glossary', 
      description: 'Key terms and definitions', 
      icon: <ScrollText className="h-4 w-4" />,
      command: 'open crypto glossary'
    },
    { 
      name: 'Video Tutorials', 
      description: 'Watch step-by-step guides', 
      icon: <Video className="h-4 w-4" />,
      command: 'show crypto video tutorials'
    }
  ];

  // Handle flow trigger click
  const handleFlowTrigger = (trigger: any) => {
    console.log(`Triggering education flow: ${trigger.command}`);
    
    // Save to memory context in localStorage
    localStorage.setItem('last_education_flow', trigger.name);
    localStorage.setItem('education_interests', 
      JSON.stringify([
        ...(JSON.parse(localStorage.getItem('education_interests') || '[]')),
        trigger.name
      ])
    );
    
    // Set selected level for stateful UI feedback
    setSelectedLevel(trigger.name);
    
    // Show visual feedback
    toast({
      title: "Learning path selected",
      description: `${trigger.name} content is now available to explore`,
    });
    
    // Simulate visual feedback by dispatching custom event
    document.dispatchEvent(new CustomEvent('chat:new-message', { 
      detail: { message: trigger.command, sender: 'user' } 
    }));
  };

  return (
    <Card className="border-border/40 bg-card/30">
      <CardContent className="p-4">
        <div className="mb-3">
          <Badge variant="outline" className="bg-primary/10 text-primary mb-2">
            Education Assistant
          </Badge>
          <p className="text-sm text-muted-foreground">
            What would you like to learn about today?
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {flowTriggers.map((trigger, index) => (
            <Button 
              key={index} 
              variant={selectedLevel === trigger.name ? "default" : "outline"}
              className="justify-start h-auto py-2 px-3"
              onClick={() => handleFlowTrigger(trigger)}
            >
              <div className="flex items-start gap-2">
                <div className={`${selectedLevel === trigger.name ? 'bg-primary-foreground' : 'bg-primary/10'} p-2 rounded-full`}>
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
        
        {selectedLevel && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Your Learning Progress</span>
              <Badge variant="outline" className="text-xs">
                Just Started
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-1">
              <div className="bg-primary h-2 rounded-full" style={{ width: '5%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Continue learning to track your progress
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EducationFlow;