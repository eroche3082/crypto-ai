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
  PieChart,
  Layout,
  PanelLeft,
  Smartphone,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getEnhancementReport, updateEnhancementReport, calculateEnhancementMetrics, type EnhancementStatus } from '@/utils/visualEnhancementTracker';

export const VisualEnhancementTracker = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [enhancementData, setEnhancementData] = useState<any>(null);
  const { toast } = useToast();
  
  // Load enhancement data
  useEffect(() => {
    loadEnhancementData();
  }, []);
  
  const loadEnhancementData = async () => {
    setLoading(true);
    try {
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Get enhancement report from utility function
      const reportData = getEnhancementReport();
      
      setEnhancementData(reportData);
    } catch (error) {
      console.error('Error loading enhancement data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load enhancement data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Export enhancement data as JSON
  const handleExport = () => {
    try {
      if (!enhancementData) {
        toast({
          title: 'Export Failed',
          description: 'No enhancement data available',
          variant: 'destructive',
        });
        return;
      }
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(enhancementData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `cryptobot-enhancements-${new Date().toISOString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: 'Export Complete',
        description: 'Enhancement data exported as JSON',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export enhancement data',
        variant: 'destructive',
      });
    }
  };
  
  // Copy JSON data to clipboard
  const handleCopyJSON = () => {
    try {
      if (!enhancementData) {
        toast({
          title: 'Copy Failed',
          description: 'No enhancement data available',
          variant: 'destructive',
        });
        return;
      }
      
      navigator.clipboard.writeText(JSON.stringify(enhancementData, null, 2));
      
      toast({
        title: 'Copied',
        description: 'Enhancement data copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying data:', error);
      toast({
        title: 'Copy Failed',
        description: 'Could not copy enhancement data',
        variant: 'destructive',
      });
    }
  };
  
  // Get status icon component
  const getStatusIcon = (status: EnhancementStatus, size: number = 4) => {
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
  const getStatusBadge = (status: EnhancementStatus) => {
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
  
  // Get status icon for specific enhancement category
  const getCategoryIcon = (category: string, status: EnhancementStatus) => {
    let Icon;
    switch (category) {
      case 'loading_state':
        Icon = Layout;
        break;
      case 'data_integration':
        Icon = PanelLeft;
        break;
      case 'responsive_ui':
        Icon = Smartphone;
        break;
      case 'chatbot_context_linked':
        Icon = MessageSquare;
        break;
      default:
        Icon = CheckCircle;
    }
    
    let colorClass;
    switch (status) {
      case '✅':
        colorClass = 'text-green-500';
        break;
      case '⚠️':
        colorClass = 'text-yellow-500';
        break;
      case '❌':
        colorClass = 'text-red-500';
        break;
      default:
        colorClass = 'text-muted-foreground';
    }
    
    return <Icon className={`h-4 w-4 ${colorClass}`} />;
  };
  
  // Get friendly name for enhancement category
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'loading_state':
        return 'Loading States';
      case 'data_integration':
        return 'Data Integration';
      case 'responsive_ui':
        return 'Responsive UI';
      case 'chatbot_context_linked':
        return 'Chatbot Context';
      default:
        return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };
  
  // Calculate metrics for display
  const metrics = enhancementData 
    ? calculateEnhancementMetrics(enhancementData)
    : { 
        total: 0, 
        loading: { complete: 0, partial: 0, missing: 0 },
        data: { complete: 0, partial: 0, missing: 0 },
        chatbot: { complete: 0, partial: 0, missing: 0 },
        responsive: { complete: 0, partial: 0, missing: 0 },
        fullyEnhanced: 0,
        percentComplete: 0
      };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Visual Enhancement Tracker</h2>
          <p className="text-muted-foreground">
            Track visual and functional enhancements across all platform modules
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
            onClick={loadEnhancementData}
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
              <h3 className="text-xl font-semibold">Loading Enhancement Data</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Analyzing visual and functional enhancements across all tabs...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !enhancementData ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <PieChart className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold">No Enhancement Data</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Click the "Refresh Data" button to load enhancement information.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Enhancement Progress</CardTitle>
              <CardDescription>
                Visual and functional enhancement progress across all platform tabs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Overall Enhancement Progress</span>
                    <span className="text-sm font-medium">{metrics.percentComplete}%</span>
                  </div>
                  <Progress value={metrics.percentComplete} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-card/50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Layout className="h-4 w-4 text-blue-500" />
                        Loading States
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">{metrics.loading.complete}/{metrics.total}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                        <span className="mr-2">{metrics.loading.complete}</span>
                        <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                        <span className="mr-2">{metrics.loading.partial}</span>
                        <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                        <span>{metrics.loading.missing}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <PanelLeft className="h-4 w-4 text-violet-500" />
                        Data Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">{metrics.data.complete}/{metrics.total}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                        <span className="mr-2">{metrics.data.complete}</span>
                        <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                        <span className="mr-2">{metrics.data.partial}</span>
                        <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                        <span>{metrics.data.missing}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-pink-500" />
                        Responsive UI
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">{metrics.responsive.complete}/{metrics.total}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                        <span className="mr-2">{metrics.responsive.complete}</span>
                        <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                        <span className="mr-2">{metrics.responsive.partial}</span>
                        <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                        <span>{metrics.responsive.missing}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-card/50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-orange-500" />
                        Chatbot Context
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">{metrics.chatbot.complete}/{metrics.total}</div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                        <span className="mr-2">{metrics.chatbot.complete}</span>
                        <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                        <span className="mr-2">{metrics.chatbot.partial}</span>
                        <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                        <span>{metrics.chatbot.missing}</span>
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
              <div className="grid grid-cols-1 gap-4">
                {enhancementData.tabs.map((tab: any, index: number) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base flex items-center gap-2">
                          {tab.tab}
                          <span className="text-xs text-muted-foreground">
                            ({Object.values(tab).filter((val: any) => val === '✅' && typeof val === 'string').length}/4)
                          </span>
                        </CardTitle>
                        
                        <div className="flex items-center gap-1">
                          {getCategoryIcon('loading_state', tab.loading_state)}
                          {getCategoryIcon('data_integration', tab.data_integration)}
                          {getCategoryIcon('responsive_ui', tab.responsive_ui)}
                          {getCategoryIcon('chatbot_context_linked', tab.chatbot_context_linked)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(tab.loading_state)}
                            <span>Loading States</span>
                          </div>
                          <span className="text-xs text-muted-foreground pl-6">
                            {tab.loading_state === '✅' ? 'Implemented' : tab.loading_state === '⚠️' ? 'Partial' : 'Missing'}
                          </span>
                        </div>
                        
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(tab.data_integration)}
                            <span>Data Integration</span>
                          </div>
                          <span className="text-xs text-muted-foreground pl-6">
                            {tab.data_integration === '✅' ? 'Connected' : tab.data_integration === '⚠️' ? 'Partial' : 'Missing'}
                          </span>
                        </div>
                        
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(tab.responsive_ui)}
                            <span>Responsive UI</span>
                          </div>
                          <span className="text-xs text-muted-foreground pl-6">
                            {tab.responsive_ui === '✅' ? 'Optimized' : tab.responsive_ui === '⚠️' ? 'Partial' : 'Not Responsive'}
                          </span>
                        </div>
                        
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(tab.chatbot_context_linked)}
                            <span>Chatbot Context</span>
                          </div>
                          <span className="text-xs text-muted-foreground pl-6">
                            {tab.chatbot_context_linked === '✅' ? 'Integrated' : tab.chatbot_context_linked === '⚠️' ? 'Basic' : 'Missing'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              <div className="space-y-6">
                {enhancementData.tabs.map((tab: any, index: number) => (
                  <Card key={index} className="overflow-hidden border-l-4" style={{
                    borderLeftColor: 
                      tab.loading_state === '✅' && 
                      tab.data_integration === '✅' && 
                      tab.chatbot_context_linked === '✅' && 
                      tab.responsive_ui === '✅' 
                        ? 'rgb(34, 197, 94)' 
                        : tab.loading_state === '❌' || 
                          tab.data_integration === '❌' || 
                          tab.chatbot_context_linked === '❌' || 
                          tab.responsive_ui === '❌'
                          ? 'rgb(239, 68, 68)'
                          : 'rgb(245, 158, 11)'
                  }}>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{tab.tab}</CardTitle>
                          <CardDescription>{tab.enhancements.length} enhancements implemented</CardDescription>
                        </div>
                        
                        <Badge className={
                          tab.loading_state === '✅' && 
                          tab.data_integration === '✅' && 
                          tab.chatbot_context_linked === '✅' && 
                          tab.responsive_ui === '✅' 
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600' 
                            : tab.loading_state === '❌' || 
                              tab.data_integration === '❌' || 
                              tab.chatbot_context_linked === '❌' || 
                              tab.responsive_ui === '❌'
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600'
                              : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-600'
                        }>
                          {tab.loading_state === '✅' && 
                           tab.data_integration === '✅' && 
                           tab.chatbot_context_linked === '✅' && 
                           tab.responsive_ui === '✅' 
                            ? 'Fully Enhanced' 
                            : tab.loading_state === '❌' || 
                              tab.data_integration === '❌' || 
                              tab.chatbot_context_linked === '❌' || 
                              tab.responsive_ui === '❌'
                              ? 'Needs Attention'
                              : 'In Progress'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Loading States</span>
                            {getStatusBadge(tab.loading_state)}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Data Integration</span>
                            {getStatusBadge(tab.data_integration)}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Responsive UI</span>
                            {getStatusBadge(tab.responsive_ui)}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Chatbot Context</span>
                            {getStatusBadge(tab.chatbot_context_linked)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Implemented Enhancements</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {tab.enhancements.map((enhancement: string, i: number) => (
                              <li key={i}>{enhancement}</li>
                            ))}
                          </ul>
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
                    Complete enhancement data in JSON format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                    <pre className="text-xs">
                      {JSON.stringify(enhancementData, null, 2)}
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

export default VisualEnhancementTracker;