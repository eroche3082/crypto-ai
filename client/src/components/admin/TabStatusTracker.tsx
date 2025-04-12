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
  BarChart,
  Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTabAuditReport, updateTabAuditReport, calculateTabMetrics, type TabStatus } from '@/utils/tabAudit';

export const TabStatusTracker = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('grid');
  const [tabData, setTabData] = useState<any>(null);
  const { toast } = useToast();
  
  // Load tab audit data
  useEffect(() => {
    loadTabAuditData();
  }, []);
  
  const loadTabAuditData = async () => {
    setLoading(true);
    try {
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Get tab audit report from utility function
      const auditData = getTabAuditReport();
      
      setTabData(auditData);
    } catch (error) {
      console.error('Error loading tab audit data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tab audit data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Export tab audit data as JSON
  const handleExport = () => {
    try {
      if (!tabData) {
        toast({
          title: 'Export Failed',
          description: 'No tab audit data available',
          variant: 'destructive',
        });
        return;
      }
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tabData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `cryptobot-tab-audit-${new Date().toISOString()}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: 'Export Complete',
        description: 'Tab audit data exported as JSON',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: 'Export Failed',
        description: 'Could not export tab audit data',
        variant: 'destructive',
      });
    }
  };
  
  // Copy JSON data to clipboard
  const handleCopyJSON = () => {
    try {
      if (!tabData) {
        toast({
          title: 'Copy Failed',
          description: 'No tab audit data available',
          variant: 'destructive',
        });
        return;
      }
      
      navigator.clipboard.writeText(JSON.stringify(tabData, null, 2));
      
      toast({
        title: 'Copied',
        description: 'Tab audit data copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying data:', error);
      toast({
        title: 'Copy Failed',
        description: 'Could not copy tab audit data',
        variant: 'destructive',
      });
    }
  };
  
  // Get status icon component
  const getStatusIcon = (status: TabStatus) => {
    switch (status) {
      case '✅':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case '⚠️':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case '❌':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  // Get status text color class
  const getStatusTextColor = (status: TabStatus) => {
    switch (status) {
      case '✅':
        return 'text-green-500';
      case '⚠️':
        return 'text-yellow-500';
      case '❌':
        return 'text-red-500';
      default:
        return '';
    }
  };
  
  // Calculate metrics for display
  const metrics = tabData ? calculateTabMetrics(tabData) : { total: 0, complete: 0, partial: 0, notWorking: 0, percentComplete: 0 };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tab Status Tracker</h2>
          <p className="text-muted-foreground">
            Comprehensive audit of all platform modules and navigation tabs
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
            onClick={loadTabAuditData}
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
              <h3 className="text-xl font-semibold">Loading Tab Status Data</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Analyzing system tabs and modules across the platform...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !tabData ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Layers className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold">No Tab Status Data</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                Click the "Refresh Data" button to load tab status information.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Tab Implementation Progress</CardTitle>
              <CardDescription>
                Current implementation status across all platform tabs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Completion Progress</span>
                    <span className="text-sm font-medium">{metrics.percentComplete}%</span>
                  </div>
                  <Progress value={metrics.percentComplete} className="h-2" />
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-card/50 p-4 rounded-lg">
                    <div className="font-medium text-sm">Total Tabs</div>
                    <div className="text-2xl font-bold text-primary mt-1">{metrics.total}</div>
                  </div>
                  <div className="bg-card/50 p-4 rounded-lg">
                    <div className="font-medium text-sm">Complete</div>
                    <div className="text-2xl font-bold text-green-500 mt-1">{metrics.complete}</div>
                  </div>
                  <div className="bg-card/50 p-4 rounded-lg">
                    <div className="font-medium text-sm">Partial</div>
                    <div className="text-2xl font-bold text-yellow-500 mt-1">{metrics.partial}</div>
                  </div>
                  <div className="bg-card/50 p-4 rounded-lg">
                    <div className="font-medium text-sm">Not Working</div>
                    <div className="text-2xl font-bold text-red-500 mt-1">{metrics.notWorking}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="json">JSON Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tabData.tabs.map((tab: any, index: number) => (
                  <Card key={index} className="overflow-hidden border-l-4" style={{
                    borderLeftColor: tab.status === '✅' 
                      ? 'rgb(34, 197, 94)' 
                      : tab.status === '⚠️' 
                        ? 'rgb(245, 158, 11)' 
                        : 'rgb(239, 68, 68)'
                  }}>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {tab.name}
                          </CardTitle>
                          <CardDescription>
                            {tab.route}
                          </CardDescription>
                        </div>
                        <Badge className={
                          tab.status === '✅' 
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600' 
                            : tab.status === '⚠️' 
                              ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-600' 
                              : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600'
                        }>
                          {tab.status === '✅' ? 'Working' : tab.status === '⚠️' ? 'Partial' : 'Not Working'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-5">
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tab.api_connection)}
                          <span className="text-sm">API Connection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tab.responsive)}
                          <span className="text-sm">UI Responsive</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tab.components_functional)}
                          <span className="text-sm">Components</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tab.chatbot_context)}
                          <span className="text-sm">Chatbot Integration</span>
                        </div>
                      </div>
                      
                      {tab.suggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {tab.suggestions.slice(0, 2).map((suggestion: string, i: number) => (
                              <li key={i}>{suggestion}</li>
                            ))}
                            {tab.suggestions.length > 2 && (
                              <li className="text-primary cursor-pointer">+{tab.suggestions.length - 2} more suggestions...</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="table">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left py-3 px-4 text-sm">Tab Name</th>
                        <th className="text-left py-3 px-4 text-sm">Route</th>
                        <th className="text-left py-3 px-4 text-sm">Status</th>
                        <th className="text-left py-3 px-4 text-sm">API</th>
                        <th className="text-left py-3 px-4 text-sm">UI</th>
                        <th className="text-left py-3 px-4 text-sm">Components</th>
                        <th className="text-left py-3 px-4 text-sm">Chatbot</th>
                        <th className="text-left py-3 px-4 text-sm">Suggestions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabData.tabs.map((tab: any, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                          <td className="py-2.5 px-4 text-sm font-medium">{tab.name}</td>
                          <td className="py-2.5 px-4 text-sm">{tab.route}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center">
                              {getStatusIcon(tab.status)}
                              <span className={`ml-1.5 text-xs ${getStatusTextColor(tab.status)}`}>
                                {tab.status === '✅' ? 'Working' : tab.status === '⚠️' ? 'Partial' : 'Not Working'}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4">{getStatusIcon(tab.api_connection)}</td>
                          <td className="py-2.5 px-4">{getStatusIcon(tab.responsive)}</td>
                          <td className="py-2.5 px-4">{getStatusIcon(tab.components_functional)}</td>
                          <td className="py-2.5 px-4">{getStatusIcon(tab.chatbot_context)}</td>
                          <td className="py-2.5 px-4 text-xs text-muted-foreground">
                            {tab.suggestions.length > 0 
                              ? `${tab.suggestions.length} suggestions` 
                              : 'No suggestions'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="json">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Raw JSON Data</CardTitle>
                  <CardDescription>
                    Complete tab audit data in JSON format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                    <pre className="text-xs">
                      {JSON.stringify(tabData, null, 2)}
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

export default TabStatusTracker;