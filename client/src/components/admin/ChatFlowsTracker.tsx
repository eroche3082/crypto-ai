import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Code
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getChatFlowsReport, updateChatFlowsReport, calculateChatFlowMetrics, type FlowStatus } from '@/utils/chatFlowTracker';

export const ChatFlowsTracker = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [chatFlowData, setChatFlowData] = useState<any>(null);
  const { toast } = useToast();
  
  // Load chat flow data
  useEffect(() => {
    loadChatFlowData();
  }, []);
  
  const loadChatFlowData = async () => {
    setLoading(true);
    try {
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Get chat flow report from utility function
      const reportData = getChatFlowsReport();
      
      setChatFlowData(reportData);
    } catch (error) {
      console.error('Error loading chat flow data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat flow data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Export chat flow data as JSON
  const handleExport = () => {
    try {
      if (!chatFlowData) {
        toast({
          title: 'Export Failed',
          description: 'No chat flow data available',
          variant: 'destructive',
        });
        return;
      }
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chatFlowData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `cryptobot-chat-flows-${new Date().toISOString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: 'Export Complete',
        description: 'Chat flow data exported as JSON',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export chat flow data',
        variant: 'destructive',
      });
    }
  };
  
  // Copy JSON data to clipboard
  const handleCopyJSON = () => {
    try {
      if (!chatFlowData) {
        toast({
          title: 'Copy Failed',
          description: 'No chat flow data available',
          variant: 'destructive',
        });
        return;
      }
      
      navigator.clipboard.writeText(JSON.stringify(chatFlowData, null, 2));
      
      toast({
        title: 'Copied',
        description: 'Chat flow data copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying data:', error);
      toast({
        title: 'Copy Failed',
        description: 'Could not copy chat flow data',
        variant: 'destructive',
      });
    }
  };
  
  // Get status icon component
  const getStatusIcon = (status: FlowStatus, size: number = 4) => {
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
  const getStatusBadge = (status: FlowStatus) => {
    switch (status) {
      case '✅':
        return (
          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600">
            Complete
          </Badge>
        );
      case '⚠️':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-600">
            Partial
          </Badge>
        );
      case '❌':
        return (
          <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600">
            Missing
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Parse smart flows enabled string to get status
  const getSmartFlowStatus = (flowString: string): FlowStatus => {
    if (flowString.includes('✅') && !flowString.includes('partial')) {
      return '✅';
    } else if (flowString.includes('⚠️') || flowString.includes('partial')) {
      return '⚠️';
    } else {
      return '❌';
    }
  };
  
  // Truncate string with ellipsis if too long
  const truncateString = (str: string, maxLength: number = 50) => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
  };
  
  // Calculate metrics for display
  const metrics = chatFlowData 
    ? calculateChatFlowMetrics(chatFlowData) 
    : {
        total: 0,
        context: { complete: 0, partial: 0, missing: 0 },
        flows: { complete: 0, partial: 0, missing: 0 },
        triggers: { average: '0' },
        actions: { average: '0' },
        fullyEnhanced: 0,
        percentComplete: 0
      };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chatbot Flows Tracker</h2>
          <p className="text-muted-foreground">
            Track conversational flows and context awareness across all platform tabs
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
            onClick={loadChatFlowData}
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
              <h3 className="text-xl font-semibold">Loading Chat Flow Data</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Analyzing chatbot conversational flows across all tabs...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !chatFlowData ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold">No Chat Flow Data</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Click the "Refresh Data" button to load chatbot flow information.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Chat Flow Implementation Progress</CardTitle>
              <CardDescription>
                Conversational AI implementation progress across all platform tabs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Overall Chat Flow Progress</span>
                    <span className="text-sm font-medium">{metrics.percentComplete}%</span>
                  </div>
                  <Progress value={metrics.percentComplete} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-card/50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-violet-500" />
                        Context Awareness
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">{metrics.context.complete}/{metrics.total}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                        <span className="mr-2">{metrics.context.complete}</span>
                        <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                        <span className="mr-2">{metrics.context.partial}</span>
                        <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                        <span>{metrics.context.missing}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        Smart Flows
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">{metrics.flows.complete}/{metrics.total}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                        <span className="mr-2">{metrics.flows.complete}</span>
                        <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                        <span className="mr-2">{metrics.flows.partial}</span>
                        <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                        <span>{metrics.flows.missing}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-blue-500" />
                        Avg. Triggers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">{metrics.triggers.average}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Triggers per tab
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-pink-500" />
                        Avg. Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">{metrics.actions.average}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Actions per tab
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed View</TabsTrigger>
              <TabsTrigger value="json">JSON Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chatFlowData.flows.map((flow: any, index: number) => {
                  const smartFlowStatus = getSmartFlowStatus(flow.smart_flows_enabled);
                  return (
                    <Card key={index} className="overflow-hidden border-l-4" style={{
                      borderLeftColor: 
                        flow.chatbot_context === '✅' && smartFlowStatus === '✅'
                          ? 'rgb(34, 197, 94)' // green
                          : flow.chatbot_context === '❌' || smartFlowStatus === '❌'
                            ? 'rgb(239, 68, 68)' // red
                            : 'rgb(245, 158, 11)' // yellow
                    }}>
                      <CardHeader className="py-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">
                            {flow.tab}
                          </CardTitle>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <MessageSquare className={
                                flow.chatbot_context === '✅' 
                                  ? 'h-4 w-4 text-green-500' 
                                  : flow.chatbot_context === '⚠️' 
                                    ? 'h-4 w-4 text-yellow-500' 
                                    : 'h-4 w-4 text-red-500'
                              } />
                            </div>
                            
                            <div className="flex items-center">
                              <Zap className={
                                smartFlowStatus === '✅' 
                                  ? 'h-4 w-4 text-green-500' 
                                  : smartFlowStatus === '⚠️' 
                                    ? 'h-4 w-4 text-yellow-500' 
                                    : 'h-4 w-4 text-red-500'
                              } />
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-5">
                        <div className="grid grid-cols-1 gap-2 mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Context Awareness</span>
                            {getStatusBadge(flow.chatbot_context)}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Smart Flows</span>
                            {getStatusBadge(smartFlowStatus)}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground">Triggers ({flow.triggers_recognized.length})</h4>
                            <p className="text-sm mt-1">{truncateString(flow.triggers_recognized.join(', '))}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground">Actions ({flow.actions_available.length})</h4>
                            <p className="text-sm mt-1">{truncateString(flow.actions_available[0])}</p>
                            {flow.actions_available.length > 1 && (
                              <p className="text-xs text-muted-foreground">+{flow.actions_available.length - 1} more actions</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              <div className="space-y-6">
                {chatFlowData.flows.map((flow: any, index: number) => {
                  const smartFlowStatus = getSmartFlowStatus(flow.smart_flows_enabled);
                  return (
                    <Card key={index} className="overflow-hidden border-l-4" style={{
                      borderLeftColor: 
                        flow.chatbot_context === '✅' && smartFlowStatus === '✅'
                          ? 'rgb(34, 197, 94)' // green
                          : flow.chatbot_context === '❌' || smartFlowStatus === '❌'
                            ? 'rgb(239, 68, 68)' // red
                            : 'rgb(245, 158, 11)' // yellow
                    }}>
                      <CardHeader className="py-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{flow.tab}</CardTitle>
                            <CardDescription>
                              {flow.chatbot_context === '✅' && smartFlowStatus === '✅'
                                ? 'Fully implemented chat flows'
                                : flow.chatbot_context === '❌' || smartFlowStatus === '❌'
                                  ? 'Chatbot functionality missing'
                                  : 'Partial chatbot implementation'}
                            </CardDescription>
                          </div>
                          
                          <Badge className={
                            flow.chatbot_context === '✅' && smartFlowStatus === '✅'
                              ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600'
                              : flow.chatbot_context === '❌' || smartFlowStatus === '❌'
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600'
                                : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-600'
                          }>
                            {flow.chatbot_context === '✅' && smartFlowStatus === '✅'
                              ? 'Complete'
                              : flow.chatbot_context === '❌' || smartFlowStatus === '❌'
                                ? 'Missing'
                                : 'In Progress'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Context Awareness</span>
                              {getStatusBadge(flow.chatbot_context)}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Smart Flows</span>
                              {getStatusBadge(smartFlowStatus)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-2">Smart Flows</div>
                            <div className="text-sm text-muted-foreground">
                              {flow.smart_flows_enabled.replace('✅', '').replace('⚠️', '').trim()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Trigger Phrases</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {flow.triggers_recognized.map((trigger: string, i: number) => (
                                <li key={i}>{trigger}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Available Actions</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {flow.actions_available.map((action: string, i: number) => (
                                <li key={i}>{action}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Fallback Strategies</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {flow.fallbacks.map((fallback: string, i: number) => (
                                <li key={i}>{fallback}</li>
                              ))}
                            </ul>
                          </div>
                          
                          {flow.suggestions.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Suggested Improvements</h4>
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {flow.suggestions.map((suggestion: string, i: number) => (
                                  <li key={i}>{suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="json">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Raw JSON Data</CardTitle>
                  <CardDescription>
                    Complete chat flow data in JSON format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                    <pre className="text-xs">
                      {JSON.stringify(chatFlowData, null, 2)}
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

export default ChatFlowsTracker;