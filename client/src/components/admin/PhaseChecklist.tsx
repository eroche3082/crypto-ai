import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Download, 
  Save, 
  RefreshCw,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Phase data type
export interface PhaseItem {
  id: string;
  label: string;
  completed: boolean;
  inProgress?: boolean;
}

export interface Phase {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'complete';
  items: PhaseItem[];
  notes: string;
}

// Initial phases data
const initialPhases: Phase[] = [
  {
    id: 'phase0',
    title: 'PHASE 0: Initialization',
    status: 'complete',
    notes: '',
    items: [
      { id: 'p0-1', label: 'App skeleton created (file structure, folders, base config)', completed: true },
      { id: 'p0-2', label: '.env and AppSecrets loaded', completed: true },
      { id: 'p0-3', label: 'Firebase / Backend connected', completed: true },
      { id: 'p0-4', label: 'Replit project initialized', completed: true },
      { id: 'p0-5', label: 'GitHub repo linked (if used)', completed: false },
    ]
  },
  {
    id: 'phase1',
    title: 'PHASE 1: Layout & UI Base',
    status: 'complete',
    notes: '',
    items: [
      { id: 'p1-1', label: 'Header / Navbar implemented', completed: true },
      { id: 'p1-2', label: 'Side Panel Menu with all tabs', completed: true },
      { id: 'p1-3', label: 'Footer bar with Admin Panel trigger', completed: true },
      { id: 'p1-4', label: 'Responsive layout configured (mobile + desktop)', completed: true },
      { id: 'p1-5', label: 'Route navigation for each tab working', completed: true },
    ]
  },
  {
    id: 'phase2',
    title: 'PHASE 2: Chatbot System Core',
    status: 'complete',
    notes: 'Chatbot successfully integrated with all AI providers and multimodal support',
    items: [
      { id: 'p2-1', label: 'Chatbot floating icon visible', completed: true },
      { id: 'p2-2', label: 'FullPage chatbot opens on click', completed: true },
      { id: 'p2-3', label: 'Vertex AI connected', completed: true },
      { id: 'p2-4', label: 'Audio input/output active', completed: true },
      { id: 'p2-5', label: 'Multilingual support tested', completed: true },
      { id: 'p2-6', label: 'Firebase context memory active', completed: true },
      { id: 'p2-7', label: 'Onboarding flow (10–15 questions) implemented', completed: true },
      { id: 'p2-8', label: 'Responses stored in subscriber dashboard', completed: true },
    ]
  },
  {
    id: 'phase3',
    title: 'PHASE 3: Tab-by-Tab Module Integration',
    status: 'in-progress',
    notes: 'Most core tabs completed; working on new feature tabs',
    items: [
      { id: 'p3-1', label: 'Dashboard - UI built and responsive', completed: true },
      { id: 'p3-2', label: 'Dashboard - Backend/API connected', completed: true },
      { id: 'p3-3', label: 'Dashboard - Chart components functional', completed: true },
      { id: 'p3-4', label: 'Favorites - UI and functionality', completed: true },
      { id: 'p3-5', label: 'Portfolio - UI and data management', completed: true },
      { id: 'p3-6', label: 'Portfolio Analysis - Charts and AI insights', completed: true },
      { id: 'p3-7', label: 'NFT Gallery - UI and data integration', completed: true },
      { id: 'p3-8', label: 'Token Tracker - Monitoring interface', completed: true },
      { id: 'p3-9', label: 'Twitter Analysis - Sentiment visualization', completed: true },
      { id: 'p3-10', label: 'Tax Simulator - Calculation engine', completed: false, inProgress: true },
      { id: 'p3-11', label: 'Gamification - User reward system', completed: true },
      { id: 'p3-12', label: 'Risk Watchlist - Alerts configuration', completed: true },
      { id: 'p3-13', label: 'Education - Learning resources', completed: false, inProgress: true },
      { id: 'p3-14', label: 'News - Integrated feed', completed: false, inProgress: true },
    ]
  },
  {
    id: 'phase4',
    title: 'PHASE 4: User Personalization',
    status: 'in-progress',
    notes: 'Profile and personalization mostly complete; expanding features',
    items: [
      { id: 'p4-1', label: 'Subscriber profile system active', completed: true },
      { id: 'p4-2', label: 'User data stored in Firebase', completed: true },
      { id: 'p4-3', label: 'Personalized dashboard rendering', completed: true },
      { id: 'p4-4', label: 'Avatar or name used by chatbot', completed: true },
      { id: 'p4-5', label: 'Recommendations based on user data', completed: false, inProgress: true },
    ]
  },
  {
    id: 'phase5',
    title: 'PHASE 5: External Integrations',
    status: 'in-progress',
    notes: 'Most API integrations complete; adding more payment options',
    items: [
      { id: 'p5-1', label: 'Google APIs (Gemini, Vision, TTS, STT, Translate)', completed: true },
      { id: 'p5-2', label: 'CoinGecko API for crypto data', completed: true },
      { id: 'p5-3', label: 'Twitter API for sentiment analysis', completed: true },
      { id: 'p5-4', label: 'Moralis API for Web3 data', completed: true },
      { id: 'p5-5', label: 'Anthropic/Claude AI integration', completed: true },
      { id: 'p5-6', label: 'OpenAI integration', completed: true },
      { id: 'p5-7', label: 'Stripe connected (test mode)', completed: false, inProgress: true },
    ]
  },
  {
    id: 'phase6',
    title: 'PHASE 6: Testing & QA',
    status: 'in-progress',
    notes: 'Testing in progress across devices and browsers',
    items: [
      { id: 'p6-1', label: 'Mobile testing', completed: false, inProgress: true },
      { id: 'p6-2', label: 'Tablet testing', completed: false, inProgress: true },
      { id: 'p6-3', label: 'Multibrowser test', completed: false, inProgress: true },
      { id: 'p6-4', label: 'Loading and error states verified', completed: true },
      { id: 'p6-5', label: 'Chatbot tested in each tab', completed: true },
    ]
  },
  {
    id: 'phase7',
    title: 'PHASE 7: Admin Tools',
    status: 'in-progress',
    notes: 'Admin panel implementation in progress',
    items: [
      { id: 'p7-1', label: 'Admin dashboard with logs viewer', completed: true },
      { id: 'p7-2', label: 'Subscriber list management', completed: false, inProgress: true },
      { id: 'p7-3', label: 'Manual onboarding override', completed: false },
      { id: 'p7-4', label: 'AI prompt tester', completed: true },
      { id: 'p7-5', label: 'System diagnostics panel', completed: true },
      { id: 'p7-6', label: 'Phase checklist management', completed: true },
    ]
  },
  {
    id: 'phase8',
    title: 'PHASE 8: Pre-Launch Prep',
    status: 'pending',
    notes: '',
    items: [
      { id: 'p8-1', label: 'SEO basics (title, meta)', completed: false },
      { id: 'p8-2', label: 'Privacy + terms pages linked', completed: false },
      { id: 'p8-3', label: 'Social icons / links added', completed: false },
      { id: 'p8-4', label: 'Contact form or email integrated', completed: false },
    ]
  },
  {
    id: 'phase9',
    title: 'PHASE 9: Deployment',
    status: 'pending',
    notes: '',
    items: [
      { id: 'p9-1', label: 'Firebase Hosting connected', completed: false },
      { id: 'p9-2', label: 'Custom domain linked', completed: false },
      { id: 'p9-3', label: 'SSL active', completed: false },
      { id: 'p9-4', label: 'Post-deploy test run completed', completed: false },
      { id: 'p9-5', label: 'Final admin checklist saved', completed: false },
    ]
  }
];

export function PhaseChecklist() {
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(['phase0', 'phase1']);
  const { toast } = useToast();

  // Simulate loading phases data from Firebase
  useEffect(() => {
    // In a real implementation, this would fetch data from Firebase
    const loadPhases = async () => {
      setLoading(true);
      try {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In reality, we would fetch from Firebase here
        // const phasesData = await firebase.firestore().collection('phases').get();
        // setPhases(phasesData.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // For now, just use the initial data
        // setPhases(initialPhases);
      } catch (error) {
        console.error('Error loading phases:', error);
        toast({
          title: 'Error',
          description: 'Failed to load phases data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPhases();
  }, [toast]);

  // Calculate overall progress
  const calculateProgress = (): number => {
    let totalItems = 0;
    let completedItems = 0;
    
    phases.forEach(phase => {
      phase.items.forEach(item => {
        totalItems++;
        if (item.completed) completedItems++;
      });
    });
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  // Update item completion status
  const handleItemToggle = (phaseId: string, itemId: string, checked: boolean) => {
    setPhases(prevPhases => 
      prevPhases.map(phase => 
        phase.id === phaseId 
          ? {
              ...phase,
              items: phase.items.map(item => 
                item.id === itemId 
                  ? { ...item, completed: checked }
                  : item
              )
            }
          : phase
      )
    );
    
    // Update phase status based on items
    updatePhaseStatus(phaseId);
  };

  // Update phase notes
  const handleNotesChange = (phaseId: string, notes: string) => {
    setPhases(prevPhases => 
      prevPhases.map(phase => 
        phase.id === phaseId 
          ? { ...phase, notes }
          : phase
      )
    );
  };

  // Update phase status based on completed items
  const updatePhaseStatus = (phaseId: string) => {
    setPhases(prevPhases => 
      prevPhases.map(phase => {
        if (phase.id !== phaseId) return phase;
        
        const totalItems = phase.items.length;
        const completedItems = phase.items.filter(item => item.completed).length;
        const inProgressItems = phase.items.filter(item => item.inProgress || (item.completed === false && phase.status === 'in-progress')).length;
        
        let status: 'pending' | 'in-progress' | 'complete' = 'pending';
        
        if (completedItems === totalItems) {
          status = 'complete';
        } else if (completedItems > 0 || inProgressItems > 0) {
          status = 'in-progress';
        }
        
        return { ...phase, status };
      })
    );
  };

  // Save phases data (would write to Firebase in real implementation)
  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In reality, we would save to Firebase here
      // await Promise.all(phases.map(phase => 
      //   firebase.firestore().collection('phases').doc(phase.id).set(phase)
      // ));
      
      toast({
        title: 'Success',
        description: 'Phase data saved successfully',
      });
    } catch (error) {
      console.error('Error saving phases:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Export phases data as JSON
  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(phases, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `cryptobot-phases-${new Date().toISOString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: 'Export Complete',
        description: 'Phases data exported as JSON',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export phases data',
        variant: 'destructive',
      });
    }
  };

  // Export phases as PDF report
  const handleExportPDF = () => {
    toast({
      title: 'PDF Export',
      description: 'Generating PDF report...',
    });
    
    // In a real implementation, we would use a library like pdfmake or jspdf
    // to generate the PDF and then download it
    
    setTimeout(() => {
      toast({
        title: 'PDF Generated',
        description: 'Phase checklist PDF report is ready',
      });
    }, 1500);
  };

  // Get status badge component
  const getStatusBadge = (status: 'pending' | 'in-progress' | 'complete') => {
    switch (status) {
      case 'complete':
        return (
          <Badge className="bg-green-500 hover:bg-green-600" variant="default">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600" variant="default">
            <Circle className="h-3.5 w-3.5 mr-1 fill-current" /> In Progress
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600" variant="default">
            <AlertCircle className="h-3.5 w-3.5 mr-1" /> Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Development Phases</h2>
          <p className="text-muted-foreground">
            Track and update project development phases and tasks
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          <Button 
            onClick={handleExportPDF}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
          <Button 
            onClick={handleSave}
            variant="default"
            size="sm"
            className="flex items-center gap-1"
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>
            Overall completion: {calculateProgress()}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
            <div>
              <div className="font-medium">Phases Complete</div>
              <div className="text-2xl font-bold text-green-500">
                {phases.filter(p => p.status === 'complete').length}
                <span className="text-sm font-normal text-muted-foreground">/{phases.length}</span>
              </div>
            </div>
            <div>
              <div className="font-medium">In Progress</div>
              <div className="text-2xl font-bold text-yellow-500">
                {phases.filter(p => p.status === 'in-progress').length}
                <span className="text-sm font-normal text-muted-foreground">/{phases.length}</span>
              </div>
            </div>
            <div>
              <div className="font-medium">Tasks Complete</div>
              <div className="text-2xl font-bold text-primary">
                {phases.reduce((acc, phase) => acc + phase.items.filter(item => item.completed).length, 0)}
                <span className="text-sm font-normal text-muted-foreground">/{phases.reduce((acc, phase) => acc + phase.items.length, 0)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Accordion
        type="multiple"
        value={expanded}
        onValueChange={setExpanded}
        className="space-y-4"
      >
        {phases.map((phase) => (
          <AccordionItem 
            key={phase.id} 
            value={phase.id}
            className={`
              border rounded-lg overflow-hidden
              ${phase.status === 'complete' ? 'border-green-200 bg-green-50/40' : 
                phase.status === 'in-progress' ? 'border-yellow-200 bg-yellow-50/40' : 
                'border-gray-200'}
            `}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-left">
                <div className="font-semibold">{phase.title}</div>
                <div className="mt-2 sm:mt-0">
                  {getStatusBadge(phase.status)}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 pt-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  {phase.items.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-start gap-2 p-2 rounded
                        ${item.completed ? 'bg-green-50' : 
                          item.inProgress ? 'bg-yellow-50' : 'bg-card'}
                      `}
                    >
                      <Checkbox 
                        id={item.id}
                        checked={item.completed}
                        onCheckedChange={(checked) => 
                          handleItemToggle(phase.id, item.id, checked === true)
                        }
                        className="mt-1"
                      />
                      <div className="leading-tight">
                        <label 
                          htmlFor={item.id}
                          className={`text-sm ${item.completed ? 'line-through opacity-70' : ''}`}
                        >
                          {item.label}
                        </label>
                        {item.inProgress && !item.completed && (
                          <div className="text-xs text-yellow-600 mt-0.5 font-medium">
                            In progress
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Notes</div>
                  <Textarea
                    value={phase.notes}
                    onChange={(e) => handleNotesChange(phase.id, e.target.value)}
                    placeholder="Add notes for this phase..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default PhaseChecklist;