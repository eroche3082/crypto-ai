import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download, 
  RefreshCw,
  Copy,
  MessageSquare,
  Zap,
  ListChecks,
  Activity,
  Database,
  ShieldCheck,
  Monitor,
  Brain,
  FileWarning,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getIntegrationStatusReport, 
  updateIntegrationStatusReport, 
  calculateIntegrationMetrics, this as any,
  getIntegrationRecommendations,
  type IntegrationStatus 
} from '@/utils/integrationStatusCheck';

export const IntegrationStatusCheck = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [integrationData, setIntegrationData] = useState<any>(null);
  const { toast } = useToast();
  
  // Load integration data
  useEffect(() => {
    loadIntegrationData();
  }, []);
  
  const loadIntegrationData = async () => {
    setLoading(true);
    try {
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Get integration report from utility function
      const reportData = getIntegrationStatusReport();
      
      setIntegrationData(reportData);
    } catch (error) {
      console.error('Error loading integration data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integration status data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Export integration data as JSON
  const handleExport = () => {
    try {
      if (!integrationData) {
        toast({
          title: 'Export Failed',
          description: 'No integration data available',
          variant: 'destructive',
        });
        return;
      }
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(integrationData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `cryptobot-integration-status-${new Date().toISOString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: 'Export Complete',
        description: 'Integration status data exported as JSON',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export integration data',
        variant: 'destructive',
      });
    }
  };
  
  // Copy JSON data to clipboard
  const handleCopyJSON = () => {
    try {
      if (!integrationData) {
        toast({
          title: 'Copy Failed',
          description: 'No integration data available',
          variant: 'destructive',
        });
        return;
      }
      
      navigator.clipboard.writeText(JSON.stringify(integrationData, null, 2));
      
      toast({
        title: 'Copied',
        description: 'Integration data copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying data:', error);
      toast({
        title: 'Copy Failed',
        description: 'Could not copy integration data',
        variant: 'destructive',
      });
    }
  };
  
  // Get status icon component
  const getStatusIcon = (status: IntegrationStatus, size: number = 4) => {
    switch (status) {
      case '✅':
        return <CheckCircle className={`h-${size} w-${size} text-green-500`} />;
      case '⚠️':
        return <AlertTriangle className={`h-${size} w-${size} text-yellow-500`} />;
      case '❌':
        return <XCircle className={`h-${size} w-${size} text-red-500`} />;
      default:
        return null;
    }
  };
  
  // Get status badge component
  const getStatusBadge = (status: IntegrationStatus | string) => {
    if (status.includes('✅')) {
      return (
        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600">
          Complete
        </Badge>
      );
    } else if (status.includes('⚠️')) {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-600">
          Partial
        </Badge>
      );
    } else if (status.includes('❌')) {
      return (
        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600">
          Missing
        </Badge>
      );
    } else {
      return null;
    }
  };
  
  // Get status text for display
  const getStatusText = (status: string): string => {
    if (status.includes('✅')) {
      return status.replace('✅', '').trim() || 'Complete';
    } else if (status.includes('⚠️')) {
      return status.replace('⚠️', '').trim() || 'Partial';
    } else if (status.includes('❌')) {
      return status.replace('❌', '').trim() || 'Missing';
    }
    return status;
  };
  
  // Get simple status from string that might contain notes
  const getSimpleStatus = (status: string): IntegrationStatus => {
    if (status.includes('✅')) return '✅';
    if (status.includes('⚠️')) return '⚠️';
    if (status.includes('❌')) return '❌';
    return '❌';
  };
  
  // Get color class based on status
  const getStatusColorClass = (status: string): string => {
    if (status.includes('✅')) return 'text-green-500';
    if (status.includes('⚠️')) return 'text-yellow-500';
    if (status.includes('❌')) return 'text-red-500';
    return 'text-muted-foreground';
  };
  
  // Get icon for integration category
  const getCategoryIcon = (category: string, status: string, size: number = 4) => {
    let Icon;
    switch (category) {
      case 'chatbot_context_linked':
        Icon = Brain;
        break;
      case 'smart_flow_triggered':
        Icon = Zap;
        break;
      case 'actions_executed_successfully':
        Icon = Activity;
        break;
      case 'API_integrated':
        Icon = Database;
        break;
      case 'memory_context_saved':
        Icon = ShieldCheck;
        break;
      case 'fallbacks_configured':
        Icon = FileWarning;
        break;
      case 'UI_feedback':
        Icon = Monitor;
        break;
      default:
        Icon = CheckCircle2;
    }
    
    const colorClass = getStatusColorClass(status);
    
    return <Icon className={`h-${size} w-${size} ${colorClass}`} />;
  };
  
  // Get friendly name for integration category
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'chatbot_context_linked':
        return 'Chatbot Context';
      case 'smart_flow_triggered':
        return 'Smart Flows';
      case 'actions_executed_successfully':
        return 'Actions Execution';
      case 'API_integrated':
        return 'API Integration';
      case 'memory_context_saved':
        return 'Memory Context';
      case 'fallbacks_configured':
        return 'Fallbacks';
      case 'UI_feedback':
        return 'UI Feedback';
      default:
        return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };
  
  // Get color for overall status badge
  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600';
      case 'WARNING':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-600';
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600';
      default:
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600';
    }
  };
  
  // Calculate metrics for display
  const metrics = integrationData 
    ? calculateIntegrationMetrics(integrationData) 
    : {
        total: 0,
        status: { complete: 0, pending: 0, failed: 0 },
        context: { complete: 0, partial: 0, missing: 0 },
        flows: { complete: 0, partial: 0, missing: 0 },
        api: { complete: 0, partial: 0, missing: 0 },
        fallbacks: { complete: 0, partial: 0, missing: 0 },
        ui: { complete: 0, partial: 0, missing: 0 },
        fullyIntegrated: 0,
        percentComplete: 0
      };

  // Get recommendations
  const recommendations = integrationData ? getIntegrationRecommendations(integrationData) : [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Integration Status Check</h2>
          <p className="text-muted-foreground">
            Comprehensive verification of all integrations, flows, and chatbot actions
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
            onClick={loadIntegrationData}
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
            Refresh Data
          </Button>
        </div>
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-semibold">Loading Integration Data</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Analyzing integration status across all tabs...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !integrationData ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Database className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold">No Integration Data</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Click the "Refresh Data" button to load integration status information.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="col-span-2">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Integration Progress</CardTitle>
                    <CardDescription>
                      Phase 3.3 integration status across all tabs
                    </CardDescription>
                  </div>
                  
                  <Badge className={getOverallStatusColor(integrationData.integration_summary_status)}>
                    {integrationData.integration_summary_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Overall Integration Progress</span>
                      <span className="text-sm font-medium">{metrics.percentComplete}%</span>
                    </div>
                    <Progress value={metrics.percentComplete} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-3 md:col-span-1">
                      <Card className="bg-card/50">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-medium">Tab Status</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-2xl font-bold">{metrics.status.complete}/{metrics.total}</div>
                              <div className="text-sm text-muted-foreground">Fully integrated</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm flex items-center justify-end">
                                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                                <span>{metrics.status.complete} complete</span>
                              </div>
                              <div className="text-sm flex items-center justify-end">
                                <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                                <span>{metrics.status.pending} pending</span>
                              </div>
                              <div className="text-sm flex items-center justify-end">
                                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                                <span>{metrics.status.failed} failed</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="col-span-3 md:col-span-2">
                      <Card className="bg-card/50">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm font-medium">Integration Categories</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-sm">
                            <div className="flex flex-col items-center">
                              <Brain className="h-6 w-6 text-blue-500 mb-1" />
                              <div className="font-semibold">Context</div>
                              <div>{metrics.context.complete}/{metrics.total}</div>
                            </div>
                            <div className="flex flex-col items-center">
                              <Zap className="h-6 w-6 text-orange-500 mb-1" />
                              <div className="font-semibold">Flows</div>
                              <div>{metrics.flows.complete}/{metrics.total}</div>
                            </div>
                            <div className="flex flex-col items-center">
                              <Activity className="h-6 w-6 text-violet-500 mb-1" />
                              <div className="font-semibold">Actions</div>
                              <div>{metrics.status.complete}/{metrics.total}</div>
                            </div>
                            <div className="flex flex-col items-center">
                              <Database className="h-6 w-6 text-emerald-500 mb-1" />
                              <div className="font-semibold">API</div>
                              <div>{metrics.api.complete}/{metrics.total}</div>
                            </div>
                            <div className="flex flex-col items-center">
                              <ShieldCheck className="h-6 w-6 text-indigo-500 mb-1" />
                              <div className="font-semibold">Memory</div>
                              <div>{metrics.status.complete}/{metrics.total}</div>
                            </div>
                            <div className="flex flex-col items-center">
                              <FileWarning className="h-6 w-6 text-amber-500 mb-1" />
                              <div className="font-semibold">Fallbacks</div>
                              <div>{metrics.fallbacks.complete}/{metrics.total}</div>
                            </div>
                            <div className="flex flex-col items-center">
                              <Monitor className="h-6 w-6 text-pink-500 mb-1" />
                              <div className="font-semibold">UI</div>
                              <div>{metrics.ui.complete}/{metrics.total}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Next steps for integration completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendations.map((recommendation, index) => (
                    <div 
                      key={index} 
                      className={`text-sm p-2 rounded-md ${
                        recommendation.includes('Ready to proceed') 
                          ? 'bg-green-500/10 text-green-500' 
                          : recommendation.includes('Critical issues') 
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {recommendation}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full text-muted-foreground"
                  onClick={() => setActiveTab('details')}
                >
                  View Detailed Status
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed View</TabsTrigger>
              <TabsTrigger value="json">JSON Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrationData.tabs.map((tab: any, index: number) => (
                  <Card key={index} className="overflow-hidden border-l-4" style={{
                    borderLeftColor: 
                      tab.status === 'complete'
                        ? 'rgb(34, 197, 94)' // green
                        : tab.status === 'failed'
                          ? 'rgb(239, 68, 68)' // red
                          : 'rgb(245, 158, 11)' // yellow
                  }}>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">
                          {tab.tab}
                        </CardTitle>
                        
                        <Badge className={
                          tab.status === 'complete'
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600'
                            : tab.status === 'failed'
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600'
                              : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-600'
                        }>
                          {tab.status === 'complete'
                            ? 'Complete'
                            : tab.status === 'failed'
                              ? 'Failed'
                              : 'Pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-5">
                      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-xs">
                        <div className="flex flex-col items-center">
                          <div className={getStatusColorClass(tab.chatbot_context_linked)}>
                            <Brain className="h-5 w-5 mb-1" />
                          </div>
                          <div>Context</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={getStatusColorClass(tab.smart_flow_triggered)}>
                            <Zap className="h-5 w-5 mb-1" />
                          </div>
                          <div>Flows</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={getStatusColorClass(tab.actions_executed_successfully)}>
                            <Activity className="h-5 w-5 mb-1" />
                          </div>
                          <div>Actions</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={getStatusColorClass(tab.API_integrated)}>
                            <Database className="h-5 w-5 mb-1" />
                          </div>
                          <div>API</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={getStatusColorClass(tab.memory_context_saved)}>
                            <ShieldCheck className="h-5 w-5 mb-1" />
                          </div>
                          <div>Memory</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={getStatusColorClass(tab.fallbacks_configured)}>
                            <FileWarning className="h-5 w-5 mb-1" />
                          </div>
                          <div>Fallbacks</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className={getStatusColorClass(tab.UI_feedback)}>
                            <Monitor className="h-5 w-5 mb-1" />
                          </div>
                          <div>UI</div>
                        </div>
                      </div>
                      
                      {tab.status !== 'complete' && tab.suggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/40">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Suggestions: {tab.suggestions[0]}{tab.suggestions.length > 1 ? ` + ${tab.suggestions.length - 1} more` : ''}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              <div className="space-y-6">
                {integrationData.tabs.map((tab: any, index: number) => (
                  <Card key={index} className="overflow-hidden border-l-4" style={{
                    borderLeftColor: 
                      tab.status === 'complete'
                        ? 'rgb(34, 197, 94)' // green
                        : tab.status === 'failed'
                          ? 'rgb(239, 68, 68)' // red
                          : 'rgb(245, 158, 11)' // yellow
                  }}>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{tab.tab}</CardTitle>
                          <CardDescription>
                            {tab.status === 'complete'
                              ? 'Fully integrated with chatbot and APIs'
                              : tab.status === 'failed'
                                ? 'Critical integration issues'
                                : 'Integration in progress'}
                          </CardDescription>
                        </div>
                        
                        <Badge className={
                          tab.status === 'complete'
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600'
                            : tab.status === 'failed'
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600'
                              : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-600'
                        }>
                          {tab.status === 'complete'
                            ? 'Complete'
                            : tab.status === 'failed'
                              ? 'Failed'
                              : 'Pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="text-sm font-medium mb-3">Context & Flow Status</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Brain className={`h-4 w-4 ${getStatusColorClass(tab.chatbot_context_linked)}`} />
                                <span className="text-sm">Chatbot Context</span>
                              </div>
                              {getStatusBadge(tab.chatbot_context_linked)}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Zap className={`h-4 w-4 ${getStatusColorClass(tab.smart_flow_triggered)}`} />
                                <span className="text-sm">Smart Flow</span>
                              </div>
                              {getStatusBadge(tab.smart_flow_triggered)}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Activity className={`h-4 w-4 ${getStatusColorClass(tab.actions_executed_successfully)}`} />
                                <span className="text-sm">Actions Execution</span>
                              </div>
                              {getStatusBadge(tab.actions_executed_successfully)}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-3">Integration & Feedback</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Database className={`h-4 w-4 ${getStatusColorClass(tab.API_integrated)}`} />
                                <span className="text-sm">API Integration</span>
                              </div>
                              {getStatusBadge(tab.API_integrated)}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className={`h-4 w-4 ${getStatusColorClass(tab.memory_context_saved)}`} />
                                <span className="text-sm">Memory Context</span>
                              </div>
                              {getStatusBadge(tab.memory_context_saved)}
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Monitor className={`h-4 w-4 ${getStatusColorClass(tab.UI_feedback)}`} />
                                <span className="text-sm">UI Feedback</span>
                              </div>
                              {getStatusBadge(tab.UI_feedback)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Integration Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                              <div>
                                <span className="text-muted-foreground">Chatbot Context:</span>{' '}
                                <span>{getStatusText(tab.chatbot_context_linked)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Smart Flow:</span>{' '}
                                <span>{getStatusText(tab.smart_flow_triggered)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Actions Execution:</span>{' '}
                                <span>{getStatusText(tab.actions_executed_successfully)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">API Integration:</span>{' '}
                                <span>{getStatusText(tab.API_integrated)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Memory Context:</span>{' '}
                                <span>{getStatusText(tab.memory_context_saved)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fallbacks:</span>{' '}
                                <span>{getStatusText(tab.fallbacks_configured)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">UI Feedback:</span>{' '}
                                <span>{getStatusText(tab.UI_feedback)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {tab.suggestions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Suggested Improvements</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {tab.suggestions.map((suggestion: string, i: number) => (
                                <li key={i}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="json">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Raw JSON Data</CardTitle>
                  <CardDescription>
                    Complete integration status data in JSON format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                    <pre className="text-xs">
                      {JSON.stringify(integrationData, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Alert className={
            integrationData.integration_summary_status === 'OK'
              ? 'bg-green-500/10 text-green-500 border-green-500/20'
              : integrationData.integration_summary_status === 'WARNING'
                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                : 'bg-red-500/10 text-red-500 border-red-500/20'
          }>
            <div className="flex items-center gap-2">
              {integrationData.integration_summary_status === 'OK' ? (
                <CheckCircle className="h-4 w-4" />
              ) : integrationData.integration_summary_status === 'WARNING' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>Integration Status: {integrationData.integration_summary_status}</AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              {integrationData.integration_summary_status === 'OK' 
                ? 'Ready to proceed to Phase 4 – Automation & Self-Optimization Layer'
                : integrationData.integration_summary_status === 'WARNING'
                  ? 'Complete pending integrations before proceeding to Phase 4'
                  : 'Critical issues must be resolved before proceeding to Phase 4'}
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
};

export default IntegrationStatusCheck;