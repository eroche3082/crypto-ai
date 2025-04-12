import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  RefreshCw,
  Copy,
  BarChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Phase diagnostic data types
interface PhaseItem {
  status: '✅' | '❌' | '⚠️';
  label: string;
}

interface PhaseDiagnostic {
  title: string;
  items: Record<string, PhaseItem['status']>;
  suggestions: string[];
}

interface DiagnosticReport {
  phases: Record<string, PhaseDiagnostic>;
  current_phase: string;
  next_focus: string;
  priority_actions: string[];
  status: 'OK' | 'WARNING' | 'ERROR';
}

export const SystemDiagnosticReport = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('report');
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticReport | null>(null);
  const { toast } = useToast();

  // Generate diagnostic report data
  useEffect(() => {
    generateDiagnosticReport();
  }, []);

  const generateDiagnosticReport = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch data from the backend
      // For now, we'll simulate the report generation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const reportData: DiagnosticReport = {
        phases: {
          phase_0_initialization: {
            title: "PHASE 0: Initialization",
            items: {
              app_skeleton_created: "✅",
              env_and_secrets_loaded: "✅",
              firebase_connected: "✅",
              replit_initialized: "✅",
              github_repo_linked: "❌"
            },
            suggestions: ["Link GitHub repo for backup and automation"]
          },
          phase_1_ui_layout: {
            title: "PHASE 1: Layout & UI Base",
            items: {
              header_navbar: "✅",
              side_panel_tabs: "✅",
              footer_with_admin_panel: "✅",
              responsive_layout: "⚠️",
              route_navigation: "✅"
            },
            suggestions: ["Add dark mode switch in navbar", "Optimize mobile layout for small screens"]
          },
          phase_2_chatbot_core: {
            title: "PHASE 2: Chatbot System Core",
            items: {
              chatbot_visible: "✅",
              fullpage_chatbot: "✅",
              vertex_ai_connected: "✅",
              voice_input_output: "✅",
              multilingual_support: "✅",
              firebase_context_memory: "⚠️",
              onboarding_flow_active: "✅",
              dashboard_linked_to_profile: "✅",
            },
            suggestions: ["Add loading animation during onboarding", "Implement chatbot message history export"]
          },
          phase_3_tab_modules: {
            title: "PHASE 3: Tab-by-Tab Module Integration",
            items: {
              dashboard_tab: "✅",
              dashboard_backend_api: "✅",
              dashboard_charts: "✅",
              favorites_functionality: "✅",
              portfolio_management: "✅",
              portfolio_analysis: "✅",
              nft_gallery: "✅",
              token_tracker: "✅", 
              twitter_analysis: "✅",
              tax_simulator: "⚠️",
              gamification: "✅",
              risk_watchlist: "✅",
              education_resources: "⚠️",
              news_feed: "⚠️"
            },
            suggestions: ["Group tabs into collapsible sections", "Add tab-specific settings"]
          },
          phase_4_user_personalization: {
            title: "PHASE 4: User Personalization",
            items: {
              subscriber_profile: "✅",
              firebase_user_data: "✅",
              personalized_dashboard: "✅",
              chatbot_personalization: "✅",
              ai_recommendations: "⚠️"
            },
            suggestions: ["Add user preference settings UI", "Implement AI-driven content recommendations"]
          },
          phase_5_external_integrations: {
            title: "PHASE 5: External Integrations",
            items: {
              google_apis: "✅",
              coingecko_api: "✅",
              twitter_api: "✅",
              moralis_api: "✅",
              anthropic_claude: "✅",
              openai_integration: "✅",
              stripe_connected: "⚠️"
            },
            suggestions: ["Add more payment options", "Implement API status monitoring dashboard"]
          },
          phase_6_testing_qa: {
            title: "PHASE 6: Testing & QA",
            items: {
              mobile_testing: "⚠️",
              tablet_testing: "⚠️",
              multibrowser_testing: "⚠️",
              error_state_handling: "✅",
              chatbot_tab_testing: "✅"
            },
            suggestions: ["Implement automated testing", "Add error reporting system"]
          },
          phase_7_admin_tools: {
            title: "PHASE 7: Admin Tools",
            items: {
              admin_dashboard: "✅",
              subscriber_management: "⚠️",
              manual_onboarding: "❌",
              ai_prompt_tester: "✅",
              system_diagnostics: "✅",
              phase_checklist: "✅"
            },
            suggestions: ["Add user action logging", "Implement admin authentication/authorization"]
          },
          phase_8_prelaunch: {
            title: "PHASE 8: Pre-Launch Prep",
            items: {
              seo_basics: "❌",
              privacy_terms: "❌",
              social_links: "❌",
              contact_form: "❌"
            },
            suggestions: ["Prepare SEO strategy", "Draft privacy policy and terms"]
          },
          phase_9_deployment: {
            title: "PHASE 9: Deployment",
            items: {
              firebase_hosting: "❌",
              custom_domain: "❌",
              ssl_active: "❌",
              post_deploy_testing: "❌",
              final_checklist: "❌"
            },
            suggestions: ["Set up CI/CD pipeline", "Prepare domain configuration"]
          }
        },
        current_phase: "PHASE 3 – Tab-by-Tab Module Integration",
        next_focus: "PHASE 4 – Complete User Personalization",
        priority_actions: [
          "Complete Tax Simulator module", 
          "Finish Education Resources section",
          "Implement News Integrated Feed", 
          "Set up AI recommendations engine"
        ],
        status: "WARNING"
      };
      
      setDiagnosticData(reportData);
    } catch (error) {
      console.error('Error generating diagnostic report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate diagnostic report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Export diagnostic data as JSON
  const handleExport = () => {
    try {
      if (!diagnosticData) {
        toast({
          title: 'Export Failed',
          description: 'No diagnostic data available',
          variant: 'destructive',
        });
        return;
      }
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(diagnosticData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `cryptobot-diagnostic-${new Date().toISOString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: 'Export Complete',
        description: 'Diagnostic report exported as JSON',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export diagnostic data',
        variant: 'destructive',
      });
    }
  };

  // Copy JSON data to clipboard
  const handleCopyJSON = () => {
    try {
      if (!diagnosticData) {
        toast({
          title: 'Copy Failed',
          description: 'No diagnostic data available',
          variant: 'destructive',
        });
        return;
      }
      
      navigator.clipboard.writeText(JSON.stringify(diagnosticData, null, 2));
      
      toast({
        title: 'Copied',
        description: 'Diagnostic data copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying data:', error);
      toast({
        title: 'Copy Failed',
        description: 'Could not copy diagnostic data',
        variant: 'destructive',
      });
    }
  };

  // Count item statuses
  const countStatuses = () => {
    if (!diagnosticData) return { completed: 0, partial: 0, missing: 0, total: 0 };
    
    let completed = 0;
    let partial = 0;
    let missing = 0;
    let total = 0;
    
    Object.values(diagnosticData.phases).forEach(phase => {
      Object.values(phase.items).forEach(status => {
        total++;
        if (status === '✅') completed++;
        else if (status === '⚠️') partial++;
        else if (status === '❌') missing++;
      });
    });
    
    return { completed, partial, missing, total };
  };
  
  // Get status badge component
  const getStatusBadge = (status: DiagnosticReport['status']) => {
    switch (status) {
      case 'OK':
        return (
          <Badge className="bg-green-500 hover:bg-green-600" variant="default">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> System OK
          </Badge>
        );
      case 'WARNING':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600" variant="default">
            <AlertTriangle className="h-3.5 w-3.5 mr-1" /> System Warning
          </Badge>
        );
      case 'ERROR':
        return (
          <Badge className="bg-red-500 hover:bg-red-600" variant="default">
            <XCircle className="h-3.5 w-3.5 mr-1" /> System Error
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get item status icon
  const getStatusIcon = (status: PhaseItem['status']) => {
    switch (status) {
      case '✅':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case '⚠️':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case '❌':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const { completed, partial, missing, total } = countStatuses();
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Diagnostic Report</h2>
          <p className="text-muted-foreground">
            Complete diagnostic of application status following the Phase Model [F0–F9]
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
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
            onClick={handleCopyJSON}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Copy className="h-4 w-4" />
            Copy JSON
          </Button>
          <Button 
            onClick={generateDiagnosticReport}
            variant="default"
            size="sm"
            className="flex items-center gap-1"
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh Report
          </Button>
          
          {diagnosticData && (
            <div className="ml-2">
              {getStatusBadge(diagnosticData.status)}
            </div>
          )}
        </div>
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-semibold">Generating Diagnostic Report</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Analyzing system status across all phases and modules...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !diagnosticData ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <BarChart className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold">No Diagnostic Data</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Click the "Refresh Report" button to generate a diagnostic report.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Project Status Overview</CardTitle>
                  <CardDescription>
                    Current phase: {diagnosticData.current_phase}
                  </CardDescription>
                </div>
                {getStatusBadge(diagnosticData.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <div className="font-medium">Completed</div>
                  <div className="text-2xl font-bold text-green-500">
                    {completed}
                    <span className="text-sm font-normal text-muted-foreground">/{total}</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium">In Progress</div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {partial}
                    <span className="text-sm font-normal text-muted-foreground">/{total}</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium">Missing</div>
                  <div className="text-2xl font-bold text-red-500">
                    {missing}
                    <span className="text-sm font-normal text-muted-foreground">/{total}</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium">Completion</div>
                  <div className="text-2xl font-bold text-primary">
                    {completionPercentage}%
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <h4 className="font-medium">Next Focus</h4>
                <p className="text-muted-foreground">{diagnosticData.next_focus}</p>
                
                <h4 className="font-medium mt-4">Priority Actions</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {diagnosticData.priority_actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="report">Phase Report</TabsTrigger>
              <TabsTrigger value="json">JSON Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="report">
              <div className="space-y-4">
                {Object.entries(diagnosticData.phases).map(([phaseKey, phase]) => (
                  <Card key={phaseKey} className="overflow-hidden border-l-4" style={{
                    borderLeftColor: getMostSevereColor(phase.items)
                  }}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{phase.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                        {Object.entries(phase.items).map(([itemKey, status]) => (
                          <div key={itemKey} className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <span className="text-sm">
                              {itemKey.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {phase.suggestions.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {phase.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="json">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Raw JSON Report</CardTitle>
                  <CardDescription>
                    Complete diagnostic data in JSON format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                    <pre className="text-xs">
                      {JSON.stringify(diagnosticData, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

// Helper function to determine the most severe status color in a phase
function getMostSevereColor(items: Record<string, PhaseItem['status']>): string {
  const statuses = Object.values(items);
  if (statuses.includes('❌')) return 'rgb(239, 68, 68)'; // red-500
  if (statuses.includes('⚠️')) return 'rgb(245, 158, 11)'; // yellow-500
  return 'rgb(34, 197, 94)'; // green-500
}

export default SystemDiagnosticReport;