import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  FileJson,
  Download
} from "lucide-react";

// Define the phase data structure
interface PhaseItem {
  id: string;
  label: string;
  status: 'completed' | 'not_started' | 'in_progress';
}

interface Phase {
  id: string;
  title: string;
  items: PhaseItem[];
  suggestions: string[];
}

// Initial phases data for diagnostic report
const initialPhases: Phase[] = [
  {
    id: 'phase_0_initialization',
    title: 'Phase 0: Initialization',
    items: [
      { id: 'app_skeleton_created', label: 'App skeleton created', status: 'completed' },
      { id: 'env_and_secrets_loaded', label: 'Env and secrets loaded', status: 'completed' },
      { id: 'firebase_connected', label: 'Firebase connected', status: 'completed' },
      { id: 'replit_initialized', label: 'Replit initialized', status: 'completed' },
      { id: 'github_repo_linked', label: 'GitHub repo linked', status: 'not_started' },
    ],
    suggestions: ['Link GitHub repo for backup and automation']
  },
  {
    id: 'phase_1_ui_layout',
    title: 'Phase 1: UI Layout',
    items: [
      { id: 'header_navbar', label: 'Header/navbar', status: 'completed' },
      { id: 'side_panel_tabs', label: 'Side panel tabs', status: 'completed' },
      { id: 'footer_with_admin_panel', label: 'Footer with admin panel', status: 'completed' },
      { id: 'responsive_layout', label: 'Responsive layout', status: 'in_progress' },
      { id: 'route_navigation', label: 'Route navigation', status: 'completed' },
    ],
    suggestions: ['Add dark mode switch in navbar', 'Improve mobile responsiveness']
  },
  {
    id: 'phase_2_chatbot_core',
    title: 'Phase 2: Chatbot Core',
    items: [
      { id: 'chatbot_visible', label: 'Chatbot visible', status: 'completed' },
      { id: 'fullpage_chatbot', label: 'Fullpage chatbot', status: 'completed' },
      { id: 'vertex_ai_connected', label: 'Vertex AI connected', status: 'completed' },
      { id: 'voice_input_output', label: 'Voice input/output', status: 'completed' },
      { id: 'multilingual_support', label: 'Multilingual support', status: 'completed' },
      { id: 'firebase_context_memory', label: 'Firebase context memory', status: 'in_progress' },
      { id: 'onboarding_flow_active', label: 'Onboarding flow active', status: 'completed' },
      { id: 'dashboard_linked_to_profile', label: 'Dashboard linked to profile', status: 'not_started' },
    ],
    suggestions: ['Add loading animation during onboarding', 'Improve context retention between sessions']
  },
  {
    id: 'phase_3_tab_modules',
    title: 'Phase 3: Tab Modules',
    items: [
      { id: 'dashboard_tab', label: 'Dashboard tab', status: 'completed' },
      { id: 'analytics_tab', label: 'Analytics tab', status: 'not_started' },
      { id: 'favorites_tab', label: 'Favorites tab', status: 'completed' },
      { id: 'portfolio_tab', label: 'Portfolio tab', status: 'completed' },
      { id: 'nft_gallery_tab', label: 'NFT Gallery tab', status: 'completed' },
      { id: 'token_tracker_tab', label: 'Token Tracker tab', status: 'completed' },
      { id: 'twitter_sentiment_tab', label: 'Twitter Sentiment tab', status: 'completed' },
      { id: 'tax_simulator_tab', label: 'Tax Simulator tab', status: 'in_progress' },
      { id: 'gamification_tab', label: 'Gamification tab', status: 'completed' },
      { id: 'profile_tab', label: 'Profile tab', status: 'in_progress' },
      { id: 'explore_tab', label: 'Explore tab', status: 'not_started' },
      { id: 'smart_tools_tab', label: 'Smart Tools tab', status: 'not_started' },
    ],
    suggestions: ['Group tabs into collapsible sections', 'Add tab search functionality']
  },
  {
    id: 'phase_4_user_personalization',
    title: 'Phase 4: User Personalization',
    items: [
      { id: 'subscriber_profile_system', label: 'Subscriber profile system', status: 'completed' },
      { id: 'user_data_stored', label: 'User data stored', status: 'completed' },
      { id: 'personalized_dashboard', label: 'Personalized dashboard', status: 'in_progress' },
      { id: 'avatar_used_by_chatbot', label: 'Avatar used by chatbot', status: 'completed' },
      { id: 'recommendations_engine', label: 'Recommendations engine', status: 'not_started' },
    ],
    suggestions: ['Add user preferences section', 'Implement AI-driven content personalization']
  },
  {
    id: 'phase_5_external_integrations',
    title: 'Phase 5: External Integrations',
    items: [
      { id: 'stripe_connected', label: 'Stripe connected', status: 'not_started' },
      { id: 'news_api_youtube_maps', label: 'News API/YouTube/Maps working', status: 'in_progress' },
      { id: 'google_apis', label: 'Google APIs (Vision, TTS, STT, Translate)', status: 'completed' },
      { id: 'webhooks_third_party', label: 'Webhooks & third-party APIs', status: 'in_progress' },
    ],
    suggestions: ['Add payment flow testing tool', 'Create API monitoring dashboard']
  },
  {
    id: 'phase_6_testing_qa',
    title: 'Phase 6: Testing & QA',
    items: [
      { id: 'mobile_testing', label: 'Mobile testing', status: 'in_progress' },
      { id: 'tablet_testing', label: 'Tablet testing', status: 'in_progress' },
      { id: 'multibrowser_test', label: 'Multibrowser test', status: 'in_progress' },
      { id: 'loading_error_states', label: 'Loading & error states verified', status: 'completed' },
      { id: 'chatbot_tested_each_tab', label: 'Chatbot tested in each tab', status: 'completed' },
    ],
    suggestions: ['Implement automated testing', 'Create a user testing program']
  },
  {
    id: 'phase_7_admin_tools',
    title: 'Phase 7: Admin Tools',
    items: [
      { id: 'admin_dashboard', label: 'Admin dashboard with logs viewer', status: 'completed' },
      { id: 'subscriber_list', label: 'Subscriber list', status: 'in_progress' },
      { id: 'manual_onboarding_override', label: 'Manual onboarding override', status: 'not_started' },
      { id: 'ai_prompt_tester', label: 'AI prompt tester', status: 'completed' },
      { id: 'system_diagnostics', label: 'System diagnostics panel', status: 'completed' },
      { id: 'phase_checklist', label: 'Phase checklist management', status: 'completed' },
    ],
    suggestions: ['Add user impersonation for debugging', 'Create analytics dashboard']
  },
  {
    id: 'phase_8_prelaunch',
    title: 'Phase 8: Pre-Launch Prep',
    items: [
      { id: 'seo_basics', label: 'SEO basics (title, meta)', status: 'not_started' },
      { id: 'privacy_terms', label: 'Privacy + terms pages linked', status: 'not_started' },
      { id: 'social_icons', label: 'Social icons/links added', status: 'not_started' },
      { id: 'contact_form', label: 'Contact form or email integrated', status: 'not_started' },
    ],
    suggestions: ['Create a pre-launch checklist', 'Setup social sharing metadata']
  },
  {
    id: 'phase_9_deployment',
    title: 'Phase 9: Deployment',
    items: [
      { id: 'firebase_hosting', label: 'Firebase Hosting connected', status: 'not_started' },
      { id: 'custom_domain', label: 'Custom domain linked', status: 'not_started' },
      { id: 'ssl_active', label: 'SSL active', status: 'not_started' },
      { id: 'post_deploy_test', label: 'Post-deploy test run completed', status: 'not_started' },
      { id: 'final_checklist', label: 'Final admin checklist saved', status: 'not_started' },
    ],
    suggestions: ['Setup CI/CD pipeline', 'Create deployment documentation']
  }
];

/**
 * SystemDiagnosticReport Component
 * Generates a comprehensive system status report based on the phase model
 */
export function SystemDiagnosticReport() {
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const [activeTab, setActiveTab] = useState('report');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(['phase_2_chatbot_core', 'phase_3_tab_modules']);
  const { toast } = useToast();

  // Calculate current phase and overall progress
  const calculateCurrentPhase = () => {
    // Find the highest phase with at least 50% completion
    const phaseResults = phases.map(phase => {
      const totalItems = phase.items.length;
      const completedItems = phase.items.filter(item => item.status === 'completed').length;
      const inProgressItems = phase.items.filter(item => item.status === 'in_progress').length;
      const completionPercentage = (completedItems + (inProgressItems * 0.5)) / totalItems;
      
      return {
        phaseId: phase.id,
        title: phase.title,
        completionPercentage
      };
    });
    
    // Sort phases by completion percentage (descending)
    phaseResults.sort((a, b) => b.completionPercentage - a.completionPercentage);
    
    // Find the highest phase with at least 50% completion
    const currentPhase = phaseResults.find(phase => phase.completionPercentage >= 0.5) || phaseResults[0];
    
    // Find the next focus (the next phase with < 100% completion)
    const nextFocus = phases.find(phase => {
      const completedItems = phase.items.filter(item => item.status === 'completed').length;
      return completedItems < phase.items.length && phase.id !== currentPhase.phaseId;
    });
    
    // Get priority actions from incomplete items in the current phase
    const priorityActions = phases
      .find(phase => phase.id === currentPhase.phaseId)
      ?.items
      .filter(item => item.status !== 'completed')
      .map(item => item.label) || [];
    
    return {
      currentPhase: currentPhase.title,
      nextFocus: nextFocus ? nextFocus.title : 'All phases complete',
      priorityActions: priorityActions.length > 0 ? priorityActions : ['Continue to next phase']
    };
  };

  // Calculate completion stats for the report
  const calculateStats = () => {
    let totalItems = 0;
    let completedItems = 0;
    let inProgressItems = 0;
    let notStartedItems = 0;
    
    phases.forEach(phase => {
      phase.items.forEach(item => {
        totalItems++;
        if (item.status === 'completed') completedItems++;
        else if (item.status === 'in_progress') inProgressItems++;
        else notStartedItems++;
      });
    });
    
    const completionPercentage = Math.round((completedItems / totalItems) * 100);
    
    let systemStatus = 'error';
    if (completionPercentage >= 80) systemStatus = 'ok';
    else if (completionPercentage >= 40) systemStatus = 'warning';
    
    return {
      totalItems,
      completedItems,
      inProgressItems,
      notStartedItems,
      completionPercentage,
      systemStatus
    };
  };

  // Generate JSON report of all phases
  const generateJsonReport = () => {
    const phaseReport: Record<string, any> = {};
    
    // Generate report for each phase
    phases.forEach(phase => {
      const phaseItems: Record<string, string> = {};
      
      // Map each item status to the appropriate emoji
      phase.items.forEach(item => {
        let statusEmoji = '❌'; // not started
        if (item.status === 'completed') statusEmoji = '✅';
        else if (item.status === 'in_progress') statusEmoji = '⚠️';
        
        // Convert camelCase or snake_case to readable form
        const readableKey = item.id
          .replace(/_/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .toLowerCase()
          .replace(/^\w/, c => c.toUpperCase());
        
        phaseItems[item.id] = statusEmoji;
      });
      
      // Add suggestions
      phaseReport[phase.id] = {
        ...phaseItems,
        suggestions: phase.suggestions
      };
    });
    
    // Add summary section
    const { currentPhase, nextFocus, priorityActions } = calculateCurrentPhase();
    const summary = {
      current_phase: currentPhase,
      next_focus: nextFocus,
      priority_actions: priorityActions
    };
    
    // Calculate system status
    const { systemStatus, completionPercentage } = calculateStats();
    
    // Final report
    const finalReport = {
      summary,
      phases: phaseReport,
      system_status: systemStatus,
      completion_percentage: completionPercentage
    };
    
    return JSON.stringify(finalReport, null, 2);
  };

  // Export report as JSON file
  const handleExportJson = () => {
    try {
      const jsonReport = generateJsonReport();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonReport);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `cryptobot-diagnostic-${new Date().toISOString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: 'Report Exported',
        description: 'Diagnostic report has been exported as JSON',
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export diagnostic report',
        variant: 'destructive',
      });
    }
  };

  // Refresh the report data
  const refreshReport = () => {
    setLoading(true);
    
    setTimeout(() => {
      // In a real implementation, we would fetch updated data here
      // For now, we'll just simulate a refresh
      setLoading(false);
      
      toast({
        title: 'Report Refreshed',
        description: 'Diagnostic data has been updated',
      });
    }, 1000);
  };

  // Get icon for item status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'not_started':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Get color class for status
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'in_progress':
        return 'text-yellow-500';
      case 'not_started':
        return 'text-red-500';
      default:
        return '';
    }
  };

  // Get status badge element
  const getSystemStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> System OK
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-500">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" /> System Warning
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500">
            <XCircle className="h-3.5 w-3.5 mr-1" /> System Error
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = calculateStats();
  const currentPhaseInfo = calculateCurrentPhase();
  const jsonReport = generateJsonReport();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Diagnostic</h2>
          <p className="text-muted-foreground">
            Comprehensive platform diagnostic and phase analysis
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={refreshReport}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button 
            onClick={handleExportJson}
            variant="default"
            size="sm"
            className="flex items-center gap-1"
          >
            <FileJson className="h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Platform Progress</CardTitle>
              <CardDescription>
                Overall completion: {stats.completionPercentage}%
              </CardDescription>
            </div>
            <div>{getSystemStatusBadge(stats.systemStatus)}</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${stats.completionPercentage >= 80 ? 'bg-green-500' : stats.completionPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-4 text-center text-sm">
            <div>
              <div className="font-medium">Completed</div>
              <div className="text-2xl font-bold text-green-500">
                {stats.completedItems}
                <span className="text-sm font-normal text-muted-foreground">/{stats.totalItems}</span>
              </div>
            </div>
            <div>
              <div className="font-medium">In Progress</div>
              <div className="text-2xl font-bold text-yellow-500">
                {stats.inProgressItems}
                <span className="text-sm font-normal text-muted-foreground">/{stats.totalItems}</span>
              </div>
            </div>
            <div>
              <div className="font-medium">Not Started</div>
              <div className="text-2xl font-bold text-red-500">
                {stats.notStartedItems}
                <span className="text-sm font-normal text-muted-foreground">/{stats.totalItems}</span>
              </div>
            </div>
            <div>
              <div className="font-medium">Current Phase</div>
              <div className="text-lg font-bold text-primary mt-1">
                {currentPhaseInfo.currentPhase.split(':')[0]}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 w-full md:w-auto">
          <TabsTrigger value="report">Phase Report</TabsTrigger>
          <TabsTrigger value="json">JSON Output</TabsTrigger>
        </TabsList>
        
        <TabsContent value="report">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
              <CardDescription>
                System phase evaluation and next steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1">Current Phase</div>
                  <div className="text-lg font-semibold">{currentPhaseInfo.currentPhase}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Next Focus</div>
                  <div className="text-lg font-semibold">{currentPhaseInfo.nextFocus}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Priority Actions</div>
                  <ul className="space-y-1">
                    {currentPhaseInfo.priorityActions.map((action, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        {action}
                      </li>
                    ))}
                  </ul>
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
            {phases.map((phase) => {
              const totalItems = phase.items.length;
              const completedItems = phase.items.filter(item => item.status === 'completed').length;
              const percentComplete = Math.round((completedItems / totalItems) * 100);
              
              return (
                <AccordionItem 
                  key={phase.id} 
                  value={phase.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-left gap-2">
                      <div className="font-semibold">{phase.title}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          {completedItems}/{totalItems} ({percentComplete}%)
                        </div>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${percentComplete === 100 ? 'bg-green-500' : percentComplete > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${percentComplete}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {phase.items.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex items-start gap-2 p-2 rounded"
                          >
                            {getStatusIcon(item.status)}
                            <div className="leading-tight">
                              <div className={`text-sm ${item.status === 'completed' ? 'font-medium' : ''}`}>
                                {item.label}
                              </div>
                              <div className={`text-xs ${getStatusColorClass(item.status)}`}>
                                {item.status === 'completed' ? 'Completed' : 
                                 item.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {phase.suggestions.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-1">Suggestions</div>
                          <ul className="space-y-1">
                            {phase.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm flex items-start gap-2 text-muted-foreground">
                                <span className="mt-1">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </TabsContent>
        
        <TabsContent value="json">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>JSON Diagnostic Report</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleExportJson}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </CardTitle>
              <CardDescription>
                Complete system diagnostic in JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-[60vh]">
                {jsonReport}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SystemDiagnosticReport;